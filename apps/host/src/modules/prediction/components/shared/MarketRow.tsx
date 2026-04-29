import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import { formatPercent } from '@/lib/format.ts'
import { MarketOutcomeButtons } from './MarketOutcomeButtons'
import { useMemo } from 'react'
import { NAVIGATIONS } from '@/lib/navigations.ts'
import { useEventMarketsContext } from '@/modules/prediction/hooks/useEventMarketsContext.ts'
import { Link } from 'react-router-dom'

export interface MarketRowProps {
  market: MarketModel
  onOutcomeClick: (market: MarketModel, outcome: string) => void
  isEventEnded?: boolean
}

export const MarketRow = (props: MarketRowProps) => {
  const { market, onOutcomeClick, isEventEnded } = props
  const { eventSlug } = useEventMarketsContext()

  const percentage = useMemo(() => {
    const outcomePrices = market.outcomePrices
    if (!outcomePrices || outcomePrices.length === 0) return undefined
    const yesOutcomePrice = +outcomePrices[0]
    return Math.round(yesOutcomePrice * 100)
  }, [market])

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5 shrink-0">
        <Link
          to={NAVIGATIONS.prediction.eventDetails(eventSlug || '')}
          className="text-xs font-medium text-white max-w-40 sm:max-w-105 lg:max-w-30 truncate hover:underline"
        >
          {market.groupItemTitle}
        </Link>
      </div>
      <div className="flex gap-1 items-center shrink-0">
        <div className="text-base font-medium text-white text-right mr-1">
          {!!percentage && percentage >= 1 ? formatPercent(percentage) : '<1%'}
        </div>
        <MarketOutcomeButtons
          market={market}
          onOutcomeClick={(outcome) => onOutcomeClick(market, outcome)}
          isEventEnded={isEventEnded}
        />
      </div>
    </div>
  )
}
