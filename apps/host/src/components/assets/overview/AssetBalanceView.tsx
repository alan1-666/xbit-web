import { formatBalance, formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils.ts'
import { useAppSelector } from '@/redux/store'
import { EstimatedAssets } from '@components/assets/overview/EstimatedAssets.tsx'
import { Loader } from '@components/common/MoneyFormatted.tsx'
import { BalanceCollapseChart } from '@components/common/walletBalance/BalanceCollapseChart.tsx'
import { NullableDataItem } from '@components/common/walletBalance/WalletChangeBox.tsx'
import { IconEye, IconEyeSlash } from '@components/icon'
import { ChartItem } from '@hooks/useAssetChart.ts'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

export interface AssetBalanceViewProps {
  hideBalance: boolean
  toggleHideBalance: (hide: boolean) => void
  currentAmount: NullableDataItem
  firstItem: ChartItem | undefined
  timeRange: string
  chartExpanded: boolean
  expandChart: () => void
  walletName?: ReactNode
  showArrow?: boolean
  balance?: string
  initChangeAmount?: number
  walletBalance?: number
  nativeTokenBalance?: number
  nativeTokenSymbol?: string
  loadingBalance?: boolean
  viewType: 'overview' | 'funding' | 'futures'
  memeBalance1DAgo?: number
  collapsedData: ChartItem[]
  expandData: ChartItem[]
}

const useStableColorState = (changePercentage: number, delay: number = 500) => {
  const [stablePercentage, setStablePercentage] = useState(changePercentage)

  useEffect(() => {
    const timer = setTimeout(() => {
      setStablePercentage(changePercentage)
    }, delay)

    return () => clearTimeout(timer)
  }, [changePercentage, delay])

  return stablePercentage
}

/**
 * @fileoverview AssetBalanceView component
 * @description This component displays the asset balance view.
 * It is used in the AssetOverview component to show the balance of a specific asset. Temporarily, it replaces the @components/common/walletBalance/BalanceView.tsx component.
 * @constructor
 */
export const AssetBalanceView = (props: AssetBalanceViewProps) => {
  const {
    toggleHideBalance,
    hideBalance,
    currentAmount,
    firstItem,
    timeRange,
    showArrow,
    walletName,
    initChangeAmount,
    walletBalance,
    nativeTokenBalance,
    nativeTokenSymbol,
    loadingBalance = false,
    viewType,
    chartExpanded,
    expandChart,
    collapsedData,
    expandData,
  } = props
  const { t } = useTranslation()
  const priceList = useAppSelector((state) => state.price.list)
  const changeAmount = useMemo(() => {
    if (((!chartExpanded && initChangeAmount !== undefined) || !currentAmount) && viewType !== 'futures') {
      return Number(initChangeAmount)
    }
    const first = expandData.find((item) => item.balance != 0) || expandData[0]
    const last = expandData[expandData.length - 1]
    if (currentAmount) {
      const curr = currentAmount?.balance || 0
      if (!curr) return 0
      const change = curr - first.balance
      return change
    }
    if (expandData && expandData.length > 0) {
      const change = last.balance - first.balance
      return change
    }
    return 0
  }, [expandData, currentAmount, chartExpanded, initChangeAmount])

  const changePercentage = useMemo(() => {
    if (((!chartExpanded && initChangeAmount !== undefined) || !currentAmount) && viewType !== 'futures') {
      const firstBalance = Number(walletBalance) - Number(initChangeAmount || 0)
      const lastBalance = Number(walletBalance)
      if (firstBalance === 0) {
        if (lastBalance === 0) return 0
        return 100
      }
      return (Number(initChangeAmount) / Math.abs(firstBalance)) * 100
    }
    const first = expandData.find((item) => item.balance != 0) || expandData[0]
    const last = expandData[expandData.length - 1]
    if (currentAmount) {
      const curr = currentAmount?.balance || 0
      if (!curr) return 0
      if (first.balance === 0) return 99999
      const change = ((curr - first.balance) / Math.abs(first.balance)) * 100
      return change
    }
    if (expandData && expandData.length > 0) {
      if (first.balance === 0) return 99999
      const change = ((last.balance - first.balance) / Math.abs(first.balance)) * 100
      return change
    }
    return 0
  }, [expandData, currentAmount, initChangeAmount, walletBalance, chartExpanded])

  const isFirstCharge = useMemo(() => changePercentage >= 99999, [changePercentage])

  const timeRangeLabel = useMemo(() => {
    switch (timeRange) {
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
  }, [timeRange])

  const balanceFormatted = useMemo(() => {
    if (currentAmount) {
      return formatBalance(currentAmount.balance, {
        roundMode: 'floor',
      })
    }
    if (walletBalance)
      return formatBalance(walletBalance, {
        roundMode: 'floor',
      })
    return '0'
  }, [currentAmount, walletBalance])

  const stablePercentage = useStableColorState(changePercentage, 300)

  const nativeTokenPrice = priceList[nativeTokenSymbol || ''] || priceList['SOL'] || 1

  return (
    <div>
      <div className="w-full flex items-start justify-between">
        <div className="flex-1">
          {walletName ?? <EstimatedAssets />}
          <div className={cn('mt-3 flex items-end gap-1 text-white')}>
            <span className="text-[24px] leading-none font-medium">≈</span>
            <span className="text-[32px] font-bold leading-[32px] flex items-center">
              {hideBalance ? '*****' : loadingBalance ? <Loader /> : balanceFormatted}
            </span>
            <span className="text-[12px] leading-[1.4] text-white/70">USD</span>
            {!!nativeTokenBalance && !!nativeTokenSymbol && (
              <span onClick={() => toggleHideBalance(!hideBalance)} className="cursor-pointer ml-0.5">
                {hideBalance ? <IconEyeSlash /> : <IconEye />}
              </span>
            )}
          </div>

          {/* {!!nativeTokenBalance && !!nativeTokenSymbol && (
            <div className="mt-2.5 flex items-center gap-1.5">
              <div className="text-white/70 text-[12px] font-[330] leading-none">
                {formatAddressWallet(selectedWallet?.walletAddress)}
              </div>
              <CopyButton text={selectedWallet?.walletAddress} />
            </div>
            // <div className="flex items-end gap-1 mt-3">
            //   <div className="text-[14px] text-white/50">{t('assets.funding.estBalance')}</div>
            //   <span className="text-[14px] text-white">
            //     {hideBalance ? (
            //       '*****'
            //     ) : loadingBalance ? (
            //       <Loader />
            //     ) : (
            //       <MoneyFormatted value={+balance / nativeTokenPrice} unit={nativeTokenSymbol} roundType="floor" />
            //     )}
            //   </span>
            // </div>
          )} */}

          <div className="flex items-center text-(--text-tertiary) h-4 mt-3 gap-1.5">
            <div className="font-[330] text-[15px] leading-[15px] text-white/70">{timeRangeLabel}</div>
            <div
              className="font-[330] text-[15px] leading-[15px]"
              style={{
                color: changeAmount === 0 ? 'var(--text-tertiary)' : changeAmount > 0 ? 'var(--rise)' : 'var(--fall)',
              }}
            >
              {hideBalance ? (
                '*****'
              ) : loadingBalance ? (
                <Loader />
              ) : (
                formatBalance(changeAmount, {
                  showSign: true,
                  showCurrency: true,
                  roundMode: 'floor',
                })
              )}
            </div>
            {!hideBalance && (
              <>
                {loadingBalance ? (
                  <Loader />
                ) : !isFirstCharge ? (
                  <div
                    className="font-[330] text-[15px] leading-[15px]"
                    style={{
                      color:
                        Number(changeAmount) === 0
                          ? 'var(--text-tertiary)'
                          : Number(changeAmount) > 0
                            ? 'var(--rise)'
                            : 'var(--fall)',
                    }}
                  >
                    (
                    {formatPercent(changePercentage, {
                      showSign: true,
                    })}
                    )
                  </div>
                ) : (
                  <></>
                )}
              </>
            )}
            {/* <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger>
              <img src="/images/orderSetting/icon-info.svg" className="h-4 w-4 min-w-4" alt="" />
            </TooltipTrigger>
            <TooltipContent className="text-center bg-[linear-gradient(43.83deg,#9035FF_0%,#EE69FF_103.57%)] p-[0.6px] rounded-[8px]">
              <div className="p-2 bg-[#0A0A0A] rounded-[8px]">
                <p className="text-xs leading-none">{t('assets.balanceChangeTooltip', { timeRange: timeRangeLabel })}</p>
                <p className="mt-1.5 text-xs leading-none">
                  {t('assets.percentChangeTooltip', { timeRange: timeRangeLabel })}
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider> */}
            {showArrow && (
              <div
                className={cn(
                  'inline-block rounded-[200px] px-1.5 cursor-pointer transition-transform duration-300 rotate-270',
                )}
              >
                <img src="/images/icons/arrow-down-icon.svg" alt="Arrow Icon" />
              </div>
            )}
          </div>
        </div>
        <div
          className={cn(
            'w-[calc(1rem*(120/16))] h-[calc(1rem*(84/16))] transition-opacity duration-500 ease-in-out',
            chartExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100',
            collapsedData ? 'block' : 'hidden',
          )}
          onClick={() => expandChart()}
        >
          <BalanceCollapseChart firstItem={firstItem} data={collapsedData} width={120} height={84} />
        </div>
      </div>
    </div>
  )
}
