import { createContext, ReactNode } from 'react'

export type SportMarketItemSlots = {
  label?: () => ReactNode
  outcomes?: () => ReactNode
  variants?: () => ReactNode
  details?: () => ReactNode
}

export type SportMarketItemContextState = {
  register: (slot: keyof SportMarketItemSlots, render: () => ReactNode) => void
}

export const SportMarketItemContext = createContext<SportMarketItemContextState | null>(null)
