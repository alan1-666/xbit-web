import { formatBalance } from '@/lib/format'
import { cn } from '@/lib/utils.ts'
import { useTranslation } from 'react-i18next'

export interface OverviewAccountCardProps {
  accountName?: string
  balance: number
  totalPnl: number
  unrealizedPnl: number
  hideBalance?: boolean
  overrideTotalPnlText?: string
  totalPnlClassName?: string
  isShowUnrealizedPnl?: boolean
}

export const OverviewAccountCard = (props: OverviewAccountCardProps) => {
  const {
    accountName,
    balance,
    totalPnl,
    unrealizedPnl,
    hideBalance = false,
    overrideTotalPnlText,
    totalPnlClassName,
    isShowUnrealizedPnl,
  } = props
  const { t } = useTranslation()
  return (
    <div className="bg-[#141418] w-full border border-[#79778C29] p-5 rounded-[12px] space-y-3">
      <div className="flex-1 justify-center text-[#FBFBFB] text-[calc(20rem/16)] leading-tight">{accountName}</div>
      <div className={cn('grid', isShowUnrealizedPnl ? 'grid-cols-3' : 'grid-cols-2')}>
        <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
          <div className="justify-center text-[#FBFBFB] text-[calc(16rem/16)] leading-none tracking-wide">
            {hideBalance ? '******' : formatBalance(balance, { roundMode: 'floor', showCurrency: true })}
          </div>
          <div className="self-stretch justify-center text-[#6C6A74] text-[calc(12rem/16)] leading-3">
            {t('detail.holdings.balance')}
          </div>
        </div>
        <div className="flex-1 inline-flex flex-col justify-start items-start gap-2 text-[calc(16rem/16)] leading-none tracking-wide">
          {hideBalance ? (
            '******'
          ) : (
            <div
              className={cn(
                'justify-center text-[calc(16rem/16)] leading-none tracking-wide',
                totalPnl >= 0 ? 'text-rise' : 'text-fall',
                totalPnlClassName,
              )}
            >
              {formatBalance(totalPnl, {
                showCurrency: true,
                roundMode: 'floor',
              })}
            </div>
          )}
          <div className="self-stretch justify-center text-[#6C6A74] text-[calc(12rem/16)] leading-3">
            {overrideTotalPnlText ?? t('assets.funding.totalPnl')}
          </div>
        </div>
        {isShowUnrealizedPnl && (
          <div className="flex-1 inline-flex flex-col justify-start items-start gap-2 text-[calc(16rem/16)] leading-none tracking-wide">
            {hideBalance ? (
              '******'
            ) : (
              <div
                className={cn(
                  'justify-center text-[calc(16rem/16)] leading-none tracking-wide',
                  unrealizedPnl >= 0 ? 'text-rise' : 'text-fall',
                )}
              >
                {formatBalance(unrealizedPnl, {
                  showCurrency: true,
                  roundMode: 'floor',
                })}
              </div>
            )}
            <div className="self-stretch justify-center text-[#6C6A74] text-[calc(12rem/16)] leading-3">
              {t('assets.futures.unrealizedPnl')}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
