import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { useMemo } from 'react'
import { eventDetailsPageActions } from '@/modules/prediction/hooks/useEventDetailsPageReducer.ts'
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar.tsx'
import { formatVolume } from '@/lib/format.ts'
import { cn } from '@/lib/utils.ts'
import { IconCheckCircle } from '@components/icon/solid/IconCheckCircle.tsx'
import { IconXCircle } from '@components/icon/solid/IconXCircle.tsx'

export interface ResolvedMarketItemProps {
  market: MarketModel
}

export const ResolvedMarketItem2 = (props: ResolvedMarketItemProps) => {
  const { market } = props
  const { dispatch, event } = useEventDetailsPageContext()

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
    <div className="border border-white/10 rounded-[8px] mb-3 p-3 cursor-pointer mt-3" onClick={handleOnClick}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {event?.showMarketImages && market.image && (
            <Avatar className="size-10 rounded-[8px] mr-3">
              <AvatarImage className="object-cover rounded-[8px]" src={market.image} />
              <AvatarFallback>
                {market.groupItemTitle ? market.groupItemTitle.charAt(0).toUpperCase() : 'A'}
              </AvatarFallback>
            </Avatar>
          )}
          <div>
            <div className="font-semibold text-xl text-white">{market.groupItemTitle || '--'}</div>
            <div className="text-[#908E98] font-light text-sm">
              {formatVolume(market.volume, { showCurrency: true })}
            </div>
          </div>
        </div>
        <div>
          <div
            className={cn(
              'flex items-center gap-1 text-sm font-medium',
              resolvedOutcomeIndex === 0 ? 'text-rise' : 'text-fall',
            )}
          >
            {resolvedOutcome}
            {resolvedOutcomeIndex === 0 ? <IconCheckCircle className="size-5" /> : <IconXCircle className="size-5" />}
          </div>
        </div>
      </div>
    </div>
  )
}
