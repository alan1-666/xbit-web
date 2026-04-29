import {
  formatPercentageChange,
  formatDuration,
  formatHolders,
  formatMarketValue,
  // formatTradeCount
} from '@/lib/format'

import { cn } from '@/lib/utils'
import { isNumber } from '@/utils/helpers.ts'
import { useMemo } from 'react'

type FormattingDisplayProps = {
  value: number
  className?: string
  showColor?: boolean
  allowOverrideStyle?: boolean
  showZero?: boolean
}

function PercentageChangeDisplay({ value, className }: FormattingDisplayProps) {
  return (
    <div className={cn(className, formatPercentageChange(value).cls)}>
      {isNumber(value) ? (
        <>
          {value > 0 ? '+' : ''}
          {formatPercentageChange(value).label}
        </>
      ) : (
        '--'
      )}
    </div>
  )
}

function DurationDisplay({ value, className, allowOverrideStyle = true }: FormattingDisplayProps) {
  return (
    <div className={cn(className)} style={allowOverrideStyle ? { color: formatDuration(value).color } : {}}>
      {value !== undefined && value !== null && isNumber(value) ? formatDuration(value).label : '--'}
    </div>
  )
}

function HolderDisplay({ value, className }: FormattingDisplayProps) {
  return (
    <div className={cn(className, '')} style={{ color: formatHolders(value) }}>
      {formatHolders(value)}
    </div>
  )
}

function MarketDisplay({ value, className, showColor = false, showZero = true }: FormattingDisplayProps) {
  const textColor = useMemo(() => {
    if (!showColor) return 'text-white'
    if (value <= 100_000) return 'text-white'
    if (value <= 1_000_000) return 'text-[#00CE89]'
    return 'text-impartal'
  }, [value, showColor])

  return (
    <div className={cn(className, textColor)} style={{ color: formatMarketValue(value) }}>
      {showZero ? (
        <>{value >= 0 ? `${formatMarketValue(value, '$')}` : '--'}</>
      ) : (
        <>{value > 0 ? `${formatMarketValue(value, '$')}` : '--'}</>
      )}
    </div>
  )
}

function TradeCountDisplay({ value, className }: FormattingDisplayProps) {
  return (
    <div className={cn(className, '')} style={{ color: formatMarketValue(value) }}>
      ${formatMarketValue(value)}
    </div>
  )
}

export {
  PercentageChangeDisplay,
  DurationDisplay,
  HolderDisplay,
  MarketDisplay,
  MarketDisplay as TransactionAmountDisplay,
  MarketDisplay as PoolAmountDisplay,
  TradeCountDisplay,
}
