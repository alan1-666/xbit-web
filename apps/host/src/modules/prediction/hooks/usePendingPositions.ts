import { useAppSelector } from '@/redux/store'
import { PendingOrder, selectAllPendingOrders } from '@/redux/modules/pendingOrders.slice'
import { PositionModel } from '@/modules/prediction/models/PositionModel'
import { useMemo } from 'react'

/**
 * Convert a PendingOrder from Redux into a PositionModel-like object
 * so it can be displayed alongside real positions in the UI.
 *
 * Fields we don't have are set to sensible defaults (0, '', false).
 * The `__pending` flag marks it as a pending order for UI differentiation.
 */
export const pendingOrderToPosition = (
  order: PendingOrder,
): PositionModel & { __pending: true; __pendingStatus: PendingOrder['status'] } => {
  return {
    __typename: 'UserPosition',
    marketId: order.marketId,
    tokenId: order.tokenId,
    conditionId: order.conditionId,
    outcome: order.outcomeLabel,
    outcomeIndex: order.outcome === 'yes' ? 0 : 1,
    size: order.size,
    avgPrice: order.price,
    curPrice: order.price,
    initialValue: order.size * order.price,
    currentValue: order.size * order.price,
    cashPnl: 0,
    percentPnl: 0,
    realizedPnl: 0,
    percentRealizedPnl: 0,
    totalBought: order.size * order.price,
    title: '',
    slug: '',
    eventId: '',
    eventSlug: '',
    icon: '',
    endDate: '',
    proxyWallet: '',
    tickSize: 0.01,
    mergeable: false,
    negativeRisk: false,
    redeemable: false,
    oppositeAsset: '',
    oppositeOutcome: '',
    __pending: true,
  }
}

/**
 * Hook to get pending orders converted to PositionModel format
 */
export const usePendingOrders = () => {
  return useAppSelector(selectAllPendingOrders)
}

export const usePendingOrdersByMarkets = (marketIds: string[] | undefined) => {
  const pendingOrders = usePendingOrders()
  return useMemo(() => {
    if (!marketIds || marketIds.length === 0) return pendingOrders
    return pendingOrders.filter((order) => marketIds.includes(order.marketId))
  }, [pendingOrders, marketIds?.join(',')])
}

/**
 * Type guard to check if a position is a pending order
 */
export const isPendingPosition = (
  position: PositionModel,
): position is PositionModel & { __pending: true; __pendingStatus: PendingOrder['status'] } => {
  return '__pending' in position && (position as any).__pending === true
}

export const mergePendingOrdersIntoPositions = (apiPositions: PositionModel[], pendingOrders: PendingOrder[]) => {
  const mergedData = apiPositions.slice()

  pendingOrders.forEach((p) => {
    const existingPositionIndex = mergedData.findIndex(
      (ap) => ap.conditionId === p.conditionId && ap.outcomeIndex === p.outcomeIndex,
    )

    if (existingPositionIndex !== -1) {
      // Clone the position to avoid mutating cache directly
      const existingPosition = { ...mergedData[existingPositionIndex] }

      if (p.side === 'buy') {
        const newSize = Number(existingPosition.size) + Number(p.size)
        const newAvgPrice =
          (Number(existingPosition.avgPrice) * Number(existingPosition.size) + Number(p.price) * Number(p.size)) /
          newSize
        const initialValue = +existingPosition.initialValue + Number(p.price) * Number(p.size)
        const currentValue = +existingPosition.currentValue + Number(p.price) * Number(p.size)
        const cashPnl = currentValue - initialValue
        const percentPnl = initialValue > 0 ? (currentValue - initialValue) / initialValue : 0

        existingPosition.size = newSize
        existingPosition.avgPrice = newAvgPrice
        existingPosition.initialValue = initialValue
        existingPosition.currentValue = currentValue
        existingPosition.cashPnl = cashPnl
        existingPosition.percentPnl = percentPnl
        existingPosition.__pending = true

        mergedData[existingPositionIndex] = existingPosition
      } else {
        // sell
        const newSize = Number(existingPosition.size) - Number(p.size)
        if (newSize < 0.01) {
          // Remove the item from array correctly by splicing
          mergedData.splice(existingPositionIndex, 1)
        } else {
          const newAvgPrice =
            (Number(existingPosition.avgPrice) * Number(existingPosition.size) - Number(p.price) * Number(p.size)) /
            newSize
          const initialValue = +existingPosition.initialValue - Number(p.price) * Number(p.size)
          const currentValue = +existingPosition.currentValue - Number(p.price) * Number(p.size)
          const cashPnl = currentValue - initialValue
          const percentPnl = initialValue > 0 ? (currentValue - initialValue) / initialValue : 0

          existingPosition.size = newSize
          existingPosition.avgPrice = newAvgPrice
          existingPosition.initialValue = initialValue
          existingPosition.currentValue = currentValue
          existingPosition.cashPnl = cashPnl
          existingPosition.percentPnl = percentPnl

          mergedData[existingPositionIndex] = existingPosition
        }
      }
    } else {
      if (p.side === 'buy') {
        mergedData.push(pendingOrderToPosition(p))
      }
    }
  })

  return mergedData
}
