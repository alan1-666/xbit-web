import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { EventModel } from '@/modules/prediction/models/EventModel'
import { MqttMarketResolvedPayload } from '@/modules/prediction/types/mqtt-payload'
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'
import { useProxyWallet } from '@/modules/prediction/hooks/useProxyWallet.ts'

export const useHandleMarketResolved = (eventId: string) => {
  const queryClient = useQueryClient()
  const proxyWallet = useProxyWallet()
  return useCallback(
    (modified: MqttMarketResolvedPayload) => {
      const queryKey = QUERY_KEYS_CONFIGS.eventDetails(eventId)
      queryClient.setQueryData(queryKey, (oldData: EventModel | undefined) => {
        if (!oldData?.markets) return oldData

        const marketIndex = oldData.markets.findIndex((m) => m.id === modified.m)
        if (marketIndex === -1) return oldData
        return {
          ...oldData,
          markets: oldData.markets.map((market) => {
            if (market.id !== modified.m) return market
            const clobTokenIds = market.clobTokenIds || []
            const tokenIndex = clobTokenIds.findIndex((id) => id === modified.wt)
            const newYesPrice = tokenIndex === 0 ? '1' : '0'
            const newNoPrice = tokenIndex === 1 ? '1' : '0'
            const newOutcomePrices = [newYesPrice, newNoPrice]
            return {
              ...market,
              closed: true,
              outcomePrices: newOutcomePrices,
            }
          }),
        }
      })

      // Refetch user positions and open orders to reflect resolved market state
      queryClient.refetchQueries({
        predicate: (query) => {
          return QUERY_KEYS_CONFIGS.predicateUserPositions(query.queryKey as string[], proxyWallet)
        },
      })
      queryClient.refetchQueries({
        predicate: (query) => {
          const marketId = modified.m
          return (
            query.queryKey[0] === 'prediction' &&
            query.queryKey[1] === 'user' &&
            query.queryKey[2] === 'openOrders' &&
            query.queryKey[3] === marketId
          )
        },
      })
    },
    [eventId, proxyWallet],
  )
}
