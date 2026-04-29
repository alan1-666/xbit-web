import { HolderDto } from '@/@generated/gql/graphql-meme2.ts'
import { useNativeTokenPrice } from '@/hooks/useNativeTokenPrice'
import isNumber from 'lodash/isNumber'
import { formatAmount, formatPercent, formatVolume } from '@/lib/format'
import { useAppSelector } from '@/redux/store'
import { useResponsive } from '@hooks/hyperliquid/useResponsive.ts'
import { useNativeTokenSymbol } from '@hooks/useActiveChain.ts'
import { memo, useMemo } from 'react'

type OptimizedTotalProfitColumnProps = {
  holder: HolderDto
  fallbackPrice?: number
}

const OptimizedTotalProfitColumn = memo(({ holder, fallbackPrice }: OptimizedTotalProfitColumnProps) => {
  const dataUnit = useAppSelector((state) => state.userSettings.dataUnit)
  const nativeTokenSymbol = useNativeTokenSymbol()
  const nativeTokenPrice = useNativeTokenPrice()

  const { isDesktop } = useResponsive()

  const unrealizedProfit = useMemo(() => {
    const avgBuyPrice = holder?.totalBuyQty && holder?.totalBuyUsd ? holder?.totalBuyUsd / holder?.totalBuyQty : 0
    if (isNaN(avgBuyPrice) || avgBuyPrice === 0) return 0
    return (Number(fallbackPrice) - Number(avgBuyPrice)) * Number(holder?.balance) || 0
  }, [fallbackPrice, holder])
  const realizedProfit = Number(holder?.realizedProfit) || 0
  const totalProfit = unrealizedProfit + realizedProfit
  const totalProfitPercentage = useMemo(() => {
    return totalProfit !== 0 && Number(holder?.totalBuyUsd) !== 0
      ? (totalProfit / Number(holder?.totalBuyUsd)) * 100
      : 0
  }, [totalProfit, holder?.totalBuyUsd])

  return (
    <div className="space-y-1.5">
      <div
        className={`app-font-medium !leading-[1] ${totalProfit > 0 ? 'text-rise' : totalProfit < 0 ? 'text-fall' : 'text-[#CACACA]'} ${isDesktop ? 'text-[14px]' : 'text-[13px]'}`}
      >
        {dataUnit === 'USD'
          ? formatVolume(totalProfit, { showCurrency: true, roundMode: 'floor' })
          : formatAmount(totalProfit / nativeTokenPrice, {
              unit: nativeTokenSymbol,
              roundMode: 'floor',
            })}
      </div>
      <div
        className={`app-font-regular !leading-[1] ${totalProfit > 0 ? 'text-rise' : totalProfit < 0 ? 'text-fall' : 'text-[#605e68]'} ${isDesktop ? 'text-[13px]' : 'text-[11px]'}`}
      >
        {formatPercent(totalProfitPercentage)}
      </div>
    </div>
  )
})

OptimizedTotalProfitColumn.displayName = 'OptimizedTotalProfitColumn'

export default OptimizedTotalProfitColumn
