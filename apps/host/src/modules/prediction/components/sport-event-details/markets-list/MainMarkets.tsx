import { MoneylineMarketsGroup } from '@/modules/prediction/components/sport-event-details/MoneylineMarketsGroup.tsx'
import { SpreadMarketsGroup } from '@/modules/prediction/components/sport-event-details/SpreadMarketsGroup.tsx'
import { TotalsMarketsGroup } from '@/modules/prediction/components/sport-event-details/TotalsMarketsGroup.tsx'
import { MapWinnerMarketsGroup } from '@/modules/prediction/components/sport-event-details/MapWinnerMarketsGroup.tsx'
import { MarketSection } from './MarketSection'

export const MainMarkets = () => {
  return (
    <MarketSection>
      <MoneylineMarketsGroup />
      <SpreadMarketsGroup />
      <MoneylineMarketsGroup type="both_teams_to_score" />
      <MapWinnerMarketsGroup />
      <SpreadMarketsGroup supportedTypes={['map_handicap']} />
      <TotalsMarketsGroup />
    </MarketSection>
  )
}
