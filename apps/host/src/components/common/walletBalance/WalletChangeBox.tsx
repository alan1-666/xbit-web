import BalanceExpendChartWrapper from '@/components/common/walletBalance/BalanceExpendChartWrapper'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { UITab } from '@/types/uiTabs'
import { useTranslation } from 'react-i18next'
import { BalanceView } from '@components/common/walletBalance/BalanceView.tsx'
import { BalanceCollapseChart } from '@components/common/walletBalance/BalanceCollapseChart.tsx'
import { usePreference } from '@hooks/usePreference.ts'
import { useAppSelector } from '@/redux/store'
import { priceChain } from '@/redux/modules/price.slice.ts'
import { TYPE_CHAIN } from '@/lib/blockchain.ts'
import { formatBalanceWallet } from '@/lib/number.ts'
import { _changeTokenAccount } from '@/redux/modules/auth.slice.ts'
import { useGetAllAssetHistory } from '@hooks/useAssetHistory.ts'
import { AssetHistoryTimeFrame } from '@/@generated/gql/graphql-core.ts'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useResponsive } from '@hooks/hyperliquid/useResponsive.ts'

export interface DataItem {
  timestamp: number
  balance: number
  changeAmount: number
  changePercentage: number
}

export type NullableDataItem = DataItem | null

const SEL_RISE_COLOR = '0,255,180'
const UNSEL_SISE_COLOR = '5,72,53'

const SEL_FALL_COLOR = '171,87,255'
const UNSEL_FALL_COLOR = '70,26,102'

export function getColorRgb(hoverPoint: NullableDataItem) {
  if (!hoverPoint) return SEL_RISE_COLOR
  return hoverPoint.changePercentage >= 0 ? SEL_RISE_COLOR : SEL_FALL_COLOR
}

export function getUnSelColorRgb(hoverPoint: NullableDataItem) {
  if (!hoverPoint) return SEL_RISE_COLOR
  return hoverPoint.changePercentage >= 0 ? UNSEL_SISE_COLOR : UNSEL_FALL_COLOR
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

const periodMap: Record<string, AssetHistoryTimeFrame> = {
  '1day': AssetHistoryTimeFrame.D1,
  '1week': AssetHistoryTimeFrame.W1,
  '1month': AssetHistoryTimeFrame.M1,
  '1year': AssetHistoryTimeFrame.Y1,
}

export default function WalletChangeBox() {
  const { isDesktop } = useResponsive()
  const activeWallet = useSelector(_activeWallet)
  const [hideBalance, setHideBalance] = useState<boolean>(false)
  const { t } = useTranslation()
  const [isExpendChart, setExpendChart] = useState<boolean>(false)
  const { preference, updatePreference } = usePreference()
  const currentTime = useMemo(() => {
    return timeList.find((item) => item.value === preference.assetTimeRange) || timeList[1]
  }, [preference.assetTimeRange])

  const walletAddress = activeWallet?.walletAddress
  const chain = useAppSelector((state) => state.newWallet.activeChain)
  const tokenAddress = chain === TYPE_CHAIN.SOLANA ? 'So11111111111111111111111111111111111111111' : undefined

  const accessToken = useAppSelector(_changeTokenAccount)

  const { expand: expandedData, collapse: collapsedData } = useGetAllAssetHistory(
    {
      timeframe: periodMap[currentTime.value],
      userAddress: walletAddress,
      tokenAddress: tokenAddress,
    },
    !accessToken,
  )

  const firstItem = expandedData.length >= 0 ? expandedData[0] : null

  const paddingChart = 0
  const maxWidthChart = 768

  function getCalcW() {
    return window.innerWidth - paddingChart >= maxWidthChart ? maxWidthChart : window.innerWidth - paddingChart
  }

  const [width, setWidth] = useState(getCalcW())

  const [currentAmount, setCurrentAmount] = useState<NullableDataItem>()

  const handleHoverChange = (point: NullableDataItem) => {
    setCurrentAmount(point)
  }

  useEffect(() => {
    const handleResize = () => {
      setWidth(getCalcW())
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Translate time periods
  const translatedTimeList = timeList.map((item) => ({
    ...item,
    label: t(
      `chart.period.${item.label === '1日' ? 'day' : item.label === '1周' ? 'week' : item.label === '1月' ? 'month' : 'year'}`,
    ),
  }))

  const setCurrentTime = (item: UITab) => {
    updatePreference({ assetTimeRange: item.value })
  }

  const { currency } = preference
  const priceETH = useAppSelector(priceChain('ETH'))
  const priceSol = useAppSelector(priceChain('SOL'))

  const formatChartValue = useCallback(
    (value: number) => {
      if (currency === 'usd') {
        if (chain === TYPE_CHAIN.SOLANA) return `$${formatBalanceWallet({ balance: value * priceSol, decimal: 2 })}`
        if (chain === TYPE_CHAIN.ETH) return `$${formatBalanceWallet({ balance: value * priceETH, decimal: 2 })}`
        return formatBalanceWallet({ balance: value, decimal: 2 })
      } else {
        if (chain === TYPE_CHAIN.SOLANA) return `${value.toFixed(2)} SOL`
        if (chain === TYPE_CHAIN.ETH) return `${value.toFixed(2)} ETH`
        return `${value.toFixed(2)} ${chain.toUpperCase()}`
      }
    },
    [currency, chain, priceETH, priceSol],
  )

  return (
    <>
      <div className="flex items-end mb-[calc(1rem*(14/16))] px-[10px]">
        <BalanceView
          hideBalance={hideBalance}
          toggleHideBalance={() => setHideBalance(!hideBalance)}
          currentAmount={currentAmount ?? null}
          firstItem={firstItem}
          timeRange={currentTime.value}
        />

        <div
          className={cn(
            'w-[calc(1rem*(120/16))] h-[calc(1rem*(84/16))] transition-opacity duration-500 ease-in-out',
            isExpendChart ? 'opacity-0 pointer-events-none' : 'opacity-100',
            collapsedData && collapsedData.length > 0 ? 'block' : 'hidden',
          )}
          onClick={() => setExpendChart(true)}
        >
          <BalanceCollapseChart data={collapsedData} width={120} height={84} />
        </div>
      </div>

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
    </>
  )
}
