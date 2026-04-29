import { useMemo } from 'react'
import type { OrderBookData, OrderWithDepth } from './types'

export interface UseOrderBookProcessorOptions {
  data: OrderBookData[] | undefined
  maxOrders?: number
}

export interface ProcessedOrderBook {
  buyOrders: OrderWithDepth[]
  sellOrders: OrderWithDepth[]
  last: number
  spread: number
}

/**
 * Hook to process raw order book data into buy/sell orders with depth information
 */
export const useOrderBookProcessor = (options: UseOrderBookProcessorOptions): ProcessedOrderBook => {
  const { data, maxOrders = 5 } = options

  const { buyOrders, sellOrders } = useMemo(() => {
    if (!data || !data[0]) return { buyOrders: [], sellOrders: [] }

    const orderBook = data[0]
    const totalBuySize = orderBook.bids.reduce((acc, order) => acc + +order.size, 0)
    const totalSellSize = orderBook.asks.reduce((acc, order) => acc + +order.size, 0)

    // Process buy orders (bids) with depth
    const buyOrdersWithDepth = orderBook.bids.slice().map((order, index, self) => {
      const totalSizeUpToOrder = self.slice(0, index + 1).reduce((acc, o) => acc + +o.size, 0)
      const totalVolumeUpToOrder = self.slice(0, index + 1).reduce((acc, o) => acc + +o.size * +o.price, 0)
      return {
        ...order,
        depth: totalSizeUpToOrder / totalBuySize,
        volume: totalVolumeUpToOrder,
      }
    })

    // Process sell orders (asks) with depth
    const sellOrdersWithDepth = orderBook.asks.slice().map((order, index, self) => {
      const totalSizeUpToOrder = self.slice(index).reduce((acc, o) => acc + +o.size, 0)
      const totalVolumeUpToOrder = self.slice(index).reduce((acc, o) => acc + +o.size * +o.price, 0)
      return {
        ...order,
        depth: totalSizeUpToOrder / totalSellSize,
        volume: totalVolumeUpToOrder,
      }
    })

    return {
      buyOrders: buyOrdersWithDepth.slice(0, maxOrders),
      sellOrders: sellOrdersWithDepth.slice(-maxOrders),
    }
  }, [data, maxOrders])

  const { last, spread } = useMemo(() => {
    const lowestSell = sellOrders[sellOrders.length - 1]
    const highestBuy = buyOrders[0]

    return {
      last: lowestSell ? +lowestSell.price : highestBuy ? +highestBuy.price : 0,
      spread: lowestSell && highestBuy ? (+lowestSell.price - +highestBuy.price) * 100 : 0,
    }
  }, [buyOrders, sellOrders])

  return {
    buyOrders,
    sellOrders,
    last,
    spread,
  }
}
