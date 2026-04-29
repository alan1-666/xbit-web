import { SpreadMarketsGroup } from '@/modules/prediction/components/sport-event-details/SpreadMarketsGroup.tsx'
import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { MarketSection } from './MarketSection'

export const LoLHandicapMarkets = () => {
  const { event } = useEventDetailsPageContext()
  
  const hasMarkets = event?.markets?.some(m => [
    'kill_handicap_match', 'tower_handicap_match', 'drake_handicap_match', 'inhibitor_handicap_match'
  ].includes(m.sportsMarketType || ''))

  if (!hasMarkets) return null

  return (
    <MarketSection title="Series Objective Handicaps">
      <SpreadMarketsGroup supportedTypes={['kill_handicap_match']} />
      <SpreadMarketsGroup supportedTypes={['tower_handicap_match']} />
      <SpreadMarketsGroup supportedTypes={['drake_handicap_match']} />
      <SpreadMarketsGroup supportedTypes={['inhibitor_handicap_match']} />
    </MarketSection>
  )
}
