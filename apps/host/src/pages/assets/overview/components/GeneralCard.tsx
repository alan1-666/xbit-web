import { formatBalance, formatPercent } from '@/lib/format'
import ls from '@/lib/local-storage.ts'
import { cn } from '@/lib/utils.ts'
import BalanceExpendChartWrapper from '@components/common/walletBalance/BalanceExpendChartWrapper.tsx'
import { IconEye, IconEyeSlash } from '@components/icon'
import { IconChevronDown2 } from '@components/icon/stroke/IconChevronDown2.tsx'
import { TooltipProvider } from '@components/ui/tooltip.tsx'
import { SimpleTooltip } from '@components/v2/ui-shared/components/SimpleTooltip.tsx'
import { ChartItem } from '@hooks/useAssetChart.ts'
import { usePreference } from '@hooks/usePreference.ts'
import { BalanceChart } from '@pages/assets/overview/components/BalanceChart.tsx'
import { Timeframe, TimeframeSelector } from '@pages/assets/overview/components/TimeframeSelector.tsx'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

export interface GeneralCardProps {
  totalBalance: number
  changeAmount: number
  changePercentage: number
  overviewExpandData: ChartItem[]
  firstItem: ChartItem
  hideBalance?: boolean
  setHideBalance?: (hide: boolean) => void
}

export const GeneralCard = (props: GeneralCardProps) => {
  const { totalBalance, changeAmount, changePercentage, overviewExpandData, firstItem, hideBalance, setHideBalance } =
    props
  const { t } = useTranslation()

  const [showChart, setShowChart] = useState(false)
  const [hoverPoint, setHoverPoint] = useState<ChartItem | null>(null)
  const { preference, updatePreference } = usePreference()

  const timeRangeLabel = useMemo(() => {
    switch (preference.assetTimeRange) {
      case '1day':
        return t('assets.overview.dayPnL')
      case '1week':
        return t('assets.overview.weekPnL')
      case '1month':
        return t('assets.overview.monthPnL')
      case '1year':
        return t('assets.overview.yearPnL')
      default:
        return t('assets.overview.todayPnL')
    }
  }, [preference.assetTimeRange])

  const timeframe: Timeframe = useMemo(() => {
    switch (preference.assetTimeRange) {
      case '1day':
        return '1D'
      case '1week':
        return '1W'
      case '1month':
        return '1M'
      case '1year':
        return '1Y'
      default:
        return '1D'
    }
  }, [preference])

  const updateTimeframe = (value: Timeframe) => {
    let assetTimeRange = '1day'
    switch (value) {
      case '1D':
        assetTimeRange = '1day'
        break
      case '1W':
        assetTimeRange = '1week'
        break
      case '1M':
        assetTimeRange = '1month'
        break
      case '1Y':
        assetTimeRange = '1year'
        break
    }
    updatePreference({ assetTimeRange })
  }

  useEffect(() => {
    ls.set('asset_hide_balance', hideBalance ? '1' : '0')
  }, [hideBalance])

  const hoverableChangeAmount = useMemo(() => {
    return hoverPoint ? hoverPoint.changeAmount : changeAmount
  }, [hoverPoint, changeAmount])

  const hoverableChangePercentage = useMemo(() => {
    return hoverPoint ? hoverPoint.changePercentage : changePercentage
  }, [hoverPoint, changePercentage])

  return (
    <div className="bg-[#141418] w-full border border-[#79778C29] p-5 rounded-[12px] relative">
      <div className="flex items-center h-[120px]">
        <div className="flex-1">
          <div className="flex items-center text-[#79778C] gap-1 mb-2">
            <TooltipProvider>
              <SimpleTooltip content={t('assets.overview.estimatedAssetsDescription')}>
                <span className="justify-start decoration-dotted underline leading-5 underline-offset-8 text-[calc(20rem/16)]">
                  {t('assets.spot.assets')}
                </span>
              </SimpleTooltip>
            </TooltipProvider>
            <button onClick={() => setHideBalance?.(!hideBalance)}>
              {hideBalance ? <IconEyeSlash className="size-5" /> : <IconEye className="size-5" />}
            </button>
          </div>

          <div>
            <span className="text-[#FBFBFB] text-[calc(40rem/16)] font-semibold">
              {!hideBalance
                ? formatBalance(hoverPoint ? hoverPoint.balance : totalBalance, {
                    roundMode: 'floor',
                  })
                : '******'}
            </span>{' '}
            <span className="text-[calc(20rem/16)] text-[#6C6A74]">USD</span>
          </div>

          <div>
            <span className="justify-start text-[#6C6A74] font-normal leading-none">{timeRangeLabel}</span>{' '}
            {!hideBalance ? (
              <span
                className={cn(
                  'justify-start text-rise leading-tight',
                  hoverableChangeAmount > 0 ? 'text-rise' : 'text-fall',
                )}
              >
                {formatBalance(hoverableChangeAmount, {
                  showSign: true,
                  showCurrency: true,
                  roundMode: 'floor',
                })}{' '}
                (
                {formatPercent(hoverableChangePercentage, {
                  showSign: true,
                })}
                )
              </span>
            ) : (
              '******'
            )}
          </div>
        </div>
        <div
          className="absolute top-5 right-5 rounded-full border-[#79778C29] border-[0.6px] py-0.5 px-2.5 bg-[#212127] cursor-pointer"
          onClick={() => setShowChart(!showChart)}
        >
          <IconChevronDown2
            className={cn('size-1.5 text-[#908E98] transition-transform', showChart ? '-rotate-180' : 'rotate-0')}
          />
        </div>
        <div>
          <div
            className={cn('cursor-pointer', showChart ? 'h-0 overflow-hidden' : '')}
            onClick={() => setShowChart(true)}
          >
            <BalanceExpendChartWrapper
              data={overviewExpandData}
              width={360}
              height={120}
              period="1day"
              isThumb={true}
              firstItem={firstItem}
            />
          </div>
        </div>
      </div>
      <div
        className={cn(
          'flex flex-col gap-1 items-end transition h-[262px] duration-300',
          showChart ? '' : 'h-0 overflow-hidden',
        )}
      >
        <TimeframeSelector value={timeframe} onValueChange={updateTimeframe} />
        <BalanceChart
          data={overviewExpandData}
          initialColor={hoverableChangeAmount >= 0 ? 'rise' : 'fall'}
          onHoverChange={setHoverPoint}
        />
      </div>
    </div>
  )
}
