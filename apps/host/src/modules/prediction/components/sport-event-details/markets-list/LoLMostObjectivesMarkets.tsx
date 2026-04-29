import { MoneylineMarketsGroup } from '@/modules/prediction/components/sport-event-details/MoneylineMarketsGroup.tsx'
import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { MarketSection } from './MarketSection'

export const LoLMostObjectivesMarkets = () => {
  const { event } = useEventDetailsPageContext()
  
  const hasMarkets = event?.markets?.some(m => [
    'kill_most_2_way_match', 'tower_most_2_way_match', 'drake_most_2_way_match', 
    'nashor_most_2_way_match', 'inhibitor_most_2_way_match'
  ].includes(m.sportsMarketType || ''))

  if (!hasMarkets) return null

  return (
    <MarketSection title="Series Most Objectives">
      <MoneylineMarketsGroup type="kill_most_2_way_match" />
      <MoneylineMarketsGroup type="tower_most_2_way_match" />
      <MoneylineMarketsGroup type="drake_most_2_way_match" />
      <MoneylineMarketsGroup type="nashor_most_2_way_match" />
      <MoneylineMarketsGroup type="inhibitor_most_2_way_match" />
    </MarketSection>
  )
}
