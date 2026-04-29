import { MouseEvent, useMemo } from 'react'
import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import { AccordionContent, AccordionItem, AccordionTrigger } from '@components/ui/accordion.tsx'
import { formatVolume } from '@/lib/format.ts'
import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { MarketItemContent } from '@/modules/prediction/components/event-details/MarketItemContent.tsx'
import { MarketItemPositionBadge } from '@/modules/prediction/components/event-details/MarketItemPositionBadge.tsx'
import { eventDetailsPageActions } from '@/modules/prediction/hooks/useEventDetailsPageReducer'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { OutcomeItem } from '@/modules/prediction/components/event-details/OutcomeItem.tsx'

export interface MarketItemProps {
  market: MarketModel
}

export const MarketItem = (props: MarketItemProps) => {
  const { market } = props
  const outcomes = market.outcomes
  // const outcomePrices: number[] = market.outcomePrices || []
  const { dispatch, event, formRef } = useEventDetailsPageContext()

  const onOutcomeClick = (e: MouseEvent, outcome: 'yes' | 'no') => {
    e.preventDefault()
    e.stopPropagation()
    dispatch(eventDetailsPageActions.setSelectedMarket(market))
    dispatch(eventDetailsPageActions.setSelectedOutcome(outcome))
    if (formRef?.current) {
      formRef.current.setValue(
        'data.price',
        outcome === 'yes' ? market.tokenYesBestAsk || 0 : market.tokenNoBestAsk || 0,
      )
    }
    // Open the trade drawer/sheet on mobile
    // Check if small screen
    if (window.innerWidth < 1280) {
      dispatch(eventDetailsPageActions.setTradeDrawerOpen(true))
    }
  }

  const handleOnClick = () => {
    dispatch(eventDetailsPageActions.setSelectedMarket(market))
  }

  const chance = useMemo(() => {
    return market.outcomePrices ? Math.round(market.outcomePrices[0] * 100) : 0
  }, [market.outcomePrices])

  const minTickSize = market.orderPriceMinTickSize ? +market.orderPriceMinTickSize : 0.01

  return (
    <AccordionItem value={market.questionID || ''}>
      <AccordionTrigger className="w-full last:border-none" icon={<></>} onClick={handleOnClick}>
        {/* Mobile: 2-row layout, Desktop: 1-row layout */}
        <div className="w-full space-y-2 md:space-y-0">
          {/* Row 1: Title, Volume, and Price */}
          <div className="grid grid-cols-1 md:grid-cols-7 w-full gap-2 md:gap-0">
            {/* Title and Volume */}

            <div className="md:col-span-3 flex items-center justify-between md:block">
              <div className="flex items-center gap-2 md:gap-4">
                {event?.showMarketImages && market.image && (
                  <Avatar className="size-10 rounded-sm!">
                    <AvatarImage className="object-cover" src={market.image} />
                    <AvatarFallback>
                      {market.groupItemTitle ? market.groupItemTitle.charAt(0).toUpperCase() : 'A'}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div>
                  <div className="text-sm font-medium md:text-base">{market.groupItemTitle || '--'}</div>
                  <div className="text-xs text-gray-400 md:text-sm">${formatVolume(market.volume)}</div>
                  <MarketItemPositionBadge market={market} />
                </div>
              </div>
              {/* Last Trade Price - visible on mobile at end of row 1 */}
              <div className="text-xs text-gray-400 md:hidden shrink-0">{chance ? chance : '<1'}%</div>
            </div>

            {/* Last Trade Price - visible on desktop */}
            <div className="hidden md:flex md:items-center md:justify-center">{chance ? chance : '<1'}%</div>

            {/* Action Buttons - desktop only in this row */}
            <div className="hidden md:col-span-3 md:flex md:items-center md:justify-end">
              <OutcomeItem
                outcomeLabel={outcomes[0]}
                type="yes"
                marketId={market.id}
                onClick={onOutcomeClick}
                price={market.tokenYesBestAsk ? +market.tokenYesBestAsk : 0}
                minTickSize={minTickSize}
              />
              <OutcomeItem
                outcomeLabel={outcomes[1]}
                type="no"
                marketId={market.id}
                onClick={onOutcomeClick}
                price={market.tokenNoBestAsk ? +market.tokenNoBestAsk : 0}
                minTickSize={minTickSize}
              />
            </div>
          </div>

          {/*Row 2: Action Buttons on mobile only */}
          <div className="grid grid-cols-2 gap-2 md:hidden">
            {/* <OutcomeItem
              outcomeLabel={outcomes[0]}
              type="yes"
              marketId={market.id}
              onClick={onOutcomeClick}
              price={market.tokenYesBestAsk ? +market.tokenYesBestAsk : 0}
              minTickSize={minTickSize}
              className="w-full ml-0"
            /> */}
            <OutcomeItem
              outcomeLabel={outcomes[1]}
              type="no"
              marketId={market.id}
              onClick={onOutcomeClick}
              price={market.tokenNoBestAsk ? +market.tokenNoBestAsk : 0}
              minTickSize={minTickSize}
              className="w-full"
            />
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="-mx-1 rounded-b">
        <MarketItemContent market={market} />
      </AccordionContent>
    </AccordionItem>
  )
}
