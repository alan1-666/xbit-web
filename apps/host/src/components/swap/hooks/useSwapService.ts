import { RootState, useAppSelector } from '@/redux/store'
import { useSelector } from 'react-redux'
import { ChainType, UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user'
import { _walletDex } from '@/redux/modules/newWallet.slice'
import { QuoteRelayRequest } from '@/@generated/gql/graphql-symbolDex'
import { symbolDexClient } from '@/lib/gql/apollo-client'
import { getQuote, getRelayPrice, getSwapStatus } from '@/services/swap.service'
import { toSmallestUnit } from '../lib/helper'
import { Configs } from '@/const/configs'
import axios from 'axios'
import { ServiceConfig } from '@/lib/gql/service-config'
import { SwapFormState } from '../lib/types'

let currentAbortController: AbortController | null = null

export const useSwapService = () => {
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)
  const EVMAddress = useSelector(_walletDex)?.walletAddress
  const SOLAddress =
    listWalletsByChain?.find((w: UserEmbeddedWalletDto) => w?.chain === ChainType.Solana)?.walletAddress || ''
  const BTCAddress =
    listWalletsByChain?.find((w: UserEmbeddedWalletDto) => w?.chain === ChainType.Btc)?.walletAddress || ''
  const TRONAddress = listWalletsByChain?.find((w: UserEmbeddedWalletDto) => w?.chain === ChainType.Tron)?.walletAddress || ''
  const swapInfo = useAppSelector<RootState, SwapFormState>((state) => state.swapInfo)

  const initDepositAddress = async () => {
    const input = {
      needDepositAddress: true,
      userAddr: EVMAddress,
      userSolAddr: SOLAddress,
      userBtcAddr: BTCAddress,
    } as QuoteRelayRequest
    const { data } = symbolDexClient.query({
      query: getQuote,
      variables: {
        input: input,
      },
      fetchPolicy: 'network-only',
    })
    return data
  }

  const handleGetQuote = async ({
    fromTokenId,
    toTokenId,
    toWalletAddress,
    amount,
    decimals,
  }: {
    fromTokenId: string
    toTokenId: string
    toWalletAddress: string
    amount: string
    decimals: number
  }) => {
    const input = {
      originId: fromTokenId,
      destinationId: toTokenId,
      recipient: toWalletAddress,
      amount: toSmallestUnit(amount || '0', decimals || 0).toString(),
      needDepositAddress: false,
      userAddr: EVMAddress,
      userSolAddr: swapInfo.fromToken?.symbol.toUpperCase() === 'SOL' ? swapInfo.fromWalletAddress : SOLAddress,
      userBtcAddr: BTCAddress,
      userTronAddr: TRONAddress
    } as QuoteRelayRequest

    if (currentAbortController) {
      currentAbortController.abort()
    }

    const controller = new AbortController()

    currentAbortController = controller

    try {
      const res = await fetch(import.meta.env.VITE_GRAPHQL_HTTP_DEX_URL, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ServiceConfig.token}`,
          'X-Consumer-Username': 'xbit',
        },
        body: JSON.stringify({
          query: getQuote.loc?.source.body,
          variables: { input },
        }),
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const result = await res.json()

      return result
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // return Promise.reject(new Error('QUOTE_REQUEST_ABORTED'))
        console.log("get quote reques aborted")
      }
    } finally {
      if (currentAbortController === controller) {
        currentAbortController = null
      }
    }
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

  const relayAuthorize = (signature: string, body: any) => {
    const RELAY = Configs.getRelayHost()

    return axios.post(`${RELAY}/authorize?signature=${signature}`, body)
  }

  const handleSwapCheckStatus = (requestId: string, txHash: string, step: number) => {
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

  const fetchRelayPrice = (tokenId: string) => {
    return symbolDexClient.query({
      query: getRelayPrice,
      variables: {
        input: {
          tokenId: tokenId,
        },
      },
      fetchPolicy: 'network-only',
    })
  }

  return {
    initDepositAddress,
    handleGetQuote,
    relayAuthorize,
    hyperliquidSendAsset,
    handleSwapCheckStatus,
    fetchRelayPrice,
  }
}
