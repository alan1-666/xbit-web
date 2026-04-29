import { useMemo } from 'react'
import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'

/** Split event markets into active and resolved, matching MarketsSection display order */
export const useEventMarkets = (allMarkets: MarketModel[] = []) => {
  return useMemo(() => {
    if (!allMarkets || allMarkets.length === 0) {
      return { activeMarkets: [], resolvedMarkets: [], displayMarkets: [] }
    }
    const active: MarketModel[] = []
    const resolved: MarketModel[] = []
    allMarkets.forEach((market) => {
      if (!market.closed && market.active) {
        active.push(market)
      } else if (market.closed) {
        resolved.push(market)
      }
    })
    return {
      activeMarkets: active,
      resolvedMarkets: resolved,
      /** Same order as MarketsSection: active first, then resolved */
      displayMarkets: [...active, ...resolved],
    }
  }, [allMarkets])
}
