import { MoneylineMarketsGroup } from '@/modules/prediction/components/sport-event-details/MoneylineMarketsGroup.tsx'
import { SpreadMarketsGroup } from '@/modules/prediction/components/sport-event-details/SpreadMarketsGroup.tsx'
import { TotalsMarketsGroup } from '@/modules/prediction/components/sport-event-details/TotalsMarketsGroup.tsx'
import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { MarketSection } from './MarketSection'

export const FirstHalfMarkets = () => {
  const { event } = useEventDetailsPageContext()
  
  const hasMarkets = event?.markets?.some(m => 
    ['first_half_moneyline', 'first_half_spreads', 'first_half_totals'].includes(m.sportsMarketType || '')
  )

  if (!hasMarkets) return null

  return (
    <MarketSection title="1st Half">
      <MoneylineMarketsGroup type="first_half_moneyline" />
      <SpreadMarketsGroup supportedTypes={['first_half_spreads']} />
      <TotalsMarketsGroup supportedTypes={['first_half_totals']} />
    </MarketSection>
  )
}
