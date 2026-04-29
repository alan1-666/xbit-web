import { symbolDexClient, walletClient } from '@/lib/gql/apollo-client'
import {
  checkStatusV2,
  createFundingSwap,
  createFutureTransaction,
  getQuoteV2,
  getSwapStatus,
} from '@/services/swap.service'
import axios from 'axios'
const quoteCache = new Map<string, { timestamp: number; data: any }>()
const CACHE_DURATION_MS = 60 * 1000
import { Configs } from '@const/configs.ts'

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const useSwapService = () => {
  const handleGetQuote = async (
    fromAddress: string,
    fromNativeVolume: string,
    originId: string,
    destinationId: string,
    toAddress: string,
    toNativeVolume: string,
    amount: string,
    type: string,
    requestId: string = '',
  ) => {
    const input = {
      user: fromAddress,
      userNativeVolume: fromNativeVolume,
      originId: originId,
      destinationId: destinationId,
      recipient: toAddress,
      recipientNativeVolume: toNativeVolume,
      amount: amount,
      type: type,
      requestId: requestId,
    }

    const key = JSON.stringify(input)
    const cached = quoteCache.get(key)
    const now = Date.now()
    if (cached && now - cached.timestamp < CACHE_DURATION_MS) {
      return cached.data
    }

    const result = await symbolDexClient.query({
      query: getQuoteV2,
      variables: { input },
      fetchPolicy: 'network-only',
    })

    quoteCache.set(key, { timestamp: now, data: result })

    return result
  }

  const hyperliquidWithdraw = (
    amount: string,
    destination: string,
    currentTimestamp: number,
    r: string,
    s: string,
    v: number,
  ) => {
    const HYPERLIQUID_CONFIG = Configs.getHyperliquidConfig()
    const network = capitalize(HYPERLIQUID_CONFIG.env)

    return axios.post(`${Configs.getHyperliquidConfig().apiUrl}/exchange`, {
      action: {
        type: 'withdraw3',
        hyperliquidChain: capitalize(network),
        signatureChainId: HYPERLIQUID_CONFIG.chainIdHex,
        amount: amount,
        time: currentTimestamp,
        destination: destination,
      },
      nonce: currentTimestamp,
      signature: {
        r: r,
        s: s,
        v: v,
      },
    })
  }

  const hyperliquidSendAsset = (r: string, s: string, v: number, action: any, nonce: any) => {
    const HYPERLIQUID_CONFIG = Configs.getHyperliquidConfig()

    return axios.post(`${Configs.getHyperliquidConfig().apiUrl}/exchange`, {
      action: {
        type: 'sendAsset',
        signatureChainId: HYPERLIQUID_CONFIG.chainIdHex,
        ...action,
      },
      nonce: nonce,
      signature: {
        r: r,
        s: s,
        v: v,
      },
    })
  }

  const handleGetSwapStatus = (requestId: string, txHash: string, step: number) => {
    return symbolDexClient.query({
      query: getSwapStatus,
      variables: {
        input: {
          requestId: requestId,
          txHash: txHash,
          step: step,
        },
      },
      fetchPolicy: 'network-only',
    })
  }

  const handleSwapCheckStatus = (requestId: string, txHash: string, step: number) => {
    return symbolDexClient.query({
      query: checkStatusV2,
      variables: {
        input: {
          requestId: requestId,
          txHash: txHash,
          step: step,
        },
      },
      fetchPolicy: 'network-only',
    })
  }

  const handleSwapRecord = (
    fromAddress: string,
    chainId: number,
    token: string,
    amount: number,
    fee: number,
    crossChainFee: number,
    crossChainFeeUnit: string,
    toAddress: string,
    toChainId: number,
    toToken: string,
    toAmount: number,
    route: 'Rango' | 'Relay' | '',
    txHash: string,
    status: string,
    errorCode: string,
    errorMessage: string,
    memo?: string,
  ) => {
    return walletClient.mutate({
      mutation: createFundingSwap,
      variables: {
        input: {
          fromAddress: fromAddress,
          chainId: chainId,
          token: token,
          amount: amount,
          fee: fee,
          crossChainFee: crossChainFee,
          crossChainFeeUnit: crossChainFeeUnit,
          toAddress: toAddress,
          toChainId: toChainId,
          toToken: toToken,
          toAmount: toAmount,
          route: route,
          txHash: txHash,
          status: status,
          errorCode: errorCode,
          errorMessage: errorMessage,
          memo,
        },
      },
      fetchPolicy: 'network-only',
    })
  }

  const handleHyperliquidTransfer = (
    type: 'FuturesDeposit' | 'FuturesWithdraw',
    fromAddress: string,
    chainId: number,
    token: string,
    amount: number,
    fee: number,
    toAddress: string,
    toChainId: number,
    txHash: string,
    status: string,
    errorCode: string,
    errorMessage: string,
    nonce: number,
    memo?: string, // memo use for deposit futures from cross chain
  ) => {
    return walletClient.mutate({
      mutation: createFutureTransaction,
      variables: {
        input: {
          fromAddress: fromAddress,
          chainId: chainId,
          token: token,
          amount: amount,
          fee: fee,
          toAddress: toAddress,
          toChainId: toChainId,
          txHash: txHash,
          status: status,
          errorMessage: errorMessage,
          errorCode: errorCode,
          type: type,
          nonce: nonce,
          memo: memo,
        },
      },
      fetchPolicy: 'network-only',
    })
  }

  return {
    handleGetQuote,
    hyperliquidWithdraw,
    hyperliquidSendAsset,
    handleSwapCheckStatus,
    handleSwapRecord,
    handleHyperliquidTransfer,
    handleGetSwapStatus,
  }
}
