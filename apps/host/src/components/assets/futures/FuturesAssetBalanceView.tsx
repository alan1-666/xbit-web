import { formatPercentageChange } from '@/lib/format.ts'
import { formatBalanceWallet } from '@/lib/number.ts'
import { cn } from '@/lib/utils.ts'
import { EstimatedAssets } from '@components/assets/overview/EstimatedAssets.tsx'
import { ReactNode, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader } from '@components/common/MoneyFormatted.tsx'
import { ICurrentAmount } from './FuturesAssetOverview'

export interface AssetBalanceViewProps {
  hideBalance: boolean
  toggleHideBalance: (hide: boolean) => void
  currentAmount: ICurrentAmount | undefined
  timeRange: string
  walletName?: ReactNode
  balance?: string
  walletBalance?: number
  isLoading?: boolean
  // futuresValueHistory: NullableDataItem | undefined
}

/**
 * @fileoverview AssetBalanceView component
 * @description This component displays the asset balance view.
 * It is used in the AssetOverview component to show the balance of a specific asset. Temporarily, it replaces the @components/common/walletBalance/BalanceView.tsx component.
 * @constructor
 */
export const FuturesAssetBalanceView = (props: AssetBalanceViewProps) => {
  const { hideBalance, currentAmount, timeRange, walletName, walletBalance, isLoading } = props
  const { t } = useTranslation()

  const timeRangeLabel = useMemo(() => {
    switch (timeRange) {
      case '1day':
        return t('chart.period.day')
      case '1week':
        return t('chart.period.week')
      case '1month':
        return t('chart.period.month')
      case '1year':
        return t('chart.period.year')
      default:
        return t('chart.period.day')
    }
  }, [timeRange])

  const balance = useMemo(() => {
    if (currentAmount) {
      return currentAmount?.balance >= 0
        ? formatBalanceWallet({ balance: Number(Number(currentAmount?.balance)), decimal: 2 })
        : '--'
    }
    return 0
  }, [currentAmount, walletBalance])

  const changeAmount = useMemo(() => {
    if (currentAmount) {
      const isNegative = currentAmount.oneDayChange < 0
      return (
        (isNegative ? '-' : '+') +
        '$' +
        formatBalanceWallet({ balance: Math.abs(+currentAmount.oneDayChange), decimal: 2 })
      )
    }
  }, [currentAmount, walletBalance])

  return (
    <div className="flex-1 mr-3">
      <div className="flex items-center mb-3">{walletName ?? <EstimatedAssets />}</div>

      <div className={cn('flex items-center mb-2', 'text-[#FFFFFF]')}>
        <span className="text-[calc(1rem*(24/16))] leading-[calc(1rem*(24/16))] mr-1 font-bold">≈</span>
        <span className="text-[calc(1rem*(32/16))] leading-[calc(1rem*(32/16))] mr-2 font-bold">
          {hideBalance ? '*****' : isLoading ? <Loader /> : balance}
        </span>
        <span className="text-[calc(1rem*(12/16))] leading-[calc(1rem*(12/16))] translate-y-[2px]">USD</span>
      </div>

      <div className="flex items-center text-(--text-tertiary) h-4">
        <div
          className={cn('text-[calc(1rem*(13/16))] leading-[calc(1rem*(13/16))] mr-2')}
          style={{
            color:
              Number(currentAmount?.oneDayChange) === 0
                ? 'var(--text-tertiary)'
                : Number(currentAmount?.oneDayChange) > 0
                  ? 'var(--rise)'
                  : 'var(--fall)',
          }}
        >
          {hideBalance ? (
            '*****'
          ) : isLoading ? (
            <Loader />
          ) : Number(currentAmount?.oneDayChange) === 0 ? (
            '$0'
          ) : (
            changeAmount
          )}
        </div>
        {!hideBalance && (
          <>
            {isLoading ? (
              <Loader />
            ) : currentAmount?.oneDayPercentChange === undefined ? (
              <div
                className={cn(
                  'py-0.5 px-1 bg-(--rise) text-center text-[#1D1D20]  rounded-[3px] text-[calc(1rem*(12/16))] leading-[calc(1rem*(12/16))]',
                  'transition-colors duration-300 ease-in-out',
                )}
              >
                --
              </div>
            ) : (
              <div
                className={cn(
                  'py-0.5 px-1 text-[#1D1D20] rounded-[3px] text-[calc(1rem*(12/16))] leading-[calc(1rem*(12/16))]',
                  'transition-colors duration-300 ease-in-out',
                  Math.abs(currentAmount?.oneDayPercentChange) < 0.01
                    ? 'bg-[#ECECED1F] text-[#FFFFFFB2]'
                    : currentAmount?.oneDayPercentChange >= 0
                      ? 'bg-(--rise)'
                      : 'bg-(--fall)',
                )}
              >
                {(currentAmount?.oneDayPercentChange ?? 0) >= 0.01 ? '+' : ''}
                {formatPercentageChange(currentAmount?.oneDayPercentChange ?? 0).label}
              </div>
            )}
          </>
        )}
        <div className="text-[calc(1rem*(12/16))] leading-[calc(1rem*(12/16))] ml-2">{timeRangeLabel}</div>
      </div>
    </div>
  )
}
