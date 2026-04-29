import { createContext } from 'react'

export interface OrderFormContextProps {
  isProcessing: boolean
  yesPrice: number
  noPrice: number
  clobTokenIds: string[]
  fee: number
  isEventEnded?: boolean
  initialSize?: number
  minTickSize?: number
  outcomeLabels?: string[]
  balance?: number
  isBalancePending?: boolean
  rawBalance?: number
  lockedBalance?: number
  availableBalance?: number
  /** Incremented after each successful order; use to reset child state (e.g. PercentageSelector). */
  orderSuccessKey?: number
  /** Incremented when sell is selected and size is set to max; use to preselect 100% in PercentageSelector. */
  sellMaxSelectedKey?: number
}

export const OrderFormContext = createContext<OrderFormContextProps>({
  isProcessing: false,
  yesPrice: 0,
  noPrice: 0,
  clobTokenIds: [],
  fee: 0,
  isEventEnded: false,
  initialSize: 0,
  outcomeLabels: [],
  rawBalance: 0,
  lockedBalance: 0,
  availableBalance: 0,
})
