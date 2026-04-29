import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import { useRef } from 'react'
import { OrderFormDialog, OrderFormDialogHandle } from '@/modules/prediction/components/shared/OrderFormDialog.tsx'
import { MarketRow } from './MarketRow'
import { useEventMarketsContext } from '@/modules/prediction/hooks/useEventMarketsContext.ts'

export interface MultipleEventMarketsProps {
  markets: MarketModel[]
  isEventEnded?: boolean
}

export const MultipleEventMarkets = (props: MultipleEventMarketsProps) => {
  const { markets, isEventEnded } = props
  const { enableQuickBuy } = useEventMarketsContext()
  const ref = useRef<OrderFormDialogHandle>(null)

  const handleOutcomeClick = (market: MarketModel, outcome: string) => {
    ref.current?.open(market, outcome)
  }

  return (
    <div className="flex flex-col gap-2">
      {markets.map((market) => (
        <MarketRow
          key={market.questionID}
          market={market}
          onOutcomeClick={handleOutcomeClick}
          isEventEnded={isEventEnded}
        />
      ))}
      {enableQuickBuy !== false && <OrderFormDialog ref={ref} defaultMarket={markets[0]} isEventEnded={isEventEnded} />}
    </div>
  )
}
