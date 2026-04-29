import { OrderBookRow } from './OrderBookRow'
import { OrderBookEmptyState } from './OrderBookEmptyState'
import type { OrderWithDepth } from './types'

export interface OrderBookSellOrdersProps {
  orders: OrderWithDepth[]
  minTickSize?: number
  openOrderPrices?: Set<string>
}

export const OrderBookSellOrders = ({ orders, minTickSize, openOrderPrices }: OrderBookSellOrdersProps) => {
  if (orders.length === 0) {
    return <OrderBookEmptyState type="asks" />
  }

  return (
    <div>
      {orders.map((order, index) => (
        <OrderBookRow
          key={`sell-${index}`}
          order={order}
          type="sell"
          minTickSize={minTickSize}
          hasOpenOrder={openOrderPrices?.has(order.price)}
        />
      ))}
    </div>
  )
}
