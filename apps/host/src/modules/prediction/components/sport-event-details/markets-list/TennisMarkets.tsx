import { SpreadMarketsGroup } from '@/modules/prediction/components/sport-event-details/SpreadMarketsGroup.tsx'
import { TotalsMarketsGroup } from '@/modules/prediction/components/sport-event-details/TotalsMarketsGroup.tsx'
import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { MarketSection } from './MarketSection'

export const TennisMarkets = () => {
  const { event } = useEventDetailsPageContext()
  
  const hasMarkets = event?.markets?.some(m => [
    'tennis_set_handicap', 'tennis_set_totals', 'tennis_match_totals'
  ].includes(m.sportsMarketType || ''))

  if (!hasMarkets) return null

  return (
    <MarketSection>
      <SpreadMarketsGroup supportedTypes={['tennis_set_handicap']} />
      <TotalsMarketsGroup supportedTypes={['tennis_set_totals']} />
      <TotalsMarketsGroup supportedTypes={['tennis_match_totals']} />
    </MarketSection>
  )
}
