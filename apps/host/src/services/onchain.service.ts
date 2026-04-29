import { SOL_ADDRESS, solanaMemeProxyConnection } from '@/lib/blockchain'
import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { AddressLookupTableAccount, BlockhashWithExpiryBlockHeight, PublicKey, SystemProgram, TransactionInstruction, TransactionMessage, VersionedTransaction } from '@solana/web3.js'
import Decimal from 'decimal.js'
import { buildPumpfunTransaction } from './pumpfun.service'

export interface PreOrder {
  userAddress: string
  inputMint: string
  outputMint: string
  amount: Decimal
  inputDecimals: number
  slippage: number
  priorityFee: Decimal | null
  mevProtect: boolean
  isToken2022: boolean
  dexes?: string[]
  priorityFeePrice: Decimal
}

export interface JupiterOrderResponse {
  mode: string
  swapType: string
  router: string
  requestId: string
  inAmount: string
  outAmount: string
  otherAmountThreshold: string
  swapMode: string
  slippageBps: number
  priceImpactPct: string
  routePlan: RoutePlan[]
  inputMint: string
  outputMint: string
  feeMint: string
  feeBps: number
  taker: string
  gasless: boolean
  transaction: string
  prioritizationFeeLamports: number
  inUsdValue: number
  outUsdValue: number
  priceImpact: number
  swapUsdValue: number
  totalTime: number
}

export interface RoutePlan {
  swapInfo: SwapInfo
  percent: number
  bps: number
}

export interface SwapInfo {
  ammKey: string
  label: string
  inputMint: string
  outputMint: string
  inAmount: string
  outAmount: string
  feeAmount: string
  feeMint: string
}

export const SLOT0_TIP_ACCOUNT = [
  'Eb2KpSC8uMt9GmzyAEm5Eb1AAAgTjRaXWFjKyFXHZxF3',
  'FCjUJZ1qozm1e8romw216qyfQMaaWKxWsuySnumVCCNe',
  'ENxTEjSQ1YabmUpXAdCgevnHQ9MHdLv8tzFiuiYJqa13',
  '6rYLG55Q9RpsPGvqdPNJs4z5WTxJVatMB8zV3WJhs5EK',
  'Cix2bHfqPcKcM233mzxbLk14kSggUUiz2A87fJtGivXr',
]
export const SLOT0_TIP_AMOUNT = 1000000 // 0.001 SOL

export const TOKEN_2022_PROGRAM_ADDRESS = TOKEN_2022_PROGRAM_ID.toBase58()
export const WSOL_FEE_ACCOUNT = 'CbpkTZyLVz4wNDHG6w9T3k97go8nFXU35ZkqX5AquxGu' // todo: move to api network fee
export const SOL_FEE_ACCOUNT = 'CG8Pfaf6BR2xvBSXkmy8ecx7NMsWJWFKMwR8TcLwf9Az'
export const PLATFORM_FEE_PERCENT = 0.01

export async function fetchIsToken2022(address: string): Promise<boolean> {
  const tokenAccount = await solanaMemeProxyConnection.getAccountInfo(new PublicKey(address), 'confirmed')

  return tokenAccount?.owner.toBase58() === TOKEN_2022_PROGRAM_ADDRESS
}

export async function fetchPumpfunOrder(order: PreOrder, latestBlockhash?: string, feeAccount?: string, platformFeePercent?: number): Promise<JupiterOrderResponse | null> {
  try {
    if (order.amount.isZero()) {
      return null
    }

    const tx = await buildPumpfunTransaction(order, latestBlockhash, feeAccount, platformFeePercent)

    return {
      transaction: tx,
    } as JupiterOrderResponse
  } catch (e) {
    console.error('Error fetching Pumpfun order:', e)
    return null
  }
}

export async function fetchJupiterOrder(order: PreOrder, feeAccount?: string, platformFeePercent?: number) {
  if (order.amount.isZero()) {
    return null
  }

  try {
    const { slippage, inputDecimals: decimals, amount, userAddress, priorityFeePrice, ...rest } = order
    const rawAmount = amount.mul(Math.pow(10, decimals))
    if (!order.inputMint || !order.outputMint || order.amount.isZero()) {
      return null
    }
    const slippageBps = Math.floor(slippage * 10000)
    // const params = {
    //   amount: rawAmount.toString(),
    //   swapMode: 'ExactIn',
    //   slippageBps: Math.floor(slippage * 10000),
    //   broadcastFeeType: 'maxCap',
    //   priorityFeeLamports,
    //   useWsol: 'false',
    //   asLegacyTransaction: 'false',
    //   excludeDexes: '',
    //   excludeRouters: '',
    //   ...rest,
    //   taker: userAddress,
    // }

    // const response = await axios.get<JupiterOrderResponse>('https://ultra-api.jup.ag/order', {
    //   params,
    // })

    // return response.data
    // Current 1%, todo: fetch from config
    const platformFee = platformFeePercent !== undefined  ? platformFeePercent : PLATFORM_FEE_PERCENT
    const platformFeeBps = new Decimal(platformFee).mul(10000).toFixed()

    let platformFeeQuery = ''
    if (!order.isToken2022) {
      platformFeeQuery = `&platformFeeBps=${platformFeeBps}`
    }

    const quoteRequest = await fetch(
      `https://lite-api.jup.ag/swap/v1/quote?inputMint=${order.inputMint}&outputMint=${order.outputMint}&amount=${rawAmount}&slippageBps=${slippageBps}&restrictIntermediateTokens=true&swapMode=ExactIn${platformFeeQuery}`,
      {
        method: 'GET',
      },
    )

    if (quoteRequest.status === 429) {
      return null
    }

    const quoteResponse = await quoteRequest.json()
    if (quoteResponse?.error) {
      if (quoteResponse.errorCode === 'COULD_NOT_FIND_ANY_ROUTE') {
        return null
      }

      return null
    }

    const swapRequest = await fetch(`https://lite-api.jup.ag/swap/v1/swap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quoteResponse,
        userPublicKey: order.userAddress,
        dynamicComputeUnitLimit: true,
        dynamicSlippage: true,
        feeAccount: order.isToken2022 ? null : WSOL_FEE_ACCOUNT,
        priorityFeePrice: priorityFeePrice.toNumber(),
      }),
    })

    if (swapRequest.status == 429) {
      return null
    }

    const swapResponse = await swapRequest.json()

    if (swapResponse?.error) {
      return null
    }

    const swapTransactionBuf = Buffer.from(swapResponse.swapTransaction, 'base64')
    const originalTransaction = VersionedTransaction.deserialize(swapTransactionBuf)

    const lookupAccountKeys = originalTransaction.message.addressTableLookups.map(
      lookup => lookup.accountKey,
    )
    const accountInfos = await solanaMemeProxyConnection.getMultipleAccountsInfo(lookupAccountKeys)

    const addressLookupTableAccounts = lookupAccountKeys.map((key, index) => {
      const accountInfo = accountInfos[index]
      if (!accountInfo || !accountInfo.data) {
        throw new Error(`Account info for ${key.toBase58()} not found.`)
      }
      return new AddressLookupTableAccount({
        key: key,
        state: AddressLookupTableAccount.deserialize(accountInfo.data),
      })
    })

    const message = TransactionMessage.decompile(originalTransaction.message, {
      addressLookupTableAccounts: addressLookupTableAccounts,
    })
    const additionalTxs: TransactionInstruction[] = []
    if (order.mevProtect) {
      const tipTx = SystemProgram.transfer({
        fromPubkey: new PublicKey(userAddress), // Sender's public key.
        toPubkey: new PublicKey(
          SLOT0_TIP_ACCOUNT[Math.floor(Math.random() * SLOT0_TIP_ACCOUNT.length)],
        ),
        lamports: SLOT0_TIP_AMOUNT, // Amount to transfer as a tip (0.001 SOL in this case).
      })
      additionalTxs.push(tipTx)
    }

    if (order.isToken2022) {
      const platformFeeLamport = new Decimal(order.inputMint === SOL_ADDRESS ? quoteResponse.inAmount : quoteResponse.outAmount)
        .mul(platformFee)
        .floor()
        .toNumber()

      additionalTxs.push(
        SystemProgram.transfer({
          lamports: platformFeeLamport,
          fromPubkey: new PublicKey(order.userAddress),
          toPubkey: new PublicKey(feeAccount ? feeAccount : SOL_FEE_ACCOUNT),
        }),
      )
    }

    message.instructions.push(...additionalTxs)
    originalTransaction.message = message.compileToV0Message(addressLookupTableAccounts)

    return {
      ...swapResponse,
      transaction: Buffer.from(originalTransaction.serialize()).toString('base64'),
    }
  } catch (e) {
    console.error('Error fetching Jupiter order:', e)
    return null
  }
}
