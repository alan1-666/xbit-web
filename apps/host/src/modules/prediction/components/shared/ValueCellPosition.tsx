import { IPortfolioPosition } from '../../models/PortfolioModel'
import { cn } from '@/lib/utils'
import { formatBalance, formatPercent, formatPrice } from '@/lib/format'
import { useEffect, useMemo } from 'react'

interface ValueCellPositionProps {
  position: IPortfolioPosition
}

const ValueCellPosition = ({ position }: ValueCellPositionProps) => {
  const { curPrice, size, initialValue } = position
  const realtimeValue = Number(curPrice) * Number(size)
  const realtimeCashPnl = realtimeValue - Number(initialValue)
  const realtimePercentPnl = Number(initialValue) !== 0 ? (realtimeCashPnl / Number(initialValue)) * 100 : 0

  // useEffect(() => {
  //   console.table(position)
  // }, [position])

  const colorText = useMemo(() => {
    if (realtimeCashPnl > 0) return 'text-rise'
    if (realtimeCashPnl < 0) return 'text-fall'
    return 'text-white'
  }, [realtimeCashPnl])

  return (
    <div className="flex flex-col items-start">
      <span className="text-sm font-medium text-white">{formatBalance(realtimeValue, { showCurrency: true })}</span>
      <div className={cn('text-xs', colorText)}>
        {formatPrice(realtimeCashPnl, { showCurrency: true })} ({formatPercent(realtimePercentPnl)})
      </div>
    </div>
  )
}

export default ValueCellPosition
