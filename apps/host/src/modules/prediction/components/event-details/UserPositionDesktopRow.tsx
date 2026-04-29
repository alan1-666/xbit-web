import { cn } from '@/lib/utils'
import { formatBalance, formatPercent, formatPrice } from '@/lib/format'
import { IPortfolioPosition } from '@/modules/prediction/models/PortfolioModel'
import { PayoutIcon } from '../icons'
import { useTranslation } from 'react-i18next'
import { EventDetailsSellButton } from '@/modules/prediction/components/shared/PositionCardSellButton.tsx'

interface UserPositionDesktopRowProps {
  pos: IPortfolioPosition
  isSingle?: boolean
}

export const UserPositionDesktopRow = ({ pos, isSingle }: UserPositionDesktopRowProps) => {
  const { t } = useTranslation()
  const isPositive = Number(pos.cashPnl) >= 0
  const outcomeBgClass = pos.outcomeIndex === 0 ? 'bg-[#04332B]' : 'bg-[#38120B]'
  const outcomeTextClass = pos.outcomeIndex === 0 ? 'text-[#00CE89]' : 'text-[#EA3B4F]'

  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-col rounded-lg bg-[#101114] border-[0.5px] border-[#FFFFFF1A] w-full overflow-hidden">
        {/* Top: outcome badge + current value */}
        <div className="flex items-center justify-between gap-2 border-b border-[#FFFFFF1A] py-2.5 px-3">
          <div className="flex items-center min-w-0">
            <span
              className={cn(
                'shrink-0 p-1 rounded-md text-xs font-normal leading-none text-white',
                outcomeBgClass,
                outcomeTextClass,
              )}
            >
              {pos.outcome}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold leading-none">
              {formatBalance(pos.currentValue, { showCurrency: true })}
            </span>
          </div>
        </div>

        {/* Middle: Avg, Current, Return */}
        <div className="flex flex-col gap-2 border-t border-white/5 px-3 pt-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#908E98]">{t('prediction.position.avg')}</span>
            <span className="text-sm text-white">{formatPrice(Number(pos.avgPrice) * 100)}¢</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#908E98]">{t('prediction.position.current')}</span>
            <span className="text-sm text-white">{formatPrice(Number(pos.curPrice) * 100)}¢</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#908E98]">{t('assets.futures.unrealizedPnl')}</span>
            <span className={cn('text-sm font-medium', isPositive ? 'text-rise' : 'text-fall')}>
              {isPositive ? '+' : ''}
              <span className="mr-1">{formatPrice(pos.cashPnl, { showCurrency: true })}</span>(
              {formatPercent(pos.percentPnl, { showSign: true })})
            </span>
          </div>
        </div>

        {/* Sell button */}
        <EventDetailsSellButton
          position={pos}
          className={isSingle ? 'w-32 h-8 px-0 ml-auto mr-3 mt-2 mb-3 text-xs' : ''}
        />

        {/* Bottom: Initial cost, Payout */}
        <div className="flex justify-between items-start border-t-[0.5px] border-[#FFFFFF1A] py-2 mx-4">
          <div className="flex flex-col">
            <span className="text-xs text-[#908E98]">{t('prediction.position.bet')}</span>
            <span className="text-sm text-white">{formatBalance(pos.initialValue, { showCurrency: true })}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-[#908E98]">{t('prediction.position.toWin')}</span>
            <div className="flex items-center gap-1">
              <PayoutIcon className="shrink-0" />
              <span className="text-sm font-semibold text-rise">{formatBalance(pos.size, { showCurrency: true })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
