import { useReducer, Dispatch } from 'react'
import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import { OrderFormState } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'

/**
 * Event Details Page State Management using useReducer
 *
 * This reducer consolidates all the state management for the EventDetailsPage
 * into a single, predictable state object. This approach provides:
 * - Centralized state updates
 * - Better scalability as the page grows
 * - Easier debugging and testing
 * - Type-safe action creators
 */

export interface EventDetailsPageState {
  selectedMarketId?: string
  selectedOutcome: 'yes' | 'no' | null
  selectedSide?: 'buy' | 'sell'
  isTradeDrawerOpen: boolean
  isShowButtonGroup: boolean
  orderFormState: OrderFormState
}

export type EventDetailsPageAction =
  | { type: 'SET_SELECTED_MARKET'; payload: MarketModel | null }
  | { type: 'SET_SELECTED_OUTCOME'; payload: 'yes' | 'no' | null }
  | { type: 'SET_SELECTED_SIDE'; payload: 'buy' | 'sell' | undefined }
  | { type: 'SET_TRADE_DRAWER_OPEN'; payload: boolean }
  | { type: 'SET_SHOW_BUTTON_GROUP'; payload: boolean }
  | { type: 'SET_ORDER_FORM_STATE'; payload: OrderFormState }
  | { type: 'RESET_STATE' }

const initialState: EventDetailsPageState = {
  selectedMarketId: undefined,
  selectedOutcome: 'yes',
  selectedSide: 'buy',
  isTradeDrawerOpen: false,
  isShowButtonGroup: false,
  orderFormState: {},
}

function eventDetailsPageReducer(state: EventDetailsPageState, action: EventDetailsPageAction): EventDetailsPageState {
  switch (action.type) {
    case 'SET_SELECTED_MARKET':
      return {
        ...state,
        selectedMarketId: action.payload ? action.payload.id : undefined,
      }
    case 'SET_SELECTED_OUTCOME':
      return {
        ...state,
        selectedOutcome: action.payload,
      }
    case 'SET_SELECTED_SIDE':
      return {
        ...state,
        selectedSide: action.payload,
      }
    case 'SET_TRADE_DRAWER_OPEN':
      return {
        ...state,
        isTradeDrawerOpen: action.payload,
      }
    case 'SET_SHOW_BUTTON_GROUP':
      return {
        ...state,
        isShowButtonGroup: action.payload,
      }
    case 'SET_ORDER_FORM_STATE':
      return {
        ...state,
        orderFormState: action.payload,
      }
    case 'RESET_STATE':
      return initialState
    default:
      return state
  }
}

export const useEventDetailsPageReducer = (): [EventDetailsPageState, Dispatch<EventDetailsPageAction>] => {
  return useReducer(eventDetailsPageReducer, initialState)
}

// Action creators for type-safe dispatch
/**
 * Action creators provide a type-safe way to dispatch actions.
 *
 * Usage examples:
 * ```typescript
 * // Using dispatch directly (recommended for new code):
 * const { dispatch } = useEventDetailsPageContext()
 * dispatch(eventDetailsPageActions.setSelectedMarket(market))
 * dispatch(eventDetailsPageActions.setTradeDrawerOpen(true))
 *
 * // Using wrapper functions (backward compatibility):
 * const { setSelectedMarket, setTradeDrawerOpen } = useEventDetailsPageContext()
 * setSelectedMarket(market)
 * setTradeDrawerOpen(true)
 * ```
 */
export const eventDetailsPageActions = {
  setSelectedMarket: (market: MarketModel | null): EventDetailsPageAction => ({
    type: 'SET_SELECTED_MARKET',
    payload: market,
  }),
  setSelectedOutcome: (outcome: 'yes' | 'no' | null): EventDetailsPageAction => ({
    type: 'SET_SELECTED_OUTCOME',
    payload: outcome,
  }),
  setSelectedSide: (side: 'buy' | 'sell' | undefined): EventDetailsPageAction => ({
    type: 'SET_SELECTED_SIDE',
    payload: side,
  }),
  setTradeDrawerOpen: (open: boolean): EventDetailsPageAction => ({
    type: 'SET_TRADE_DRAWER_OPEN',
    payload: open,
  }),
  setShowButtonGroup: (show: boolean): EventDetailsPageAction => ({
    type: 'SET_SHOW_BUTTON_GROUP',
    payload: show,
  }),
  setOrderFormState: (state: OrderFormState): EventDetailsPageAction => ({
    type: 'SET_ORDER_FORM_STATE',
    payload: state,
  }),
  resetState: (): EventDetailsPageAction => ({
    type: 'RESET_STATE',
  }),
}
