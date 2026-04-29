import { EventModel } from '@/modules/prediction/models/EventModel.ts'
import { useMemo } from 'react'
import { ChanceChart } from '@/modules/prediction/components/shared/ChanceChart.tsx'

export interface EventChanceChartProps {
  event: EventModel
}

export const EventChanceChart = (props: EventChanceChartProps) => {
  const { event } = props
  const activeMarkets = useMemo(() => {
    if (!event.markets) return []
    return event.markets.filter((market) => market?.active && !market.closed)
  }, [event.markets])
  const percentage = useMemo(() => {
    const isSingleMarket = activeMarkets.length === 1
    if (!isSingleMarket) return undefined
    const outcomePrices = activeMarkets[0].outcomePrices
    if (!outcomePrices || outcomePrices.length === 0) return undefined
    const yesOutcomePrice = +outcomePrices[0]
    return Math.round(yesOutcomePrice * 100)
  }, [activeMarkets])

  if (percentage === undefined) {
    return null
  }

  return <ChanceChart percentage={percentage} />
}
