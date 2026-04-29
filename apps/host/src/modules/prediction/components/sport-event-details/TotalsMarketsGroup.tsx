import { SportMarketItem } from '@/modules/prediction/components/sport-event-details/SportMarketItem.tsx'
import { SportMarketItemLabel } from '@/modules/prediction/components/sport-event-details/SportMarketItemLabel.tsx'
import { MarketVariants2 } from '@/modules/prediction/components/sport-event-details/MarketVariants2.tsx'
import { SportMarketOrderBook } from '@/modules/prediction/components/sport-event-details/SportMarketOrderBook.tsx'
import { BinaryOutcomes } from '@/modules/prediction/components/sport-event-details/BinaryOutcomes.tsx'
import { useCurrentMarketsByGroup } from '@/modules/prediction/hooks/useCurrentMarketsByGroup.ts'

import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'

const defaultSupportedTypes = ['totals']

export const TotalsMarketsGroup = ({ supportedTypes = defaultSupportedTypes }: { supportedTypes?: string[] }) => {
  const { market, setMarket, markets } = useCurrentMarketsByGroup(supportedTypes)
  const { isEnded } = useEventDetailsPageContext()

  if (markets?.length === 0) return null

  const primaryType = supportedTypes[0]

  const getTitle = () => {
    if (!market) return undefined
    const isEsports = market.slug?.includes('cs2') || market.slug?.includes('csgo')
    if (isEsports && market.groupItemTitle?.includes('Games')) {
      return 'Total Maps'
    }
    if ((market.slug?.includes('lol') || market.slug?.includes('dota2')) && market.groupItemTitle?.includes('Games')) {
        return 'Total Games'
    }
    return undefined
  }

  return (
    <SportMarketItem itemKey={primaryType}>
      <SportMarketItemLabel type={primaryType} title={getTitle()} volume={market?.volume ? +market.volume : 0} />
      {!isEnded && <BinaryOutcomes market={market} showLine={true} />}
      <MarketVariants2 markets={markets || []} currentMarket={market} onChange={setMarket} />
      <SportMarketOrderBook market={market} />
    </SportMarketItem>
  )
}
