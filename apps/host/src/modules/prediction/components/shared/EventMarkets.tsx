import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import { SingleEventMarket } from '@/modules/prediction/components/shared/SingleEventMarket.tsx'
import { MultipleEventMarkets } from '@/modules/prediction/components/shared/MultipleEventMarkets.tsx'
import { EventMarketsProvider } from '@/modules/prediction/contexts/EventMarketsContext.tsx'

export interface EventMarketsProps {
  markets: MarketModel[]
  isEventEnded?: boolean
  enableQuickBuy?: boolean
  eventSlug?: string
}
export const EventMarkets = (props: EventMarketsProps) => {
  const { markets, isEventEnded, enableQuickBuy, eventSlug } = props
  if (markets.length === 0) return null

  const content =
    markets.length === 1 ? (
      <SingleEventMarket market={markets[0]} isEventEnded={isEventEnded} />
    ) : (
      <MultipleEventMarkets markets={markets} isEventEnded={isEventEnded} />
    )

  return (
    <EventMarketsProvider enableQuickBuy={enableQuickBuy} eventSlug={eventSlug}>
      {content}
    </EventMarketsProvider>
  )
}
