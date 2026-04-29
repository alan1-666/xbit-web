import { usePublicSubscriptionCallback } from '@hooks/mqtt/usePublicSubscriptionCallback.ts'
import { TOPICS } from '@/lib/topics.ts'
import { MqttTradePayload } from '@/modules/prediction/types/mqtt-payload.ts'
import { useQueryClient } from '@tanstack/react-query'
import { EventModel } from '@/modules/prediction/models/EventModel.ts'
import { useCallback } from 'react'

export const useMarketTradeUpdated = (marketId: string) => {
  const queryClient = useQueryClient()

  const handleTradeUpdate = useCallback(
    (_: string, payload: MqttTradePayload) => {
      // Update all event queries that contain this market
      queryClient.setQueriesData<EventModel>(
        {
          predicate: (query) => {
            const queryKey = query.queryKey
            return queryKey[0] === 'prediction' && queryKey[1] === 'event'
          },
        },
        (oldData) => {
          if (!oldData?.markets) return oldData

          const marketIndex = oldData.markets.findIndex((m) => m.id === payload.m)
          if (marketIndex === -1) return oldData

          const updatedMarkets = [...oldData.markets]
          updatedMarkets[marketIndex] = {
            ...updatedMarkets[marketIndex],
            lastTradePrice: parseFloat(payload.p),
          }

          return {
            ...oldData,
            markets: updatedMarkets,
          }
        },
      )
    },
    [queryClient],
  )

  usePublicSubscriptionCallback<MqttTradePayload>(TOPICS.prediction.marketTrade(marketId), {
    shouldSkip: !marketId,
    onMessage: handleTradeUpdate,
  })
}
