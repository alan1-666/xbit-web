import { useUpdateQueriesCache } from '@/modules/prediction/hooks/useUpdateQueryCache.ts'
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'
import { useMemo } from 'react'
import { usePublicSubscriptionCallback } from '@hooks/mqtt/usePublicSubscriptionCallback.ts'
import { TOPICS } from '@/lib/topics.ts'
import { MqttMarketPayload } from '@/modules/prediction/types/mqtt-payload.ts'
import { InfiniteData } from '@tanstack/react-query'
import { PositionModel } from '@/modules/prediction/models/PositionModel.ts'

export const usePositionRealtimeUpdates = (userAddress: string, marketIds: string[]) => {
  const topics = useMemo(() => {
    return marketIds.map((marketId) => TOPICS.prediction.marketUpdated(marketId))
  }, [marketIds.join(',')])

  const updateQueryCache = useUpdateQueriesCache<InfiniteData<PositionModel[]>, MqttMarketPayload>({
    predicate: (query) => QUERY_KEYS_CONFIGS.predicateUserPositions(query.queryKey as string[], userAddress),
    updater: (oldData, modified) => {
      if (!oldData) return oldData
      return {
        ...oldData,
        pages: oldData.pages.map((positions) => {
          return positions.map((position) => {
            if (position.marketId !== modified.i) return position
            // Pick best bid based on outcome: outcomeIndex 0 = Yes, 1 = No
            const bestBid = position.outcomeIndex === 0 ? modified.tybb : modified.tnbb
            if (!bestBid) return position
            const newPrice = +bestBid
            const initialValue = +position.initialValue
            const size = +position.size
            const newValue = newPrice * size
            const cashPnl = newValue - initialValue
            const percentPnl = initialValue !== 0 ? (cashPnl / initialValue) * 100 : 0
            return {
              ...position,
              curPrice: newPrice,
              currentPrice: newPrice,
              currentValue: newValue,
              cashPnl,
              percentPnl,
            }
          })
        }),
      }
    },
  })

  usePublicSubscriptionCallback<MqttMarketPayload>(topics, {
    onMessage: (_, payload) => {
      updateQueryCache(payload)
    },
  })
}
