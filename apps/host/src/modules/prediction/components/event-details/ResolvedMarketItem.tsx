import { formatVolume } from '@/lib/format.ts'
import { MarketItemPositionBadge } from '@/modules/prediction/components/event-details/MarketItemPositionBadge.tsx'
import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import { useMemo } from 'react'
import { cn } from '@/lib/utils.ts'
import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { eventDetailsPageActions } from '@/modules/prediction/hooks/useEventDetailsPageReducer'

export interface ResolvedMarketItemProps {
  market: MarketModel
}

export const ResolvedMarketItem = (props: ResolvedMarketItemProps) => {
  const { market } = props
  const { dispatch } = useEventDetailsPageContext()

  const resolvedOutcomeIndex = useMemo(() => {
    if (!market.outcomePrices) return -1
    const maxPrice = Math.max(...market.outcomePrices)
    return market.outcomePrices.findIndex((price) => +price === +maxPrice)
  }, [market.outcomePrices])

  const resolvedOutcome = useMemo(() => {
    if (!market.outcomes || !market.outcomePrices) return '--'
    if (resolvedOutcomeIndex === -1) return '--'
    return market.outcomes[resolvedOutcomeIndex] || '--'
  }, [market.outcomes, resolvedOutcomeIndex])

  const handleOnClick = () => {
    dispatch(eventDetailsPageActions.setSelectedMarket(market))
  }

  return (
    <div
      className="flex items-center justify-between py-4 border-b last:border-none cursor-pointer"
      onClick={handleOnClick}
    >
      <div>
        <div className="text-sm font-medium md:text-base">{market.groupItemTitle || '--'}</div>
        <div className="text-xs text-gray-400 md:text-sm">${formatVolume(market.volume)}</div>
        <MarketItemPositionBadge market={market} />
      </div>
      <div>
        <div className={cn('text-sm font-medium md:text-base', resolvedOutcomeIndex === 0 ? 'text-rise' : 'text-fall')}>
          {resolvedOutcome}
        </div>
      </div>
    </div>
  )
}
