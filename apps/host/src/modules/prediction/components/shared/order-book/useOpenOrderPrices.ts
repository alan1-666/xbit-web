import { useMemo } from 'react'
import { useMyPolymarketOpenOrders } from '@/modules/prediction/hooks/usePolymarketOpenOrders'

export interface OpenOrderPrices {
  buyPrices: Set<string>
  sellPrices: Set<string>
}

export const useOpenOrderPrices = (conditionId?: string, tokenId?: string): OpenOrderPrices => {
  const { data: openOrders } = useMyPolymarketOpenOrders(conditionId, {
    enabled: !!conditionId,
  })

  return useMemo(() => {
    const buyPrices = new Set<string>()
    const sellPrices = new Set<string>()

    if (!openOrders || !tokenId) return { buyPrices, sellPrices }

    for (const order of openOrders) {
      if (order.asset_id !== tokenId) continue
      if (order.side === 'BUY') {
        buyPrices.add(order.price)
      } else if (order.side === 'SELL') {
        sellPrices.add(order.price)
      }
    }

    return { buyPrices, sellPrices }
  }, [openOrders, tokenId])
}
