import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { MarketBase } from '@/@generated/gql/graphql-prediction.ts'
import { SportMarketItem } from '@/modules/prediction/components/sport-event-details/SportMarketItem.tsx'
import { SportMarketItemLabel } from '@/modules/prediction/components/sport-event-details/SportMarketItemLabel.tsx'
import { BinaryTeamsOutcomes } from '@/modules/prediction/components/sport-event-details/BinaryTeamsOutcomes.tsx'
import { MarketVariants2 } from '@/modules/prediction/components/sport-event-details/MarketVariants2.tsx'
import { SportMarketOrderBook } from '@/modules/prediction/components/sport-event-details/SportMarketOrderBook.tsx'

export interface BaseGroupMarketsProps {
  marketType: string
  supportedTypes: string[]
  sortFn?: (a: MarketBase, b: MarketBase) => number
}

export const BaseGroupMarkets = (props: BaseGroupMarketsProps) => {
  const { supportedTypes, sortFn, marketType } = props
  const { event } = useEventDetailsPageContext()
  const markets = useMemo(() => {
    const list = event?.markets?.filter((market) => {
      if (!market.sportsMarketType) return false
      return supportedTypes.includes(market.sportsMarketType)
    })
    if (!list || list.length === 0) return []
    if (sortFn) {
      list.sort(sortFn)
    }
    return list
  }, [event?.markets, supportedTypes, sortFn])

  const [currentMarketSlug, setCurrentMarketSlug] = useState<string>(markets?.[0]?.slug || '')

  useEffect(() => {
    if (!currentMarketSlug) {
      setCurrentMarketSlug(markets?.[0]?.slug || '')
    }
  }, [markets])

  const market = useMemo(() => markets?.find((m) => m.slug === currentMarketSlug), [markets, currentMarketSlug])

  const setMarket = useCallback((item: MarketBase) => {
    setCurrentMarketSlug(item.slug || '')
  }, [])

  return (
    <SportMarketItem itemKey={marketType}>
      <SportMarketItemLabel type={marketType} volume={market?.volume ? +market.volume : 0} />
      <BinaryTeamsOutcomes market={market} />
      <MarketVariants2 markets={markets || []} currentMarket={market} onChange={setMarket} />
      <SportMarketOrderBook market={market} />
    </SportMarketItem>
  )
}
