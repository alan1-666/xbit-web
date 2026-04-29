import { useNativeTokenPrice } from '@/hooks/useNativeTokenPrice'
import { formatAmount, formatPercent, formatVolume } from '@/lib/format'
import { cn } from '@/lib/utils.ts'
import { useAppSelector } from '@/redux/store'
import { memo } from 'react'

type OptimizedUsdColumnProps = {
  upperUsdValue: number
  lowerUsdValue?: number
  upperValueClassName?: string
  lowerValueClassName?: string
  lowerUnit?: string
  showPercentage?: boolean
  isPnL?: boolean
  txCount?: number
  customColorUpperValue?: string
}

const OptimizedUsdColumn = memo(
  ({
    upperUsdValue,
    lowerUsdValue,
    lowerUnit,
    upperValueClassName = 'app-font-medium text-[13px] leading-[1] text-[#CACACA]',
    lowerValueClassName = 'app-font-regular text-[11px] leading-[1] text-[#605e68]',
    isPnL = false,
    txCount = undefined,
  }: OptimizedUsdColumnProps) => {
    const dataUnit = useAppSelector((state) => state.userSettings.dataUnit)
    const nativeTokenPrice = useNativeTokenPrice()

    return (
      <div className="space-y-1.5">
        <div className={cn(upperValueClassName)}>
          {dataUnit === 'USD'
            ? formatVolume(upperUsdValue ? upperUsdValue : 0, { showCurrency: true })
            : formatAmount(upperUsdValue && nativeTokenPrice ? upperUsdValue / nativeTokenPrice : 0, {
                unit: dataUnit,
              })}
        </div>
        <div className={cn(lowerValueClassName)}>
          {lowerUnit === '%' ? formatPercent(lowerUsdValue ? lowerUsdValue : 0) : formatVolume(lowerUsdValue)}
          {txCount !== undefined && <span className=""> / {formatVolume(txCount)} TXs</span>}
        </div>
      </div>
    )
  },
)

OptimizedUsdColumn.displayName = 'OptimizedUsdColumn'

export default OptimizedUsdColumn
