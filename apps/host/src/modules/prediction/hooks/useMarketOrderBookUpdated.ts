import { usePublicSubscriptionCallback } from '@hooks/mqtt/usePublicSubscriptionCallback.ts'
import { TOPICS } from '@/lib/topics.ts'
import { MqttOrderBookPayload } from '@/modules/prediction/types/mqtt-payload.ts'
import { useQueryClient } from '@tanstack/react-query'
import { orderbookMapper } from '@/modules/prediction/models/mappers/orderbook.mapper.ts'
import { useCallback } from 'react'
import { OrderBookModel } from '@/modules/prediction/models/OrderBookModel.ts'
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'

export interface UseMarketOrderBookUpdatedOptions {
  marketId: string
  tokenId: string
}

export const useMarketOrderBookUpdated = (options: UseMarketOrderBookUpdatedOptions) => {
  const { marketId, tokenId } = options
  const queryClient = useQueryClient()

  const handleOrderBookUpdate = useCallback(
    (_: string, payload: MqttOrderBookPayload) => {
      // Only update if the payload matches our subscription
      if (payload.m !== marketId || payload.t !== tokenId) return

      const orderBook = orderbookMapper.fromMqttOrderBookPayload(payload)

      // Update the order book cache
      queryClient.setQueryData<OrderBookModel[]>(QUERY_KEYS_CONFIGS.marketOrderBook(marketId, tokenId), [orderBook])
    },
    [queryClient, marketId, tokenId],
  )

  usePublicSubscriptionCallback<MqttOrderBookPayload>(TOPICS.prediction.marketOrderBook(marketId), {
    shouldSkip: !marketId || !tokenId,
    onMessage: handleOrderBookUpdate,
  })
}
