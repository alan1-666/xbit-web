import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { MqttOrderBookPayload } from '@/modules/prediction/types/mqtt-payload.ts'
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'
import { OrderBookModel } from '@/modules/prediction/models/OrderBookModel.ts'

export const useHandleMarketOrderBookUpdated = (eventId: string) => {
  const queryClient = useQueryClient()
  const callback = useCallback(
    (modified: MqttOrderBookPayload) => {
      const marketId = modified.m
      const tokenId = modified.t
      const queryKey = QUERY_KEYS_CONFIGS.marketOrderBook(marketId, tokenId)
      queryClient.setQueryData(queryKey, (oldData: OrderBookModel[]) => {
        if (!oldData) return oldData
        const orderBook = oldData.find((ob) => ob.marketId === marketId && ob.tokenId === tokenId)
        if (!orderBook) return oldData

        const updatedOrderBook = {
          ...orderBook,
          bids: modified.b.sort((a, b) => +b.price - +a.price),
          asks: modified.a.sort((a, b) => +b.price - +a.price),
          hash: modified.h,
          timestamp: modified.ts,
        }
        return oldData.map((ob) => {
          if (ob.marketId === marketId && ob.tokenId === tokenId) {
            return updatedOrderBook
          }
          return ob
        })
      })
    },
    [eventId],
  )
  return useMemo(() => {
    // return throttle(callback, 10)
    return callback
  }, [callback])
}
