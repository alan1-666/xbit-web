import { createContext } from 'react'

export interface EventMarketsContextType {
  enableQuickBuy?: boolean
  eventSlug?: string
}

export const EventMarketsContext = createContext<EventMarketsContextType | undefined>(undefined)
