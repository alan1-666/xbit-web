import { formatAmount, formatVolume } from '@/lib/format.ts'
import { cn } from '@/lib/utils.ts'
import { PoolTransactionType } from '@/types/enums.ts'
import { useNativePriceByActiveChain, useNativeTokenNameByChain } from '@hooks/useNativeTokenNameByChain.ts'
import { memo } from 'react'

interface OptimizedTotalValueCellProps {
  usdAmount: number
  isSingleSide: boolean
  type: string
  dataUnit?: string
  className?: string
}

const OptimizedTotalValueCell = memo(
  ({ usdAmount, isSingleSide, type, dataUnit, className = 'text-[calc(12rem/16)]' }: OptimizedTotalValueCellProps) => {
    const nativePrice = useNativePriceByActiveChain()
    const nativeToken = useNativeTokenNameByChain()

    const getDisplayValue = () => {
      if (dataUnit !== 'USD') {
        const solAmount = usdAmount / (parseFloat(nativePrice) || 1)
        return { amount: solAmount, symbol: ` ${nativeToken}` }
      }
      return { amount: usdAmount, symbol: '$' }
    }

    const { amount, symbol } = getDisplayValue()

    const isRemoveType = type === PoolTransactionType.Remove || type === PoolTransactionType.RemoveLiquidity

    return (
      <div
        className={cn(
          `text-xs font-medium inline-flex items-center gap-1 whitespace-nowrap`,
          isSingleSide ? 'cursor-pointer' : '',
          isRemoveType ? 'text-fall' : 'text-rise',
        )}
      >
        <span className={className}>
          {symbol === '$'
            ? formatVolume(usdAmount, { showCurrency: true })
            : formatAmount(amount, {
                unit: symbol,
              })}
        </span>
      </div>
    )
  },
)

OptimizedTotalValueCell.displayName = 'OptimizedTotalValueCell'

export default OptimizedTotalValueCell
