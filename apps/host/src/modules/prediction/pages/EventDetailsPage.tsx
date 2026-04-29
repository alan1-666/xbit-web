import { Header } from '@/modules/prediction/components/event-details/Header.tsx'
import { Chart } from '@/modules/prediction/components/event-details/Chart.tsx'
import { OrderForm } from '@/modules/prediction/components/event-details/OrderForm.tsx'
import { RelatedEvents } from '@/modules/prediction/components/event-details/RelatedEvents.tsx'
import { BaseEventDetailsPage } from '@/modules/prediction/components/shared/BaseEventDetailsPage.tsx'
import { OrderFormSheet } from '@/modules/prediction/components/event-details/OrderFormSheet.tsx'
import { EventDetailsBottomBar } from '@/modules/prediction/components/event-details/EventDetailsBottomBar.tsx'
import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { eventDetailsPageActions } from '@/modules/prediction/hooks/useEventDetailsPageReducer'

import { useCallback, useEffect, useMemo } from 'react'
import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import { useResponsive } from '@hooks/useResponsive.ts'
import { MarketResolvedAlert } from '@/modules/prediction/components/event-details/MarketResolvedAlert.tsx'
import { Loading } from '@/components/common/Loading'
import { useTranslation } from 'react-i18next'
import { EventDetailsSection } from '@/modules/prediction/components/event-details/EventDetailsSection.tsx'
import { UserTransactionsSubscription } from '@/modules/prediction/components/shared/UserTransactionsSubscription.tsx'
import { cn } from '@/lib/utils'
import ClearTimerPendingPosition from '../components/shared/ClearTimerPendingPosition'
import { AutoSyncClobAllowance } from '../components/shared/AutoSyncClobAllowance'

const EventDetailsPageContent = () => {
  const { dispatch, event, selectedMarket, selectedOutcome, isShowButtonGroup, isEnded } = useEventDetailsPageContext()
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()

  // Auto-select first active market
  useEffect(() => {
    if (event?.markets && event.markets.length > 0 && !selectedMarket) {
      const activeMarkets = event.markets.filter((m) => m.closed === false && m.active === true)
      if (activeMarkets.length > 0) {
        dispatch(eventDetailsPageActions.setSelectedMarket(activeMarkets[0] as MarketModel))
      } else if (event.markets[0]) {
        dispatch(eventDetailsPageActions.setSelectedMarket(event.markets[0] as MarketModel))
      }
    }
  }, [event, selectedMarket?.id, dispatch])

  const tokenId = useMemo(() => {
    if (!selectedMarket || !selectedOutcome) return null
    const clobTokenIds = selectedMarket.clobTokenIds
    if (!clobTokenIds) return null
    return selectedOutcome === 'yes' ? clobTokenIds[0] : clobTokenIds[1]
  }, [selectedMarket, selectedOutcome])

  const shouldRefetch = useCallback((conditionId: string) => {
    if (!event?.markets) return false
    return event.markets.some((m) => m.conditionId === conditionId)
  }, [event?.markets])

  return (
    <>
      <div
        className={cn(
          'relative flex flex-col min-h-0',
          isShowButtonGroup && !isEnded
            ? 'h-[calc(100dvh-150px)] xl:h-[calc(100dvh-80px)]'
            : 'h-screen xl:h-[calc(100dvh-100px)]',
        )}
      >
        <div className="flex-1 min-h-0 overflow-y-auto _hidescrollbar">
          <div className="mx-auto max-w-360 px-4 flex flex-col gap-3 lg:flex-row lg:gap-8 ">
            <div className="space-y-3 flex-1 w-full">
              <Header />
              <Chart />
              <EventDetailsSection />
              <MarketResolvedAlert />
            </div>
            <div className="hidden shrink-0 xl:block xl:w-100">
              <div className="sticky top-10 mt-10 space-y-3 rounded-[8px] bg-[#18181B] p-4 pb-8 min-h-45.5">
                {isDesktop ? <OrderForm /> : null}
                <RelatedEvents />
              </div>
            </div>
          </div>
        </div>
      </div>

      <UserTransactionsSubscription shouldRefetch={shouldRefetch} />
      <ClearTimerPendingPosition />
      <AutoSyncClobAllowance tokenId={tokenId || ''} />

      {/* Order Form Sheet for mobile */}
      {!isDesktop && <OrderFormSheet />}

      {/* Mobile Bottom Trade Bar */}
      {isShowButtonGroup && !isEnded && <EventDetailsBottomBar />}
      {event && !event?.id && (
        <div className="fixed top-24 left-0 z-30 h-full w-full bg-[#0A0A0A] opacity-85">
          <div className="w-100% mx-auto h-fit max-w-87.75 min-w-87.75 rounded-[8px] bg-[#27272a] px-3 py-4">
            <p className="text-sm">We didn't forecast this.</p>
            <div className="flex items-center gap-2">
              <p className="text-sm">{t('detail.tokenDetail.waiting')}</p>
              <Loading />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export const EventDetailsPage = () => {
  return (
    <BaseEventDetailsPage>
      <EventDetailsPageContent />
    </BaseEventDetailsPage>
  )
}
