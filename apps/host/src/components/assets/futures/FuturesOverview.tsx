import { WalletBalanceUnit, WalletDuration } from '@/@generated/gql/graphql-core.ts'
import { usePortfolioData } from '@/hooks/hyperliquid/usePortfolioData'
import { formatBalanceWallet } from '@/lib/number.ts'
import { cn } from '@/lib/utils.ts'
import { UITab } from '@/types/uiTabs.ts'
import { AssetBalanceView } from '@components/assets/overview/AssetBalanceView.tsx'
import BalanceExpendChartWrapper from '@components/common/walletBalance/BalanceExpendChartWrapper.tsx'
import { NullableDataItem } from '@components/common/walletBalance/WalletChangeBox.tsx'
import { usePreference } from '@hooks/usePreference.ts'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAssetChart } from '@hooks/useAssetChart.ts'
import { useResponsive } from '@hooks/hyperliquid/useResponsive.ts'
export interface AssetOverviewProps {
  hideBalance: boolean
  setHideBalance: (value: boolean) => void
  showArrow?: boolean
  walletName?: ReactNode
  balance?: number
  walletAddress?: string
}

const timeList: UITab[] = [
  {
    label: '1日',
    value: '1day',
  },
  {
    label: '1周',
    value: '1week',
  },
  {
    label: '1月',
    value: '1month',
  },
  {
    label: '1年',
    value: '1year',
  },
]

const periodMap: Record<string, WalletDuration> = {
  '1day': WalletDuration.D1,
  '1week': WalletDuration.W1,
  '1month': WalletDuration.M1,
  '1year': WalletDuration.Y1,
}

const paddingChart = 0
const maxWidthChart = 768

export const FuturesOverview = (props: AssetOverviewProps) => {
  const { isDesktop } = useResponsive()
  const { hideBalance, setHideBalance, showArrow, walletName, balance, walletAddress } = props
  const [currentAmount, setCurrentAmount] = useState<NullableDataItem>()
  const [isExpendChart, setExpendChart] = useState<boolean>(false)
  const [width, setWidth] = useState(getCalcW())

  const { preference, updatePreference } = usePreference()
  const { t } = useTranslation()

  const { dayData, weekData, monthData, allTimeData, loading } = usePortfolioData()

  const currentTime = useMemo(() => {
    return timeList.find((item) => item.value === preference.assetTimeRange) || timeList[0]
  }, [preference.assetTimeRange])

  const pointData = useMemo(() => {
    if (currentTime.value === '1day') return dayData
    if (currentTime.value === '1week') return weekData
    if (currentTime.value === '1month') return monthData
    return allTimeData
  }, [dayData, weekData, monthData, allTimeData, currentTime])

  const { collapsedData: collapsedMemeData, expandedData: expandedMemeData } = useAssetChart({
    duration: periodMap[currentTime.value],
    unit: WalletBalanceUnit.Usd,
  })

  const handleHoverChange = (point: NullableDataItem) => {
    setCurrentAmount(point)
  }

  function getCalcW() {
    return window.innerWidth - paddingChart >= maxWidthChart ? maxWidthChart : window.innerWidth - paddingChart
  }

  useEffect(() => {
    updatePreference({ assetTimeRange: timeList[0].value }) // Default to 1 day
    const handleResize = () => {
      setWidth(getCalcW())
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const formatChartValue = useCallback((value: number) => {
    return '$' + formatBalanceWallet({ balance: +value, decimal: 2 })
  }, [])

  const setCurrentTime = (item: UITab) => {
    updatePreference({ assetTimeRange: item.value })
  }

  const translatedTimeList = timeList.map((item) => ({
    ...item,
    label: t(
      `chart.period.${item.label === '1日' ? 'day' : item.label === '1周' ? 'week' : item.label === '1月' ? 'month' : 'year'}`,
    ),
  }))

  const collapsedData = useMemo(() => {
    const data: typeof collapsedMemeData = []
    if (!pointData?.accountValueHistory || pointData.accountValueHistory.length === 0) return data
    const firstBalance = pointData?.accountValueHistory[0] || 0
    for (const point of collapsedMemeData) {
      let futureBalance = pointData?.accountValueHistory?.[0] || 0
      let futureChangeAmount = 0
      if (pointData?.accountValueHistory) {
        for (let i = pointData.accountValueHistory.length - 1; i >= 0; i--) {
          const item = pointData.accountValueHistory[i]
          if (item[0] <= point.timestamp) {
            futureBalance = item
            if (firstBalance) {
              futureChangeAmount = (Number(item[1]) - Number(firstBalance[1])) * 100
            }
            break
          }
        }
      }
      data.push({
        ...point,
        balance: Number(futureBalance[1]),
        changeAmount: futureChangeAmount,
      })
    }
    return data
  }, [pointData, collapsedMemeData])

  const expandedData = useMemo(() => {
    const data: typeof expandedMemeData = []
    if (!pointData?.accountValueHistory || pointData.accountValueHistory.length === 0) return data
    const firstBalance =
      pointData?.accountValueHistory.find((item) => Number(item[1]) != 0) || pointData?.accountValueHistory[0] || 0
    for (const point of expandedMemeData) {
      let futureBalance = pointData?.accountValueHistory?.[0] || {}
      let futureChangeAmount = 0
      if (pointData?.accountValueHistory) {
        for (let i = pointData.accountValueHistory.length - 1; i >= 0; i--) {
          const item = pointData.accountValueHistory[i]
          if (item[0] <= point.timestamp) {
            futureBalance = item
            if (firstBalance) {
              futureChangeAmount = (Number(item[1]) - Number(firstBalance[1])) * 100
            }
            break
          }
        }
      }
      data.push({
        ...point,
        balance: Number(futureBalance[1]),
        changeAmount: futureChangeAmount,
      })
    }
    return data
  }, [pointData, expandedMemeData])

  const firstItem = useMemo(() => {
    if (!expandedData || expandedData.length === 0) return undefined
    return expandedData.find((item) => Number(item.balance) > 0) || expandedData[0]
  }, [expandedData])

  return (
    <>
      <AssetBalanceView
        hideBalance={hideBalance}
        toggleHideBalance={() => setHideBalance(!hideBalance)}
        currentAmount={currentAmount ?? null}
        firstItem={firstItem}
        viewType={'futures'}
        timeRange={currentTime.value}
        chartExpanded={isExpendChart}
        expandChart={() => setExpendChart(!isExpendChart)}
        showArrow={showArrow}
        walletName={walletName}
        walletBalance={balance}
        loadingBalance={loading}
        collapsedData={collapsedData}
        expandData={expandedData}
      />

      <div
        className={cn(
          'overflow-hidden transition-all duration-500 ease-in-out',
          isExpendChart ? 'max-h-[560px]' : 'max-h-0',
          expandedData ? 'block' : 'hidden',
        )}
      >
        <div className={cn('mb-2', width == maxWidthChart ? 'mx-auto w-[768px]' : '', isDesktop && 'w-full')}>
          <BalanceExpendChartWrapper
            data={expandedData}
            width={isDesktop ? 1280 : width}
            height={isDesktop ? 450 : width / 1.6}
            period={currentTime.value}
            onHoverChange={handleHoverChange}
            isThumb={false}
            formatChartValue={formatChartValue}
            firstItem={firstItem}
            isFilterPoints={false}
          />

          <div className="text-center grid grid-cols-4 mt-2 select-none">
            {translatedTimeList.map((item) => (
              <div key={item.value} className="flex justify-center">
                <div
                  className={cn(
                    'cursor-pointer inline-block px-2 py-1 text-(--text-tertiary) rounded-[200px] text-[calc(1rem*(12/16))] leading-[calc(1rem*(12/16))]',
                    currentTime.value === item.value ? 'text-(--text-primary) bg-[rgba(236,236,237,0.08)]' : '',
                  )}
                  onClick={() => setCurrentTime(timeList.find((t) => t.value === item.value) || timeList[0])}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center select-none">
          <div
            className={cn(
              'inline-block rounded-[200px] px-1.5 bg-(--bg-secondary) cursor-pointer transition-transform duration-300',
              isExpendChart ? 'rotate-180' : '',
              expandedData && expandedData.length > 0 ? 'visible' : 'invisible pointer-events-none',
            )}
            onClick={() => setExpendChart(!isExpendChart)}
          >
            <img src="/images/icons/arrow-down-icon.svg" alt="Arrow Icon" />
          </div>
        </div>
      </div>
    </>
  )
}
