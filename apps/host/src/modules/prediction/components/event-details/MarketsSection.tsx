import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { useEffect, useMemo } from 'react'
import { Accordion } from '@components/ui/accordion.tsx'
import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import { SingleMarketSection } from '@/modules/prediction/components/event-details/SingleMarketSection.tsx'
import { eventDetailsPageActions } from '@/modules/prediction/hooks/useEventDetailsPageReducer'
import { MarketItem2 } from '@/modules/prediction/components/event-details/MarketItem2.tsx'
import { ResolvedMarkets2 } from '@/modules/prediction/components/event-details/ResolvedMarkets2.tsx'
import { useEventPositions } from '@/modules/prediction/hooks/useEventPositions.ts'
import { useEventMarkets } from '@/modules/prediction/hooks/useEventMarkets.ts'
import { UserPosition } from '@/@generated/gql/graphql-prediction.ts'
import { useMyPolymarketOpenOrders } from '@/modules/prediction/hooks/usePolymarketOpenOrders.ts'
import { OpenOrderDto } from '@/@generated/gql/graphql-xpUser.ts'

import { useTranslation } from 'react-i18next'

export const MarketsSection = () => {
  const { event, dispatch } = useEventDetailsPageContext()
  const allMarkets = event?.markets || []
  const { t } = useTranslation()

  const { activeMarkets, resolvedMarkets } = useEventMarkets(allMarkets)

  const { data: activePositions } = useEventPositions(
    event?.id || '',
    activeMarkets.map((m) => m.id),
  )
  const { data: openOrders } = useMyPolymarketOpenOrders()

  const marketPositionsMap = useMemo<Record<string, UserPosition[]>>(() => {
    const map: Record<string, UserPosition[]> = {}
    if (!activePositions) return map
    activePositions.forEach((pos) => {
      const marketId = pos.marketId
      if (!map[marketId]) {
        map[marketId] = []
      }
      map[marketId].push(pos)
    })
    return map
  }, [activePositions])

  const openOrdersMap = useMemo<Record<string, OpenOrderDto[]>>(() => {
    const map: Record<string, OpenOrderDto[]> = {}
    if (!openOrders) return map
    openOrders.forEach((order) => {
      const conditionId = order.market
      if (!conditionId) return
      if (!map[conditionId]) {
        map[conditionId] = []
      }
      map[conditionId].push(order)
    })
    return map
  }, [openOrders])

  useEffect(() => {
    dispatch(eventDetailsPageActions.setShowButtonGroup(activeMarkets.length === 1))
  }, [activeMarkets.length, dispatch])

  if (allMarkets.length === 0) return null
  if (allMarkets.length === 1) return <SingleMarketSection market={allMarkets[0]} />
  return (
    <div className="w-full">
      <div className="hidden grid-cols-7 w-full border-b py-3">
        <div className="col-span-3">{t('prediction.markets.outcome')}</div>
        <div className="flex items-center justify-center">{t('prediction.markets.chance')}</div>
        <div className="col-span-3"></div>
      </div>
      <Accordion type="single" collapsible>
        {activeMarkets.map((market) => (
          <MarketItem2
            key={market.slug}
            market={market as MarketModel}
            positions={marketPositionsMap[market.id]}
            orders={market.conditionId ? openOrdersMap[market.conditionId] : []}
          />
        ))}
      </Accordion>
      <ResolvedMarkets2 markets={resolvedMarkets} defaultOpen={activeMarkets.length === 0} />
    </div>
  )
}
