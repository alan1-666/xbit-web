import { MarketBase } from '@/@generated/gql/graphql-prediction.ts'
import { SportMarketItemLabel } from '@/modules/prediction/components/sport-event-details/SportMarketItemLabel.tsx'
import { SportMarketItem } from '@/modules/prediction/components/sport-event-details/SportMarketItem.tsx'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TernaryTeamsOutcomes } from '@/modules/prediction/components/sport-event-details/TernaryTeamsOutcomes.tsx'
import { SportMarketOrderBook } from '@/modules/prediction/components/sport-event-details/SportMarketOrderBook.tsx'

import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'

export interface DrawableMoneylineMarketItemProps {
  markets: MarketBase[]
  type?: string
}

export const DrawableMoneylineMarketItem = (props: DrawableMoneylineMarketItemProps) => {
  const { markets, type = 'moneyline' } = props
  const { isEnded } = useEventDetailsPageContext()

  const [currentMarket, setCurrentMarket] = useState<MarketBase>()

  const accordionTriggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setCurrentMarket(markets[0])
  }, [markets])

  const volume = useMemo(() => {
    return markets.reduce((acc, market) => {
      return acc + (market.volume ? +market.volume : 0)
    }, 0)
  }, [markets])

  const handleOnSelect = useCallback((market: MarketBase) => {
    setCurrentMarket(market)
    // accordionTriggerRef.current?.click()
  }, [])

  return (
    <SportMarketItem triggerRef={accordionTriggerRef} itemKey={type}>
      <SportMarketItemLabel type={type} volume={volume} />
      {!isEnded && <TernaryTeamsOutcomes markets={markets} onSelect={handleOnSelect} />}
      <SportMarketOrderBook market={currentMarket} />
    </SportMarketItem>
  )
}
