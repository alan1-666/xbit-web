import { ReactNode } from 'react'
import { EventMarketsContext } from '@/modules/prediction/contexts/EventMarketsContextValue.ts'

export interface EventMarketsProviderProps {
  children: ReactNode
  enableQuickBuy?: boolean
  eventSlug?: string
}

export const EventMarketsProvider = (props: EventMarketsProviderProps) => {
  const { children, enableQuickBuy, eventSlug } = props

  return <EventMarketsContext.Provider value={{ enableQuickBuy, eventSlug }}>{children}</EventMarketsContext.Provider>
}
