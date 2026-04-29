import { HolderDto } from '@/@generated/gql/graphql-meme2.ts'
import { useNativeTokenPrice } from '@/hooks/useNativeTokenPrice'
import { formatAmount, formatPercent, formatVolume } from '@/lib/format'
import { useAppSelector } from '@/redux/store'
import { memo, useMemo } from 'react'

type OptimizedUnrealizedColumnProps = {
  holder: HolderDto
  fallbackPrice?: number
}

const OptimizedUnRealizedColumn = memo(({ holder, fallbackPrice }: OptimizedUnrealizedColumnProps) => {
  const dataUnit = useAppSelector((state) => state.userSettings.dataUnit)

  const nativeTokenPrice = useNativeTokenPrice()

  const unrealizedProfit = useMemo(() => {
    const avgBuyPrice = holder?.totalBuyQty && holder?.totalBuyUsd ? holder?.totalBuyUsd / holder?.totalBuyQty : 0
    if (isNaN(avgBuyPrice) || avgBuyPrice === 0) return 0
    return (Number(fallbackPrice) - Number(avgBuyPrice)) * Number(holder?.balance) || 0
  }, [fallbackPrice, holder])
  const unrealizedProfitPercentage =
    unrealizedProfit && holder?.totalBuyUsd ? (unrealizedProfit / Number(holder?.totalBuyUsd)) * 100 : 0

  return (
    <div className="space-y-1.5">
      <div
        className={`app-font-medium text-[13px] leading-[1] ${unrealizedProfit > 0 ? 'text-rise' : unrealizedProfit < 0 ? 'text-fall' : 'text-[#CACACA]'}`}
      >
        {dataUnit === 'USD'
          ? formatVolume(unrealizedProfit ? unrealizedProfit : 0, { showCurrency: true, roundMode: 'floor' })
          : formatAmount(unrealizedProfit && nativeTokenPrice ? unrealizedProfit / nativeTokenPrice : 0, {
              unit: dataUnit,
              roundMode: 'floor',
            })}
      </div>
      <div
        className={`app-font-regular text-[11px] leading-[1] ${unrealizedProfit > 0 ? 'text-rise' : unrealizedProfit < 0 ? 'text-fall' : 'text-[#605e68]'}`}
      >
        {formatPercent(unrealizedProfitPercentage)}
      </div>
    </div>
  )
})

OptimizedUnRealizedColumn.displayName = 'OptimizedUnRealizedColumn'

export default OptimizedUnRealizedColumn
