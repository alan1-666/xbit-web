import { useMarketOrderBook } from '@/modules/prediction/hooks/useMarketOrderBook.ts'
import {
  OrderBookHeader,
  OrderBookSpread,
  OrderBookSkeleton,
  OrderBookSellOrders,
  OrderBookBuyOrders,
  useOrderBookProcessor,
} from './order-book'
import { useOpenOrderPrices } from './order-book/useOpenOrderPrices'

export interface OrderBookProps {
  marketId: string
  tokenId: string
  minTickSize?: number
  conditionId?: string
}

export const OrderBook = (props: OrderBookProps) => {
  const { tokenId, marketId, minTickSize, conditionId } = props
  const { data, isPending } = useMarketOrderBook({
    marketId,
    tokenId,
  })

  const { buyOrders, sellOrders, last, spread } = useOrderBookProcessor({ data })
  const { buyPrices, sellPrices } = useOpenOrderPrices(conditionId, tokenId)

  if (isPending) {
    return <OrderBookSkeleton />
  }

  return (
    <div className="w-full">
      <OrderBookHeader />
      <div className="tex-sm">
        <OrderBookSellOrders orders={sellOrders} minTickSize={minTickSize} openOrderPrices={sellPrices} />
        <OrderBookSpread last={last} spread={spread} />
        <OrderBookBuyOrders orders={buyOrders} minTickSize={minTickSize} openOrderPrices={buyPrices} />
      </div>
    </div>
  )
}
