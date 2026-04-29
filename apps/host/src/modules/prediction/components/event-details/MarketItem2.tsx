import { UserPosition } from '@/@generated/gql/graphql-prediction.ts'
import { OpenOrderDto } from '@/@generated/gql/graphql-xpUser.ts'
import { EVENT_MESSAGE_OPEN_LOGIN } from '@/components/auth/LoginHandler'
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import eventBus from '@/lib/eventBus'
import { formatPercent, formatVolume } from '@/lib/format.ts'
import { cn } from '@/lib/utils'
import { MarketItemContent } from '@/modules/prediction/components/event-details/MarketItemContent.tsx'
import { MarketPositionsAndOrdersBadge } from '@/modules/prediction/components/event-details/MarketPositionsAndOrdersBadge.tsx'
import { OutcomeItem } from '@/modules/prediction/components/event-details/OutcomeItem.tsx'
import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { eventDetailsPageActions } from '@/modules/prediction/hooks/useEventDetailsPageReducer.ts'
import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar.tsx'
import { ChevronDown } from 'lucide-react'
import { MouseEvent, useMemo } from 'react'
import { useSelector } from 'react-redux'

export interface MarketItemProps {
  market: MarketModel
  positions: UserPosition[]
  orders: OpenOrderDto[]
}

export const MarketItem2 = (props: MarketItemProps) => {
  const { market, positions = [], orders = [] } = props
  const activeWallet = useSelector(_activeWallet)

  const { dispatch, event, formRef } = useEventDetailsPageContext()

  const chance = useMemo(() => {
    return market.outcomePrices ? Math.round(market.outcomePrices[0] * 100) : 0
  }, [market.outcomePrices])
  const oneDayPriceChange = useMemo(() => {
    return market.allTimePriceChangePct ? market.allTimePriceChangePct : 0
  }, [market.allTimePriceChangePct])

  const handleOnClick = () => {
    dispatch(eventDetailsPageActions.setSelectedMarket(market))
  }

  const onOutcomeClick = (e: MouseEvent, outcome: 'yes' | 'no') => {
    e.preventDefault()
    e.stopPropagation()
    if (!activeWallet?.isConnected) {
      eventBus.dispatch(EVENT_MESSAGE_OPEN_LOGIN, { data: { isOpen: true } })
      return
    }
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

  const outcomes = market.outcomes
  const minTickSize = market.orderPriceMinTickSize ? +market.orderPriceMinTickSize : 0.01

  return (
    <AccordionItem value={market.id} className="border border-white/10 rounded-[8px] mb-3">
      <AccordionTrigger
        className="w-full p-3 relative"
        icon={<ChevronDown className="absolute top-6 right-3 transition text-[#908E98]" />}
        onClick={handleOnClick}
      >
        <div className="w-full xl:flex xl:items-center xl:justify-between xl:mr-8">
          <div className="flex items-center justify-between mb-4 mr-6 xl:flex-1 xl:mb-0">
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
            <div className="text-right">
              <div className="flex items-center justify-end gap-2">
                <div className="text-xl text-white font-semibold shrink-0">{chance ? chance : '<1'}%</div>
                <div
                  className={cn(
                    'font-medium text-[14px] min-w-3',
                    oneDayPriceChange > 0 ? 'text-rise' : oneDayPriceChange < 0 ? 'text-fall' : 'text-[#908E98]',
                  )}
                >
                  {oneDayPriceChange ? formatPercent(oneDayPriceChange) : '--'}
                </div>
              </div>

              <MarketPositionsAndOrdersBadge market={market} positions={positions} orders={orders} />
            </div>
          </div>
          <div className="w-full grid grid-cols-2 gap-2 xl:w-72">
            <OutcomeItem
              outcomeLabel={outcomes[0]}
              type="yes"
              marketId={market.id}
              onClick={onOutcomeClick}
              price={market.tokenYesBestAsk ? +market.tokenYesBestAsk : 0}
              minTickSize={minTickSize}
              className="w-full mx-0 bg-[#04332B]"
            />
            <OutcomeItem
              outcomeLabel={outcomes[1]}
              type="no"
              marketId={market.id}
              onClick={onOutcomeClick}
              price={market.tokenNoBestAsk ? +market.tokenNoBestAsk : 0}
              minTickSize={minTickSize}
              className="w-full mx-0"
            />
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <MarketItemContent market={market} />
      </AccordionContent>
    </AccordionItem>
  )
}
