import { TotalsMarketsGroup } from '@/modules/prediction/components/sport-event-details/TotalsMarketsGroup.tsx'
import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { MarketSection } from './MarketSection'

export const SeriesTotalsMarkets = () => {
  const { event } = useEventDetailsPageContext()
  
  const hasMarkets = event?.markets?.some(m => m.sportsMarketType === 'round_over_under_match')

  if (!hasMarkets) return null

  return (
    <MarketSection title="Series Totals">
      <TotalsMarketsGroup supportedTypes={['round_over_under_match']} />
    </MarketSection>
  )
}
