import { useContext } from 'react'
import { EventMarketsContext, EventMarketsContextType } from '@/modules/prediction/contexts/EventMarketsContextValue.ts'

export const useEventMarketsContext = (): EventMarketsContextType => {
  const context = useContext(EventMarketsContext)
  if (!context) {
    return { enableQuickBuy: undefined, eventSlug: undefined }
  }
  return context
}
