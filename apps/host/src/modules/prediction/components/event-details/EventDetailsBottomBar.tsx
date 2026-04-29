import { Button } from '@/components/ui/button'
import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext'
import { eventDetailsPageActions } from '@/modules/prediction/hooks/useEventDetailsPageReducer'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'

interface EventDetailsBottomBarContentProps {
  selectedMarket: MarketModel
}

export const EventDetailsBottomBarContent = (props: EventDetailsBottomBarContentProps) => {
  const { selectedMarket } = props
  const { dispatch } = useEventDetailsPageContext()
  const { t } = useTranslation()
  const yesPrice = selectedMarket.tokenYesBestAsk ? +selectedMarket.tokenYesBestAsk : 0
  const noPrice = selectedMarket.tokenNoBestAsk ? +selectedMarket.tokenNoBestAsk : 0
  const tickSize = selectedMarket.orderPriceMinTickSize ? +selectedMarket.orderPriceMinTickSize : 0.01

  const handleBuyYes = () => {
    dispatch(eventDetailsPageActions.setSelectedOutcome('yes'))
    dispatch(eventDetailsPageActions.setTradeDrawerOpen(true))
  }

  const handleBuyNo = () => {
    dispatch(eventDetailsPageActions.setSelectedOutcome('no'))
    dispatch(eventDetailsPageActions.setTradeDrawerOpen(true))
  }

  const decimals = useMemo(() => {
    return tickSize > 0 ? Math.max(2, -Math.floor(Math.log10(tickSize))) : 2
  }, [tickSize])

  const formattedYesPrice = useMemo(() => {
    const priceInCent = yesPrice * 100
    return priceInCent.toLocaleString('en-US', {
    })
  }, [yesPrice, decimals])

  const formattedNoPrice = useMemo(() => {
    const priceInCent = noPrice * 100
    return priceInCent.toLocaleString('en-US', {
    })
  }, [noPrice, decimals])

  return (
    <nav
      className="fixed bottom-20 left-0 right-0 z-102 flex touch-none items-end overflow-visible bg-background pb-safe transition-[padding-bottom] duration-250 ease-[cubic-bezier(0.42,0,0.58,1)] xl:hidden max-w-[768px] mx-auto"
      aria-label="Trade actions"
    >
      <div className="relative flex w-full flex-col overflow-hidden">
        <div className="flex h-20 w-full items-center justify-between overflow-hidden border-t border-border bg-background">
          <div className="flex h-full w-screen gap-3 p-4">
            {/* Trade Buttons */}
            <div className="flex flex-1 gap-3">
              {/* Buy Yes Button */}
              <Button
                onClick={handleBuyYes}
                className="h-12 flex-1 bg-[#3AB549] text-white hover:bg-[#2fa03d] active:bg-[#258f33] shadow-[0_4px_0_0_rgba(42,125,55,1)] hover:shadow-[0_2px_0_0_rgba(42,125,55,1)] active:shadow-[0_0px_0_0_rgba(42,125,55,1)] transition-all active:translate-y-1"
              >
                <span className="text-sm font-semibold">
                  {t('prediction.orderForm.buy')} {selectedMarket.outcomes[0]} {formattedYesPrice}¢
                </span>
              </Button>

              {/* Buy No Button */}
              <Button
                onClick={handleBuyNo}
                className="h-12 flex-1 bg-[#EF4444] text-white hover:bg-[#dc2626] active:bg-[#b91c1c] shadow-[0_4px_0_0_rgba(185,28,28,1)] hover:shadow-[0_2px_0_0_rgba(185,28,28,1)] active:shadow-[0_0px_0_0_rgba(185,28,28,1)] transition-all active:translate-y-1"
              >
                <span className="text-sm font-semibold">
                  {t('prediction.orderForm.buy')} {selectedMarket.outcomes[1]} {formattedNoPrice}¢
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export const EventDetailsBottomBar = () => {
  const { selectedMarket, isEnded } = useEventDetailsPageContext()

  if (!selectedMarket || isEnded) return null

  return <EventDetailsBottomBarContent selectedMarket={selectedMarket} />
}
