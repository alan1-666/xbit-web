import { useSubscription } from '@/lib/mqtt'
import { MemeDto } from '@/@generated/gql/graphql-future.ts'
import { useCallback, useEffect, useMemo } from 'react'
import { InfiniteData, useQueryClient } from '@tanstack/react-query'
import { GetMemeOutput } from '@/types/responses'
import { MqttNewMemeToken } from '@/types/mqtt.ts'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { ChainIds } from '@/types/enums.ts'

export interface UseNewMemeTokensListenerOptions {
  shouldSkip?: boolean
  callback?: (token: MemeDto[]) => void
}

const calculateDevHold = (item: MqttNewMemeToken) => {
  if (item.dhp) return +item.dhp * 100
  if (item.dhb && item.totalSupply) {
    return (+item.dhb / +item.totalSupply) * 100
  }
  return 0
}

const calculateInsiderTrading = (item: MqttNewMemeToken) => {
  if (item.insiderTradingPercentage) {
    return +item.insiderTradingPercentage * 100
  }
  return 0
}

export const calculateSniperHold = (item: MqttNewMemeToken) => {
  if (item.sniperPercentage) {
    return +item.sniperPercentage * 100
  }
  if (item.sniperHoldAmount && item.totalSupply && item.decimals) {
    return (+item.sniperHoldAmount / +item.totalSupply) * 100 * Math.pow(10, item.decimals)
  }
}

const useSubscriptionTopic = () => {
  const activeChainId = useActiveChainId()
  return useMemo(() => {
    if (activeChainId === ChainIds.Mon) {
      return 'public/meme/mon/new'
    }
    if (activeChainId === ChainIds.Bsc) {
      return 'public/meme/bsc/new'
    }
    return 'public/meme/new'
  }, [activeChainId])
}

export const useNewMemeTokensListener = (options?: UseNewMemeTokensListenerOptions) => {
  const queryClient = useQueryClient()
  const { shouldSkip = false, callback } = options || {}
  const subscriptionTopic = useSubscriptionTopic()
  const { message: mqttMessage } = useSubscription(subscriptionTopic, {
    shouldSkip: shouldSkip,
    clientOptions: {
      qos: 1,
    },
    clientType: 'public',
  })

  useEffect(() => {
    if (!mqttMessage?.message) return
    let data = JSON.parse(mqttMessage.message.toString()) as MqttNewMemeToken[] | MqttNewMemeToken
    if (!Array.isArray(data)) {
      // If it's a single object, wrap it in an array
      data = [data]
    }

    const tokens: MemeDto[] = data.map(
      (item) =>
        ({
          ...item,
          token: item.token || item.address,
          buyTxs1h: item.txb ? +item.txb : 0,
          buyTxs1m: item.txb ? +item.txb : 0,
          buyTxs5m: item.txb ? +item.txb : 0,
          buyTxs6h: item.txb ? +item.txb : 0,
          buyTxs24h: item.txb ? +item.txb : 0,
          isFavorite: false,
          ohlc: [],
          sellTxs1h: item.txs ? +item.txs : 0,
          sellTxs1m: item.txs ? +item.txs : 0,
          sellTxs5m: item.txs ? +item.txs : 0,
          sellTxs6h: item.txs ? +item.txs : 0,
          sellTxs24h: item.txs ? +item.txs : 0,
          txs1h: (item.txb ? +item.txb : 0) + (item.txs ? +item.txs : 0),
          txs1m: (item.txb ? +item.txb : 0) + (item.txs ? +item.txs : 0),
          txs5m: (item.txb ? +item.txb : 0) + (item.txs ? +item.txs : 0),
          txs6h: (item.txb ? +item.txb : 0) + (item.txs ? +item.txs : 0),
          txs24h: (item.txb ? +item.txb : 0) + (item.txs ? +item.txs : 0),
          isHotToken: false,
          internalMarketProgress: item.internalMarketProgress || '0',
          volume1h: item.vl,
          volume1m: item.vl,
          volume5m: item.vl,
          volume6h: item.vl,
          volume24h: item.vl,
          marketcap: item.marketcap,
          numberOfHolder: item.hc ? +item.hc : 0,
          devHold: calculateDevHold(item),
          sameSourceWallet: item.sameSourceTradingPercentage ? `${+item.sameSourceTradingPercentage * 100}` : '0',
          devLaunched: item.dt ? +item.dt : 0,
          insider: calculateInsiderTrading(item),
          top10Holder: item.top10HolderPercentage ? +item.top10HolderPercentage * 100 : 0,
          txBySniperPct: calculateSniperHold(item) || 0,
          isMigrated: false,
          decimals: item.decimals.toString(),
          source: 'new',
        }) as any as MemeDto,
    ) // TODO: fix type
    callback?.(tokens)
  }, [mqttMessage])

  const updateQuery = useCallback((queryKey: any[], tokens: MemeDto[]) => {
    queryClient.setQueryData(queryKey, (oldData: InfiniteData<GetMemeOutput>) => {
      if (!oldData) return oldData
      // insert to first page
      const firstPage = oldData.pages?.[0]
      if (!firstPage) return oldData
      const allOldTokens = oldData.pages.flatMap((page) => page.getMemeToken?.data || [])
      const newTokens: MemeDto[] = []
      tokens.forEach((token) => {
        const isNew = !allOldTokens.some((newToken) => newToken.token === token.token)
        if (isNew) {
          newTokens.push(token)
        }
      })

      const newPages = oldData.pages.map((page, index) => {
        if (index === 0) {
          return {
            ...page,
            getMemeToken: {
              ...page.getMemeToken,
              data: [...newTokens, ...(page.getMemeToken?.data || [])],
            },
          }
        }
        const pageTokens = page.getMemeToken?.data || []
        const updatedTokens = pageTokens.map((token) => {
          const newToken = tokens.find((t) => t.token === token.token)
          return newToken ? { ...token, ...newToken } : token
        })
        return {
          ...page,
          getMemeToken: {
            ...page.getMemeToken,
            data: updatedTokens,
          },
        }
      })
      return {
        ...oldData,
        pages: newPages,
      }
    })
  }, [])

  return {
    updateQuery,
  }
}
