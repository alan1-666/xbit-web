import { MarketBase } from '@/@generated/gql/graphql-prediction.ts'
import { BinaryTeamsOutcomes } from '@/modules/prediction/components/sport-event-details/BinaryTeamsOutcomes.tsx'
import { MarketVariants2 } from '@/modules/prediction/components/sport-event-details/MarketVariants2.tsx'
import { SportMarketItem } from '@/modules/prediction/components/sport-event-details/SportMarketItem.tsx'
import { SportMarketItemLabel } from '@/modules/prediction/components/sport-event-details/SportMarketItemLabel.tsx'
import { SportMarketOrderBook } from '@/modules/prediction/components/sport-event-details/SportMarketOrderBook.tsx'
import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { useCallback, useEffect, useMemo, useState } from 'react'

export const MapWinnerMarketsGroup = () => {
  const { event, isEnded } = useEventDetailsPageContext()

  const markets = useMemo(() => {
    if (!event?.markets) return []
    
    // Regex to capture map number: "Map 1 Winner" or "Game 1 Winner" -> "1"
    const mapRegex = /(?:Map|Game)\s+(\d+)/i

    return event.markets
      .filter((m) => m.sportsMarketType === 'child_moneyline')
      .sort((a, b) => {
        const matchA = a.groupItemTitle?.match(mapRegex)
        const matchB = b.groupItemTitle?.match(mapRegex)
        const mapNumA = matchA ? parseInt(matchA[1]) : 999
        const mapNumB = matchB ? parseInt(matchB[1]) : 999
        return mapNumA - mapNumB
      })
  }, [event?.markets])

  const [currentMarketSlug, setCurrentMarketSlug] = useState<string>(markets?.[0]?.slug || '')

  useEffect(() => {
    if ((!currentMarketSlug || !markets.find(m => m.slug === currentMarketSlug)) && markets.length > 0) {
      setCurrentMarketSlug(markets[0].slug || '')
    }
  }, [markets, currentMarketSlug])

  const currentMarket = useMemo(() => 
    markets.find((m) => m.slug === currentMarketSlug) || markets[0], 
  [markets, currentMarketSlug])

  const setMarket = useCallback((item: MarketBase) => {
    setCurrentMarketSlug(item.slug || '')
  }, [])

  if (!markets || markets.length === 0) return null

  const getVariantLabel = (market: MarketBase) => {
    const match = market.groupItemTitle?.match(/(?:Map|Game)\s+(\d+)/i)
    return match ? match[1] : market.line  
  }

  if (!currentMarket) return null

  return (
    <SportMarketItem itemKey="map_winner">
      <SportMarketItemLabel 
        type="child_moneyline" 
        title={currentMarket.groupItemTitle || undefined} 
        volume={currentMarket.volume ? +currentMarket.volume : 0} 
      />
      
      {!isEnded && <BinaryTeamsOutcomes market={currentMarket} />}
      
      <MarketVariants2 
        markets={markets} 
        currentMarket={currentMarket} 
        onChange={setMarket} 
        getLabel={getVariantLabel}
      />
      
      <SportMarketOrderBook market={currentMarket} />
    </SportMarketItem>
  )
}
