import { OrderBookRow } from './OrderBookRow'
import { OrderBookEmptyState } from './OrderBookEmptyState'
import type { OrderWithDepth } from './types'

export interface OrderBookBuyOrdersProps {
  orders: OrderWithDepth[]
  minTickSize?: number
  openOrderPrices?: Set<string>
}

export const OrderBookBuyOrders = ({ orders, minTickSize, openOrderPrices }: OrderBookBuyOrdersProps) => {
  if (orders.length === 0) {
    return <OrderBookEmptyState type="bids" />
  }

  return (
    <>
      {orders.map((order, index) => (
        <OrderBookRow
          key={`buy-${index}`}
          order={order}
          type="buy"
          minTickSize={minTickSize}
          hasOpenOrder={openOrderPrices?.has(order.price)}
        />
      ))}
    </>
  )
}
