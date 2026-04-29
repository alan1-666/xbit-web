import { useCallback } from 'react'
import { InfiniteData, useQueryClient } from '@tanstack/react-query'
import { EventModel } from '@/modules/prediction/models/EventModel'
import { MqttMarketPayload } from '@/modules/prediction/types/mqtt-payload.ts'
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'
import { useUpdateQueriesCache } from '@/modules/prediction/hooks/useUpdateQueryCache.ts'
import { useProxyWallet } from '@/modules/prediction/hooks/useProxyWallet.ts'
import { UserPosition } from '@/@generated/gql/graphql-prediction.ts'

/**
 * Hook to handle market update messages from MQTT
 * Maps MQTT payload fields to GraphQL Market model fields
 *
 * MQTT to GraphQL field mapping:
 * - tybb → tokenYesBestBid (Token Yes Best Bid)
 * - tyba → tokenYesBestAsk (Token Yes Best Ask)
 * - tnbb → tokenNoBestBid (Token No Best Bid)
 * - tnba → tokenNoBestAsk (Token No Best Ask)
 * - op → outcomePrices (Outcome Prices array)
 * - v → volume
 * - l → liquidity
 * - a → active
 * - c → closed
 */
export const useHandleMarketUpdated = (eventId: string) => {
  const queryClient = useQueryClient()
  const proxyWallet = useProxyWallet()

  const updatePositions = useUpdateQueriesCache<InfiniteData<UserPosition[]>, MqttMarketPayload>({
    predicate: (query) => QUERY_KEYS_CONFIGS.predicateUserPositions(query.queryKey as string[], proxyWallet),
    updater: (oldData, modified) => {
      if (!oldData) return oldData
      // Find position that matches the modified market, then calculate new values based on the market update
      const allPositions = oldData.pages.flat()
      const exists = allPositions.some((position) => position.marketId === modified.i)
      if (!exists) return oldData

      return {
        ...oldData,
        pages: oldData.pages.map((page) => {
          const positionToUpdate = page.find((position) => position.marketId === modified.i)
          if (!positionToUpdate) return page

          return page.map((position) => {
            if (position.marketId !== modified.i) return position
            const price = position.outcomeIndex === 0 ? modified.tybb : modified.tnbb
            if (!price) return position
            const newPrice = +price
            const newCurrentValue = position.size * newPrice
            const cashPnl = newCurrentValue - position.initialValue
            const percentPnl = (cashPnl / position.initialValue) * 100
            // console.log({
            //   position,
            //   modified,
            //   newPrice,
            //   newCurrentValue,
            //   cashPnl,
            //   percentPnl,
            // })

            return {
              ...position,
              currentPrice: newPrice,
              curPrice: newPrice,
              currentValue: newCurrentValue,
              cashPnl,
              percentPnl,
            }
          })
        }),
      }
    },
  })

  return useCallback(
    (modified: MqttMarketPayload) => {
      const queryKey = QUERY_KEYS_CONFIGS.eventDetails(eventId)

      queryClient.setQueryData(queryKey, (oldData: EventModel | undefined) => {
        if (!oldData?.markets) return oldData

        const marketIndex = oldData.markets.findIndex((m) => m.id === modified.i)
        if (marketIndex === -1) return oldData

        return {
          ...oldData,
          markets: oldData.markets.map((market) => {
            if (market.id !== modified.i) return market

            const yesTickSize = modified.tyts ? +modified.tyts : 0
            const noTickSize = modified.tyts ? +modified.tyts : 0
            const tickSize = Math.min(yesTickSize, noTickSize)

            return {
              ...market,
              // Basic fields
              active: modified.a ?? market.active,
              closed: modified.c || market.closed,
              volume: modified.v ?? market.volume,
              liquidity: modified.l ?? market.liquidity,

              // Outcome prices
              outcomePrices: modified.op ?? market.outcomePrices,

              // Token-specific best bid/ask prices
              tokenYesBestBid: modified.tybb ?? market.tokenYesBestBid,
              tokenYesBestAsk: modified.tyba ?? market.tokenYesBestAsk,
              tokenNoBestBid: modified.tnbb ?? market.tokenNoBestBid,
              tokenNoBestAsk: modified.tnba ?? market.tokenNoBestAsk,

              orderPriceMinTickSize: tickSize > 0 ? tickSize : market.orderPriceMinTickSize,
            }
          }),
        }
      })

      updatePositions(modified)
    },
    [eventId, queryClient],
  )
}
