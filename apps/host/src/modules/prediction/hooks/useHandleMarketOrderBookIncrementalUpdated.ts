import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { MqttOrderBookUpdatePayload } from '@/modules/prediction/types/mqtt-payload.ts'
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'
import { OrderBookModel } from '@/modules/prediction/models/OrderBookModel.ts'

/**
 * Hook to handle incremental order book updates from MQTT
 * Applies batched level updates to existing order book data in React Query cache
 *
 * Topic: public/market/{market_id}/orderbook/update
 * Payload: Array of order book level updates (batched)
 *
 * Usage:
 * ```typescript
 * const handleOrderBookUpdate = useHandleMarketOrderBookIncrementalUpdated(eventId)
 * handleOrderBookUpdate(updates) // updates: MqttOrderBookUpdatePayload[]
 * ```
 */
export const useHandleMarketOrderBookIncrementalUpdated = (eventId: string) => {
  const queryClient = useQueryClient()

  return useCallback(
    (updates: MqttOrderBookUpdatePayload[]) => {
      // Group updates by market:token combination for efficient processing
      const updateMap = new Map<string, MqttOrderBookUpdatePayload[]>()

      updates.forEach((update) => {
        const key = `${update.m}:${update.t}`
        if (!updateMap.has(key)) {
          updateMap.set(key, [])
        }
        updateMap.get(key)!.push(update)
      })

      // Update query cache for each market:token combination
      updateMap.forEach((updatesList, key) => {
        const [marketId, tokenId] = key.split(':')
        const queryKey = QUERY_KEYS_CONFIGS.marketOrderBook(marketId, tokenId)

        queryClient.setQueryData(queryKey, (oldData: OrderBookModel[] | undefined) => {
          if (!oldData) return oldData

          const orderBook = oldData.find((ob) => ob.marketId === marketId && ob.tokenId === tokenId)
          if (!orderBook) return oldData

          // Apply incremental updates to order book
          const updatedBids = [...(orderBook.bids || [])]
          const updatedAsks = [...(orderBook.asks || [])]
          let latestTimestamp = parseInt(orderBook.timestamp || '0', 10)

          updatesList.forEach((update) => {
            const price = update.p
            const size = update.s
            const type = update.ty

            // Track latest timestamp
            if (update.ts > latestTimestamp) {
              latestTimestamp = update.ts
            }

            if (type === 'BUY') {
              // Update bids
              const bidIndex = updatedBids.findIndex((b) => b.price === price)
              if (size === '0') {
                // Remove bid level if size is 0
                if (bidIndex !== -1) {
                  updatedBids.splice(bidIndex, 1)
                }
              } else {
                // Add or update bid level
                if (bidIndex !== -1) {
                  updatedBids[bidIndex] = { price, size }
                } else {
                  updatedBids.push({ price, size })
                }
              }
            } else {
              // Update asks
              const askIndex = updatedAsks.findIndex((a) => a.price === price)
              if (size === '0') {
                // Remove ask level if size is 0
                if (askIndex !== -1) {
                  updatedAsks.splice(askIndex, 1)
                }
              } else {
                // Add or update ask level
                if (askIndex !== -1) {
                  updatedAsks[askIndex] = { price, size }
                } else {
                  updatedAsks.push({ price, size })
                }
              }
            }
          })

          // Sort bids (ascending by price - highest bid first) and asks (descending by price - lowest ask first)
          const sortedBids = updatedBids.sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
          const sortedAsks = updatedAsks.sort((a, b) => parseFloat(b.price) - parseFloat(a.price))

          const updatedOrderBook: OrderBookModel = {
            ...orderBook,
            bids: sortedBids,
            asks: sortedAsks,
            timestamp: String(latestTimestamp),
          }

          return oldData.map((ob) => {
            if (ob.marketId === marketId && ob.tokenId === tokenId) {
              return updatedOrderBook
            }
            return ob
          })
        })
      })
    },
    [eventId, queryClient],
  )
}
