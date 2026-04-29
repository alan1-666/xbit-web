import { createContext, useContext, Dispatch, RefObject } from 'react'
import { EventModel } from '@/modules/prediction/models/EventModel.ts'
import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import { TeamModel } from '@/modules/prediction/models/TeamModel.ts'
import { EventDetailsPageAction } from '@/modules/prediction/hooks/useEventDetailsPageReducer.ts'
import dayjs from 'dayjs'
import { UseFormReturn } from 'react-hook-form'
import { OrderFormData } from '@/modules/prediction/components/shared/order-form/OrderFormData.ts'

export interface OrderFormState {
  side?: 'buy' | 'sell'
  outcome?: 'yes' | 'no'
  size?: number
  shouldFocus?: boolean
  timestamp?: number
}

export interface EventDetailsPageContextState {
  event: EventModel | null
  teams?: TeamModel[]
  selectedMarket: MarketModel | null
  selectedOutcome?: 'yes' | 'no' | null
  selectedSide?: 'buy' | 'sell'
  isFetching: boolean
  isTradeDrawerOpen: boolean
  isShowButtonGroup: boolean
  orderFormState?: OrderFormState
  dispatch: Dispatch<EventDetailsPageAction>
  formRef?: RefObject<UseFormReturn<OrderFormData> | null>
}

export const EventDetailsPageContext = createContext<EventDetailsPageContextState>({
  event: null,
  selectedMarket: null,
  selectedOutcome: null,
  isFetching: false,
  isTradeDrawerOpen: false,
  isShowButtonGroup: false,
  dispatch: () => {},
})

export const EventDetailsPageContextProvider = EventDetailsPageContext.Provider

export const useEventDetailsPageContext = () => {
  const context = useContext(EventDetailsPageContext)
  // Event is ended when endDate is in the past (don't rely only on event.live from API)
  const isEnded = !!context.event?.endDate && dayjs(context.event.endDate).isBefore(dayjs())
  // Only show as live when API says live AND event has not ended
  const isLive = !!(context.event?.live && !isEnded)
  return { ...context, isEnded, isLive }
}
