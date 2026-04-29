import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'
import { MqttTradePayload } from '@/modules/prediction/types/mqtt-payload.ts'
import { EventModel } from '@/modules/prediction/models/EventModel.ts'

export const useHandleMarketTradeUpdated = (eventId: string) => {
  const queryClient = useQueryClient()
  return useCallback(
    (modified: MqttTradePayload) => {
      const queryKey = QUERY_KEYS_CONFIGS.eventDetails(eventId)
      queryClient.setQueryData(queryKey, (oldData: EventModel | undefined) => {
        if (!oldData?.markets) return oldData

        const marketIndex = oldData.markets.findIndex((m) => m.id === modified.m)
        if (marketIndex === -1) return oldData
        return {
          ...oldData,
          markets: oldData.markets.map((market) => {
            if (market.id !== modified.m) return market
            return {
              ...market,
              lastTradePrice: modified.p ?? market.lastTradePrice,
            }
          }),
        }
      })
    },
    [eventId],
  )
}
