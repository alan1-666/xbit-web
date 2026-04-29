import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction as SOLTransaction,
  SystemProgram,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js'
import { getSolanaConnection } from '../lib/clients'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { useTurnkey } from '@turnkey/sdk-react'
import { useSelector } from 'react-redux'
import { Item } from '../types/TransactionData'
import { Transaction as EVMTransaction } from 'ethers/transaction'
import { ethers, getAddress, JsonRpcProvider, parseUnits, hexlify, concat } from 'ethers'
import { CHAIN_CONFIGS, HYPERLIQUID_BRIDGE_ADDRESS, USDC_ADDRESS_ARBITRUM } from '../constants'
import Decimal from 'decimal.js'
import { submitPermitDeposit } from '@/services/wallet.service'
import { walletClient } from '@/lib/gql/apollo-client'

export const useSendTransaction = () => {
  const solanaConnection = getSolanaConnection()

  const { indexedDbClient } = useTurnkey()
  const subOrgId = useSelector(_userInfo)?.subOrgId

  const buildSolTransaction = async (fromAddress: string, toAddress: string, amount: number) => {
    const connection = solanaConnection
    const fromPubkey = new PublicKey(fromAddress)
    const toPubkey = new PublicKey(toAddress)
    const lamports = Number(amount) * LAMPORTS_PER_SOL

    const tx = new SOLTransaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports,
      }),
    )
    tx.feePayer = fromPubkey

    const { blockhash } = await getSolanaBlockHash(connection)
    tx.recentBlockhash = blockhash
    return tx
  }

  const solTransferEstimatedFee = async (tx: SOLTransaction) => {
    const connection = solanaConnection

    return await connection.getFeeForMessage(tx.compileMessage())
  }

  const sendSolanaTransfer = async (fromAddress: string, toAddress: string, amount: number, balance: number) => {
    let txHash = ''
    const connection = solanaConnection

    const tx = await buildSolTransaction(fromAddress, toAddress, amount)
    const fee = await solTransferEstimatedFee(tx)

    const lamportsToSend = amount ? Math.floor(Number(amount) * LAMPORTS_PER_SOL) : balance - (fee.value || 0)

    if (lamportsToSend <= 0) {
      throw new Error('Insufficient balance to cover fee')
    }

    const unsignedTransaction = Buffer.from(
      tx.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      }),
    ).toString('hex')

    const activity = await indexedDbClient?.signTransaction({
      type: 'TRANSACTION_TYPE_SOLANA',
      signWith: fromAddress,
      organizationId: subOrgId,
      unsignedTransaction: unsignedTransaction,
    })

    if (activity) {
      const signedTransaction = activity.signedTransaction
      const signedTxBuffer = Buffer.from(signedTransaction, 'hex')
      txHash = await connection.sendRawTransaction(signedTxBuffer)
    }

    return txHash
  }

  const getSolTransferFee = async (txHash: string) => {
    let fee = 0
    const connection = solanaConnection

    const { lastValidBlockHeight, blockhash } = await getSolanaBlockHash(connection)

    await connection.confirmTransaction(
      {
        signature: txHash,
        blockhash,
        lastValidBlockHeight,
      },
      'confirmed',
    )

    const txInfo = await connection.getTransaction(txHash, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    })
    console.log('solanaTransfer txInfo: ', txInfo)

    fee = 0

    if (txInfo?.meta?.fee != null) {
      const feeInLamports = txInfo.meta.fee
      fee = feeInLamports / 1e9
    } else {
      console.error('❌ Failed to retrieve transaction fee.')
    }

    return fee
  }

  const getSolanaBlockHash = async (connection: Connection) => {
    const { lastValidBlockHeight, blockhash } = await connection.getLatestBlockhash()
    return { lastValidBlockHeight, blockhash }
  }

  const checkIfNewSolAccountAndGetRent = async (address: string) => {
    const pubkey = new PublicKey(address)
    let rentExemption = 0
    try {
      // 1. Check if account exists
      const accountInfo = await solanaConnection.getAccountInfo(pubkey)

      if (accountInfo === null) {
        console.log(`✅ Address ${address} is a new account.`)

        // 2. Get rent exemption for an empty system account (size 0)
        const accountSize = 0
        const rentExemptionLamports = await solanaConnection.getMinimumBalanceForRentExemption(accountSize)

        // console.log(`🧾 Rent-exemption required: ${rentExemptionLamports} lamports`)
        // console.log(`≈ ${rentExemptionLamports / LAMPORTS_PER_SOL} SOL`)
        // rentExemption = rentExemptionLamports / LAMPORTS_PER_SOL
      } else {
        // console.log(`🔁 Address ${address} already exists.`)
        // console.log(`Lamports: ${accountInfo.lamports}`)
        // console.log(`Owner: ${accountInfo.owner.toBase58()}`)
      }
    } catch (err) {
      console.error(`❌ Invalid address or failed to check: ${err}`)
    }

    return rentExemption
  }

  const buildVersionedTransaction = async (item: Item): Promise<VersionedTransaction> => {
    const payer = new PublicKey(item.from)
    const instructions: TransactionInstruction[] = []

    for (const inst of item.instructions) {
      const keys = inst.keys.map((key: any) => ({
        pubkey: new PublicKey(key.pubkey),
        isSigner: key.isSigner,
        isWritable: key.isWritable,
      }))

      const instruction = new TransactionInstruction({
        programId: new PublicKey(inst.programId),
        keys,
        data: Buffer.from(inst.data, 'hex'),
      })

      instructions.push(instruction)
    }

    const { blockhash } = await getSolanaBlockHash(solanaConnection)

    const messageV0 = new TransactionMessage({
      payerKey: payer,
      recentBlockhash: blockhash,
      instructions,
    }).compileToV0Message()

    const versionedTx = new VersionedTransaction(messageV0)

    return versionedTx
  }

  const solCrossChainTransfer = async (swapType: 'rango' | 'relay', item: Item) => {
    let serialized

    if (swapType === 'rango') {
      const serializedMessage = new Uint8Array(item.serializedMessage)
      serialized = Buffer.from(serializedMessage).toString('hex')
    } else {
      const unsignedTx = await buildVersionedTransaction(item)
      serialized = Buffer.from(unsignedTx.serialize()).toString('hex')
    }

    const activity = await indexedDbClient?.signTransaction({
      type: 'TRANSACTION_TYPE_SOLANA',
      signWith: item.from,
      organizationId: subOrgId,
      unsignedTransaction: serialized!,
    })

    if (!activity) throw new Error('turnkey sign transaction failed')

    const signedTransaction = activity.signedTransaction

    const signedTxBuffer = Buffer.from(signedTransaction, 'hex')
    const txHash = await solanaConnection.sendRawTransaction(signedTxBuffer)

    return txHash
  }

  const evmCrossChainTranser = async (chainType: 'ARBITRUM' | 'ETH', item: Item) => {
    let rpc
    if (chainType === 'ARBITRUM') {
      rpc = CHAIN_CONFIGS.ARBITRUM.rpc
    } else if (chainType === 'ETH') {
      rpc = CHAIN_CONFIGS.ETH.rpc
    }
    const provider = new ethers.JsonRpcProvider(rpc)

    const nonce = await getEVMNonce(item.from, provider)

    let serialized
    const tx = {
      to: item.to,
      data: item.data,
      gasLimit: item.gas,
      maxPriorityFeePerGas: item.maxPriorityFeePerGas,
      maxFeePerGas: item.maxFeePerGas,
      nonce: nonce,
      chainId: item.chainId,
      ...(item.value !== undefined && item.value !== null && item.value !== '' ? { value: item.value } : {}),
    }
    serialized = EVMTransaction.from(tx).unsignedSerialized

    const activity = await indexedDbClient?.signTransaction({
      type: 'TRANSACTION_TYPE_ETHEREUM',
      signWith: getAddress(item.from),
      organizationId: subOrgId,
      unsignedTransaction: serialized!,
    })

    if (!activity) throw new Error('turnkey sign transaction failed')

    const signedTransaction = activity.signedTransaction
    try {
      const txHash = await provider.send('eth_sendRawTransaction', [signedTransaction])

      const receipt = await provider.waitForTransaction(txHash, 1)
      console.log('Tx confirmed in block:', receipt?.blockNumber)

      return txHash
    } catch (rpcError: any) {
      console.error('Ethereum RPC Error:', rpcError)
      throw new Error(`Ethereum RPC Error: ${rpcError.message || rpcError}`)
    }
  }

  const getEVMNonce = async (address: string, provider?: JsonRpcProvider) => {
    if (!provider) provider = new ethers.JsonRpcProvider(CHAIN_CONFIGS.ARBITRUM.rpc)

    try {
      return await provider.getTransactionCount(address, 'latest')
    } catch (rpcError: any) {
      console.error('Ethereum RPC Error when get nonce:', rpcError)
      throw new Error(`Ethereum RPC Error: ${rpcError.message || rpcError}`)
    }
  }

  const bscCrossChainTransfer = async (item: Item) => {
    const provider = new ethers.JsonRpcProvider(CHAIN_CONFIGS.BSC.rpc)

    const nonce = await getBSCNonce(item.from, provider)

    let serialized
    const tx = {
      to: item.to,
      data: item.data,
      gasLimit: item.gas,
      maxPriorityFeePerGas: item.maxPriorityFeePerGas,
      maxFeePerGas: item.maxFeePerGas,
      nonce: nonce,
      chainId: item.chainId,
      ...(item.value !== undefined && item.value !== null && item.value !== '' ? { value: item.value } : {}),
    }
    serialized = EVMTransaction.from(tx).unsignedSerialized

    const activity = await indexedDbClient?.signTransaction({
      type: 'TRANSACTION_TYPE_ETHEREUM', // BSC is EVM compatible
      signWith: getAddress(item.from),
      organizationId: subOrgId,
      unsignedTransaction: serialized!,
    })

    if (!activity) throw new Error('turnkey sign transaction failed')

    const signedTransaction = activity.signedTransaction
    try {
      const txHashWithPrefix = signedTransaction.startsWith('0x') ? signedTransaction : `0x${signedTransaction}`
      const txHash = await provider.send('eth_sendRawTransaction', [txHashWithPrefix])

      const receipt = await provider.waitForTransaction(txHash, 1)
      console.log('Tx confirmed in block:', receipt?.blockNumber)

      return txHash
    } catch (rpcError: any) {
      console.error('BSC RPC Error:', rpcError)
      throw new Error(`BSC RPC Error: ${rpcError.message || rpcError}`)
    }
  }

  const getBSCNonce = async (address: string, provider?: JsonRpcProvider) => {
    if (!provider) provider = new ethers.JsonRpcProvider(CHAIN_CONFIGS.BSC.rpc)

    try {
      return await provider.getTransactionCount(address, 'latest')
    } catch (rpcError: any) {
      console.error('BSC RPC Error when get nonce:', rpcError)
      throw new Error(`BSC RPC Error: ${rpcError.message || rpcError}`)
    }
  }

  const getDepositHLGasFee = async (
    address: string,
    amount: string,
    provider?: JsonRpcProvider,
    requestId?: string,
  ) => {
    if (!provider) provider = new ethers.JsonRpcProvider(CHAIN_CONFIGS.ARBITRUM.rpc)
    try {
      const nonce = await getEVMNonce(address, provider)

      const decimals = 6
      const parsedAmount = parseUnits(amount, decimals)

      const usdc = new ethers.Contract(
        USDC_ADDRESS_ARBITRUM,
        ['function transfer(address to, uint256 amount) returns (bool)'],
        provider,
      )
      let data = await usdc.interface.encodeFunctionData('transfer', [HYPERLIQUID_BRIDGE_ADDRESS, parsedAmount])

      if (requestId) {
        let memo = requestId.replace(/^0x/, '') as any // force type to use replace all for string
        memo = memo?.replaceAll('-', '')
        data = data + memo.padStart(64, '0')
      }

      let gasLimit = await provider.estimateGas({
        to: USDC_ADDRESS_ARBITRUM,
        from: address,
        nonce: nonce,
        data,
      })

      if (requestId) {
        gasLimit = BigInt(new Decimal(gasLimit.toString()).mul(1.2).floor().toNumber())
      }

      const feeData = await provider.getFeeData()
      return { gasLimit, nonce, data, feeData }
    } catch (rpcError: any) {
      console.error('Ethereum RPC Error:', rpcError)
      throw new Error(`Ethereum RPC Error: ${rpcError.message || rpcError}`)
    }
  }

  const hyperliquidDeposit = async (address: string, amount: string, requestId?: string) => {
    let txHash = ''

    const provider = new ethers.JsonRpcProvider(CHAIN_CONFIGS.ARBITRUM.rpc)
    const { gasLimit, nonce, data, feeData } = await getDepositHLGasFee(address, amount, provider, requestId)

    const gasPrice = feeData.gasPrice
    const maxFeePerGas = feeData.maxFeePerGas
    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas

    const tx = {
      to: USDC_ADDRESS_ARBITRUM,
      data: data,
      gasLimit: gasLimit,
      gasPrice: gasPrice,
      maxPriorityFeePerGas: maxPriorityFeePerGas,
      maxFeePerGas: maxFeePerGas,
      nonce: nonce,
      chainId: 42161,
    }

    const serialized = EVMTransaction.from(tx).unsignedSerialized

    const activity = await indexedDbClient?.signTransaction({
      type: 'TRANSACTION_TYPE_ETHEREUM',
      signWith: getAddress(address),
      organizationId: subOrgId,
      unsignedTransaction: serialized,
    })

    if (activity) {
      const signatureTx = activity.signedTransaction

      try {
        txHash = await provider.send('eth_sendRawTransaction', [signatureTx])
        return { txHash, nonce }
      } catch (rpcError: any) {
        console.error('Ethereum RPC Error:', rpcError)
        throw new Error(`Ethereum RPC Error: ${rpcError.message || rpcError}`)
      }
    } else {
      throw new Error('turnkey sign transaction failed')
    }
  }

  const normalizeBytes32 = (value: string) => {
    if (!value.startsWith('0x')) {
      return `0x${value}`
    }
    return value
  }

  const depositWithNoGasFee = async (Address: string, amount: string) => {
    const walletAddress = getAddress(Address);
    try {
      const provider = new ethers.JsonRpcProvider(CHAIN_CONFIGS.ARBITRUM.rpc)

      const tokenIface = new ethers.Interface([
        'function name() view returns (string)',
        'function decimals() view returns (uint8)',
        'function nonces(address) view returns (uint256)',
      ])

      const [nameRes, nonceRes, decimalsRes] = await Promise.all([
        provider.call({ to: USDC_ADDRESS_ARBITRUM, data: tokenIface.encodeFunctionData('name') }),
        provider.call({ to: USDC_ADDRESS_ARBITRUM, data: tokenIface.encodeFunctionData('nonces', [walletAddress]) }),
        provider.call({ to: USDC_ADDRESS_ARBITRUM, data: tokenIface.encodeFunctionData('decimals') }),
      ])

      const tokenName = tokenIface.decodeFunctionResult('name', nameRes)[0]
      const nonce = Number(tokenIface.decodeFunctionResult('nonces', nonceRes)[0])
      const decimals = Number(tokenIface.decodeFunctionResult('decimals', decimalsRes)[0])
      const tokenVersion = '2'
      const chainId = 42161
      const deadline = Math.floor(Date.now() / 1000) + 3600
      const parsedValue = ethers.parseUnits(amount, decimals)
      const domain = {
        name: tokenName,
        version: tokenVersion,
        chainId,
        verifyingContract: USDC_ADDRESS_ARBITRUM,
      }

      const types = {
        Permit: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      }

      const message = {
        owner: walletAddress,
        spender: HYPERLIQUID_BRIDGE_ADDRESS,
        value: parsedValue.toString(),
        nonce: nonce.toString(),
        deadline: deadline.toString(),
      }
      const activity = await indexedDbClient?.signRawPayload({
        organizationId: subOrgId,
        signWith: walletAddress,
        payload: JSON.stringify({
          domain,
          types,
          primaryType: 'Permit',
          message,
        }),
        encoding: 'PAYLOAD_ENCODING_EIP712',
        hashFunction: 'HASH_FUNCTION_NOT_APPLICABLE',
      })

      if (!activity) throw new Error('Turnkey signing failed')

      let r = normalizeBytes32(activity.r)
      let s = normalizeBytes32(activity.s)
      let v = Number(activity.v)
      if (v === 0 || v === 1) v += 27

      const digest = ethers.TypedDataEncoder.hash(domain, types, message)
      const recovered = ethers.recoverAddress(digest, { r, s, v })

      if (recovered.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new Error('Signature does not match owner!')
      }

      // v 值有时是 0/1，需要转换成 27/28
      const vFixed = v < 27 ? v + 27 : v
      // 拼接标准的以太坊签名格式: 0x + r(64位) + s(64位) + v(2位)
      const signature = hexlify(
        concat([r, s, '0x' + vFixed.toString(16).padStart(2, '0')]), // 转成 1 字节的十六进制
      )
      const { data } = await walletClient.mutate({
        mutation: submitPermitDeposit,
        variables: {
          input: {
            address: walletAddress,
            tokenName,
            amount,
            chainId,
            tokenAddress: USDC_ADDRESS_ARBITRUM,
            signature,
            nonce,
            tokenDecimal: decimals,
            deadline,
          },
        },
      })

      if (data?.submitPermitDeposit?.status === 'Success' || data?.submitPermitDeposit?.status === 'Pending') {
        return { success: true, status: data.submitPermitDeposit.status }
      } else {
        throw new Error('Backend submission failed')
      }
    } catch (error: any) {
      throw error
    }
  }
  return {
    sendSolanaTransfer,
    getSolTransferFee,
    checkIfNewSolAccountAndGetRent,
    solCrossChainTransfer,
    evmCrossChainTranser,
    bscCrossChainTransfer,
    buildSolTransaction,
    solTransferEstimatedFee,
    hyperliquidDeposit,
    getDepositHLGasFee,
    getEVMNonce,
    depositWithNoGasFee,
  }
}
