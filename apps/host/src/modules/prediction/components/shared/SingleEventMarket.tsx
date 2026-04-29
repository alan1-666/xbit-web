import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import { cn } from '@/lib/utils.ts'
import { OrderFormDialog, OrderFormDialogHandle } from '@/modules/prediction/components/shared/OrderFormDialog.tsx'
import { useRef } from 'react'
import { Button } from '@components/ui/button.tsx'
import { useNavigate } from 'react-router-dom'
import { NAVIGATIONS } from '@/lib/navigations.ts'
import { useEventMarketsContext } from '@/modules/prediction/hooks/useEventMarketsContext.ts'

export interface SingleEventMarketProps {
  market: MarketModel
  isEventEnded?: boolean
}

export const SingleEventMarket = (props: SingleEventMarketProps) => {
  const { market, isEventEnded } = props
  const { enableQuickBuy, eventSlug } = useEventMarketsContext()
  const navigate = useNavigate()
  const outcomes = market.outcomes
  const ref = useRef<OrderFormDialogHandle>(null)

  return (
    <div className="flex gap-2.5 items-center h-full">
      {outcomes.map((outcome, index) => (
        <Button
          key={index}
          variant="ghost"
          size="sm"
          className={cn(
            'h-9 flex-1 px-0 text-xs font-semibold leading-tight rounded-none hover:opacity-80',
            index === 0
              ? 'bg-[#04332b] text-[#00ce89] hover:bg-[#04332b] rounded-bl-[6.667px]'
              : 'bg-[#38120b] text-[#EA3B4F] hover:bg-[#38120b] rounded-tr-[6.667px]',
          )}
          onClick={() => {
            if (!enableQuickBuy && eventSlug) {
              navigate(NAVIGATIONS.prediction.eventDetails(eventSlug), {
                state: { market, outcome },
              })
            } else {
              ref.current?.open(market, outcome)
            }
          }}
          disabled={isEventEnded}
        >
          {outcome}
        </Button>
      ))}
      {enableQuickBuy !== false && <OrderFormDialog ref={ref} defaultMarket={market} isEventEnded={isEventEnded} />}
    </div>
  )
}
