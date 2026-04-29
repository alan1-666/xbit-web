import { SpreadMarketsGroup } from '@/modules/prediction/components/sport-event-details/SpreadMarketsGroup.tsx'
import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { MarketSection } from './MarketSection'

export const CS2SeriesMarkets = () => {
  const { event } = useEventDetailsPageContext()
  
  const hasMarkets = event?.markets?.some(m => m.sportsMarketType === 'round_handicap_match')

  if (!hasMarkets) return null

  return (
    <MarketSection title="Series Objective Handicaps">
      <SpreadMarketsGroup supportedTypes={['round_handicap_match']} />
    </MarketSection>
  )
}
