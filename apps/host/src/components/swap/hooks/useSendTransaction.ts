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
import { chainConfigs, getSolanaConnection } from '../lib/clients'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { useTurnkey } from '@turnkey/sdk-react'
import { useSelector } from 'react-redux'
import { Transaction as EVMTransaction } from 'ethers/transaction'
import { ethers, getAddress, JsonRpcProvider } from 'ethers'
import { Item } from '../lib/types'
import { MathFun } from '@/lib/utils'

export const useSendTransaction = () => {
  const solanaConnection = getSolanaConnection()

  const { indexedDbClient } = useTurnkey()
  const subOrgId = useSelector(_userInfo)?.subOrgId

  const buildSolTransaction = async (fromAddress: string, toAddress: string, amount: number) => {
    const connection = solanaConnection
    const fromPubkey = new PublicKey(fromAddress)
    const toPubkey = new PublicKey(toAddress)

    const { blockhash } = await getSolanaBlockHash(connection)

    const messageForFee = new TransactionMessage({
    payerKey: fromPubkey,
    recentBlockhash: blockhash,
    instructions: [
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: Number(amount) * LAMPORTS_PER_SOL,
      }),
    ],
  }).compileToV0Message()
    const fee = await connection.getFeeForMessage(messageForFee)

    const balance = await connection.getBalance(fromPubkey)
    
    const enableToSwap = MathFun.sub(Number(balance || 0), Number(amount) * LAMPORTS_PER_SOL)

    const lamports = enableToSwap > 0 ? Number(amount) * LAMPORTS_PER_SOL : Number(balance || 0)

    const lamportsToSend: number = MathFun.sub(lamports, Number(fee.value))

    if (lamportsToSend <= 0) {
      throw new Error('Insufficient balance to cover fee')
    }

    const tx = new SOLTransaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: lamportsToSend,
      }),
    )
    tx.feePayer = fromPubkey

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
        rentExemption = rentExemptionLamports / LAMPORTS_PER_SOL
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

  const solCrossChainTransfer = async (item: Item) => {
    let serialized

    const unsignedTx = await buildVersionedTransaction(item)
    serialized = Buffer.from(unsignedTx.serialize()).toString('hex')

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

  const bscCrossChainTransfer = async (item: Item) => {
    const provider = new ethers.JsonRpcProvider(chainConfigs.bsc.rpcUrl)

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
    if (!provider) provider = new ethers.JsonRpcProvider(chainConfigs.bsc.rpcUrl)

    try {
      return await provider.getTransactionCount(address, 'latest')
    } catch (rpcError: any) {
      console.error('BSC RPC Error when get nonce:', rpcError)
      throw new Error(`BSC RPC Error: ${rpcError.message || rpcError}`)
    }
  }

  const monCrossChainTransfer = async (item: Item) => {
    const provider = new ethers.JsonRpcProvider(chainConfigs.monad.rpcUrl)

    const nonce = await getMonNonce(item.from, provider)

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

    // console.log('MON cross-chain transfer item:', item)
    // console.log('MON cross-chain transfer unsigned tx:', tx)
    // return 

    const activity = await indexedDbClient?.signTransaction({
      type: 'TRANSACTION_TYPE_ETHEREUM', // MON is EVM compatible
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
      console.error('MON RPC Error:', rpcError)
      throw new Error(`MON RPC Error: ${rpcError.message || rpcError}`)
    }
  }

  const getMonNonce = async (address: string, provider?: JsonRpcProvider) => {
    if (!provider) provider = new ethers.JsonRpcProvider(chainConfigs.monad.rpcUrl)

    try {
      return await provider.getTransactionCount(address, 'latest')
    } catch (rpcError: any) {
      console.error('MON RPC Error when get nonce:', rpcError)
      throw new Error(`MON RPC Error: ${rpcError.message || rpcError}`)
    }
  }

  return {
    sendSolanaTransfer,
    getSolTransferFee,
    checkIfNewSolAccountAndGetRent,
    solCrossChainTransfer,
    bscCrossChainTransfer,
    monCrossChainTransfer,
    buildSolTransaction,
    solTransferEstimatedFee
  }
}
