import { useMemo } from 'react'
import { EventModel } from '@/modules/prediction/models/EventModel.ts'
import { TOPICS } from '@/lib/topics.ts'
import { usePublicSubscriptionCallback } from '@hooks/mqtt/usePublicSubscriptionCallback.ts'
import {
  MqttMarketPayload,
  MqttMarketResolvedPayload,
  MqttOrderBookPayload,
  MqttOrderBookUpdatePayload,
  MqttTradePayload,
} from '@/modules/prediction/types/mqtt-payload.ts'
import { useHandleMarketUpdated } from './useHandleMarketUpdated'
import { useHandleMarketTradeUpdated } from './useHandleMarketTradeUpdated'
import { useHandleMarketOrderBookUpdated } from './useHandleMarketOrderBookUpdated'
import { useHandleMarketOrderBookIncrementalUpdated } from './useHandleMarketOrderBookIncrementalUpdated'
import { useHandleMarketResolved } from './useHandleMarketResolved'
import ls from '@/lib/local-storage.ts'

export interface UseEventRealtimeUpdatesOptions {
  event: EventModel | null | undefined
}

export const useEventMarketRealtimeUpdates = (options: UseEventRealtimeUpdatesOptions) => {
  const { event } = options

  const marketIds = useMemo(() => {
    if (!event?.markets) return []
    return event.markets.map((market) => market.id)
  }, [event?.markets])

  const topics = useMemo(() => {
    return marketIds
      .map((marketId) => [
        TOPICS.prediction.marketUpdated(marketId),
        TOPICS.prediction.marketOrderBook(marketId),
        TOPICS.prediction.marketOrderBookUpdate(marketId),
        TOPICS.prediction.marketTrade(marketId),
        TOPICS.prediction.marketResolved(marketId),
      ])
      .flat()
  }, [marketIds.join(',')])

  const handleMarketUpdated = useHandleMarketUpdated(event?.slug || '')
  const handleMarketTradeUpdated = useHandleMarketTradeUpdated(event?.slug || '')
  const handleMarketOrderBookUpdated = useHandleMarketOrderBookUpdated(event?.slug || '')
  const handleMarketOrderBookIncrementalUpdated = useHandleMarketOrderBookIncrementalUpdated(event?.slug || '')
  const handleMarketResolved = useHandleMarketResolved(event?.slug || '')

  usePublicSubscriptionCallback(topics, {
    shouldSkip: topics.length === 0,
    debug: ls.get('mqtt_debug'),
    onMessage: (topic: string, payload: any) => {
      if (TOPICS.prediction.isMarketUpdate(topic)) {
        // Handle market update
        handleMarketUpdated(payload as MqttMarketPayload)
      } else if (TOPICS.prediction.isMarketTrade(topic)) {
        // Handle market trade update
        handleMarketTradeUpdated(payload as MqttTradePayload)
      } else if (TOPICS.prediction.isMarketResolved(topic)) {
        // Handle market resolved update
        handleMarketResolved(payload as MqttMarketResolvedPayload)
      } else if (TOPICS.prediction.isMarketOrderBook(topic)) {
        // Handle market order book snapshot
        handleMarketOrderBookUpdated(payload as MqttOrderBookPayload)
      } else if (TOPICS.prediction.isMarketOrderBookUpdate(topic)) {
        // Handle market order book incremental updates
        handleMarketOrderBookIncrementalUpdated(payload as MqttOrderBookUpdatePayload[])
      }
    },
  })
}
