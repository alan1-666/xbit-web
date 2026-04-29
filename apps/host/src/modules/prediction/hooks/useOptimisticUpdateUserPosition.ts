import { useCallback } from 'react'
import { InfiniteData } from '@tanstack/react-query'
import { useUpdateQueriesCache } from '@/modules/prediction/hooks/useUpdateQueryCache.ts'
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'
import { PositionModel } from '@/modules/prediction/models/PositionModel.ts'
import { useProxyWallet } from '@/modules/prediction/hooks/useProxyWallet.ts'

export interface PositionUpdateData {
  marketId: string
  outcome: 'yes' | 'no'
  side: 'buy' | 'sell'
  size: number
  price: number
  outcomeLabel: string
}

/**
 * Hook to optimistically update user positions across all queries matching predicateUserPositions.
 * For buy orders: adds a new position or updates existing one by increasing size and recalculating avgPrice.
 * For sell orders: decreases size and recalculates avgPrice, removes position if size becomes <= 0.
 */
export const useOptimisticUpdateUserPosition = () => {
  const wallet = useProxyWallet()

  const updater = useCallback((oldData: InfiniteData<PositionModel[]> | undefined, data: PositionUpdateData) => {
    console.log('Optimistically updating user positions with data:', oldData)
    if (!oldData || !oldData.pages) return oldData

    const { marketId, outcome, side, size, price } = data

    return {
      ...oldData,
      pages: oldData.pages.map((positions) => {
        const outcomeIndex = outcome === 'yes' ? 0 : 1
        const existingPositionIndex = positions.findIndex(
          (p) => p.marketId === marketId && p.outcomeIndex === outcomeIndex,
        )

        if (existingPositionIndex === -1) {
          // Position doesn't exist
          if (side === 'buy') {
            // Add new position at the beginning
            return [
              {
                ...positions[0], // Use first position as template for other fields
                marketId,
                outcome: data.outcomeLabel,
                outcomeIndex: outcomeIndex,
                size,
                avgPrice: price,
                initialValue: price * size,
                cashPnl: 0,
                percentPnl: 0,
              } as PositionModel,
              ...positions,
            ]
          } else {
            // Sell order with no existing position - should not happen, but skip
            return positions
          }
        }

        // Position exists
        const existing = positions[existingPositionIndex]
        const oldSize = existing.size
        const oldAvgPrice = existing.avgPrice

        if (side === 'buy') {
          // Increase position: calculate new weighted average price
          const newSize = oldSize + size
          const newAvgPrice = (oldAvgPrice * oldSize + price * size) / newSize
          const newInitialValue = existing.initialValue + price * size
          const currentValue = newSize * price
          const cashPnl = currentValue - newInitialValue
          const percentPnl = cashPnl / newInitialValue

          return positions.map((p, idx) =>
            idx === existingPositionIndex
              ? {
                  ...p,
                  size: newSize,
                  avgPrice: newAvgPrice,
                  initialValue: newInitialValue, // Update initial value for PnL calculations
                  cashPnl,
                  percentPnl,
                  currentValue,
                }
              : p,
          )
        } else {
          // Decrease position: calculate remaining size
          const newSize = oldSize - size

          if (newSize <= 0.01) {
            // Remove position if size becomes zero or negative
            return positions.filter((_, idx) => idx !== existingPositionIndex)
          } else {
            // Update position with decreased size, avgPrice stays the same for sell orders
            // (avgPrice represents the average entry price, not affected by selling)
            return positions.map((p, idx) =>
              idx === existingPositionIndex
                ? {
                    ...p,
                    size: newSize,
                  }
                : p,
            )
          }
        }
      }),
    }
  }, [])

  return useUpdateQueriesCache<InfiniteData<PositionModel[]>, PositionUpdateData>({
    predicate: (query) => {
      return QUERY_KEYS_CONFIGS.predicateUserPositions(query.queryKey as string[], wallet)
    },
    updater: updater,
  })
}
