import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { MarketBase } from '@/@generated/gql/graphql-prediction.ts'

export const useCurrentMarketsByGroup = (supportedTypes: string[]) => {
  const { event } = useEventDetailsPageContext()
  const markets = useMemo(() => {
    if (!event?.markets || event?.markets.length === 0) return []
    return event?.markets
      .filter((market) => market.sportsMarketType && supportedTypes.includes(market.sportsMarketType))
      .sort((a, b) => a.line - b.line)
  }, [event?.markets, supportedTypes])

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

  return { markets, market, setMarket }
}
