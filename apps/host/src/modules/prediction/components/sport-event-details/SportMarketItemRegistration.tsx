import { ReactNode, useContext } from 'react'
import {
  SportMarketItemContext,
  SportMarketItemSlots,
} from '@/modules/prediction/components/sport-event-details/SportMarketItemContext.ts'

export interface SportMarketItemRegistrationProps {
  slot: keyof SportMarketItemSlots
  children: ReactNode
}

export const SportMarketItemRegistration = ({ children, slot }: SportMarketItemRegistrationProps) => {
  const ctx = useContext(SportMarketItemContext)
  if (!ctx) return null
  ctx.register(slot, () => children)
  return null
}
