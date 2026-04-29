import { WalletBalanceUnit, WalletDuration } from '@/@generated/gql/graphql-core.ts'
import { formatBalanceWallet } from '@/lib/number.ts'
import { cn } from '@/lib/utils.ts'
import { UITab } from '@/types/uiTabs.ts'
import { AssetBalanceView } from '@components/assets/overview/AssetBalanceView.tsx'
import BalanceExpendChartWrapper from '@components/common/walletBalance/BalanceExpendChartWrapper.tsx'
import { NullableDataItem } from '@components/common/walletBalance/WalletChangeBox.tsx'
import { useAssetChart } from '@hooks/useAssetChart.ts'
import { usePreference } from '@hooks/usePreference.ts'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useResponsive } from '@hooks/hyperliquid/useResponsive.ts'
import BigNumber from 'bignumber.js'
import { useFuturesPortfolio } from '@pages/assets/overview/hooks/useTotalBalance.ts'

export interface AssetOverviewProps {
  hideBalance: boolean
  setHideBalance: (value: boolean) => void
  showArrow?: boolean
  walletName?: ReactNode
  balance?: number
  fundingBalanceChange?: number
  walletAddress?: string
  chainId?: number
  nativeTokenBalance?: number
  nativeTokenSymbol?: string
  loadingBalance?: boolean
  viewType: 'overview' | 'funding' | 'futures'
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

export const AssetOverview = (props: AssetOverviewProps) => {
  const {
    hideBalance,
    setHideBalance,
    showArrow,
    walletName,
    balance,
    fundingBalanceChange,
    walletAddress,
    chainId,
    nativeTokenBalance,
    nativeTokenSymbol,
    loadingBalance,
    viewType,
  } = props
  const { isDesktop } = useResponsive()
  const [currentAmount, setCurrentAmount] = useState<NullableDataItem>()
  const [isExpandChart, setExpandChart] = useState<boolean>(false)
  const [width, setWidth] = useState(getCalcW())

  const { preference, updatePreference } = usePreference()
  const { t } = useTranslation()

  const { dayData, weekData, monthData, allTimeData, loading } = useFuturesPortfolio()

  useEffect(() => {
    updatePreference({ assetTimeRange: timeList[0].value })
  }, [])

  const currentTime = useMemo(() => {
    return timeList.find((item) => item.value === preference.assetTimeRange) || timeList[0]
  }, [preference.assetTimeRange])

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

  const { collapsedData, expandedData } = useAssetChart({
    chainId,
    walletAddress,
    duration: periodMap[currentTime.value],
    unit: WalletBalanceUnit.Usd,
  })

  const overviewCollapseData = useMemo(() => {
    if (viewType !== 'overview') return collapsedData
    const data: typeof collapsedData = []
    if (!collapsedData || collapsedData.length === 0) return data

    let futureData = dayData
    switch (currentTime.value) {
      case '1day':
        futureData = dayData
        break
      case '1week':
        futureData = weekData
        break
      case '1month':
        futureData = monthData
        break
      case '1year':
        futureData = allTimeData
        break
      default:
        futureData = dayData
        break
    }

    const firstBalance =
      futureData?.accountValueHistory.find((item) => Number(item[1]) != 0) || futureData?.accountValueHistory[0] || 0
    for (const point of collapsedData) {
      let futureBalance = futureData?.accountValueHistory?.[0] || undefined
      let futureChangeAmount = 0
      if (futureData?.accountValueHistory) {
        for (let i = futureData.accountValueHistory.length - 1; i >= 0; i--) {
          const item = futureData.accountValueHistory[i]
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
        balance: futureBalance ? Number(futureBalance[1]) + Number(point.balance) : point.balance,
        changeAmount: futureBalance ? futureChangeAmount + Number(point.changeAmount) : Number(point.changeAmount),
      })
    }
    return data
  }, [collapsedData, currentTime.value, dayData, weekData, monthData])

  const overviewExpandData = useMemo(() => {
    if (viewType !== 'overview') return expandedData
    const data: typeof expandedData = []
    if (!expandedData || expandedData.length === 0) return data
    let futureData = dayData
    switch (currentTime.value) {
      case '1day':
        futureData = dayData
        break
      case '1week':
        futureData = weekData
        break
      case '1month':
        futureData = monthData
        break
      case '1year':
        futureData = allTimeData
        break
      default:
        futureData = dayData
        break
    }

    const firstBalance =
      futureData?.accountValueHistory.find((item) => Number(item[1]) != 0) || futureData?.accountValueHistory[0] || 0
    for (const point of expandedData) {
      let futureBalance = undefined
      let futureChangeAmount = 0
      if (futureData?.accountValueHistory) {
        for (let i = futureData.accountValueHistory.length - 1; i >= 0; i--) {
          const item = futureData.accountValueHistory[i]
          if (item[0] <= point.timestamp) {
            futureBalance = item
            if (firstBalance) {
              futureChangeAmount = Number(item[1]) - Number(firstBalance[1])
            }
            break
          }
        }
      }
      data.push({
        ...point,
        balance: futureBalance ? Number(futureBalance[1]) + Number(point.balance) : point.balance,
        changeAmount: futureBalance ? futureChangeAmount + Number(point.changeAmount) : Number(point.changeAmount),
      })
    }
    return data
  }, [expandedData, currentTime.value, dayData, weekData, monthData])

  const initChangeAmount = useMemo(() => {
    let change = fundingBalanceChange || 0
    if (viewType === 'overview') {
      let futureData = dayData
      switch (currentTime.value) {
        case '1day':
          futureData = dayData
          break
        case '1week':
          futureData = weekData
          break
        case '1month':
          futureData = monthData
          break
        case '1year':
          futureData = allTimeData
          break
        default:
          futureData = dayData
          break
      }
      const firstBalance =
        futureData?.accountValueHistory.find((item) => Number(item[1]) != 0) || futureData?.accountValueHistory[0]
      const lastBalance = futureData?.accountValueHistory[futureData.accountValueHistory.length - 1] || firstBalance
      const lastChangeAmount =
        lastBalance && firstBalance ? new BigNumber(lastBalance[1]).minus(new BigNumber(firstBalance[1])).toNumber() : 0

      change = Number(change) + Number(lastChangeAmount)
    }
    return change
  }, [fundingBalanceChange, expandedData, currentTime.value, dayData, weekData, monthData])

  const firstItem = useMemo(() => {
    if (!overviewExpandData || overviewExpandData.length === 0) return undefined
    return overviewExpandData.find((item) => Number(item.balance) > 0) || overviewExpandData[0]
  }, [overviewExpandData])

  return (
    <>
      <AssetBalanceView
        hideBalance={hideBalance}
        toggleHideBalance={() => setHideBalance(!hideBalance)}
        currentAmount={currentAmount ?? null}
        firstItem={firstItem}
        viewType={viewType}
        timeRange={currentTime.value}
        chartExpanded={isExpandChart}
        expandChart={() => setExpandChart(!isExpandChart)}
        showArrow={showArrow}
        walletName={walletName}
        walletBalance={balance}
        initChangeAmount={initChangeAmount}
        nativeTokenBalance={nativeTokenBalance}
        nativeTokenSymbol={nativeTokenSymbol}
        loadingBalance={loading || loadingBalance}
        collapsedData={overviewCollapseData}
        expandData={overviewExpandData}
      />

      <div
        className={cn(
          'overflow-hidden transition-all duration-500 ease-in-out',
          isExpandChart ? 'max-h-[560px]' : 'max-h-0',
          expandedData ? 'block' : 'hidden',
        )}
      >
        <div className={cn('mb-2 mx-auto', width == maxWidthChart ? 'w-[768px]' : '', isDesktop && 'w-[1280px]')}>
          <div className="flex justify-center">
            <BalanceExpendChartWrapper
              data={overviewExpandData}
              width={isDesktop ? 1280 : width}
              height={isDesktop ? 450 : width / 1.6}
              period={currentTime.value}
              onHoverChange={handleHoverChange}
              isThumb={false}
              formatChartValue={formatChartValue}
              firstItem={firstItem}
            />
          </div>
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
              isExpandChart ? 'rotate-180' : '',
              expandedData && expandedData.length > 0 ? 'visible' : 'invisible pointer-events-none',
            )}
            onClick={() => setExpandChart(!isExpandChart)}
          >
            <img src="/images/icons/arrow-down-icon.svg" alt="Arrow Icon" />
          </div>
        </div>
      </div>
    </>
  )
}
