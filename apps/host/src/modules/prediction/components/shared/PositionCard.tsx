import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatBalance, formatPercent, formatPrice } from '@/lib/format'
import { NAVIGATIONS } from '@/lib/navigations'
import { cn } from '@/lib/utils'
import { PositionModel } from '@/modules/prediction/models/PositionModel'
import { roundByTickSize } from '@/utils/helpers'
import { ChevronRight } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { MarketModel } from '../../models/MarketModel'
import { PayoutIcon } from '../icons'

interface PositionCardProps {
  position: PositionModel & {
    groupItemTitle?: string
  }
  renderSellButton?: (position: PositionModel) => React.ReactNode
  showEventHeader?: boolean
  market?: MarketModel
  currentTitle?: string
}

const EventHeader = ({ icon, title, eventSlug }: { icon: string; title: string; eventSlug: string }) => {
  return (
    <Link
      to={NAVIGATIONS.prediction.eventDetails(eventSlug)}
      className="flex w-full items-center gap-2.5 rounded-t-lg py-3 px-0 text-left transition-colors hover:bg-[#18181B]"
    >
      <Avatar className="size-[24px] shrink-0 rounded-sm">
        <AvatarImage src={icon} alt={title} className="object-cover" />
        <AvatarFallback className="rounded-sm text-xs">{title?.[0]}</AvatarFallback>
      </Avatar>
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-white line-clamp-2">{title}</span>
      <ChevronRight className="size-5 shrink-0 text-white" />
    </Link>
  )
}

export const PositionCard = ({
  position,
  renderSellButton,
  showEventHeader,
  market,
  currentTitle,
}: PositionCardProps) => {
  // const isPositive = Number(position.cashPnl) >= 0
  const outcomeBgClass = position.outcomeIndex === 0 ? 'bg-[#04332B]' : 'bg-[#38120B]'
  const outcomeTextClass = position.outcomeIndex === 0 ? 'text-[#00CE89]' : 'text-[#EA3B4F]'
  const { t } = useTranslation()

  const currentValue = useMemo(() => {
    if (position?.curPrice === 0 || position?.curPrice === 0) return 0

    return position?.curPrice * position?.size
  }, [position])

  const currentPrice = useMemo(() => {
    if (!market) return position?.curPrice

    const conditionBid = position.outcomeIndex === 0 ? market?.tokenYesBestBid : market?.tokenNoBestBid

    return conditionBid || 0
  }, [market, position.outcomeIndex, position?.curPrice])

  const { pnl, percentPnl } = useMemo(() => {
    if (!market) return { pnl: position?.cashPnl, percentPnl: position?.percentPnl }

    const pnl = position.size * currentPrice - position.initialValue || 0
    const percentPnl = (pnl / position.initialValue) * 100 || 0

    return { pnl, percentPnl }
  }, [market, currentPrice])

  return (
    <div className="flex w-full flex-col">
      {showEventHeader && position.eventSlug && (
        <EventHeader icon={position.icon} title={position.title} eventSlug={position.eventSlug} />
      )}
      <div className="flex flex-col rounded-lg bg-[#101114] border-[0.5px] border-[#FFFFFF1A] w-full overflow-hidden">
        {/* Top section: size + outcome badge | value + pnl */}
        <div className="flex items-center justify-between gap-2 border-b border-[#FFFFFF1A] py-2.5 px-3">
          <div className="flex items-center min-w-0">
            {position.groupItemTitle && (
              <span className={cn('shrink-0 p-1 rounded-[4px] text-base font-semibold leading-none text-white')}>
                {position.groupItemTitle}
              </span>
            )}
            <span
              className={cn(
                'shrink-0 p-1 rounded-[4px] text-xs font-normal leading-none text-white',
                outcomeBgClass,
                outcomeTextClass,
              )}
            >
              {position.outcome}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn('text-base font-bold leading-none')}>
              {formatBalance(currentValue, { showCurrency: true })}
            </span>
          </div>
        </div>

        {/* Middle section: Avg, Current, Return */}
        <div className="flex flex-col gap-2 border-t border-white/5 px-3 pt-2">
          <div className="flex justify-between items-center ">
            <span className="text-xs text-[#908E98]">{t('prediction.position.avg')}</span>
            <span className="text-sm text-white">
              {formatPrice(roundByTickSize(Number(position.avgPrice), position.tickSize))}¢
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#908E98]">
              {currentTitle ? currentTitle : t('prediction.position.current')}
            </span>
            <span className="text-sm text-white">
              {/* {formatPrice(roundByTickSize(Number(currentPrice), position.tickSize))}¢ */}
              {(currentPrice * 100).toLocaleString('en-US', {})}¢
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#908E98]">{t('assets.futures.unrealizedPnl')}</span>
            <span className={cn('text-sm font-medium', pnl > 0 ? 'text-rise' : 'text-fall')}>
              {pnl > 0 ? '+' : ''}
              <span className="mr-1">{formatPrice(pnl, { showCurrency: true })}</span>(
              {formatPercent(percentPnl, { showSign: true })})
            </span>
          </div>
        </div>

        {/* Sell button - injected by parent */}
        {renderSellButton?.(position)}

        {/* Bottom section: Initial cost, Payout */}
        <div className="flex justify-between items-start border-t-[0.5px] border-[#FFFFFF1A] py-2 mx-3">
          <div className="flex flex-col">
            <span className="text-xs text-[#908E98]">{t('prediction.position.bet')}</span>
            <span className="text-sm text-white">{formatBalance(position.initialValue, { showCurrency: true })}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-[#908E98]">{t('prediction.position.toWin')}</span>
            <div className="flex items-center gap-1">
              <PayoutIcon className="shrink-0" />
              <span className="text-sm font-semibold text-rise">
                {formatBalance(position.size, { showCurrency: true, roundMode: 'floor' })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
