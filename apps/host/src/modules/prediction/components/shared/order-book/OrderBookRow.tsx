import { formatAmount } from '@/lib/format.ts'
import { useMemo } from 'react'
import { Clock } from 'lucide-react'
import type { OrderWithDepth } from './types'

export interface OrderBookRowProps {
  order: OrderWithDepth
  type: 'buy' | 'sell'
  minTickSize?: number
  hasOpenOrder?: boolean
}

export const OrderBookRow = ({ order, type, minTickSize = 0.01, hasOpenOrder }: OrderBookRowProps) => {
  const isBuy = type === 'buy'
  const textColorClass = isBuy ? 'text-rise' : 'text-fall'
  const bgClass = isBuy ? 'bg-(image:--rise-transaction-bg)' : 'bg-(image:--fall-transaction-bg)'

  const decimals = useMemo(() => -Math.log10(minTickSize), [minTickSize])

  const formattedPrice = useMemo(() => {
    const price = +order.price * 100
    return price.toLocaleString('en-US', {})
  }, [decimals, order.price])

  return (
    <div className="border-none relative grid grid-cols-3 h-6 items-center px-3 text-xs font-normal mb-0.5 last:mb-0 hover:bg-white/5">
      <div
        className={`absolute inset-y-0 left-0 transition duration-75 ${bgClass}`}
        style={{ width: `${order.depth * 100}%` }}
      />
      <div className={textColorClass}>{formattedPrice}¢</div>
      <div className="text-end flex items-center justify-end gap-1">
        {hasOpenOrder && <Clock className="size-3 text-muted-foreground" />}
        {formatAmount(+order.size)}
      </div>
      <div className="text-end">${formatAmount(+order.volume)}</div>
    </div>
  )
}
