import { useEventDetailsFromUrlParams } from '@/modules/prediction/hooks/useEventDetailsFromUrlParams.ts'
import { ReactNode, useMemo, useRef } from 'react'
import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import { EventDetailsPageContextProvider } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { useEventCommentsUpdated } from '@/modules/prediction/hooks/useEventCommentsUpdated.ts'
import { useEventMarketRealtimeUpdates } from '@/modules/prediction/hooks/useEventRealtimeUpdates.ts'
import { useEventDetailsPageReducer } from '@/modules/prediction/hooks/useEventDetailsPageReducer.ts'
import { UseFormReturn } from 'react-hook-form'
import { OrderFormData } from '@/modules/prediction/components/shared/order-form/OrderFormData.ts'
import { usePublicSubscriptionCallback } from '@/hooks/mqtt/usePublicSubscriptionCallback'
import { queryClient } from '@/lib/queryClient'
import { QUERY_KEYS_CONFIGS } from '../../configs/queryKeys.configs'

export interface BaseEventDetailsPageProps {
  children: ReactNode
}

export const BaseEventDetailsPage = (props: BaseEventDetailsPageProps) => {
  const { children } = props
  const { event, isPending } = useEventDetailsFromUrlParams()

  // Use reducer for state management
  const [state, dispatch] = useEventDetailsPageReducer()

  const formRef = useRef<UseFormReturn<OrderFormData>>(null)

  // Subscribe to market updates for all active markets in this event
  useEventMarketRealtimeUpdates({ event })
  usePublicSubscriptionCallback(`public/crypto-event/${event?.slug}/volume`, {
    shouldSkip: !event?.slug,
    onMessage: (_, payload) => {
      queryClient.setQueryData(QUERY_KEYS_CONFIGS.eventDetails(event?.slug || ''), (oldData: any) => {
        if (!oldData) return oldData
        const updatedEvent = {
          ...oldData,
          volume: (payload as any).v,
        }
        return updatedEvent
      })
    },
  })

  // Subscribe to new comments for this event
  useEventCommentsUpdated({
    eventId: event?.id || '',
    enabled: !!event?.id,
  })

  const selectedMarket = useMemo<MarketModel | null>(() => {
    if (!event || !event.markets) return null
    if (state.selectedMarketId) {
      const market = event.markets.find((m) => String(m.id) === String(state.selectedMarketId))
      return market || null
    }
    const activeMarkets = event.markets.filter((m) => m.closed === false && m.active === true)
    if (activeMarkets.length > 0) {
      return activeMarkets[0]
    }
    return event.markets.length > 0 ? event.markets[0] : null
  }, [event, state.selectedMarketId])

  const contextValue = useMemo(() => {
    return {
      event: event || null,
      selectedMarket: selectedMarket,
      selectedOutcome: state.selectedOutcome,
      selectedSide: state.selectedSide,
      isFetching: isPending,
      isTradeDrawerOpen: state.isTradeDrawerOpen,
      isShowButtonGroup: state.isShowButtonGroup,
      orderFormState: state.orderFormState,
      dispatch,
      formRef,
    }
  }, [
    event,
    selectedMarket,
    state.selectedOutcome,
    state.selectedSide,
    state.isTradeDrawerOpen,
    state.isShowButtonGroup,
    state.orderFormState,
    isPending,
    dispatch,
    formRef,
  ])

  if (!event && !isPending) return <div>No event found</div>

  return <EventDetailsPageContextProvider value={contextValue}>{children}</EventDetailsPageContextProvider>
}
