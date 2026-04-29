import { MoneylineMarketsGroup } from '@/modules/prediction/components/sport-event-details/MoneylineMarketsGroup.tsx'
import { TotalsMarketsGroup } from '@/modules/prediction/components/sport-event-details/TotalsMarketsGroup.tsx'
import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { MarketSection } from './MarketSection'

export const TennisFirstSetMarkets = () => {
  const { event } = useEventDetailsPageContext()
  
  const hasMarkets = event?.markets?.some(m => [
    'tennis_first_set_winner', 'tennis_first_set_totals'
  ].includes(m.sportsMarketType || ''))

  if (!hasMarkets) return null

  return (
    <MarketSection title="1st Set">
      <MoneylineMarketsGroup type="tennis_first_set_winner" />
      <TotalsMarketsGroup supportedTypes={['tennis_first_set_totals']} />
    </MarketSection>
  )
}
