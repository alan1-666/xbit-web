import { SportMarketItem } from '@/modules/prediction/components/sport-event-details/SportMarketItem.tsx'
import { SportMarketItemLabel } from '@/modules/prediction/components/sport-event-details/SportMarketItemLabel.tsx'
import { BinaryTeamsOutcomes } from '@/modules/prediction/components/sport-event-details/BinaryTeamsOutcomes.tsx'
import { MarketVariants2 } from '@/modules/prediction/components/sport-event-details/MarketVariants2.tsx'
import { SportMarketOrderBook } from '@/modules/prediction/components/sport-event-details/SportMarketOrderBook.tsx'
import { useCurrentMarketsByGroup } from '@/modules/prediction/hooks/useCurrentMarketsByGroup.ts'

import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'

const defaultSupportedTypes = ['spreads', 'tennis_set_handicap']

export const SpreadMarketsGroup = ({ supportedTypes = defaultSupportedTypes }: { supportedTypes?: string[] }) => {
  const { market, setMarket, markets } = useCurrentMarketsByGroup(supportedTypes)
  const { isEnded } = useEventDetailsPageContext()
  
  if (markets?.length === 0) return null

  const getTitle = () => {
    if ((market?.slug?.includes('lol') || market?.slug?.includes('dota2')) && primaryType === 'map_handicap') {
        return 'Game Handicap'
    }
    return undefined
  }

  const primaryType = supportedTypes[0]

  return (
    <SportMarketItem itemKey={primaryType}>
      <SportMarketItemLabel type={primaryType} title={getTitle()} volume={market?.volume ? +market.volume : 0} />
      {!isEnded && <BinaryTeamsOutcomes market={market} showLine={true} />}
      <MarketVariants2 markets={markets || []} currentMarket={market} onChange={setMarket} />
      <SportMarketOrderBook market={market} />
    </SportMarketItem>
  )
}
