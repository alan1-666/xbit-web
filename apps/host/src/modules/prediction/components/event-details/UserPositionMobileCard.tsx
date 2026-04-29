import { cn } from '@/lib/utils'
import { formatBalance, formatPercent, formatPrice } from '@/lib/format'

import { IPortfolioPosition } from '@/modules/prediction/models/PortfolioModel'
import { Button } from '@/components/ui/button'
import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext'
import { eventDetailsPageActions } from '@/modules/prediction/hooks/useEventDetailsPageReducer'
import Decimal from 'decimal.js'
import { useTranslation } from 'react-i18next'

interface UserPositionMobileCardProps {
  pos: IPortfolioPosition
}

export const UserPositionMobileCard = ({ pos }: UserPositionMobileCardProps) => {
  const { event, dispatch } = useEventDetailsPageContext()
  const { t } = useTranslation()
  const isPositive = Number(pos.cashPnl) >= 0
  const outcomeTextClass = pos.outcome === 'Yes' ? 'text-rise' : 'text-fall'
  const outcomeBgClass = pos.outcome === 'Yes' ? 'bg-rise/10' : 'bg-fall/10'

  const handleCashOut = () => {
    // Use orderFormState so drawer form gets prefilled when it mounts
    // (eventBus would fire before BaseOrderForm mounts)
    const outcome = pos.outcome.toLowerCase() as 'yes' | 'no'
    const decimals = pos.tickSize ? new Decimal(pos.tickSize).dp() : 2
    const size = Decimal(pos.size).toDecimalPlaces(decimals, Decimal.ROUND_DOWN).toNumber()
    const market = event?.markets?.find(
      (m) => String(m.id) === String(pos.marketId) || String(m.providerId) === String(pos.marketId),
    )
    if (market) {
      dispatch(eventDetailsPageActions.setSelectedMarket(market))
    }
    dispatch(
      eventDetailsPageActions.setOrderFormState({
        side: 'sell',
        outcome,
        size,
        shouldFocus: true,
        timestamp: Date.now(),
      }),
    )
    dispatch(eventDetailsPageActions.setSelectedOutcome(outcome))
    dispatch(eventDetailsPageActions.setTradeDrawerOpen(true))
  }

  return (
    <div className="flex flex-col w-full rounded-lg bg-card text-foreground border border-border pt-3 gap-4 overflow-hidden">
      <div className="flex flex-col gap-2 px-3">
        <div className="flex w-full items-center gap-3">
          {pos.icon && (
            <div className="size-10.5 relative overflow-hidden rounded-[4px]">
              <img alt={`${pos.outcome} icon`} src={pos.icon} className="absolute h-full w-full inset-0 object-cover" />
            </div>
          )}
          <div
            className={cn('flex h-5 w-fit items-center rounded-sm px-[5px] py-[3px]', outcomeBgClass, outcomeTextClass)}
          >
            <p className="text-xs font-medium text-inherit leading-[18px] tracking-[0.15px]">{pos.outcome}</p>
          </div>
          <p className="text-xs font-medium text-muted-foreground leading-[18px] tracking-[0.15px]">
            {formatBalance(pos.size, { roundMode: 'floor' })} shares
          </p>
        </div>
        <div className="flex gap-5 py-2">
          <div className="flex flex-col items-start">
            <p className="text-xs font-medium text-muted-foreground leading-[18px] tracking-[0.15px]">Avg</p>
            <div className="flex gap-2 h-[21px] overflow-visible items-center">
              <p className="text-sm font-semibold leading-[21px] tracking-[0.15px] text-foreground">
                {formatPrice(pos.avgPrice * 100)}¢
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start">
            <p className="text-xs font-medium text-muted-foreground leading-[18px] tracking-[0.15px]">Current</p>
            <div className="flex gap-2 h-[21px] overflow-visible items-center">
              <p className="text-sm font-semibold leading-[21px] tracking-[0.15px] text-foreground">
                {formatPrice(Number(pos.curPrice) * 100)}¢
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start">
            <p className="text-xs font-medium text-muted-foreground leading-[18px] tracking-[0.15px]">Return</p>
            <div className="flex gap-2 h-[21px] overflow-visible items-center">
              <p
                className={cn(
                  'text-sm font-semibold leading-[21px] tracking-[0.15px]',
                  isPositive ? 'text-rise' : 'text-fall',
                )}
              >
                {isPositive ? '+' : ''}
                {formatPrice(pos.cashPnl, { showCurrency: true })} ({formatPercent(pos.percentPnl)})
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 px-3 gap-2">
        <span className="flex h-12 flex-1 w-full max-w-full">
          <Button
            className="w-full h-12 text-base font-semibold bg-fall hover:bg-fall/85 text-white shadow-lg shadow-fall/20 rounded-md transition-all active:scale-[0.98]"
            onClick={handleCashOut}
          >
            {t('prediction.orderForm.sell')}
          </Button>
        </span>
      </div>

      <div className="flex w-full justify-between bg-muted/20 px-3 py-2 border-t border-border">
        <div className="flex flex-col items-start">
          <p className="text-xs font-medium text-muted-foreground leading-[18px] tracking-[0.15px]">Initial cost</p>
          <div className="flex gap-2 h-[21px] overflow-visible items-center">
            <p className="text-sm font-semibold leading-[21px] tracking-[0.15px] text-foreground">
              {formatBalance(pos.initialValue, { showCurrency: true })}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-xs font-medium text-muted-foreground leading-[18px] tracking-[0.15px]">Payout</p>
          <div className="flex gap-2 h-[21px] overflow-visible items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="14" viewBox="0 0 20 14" fill="none">
              <path d="M0 8V5.49951H20V7.74951L5.5 14.0005L0 8Z" fill="#21832D"></path>
              <path d="M12.5 -0.000488281L0 5.49951L5.5 11.6245L20 5.49951L12.5 -0.000488281Z" fill="#3AB549"></path>
              <path
                d="M3.5 5.49951C4.3 6.29951 3.5 6.66667 3 7L5 9C6.2 8.2 6.66667 8.83333 7 9.5L15.5 6C13.9 4.8 15 4.33284 15.5 3.99951L13.5 2.49951C12.3 2.89951 11.3333 2.33285 11 1.99951L3.5 5.49951Z"
                fill="#92FF04"
              ></path>
              <ellipse cx="9.5" cy="5.49951" rx="2.5" ry="1.5" fill="#3AB549"></ellipse>
            </svg>
            <p className="text-sm font-semibold leading-[21px] tracking-[0.15px] text-rise">
              {formatBalance(pos.size, { showCurrency: true })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
