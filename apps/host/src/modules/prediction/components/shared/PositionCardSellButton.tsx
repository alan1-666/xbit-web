import { Button } from '@/components/ui/button'
import { useResponsive } from '@/hooks/useResponsive'
import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext'
import { eventDetailsPageActions } from '@/modules/prediction/hooks/useEventDetailsPageReducer'
import eventBus from '@/lib/eventBus'
import { PositionModel } from '@/modules/prediction/models/PositionModel'
import Decimal from 'decimal.js'
import { cn } from '@/lib/utils.ts'
import { useTranslation } from 'react-i18next'
import { TooltipProvider } from '@components/ui/tooltip.tsx'
import { SimpleTooltip } from '@components/v2/ui-shared/components/SimpleTooltip.tsx'

interface EventDetailsSellButtonProps {
  position: PositionModel
  className?: string
}

export const EventDetailsSellButton = ({ position, className }: EventDetailsSellButtonProps) => {
  const { isDesktop } = useResponsive()
  const { event, dispatch } = useEventDetailsPageContext()
  const { t } = useTranslation()

  const handleSell = () => {
    const outcome = position.outcomeIndex === 0 ? 'yes' : 'no'
    const size = new Decimal(position.size).toDecimalPlaces(2, Decimal.ROUND_DOWN).toNumber()

    if (isDesktop) {
      eventBus.dispatch('FILL_PREDICTION_ORDER_FORM', {
        data: {
          marketId: position.marketId,
          outcome,
          side: 'sell',
          size,
        },
      })
    } else {
      const market = event?.markets?.find(
        (m) => String(m.id) === String(position.marketId) || String(m.providerId) === String(position.marketId),
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
  }

  if (position.__pending) {
    return (
      <TooltipProvider>
        <SimpleTooltip content={t('prediction.orderForm.pendingOrderWarning')} side="top">
          <Button
            variant="gradient"
            disabled
            className={cn(
              'mx-3 mt-2 mb-3 h-12 rounded-[6px] bg-fall shadow-[0px_-4px_0px_0px_#0000004D_inset]',
              className,
            )}
          >
            {t('prediction.position.finalizing')}
          </Button>
        </SimpleTooltip>
      </TooltipProvider>
    )
  }

  return (
    <Button
      onClick={handleSell}
      variant="gradient"
      className={cn('mx-3 mt-2 mb-3 h-12 rounded-[6px] bg-fall shadow-[0px_-4px_0px_0px_#0000004D_inset]', className)}
    >
      {t('prediction.orders.sell')}
    </Button>
  )
}
