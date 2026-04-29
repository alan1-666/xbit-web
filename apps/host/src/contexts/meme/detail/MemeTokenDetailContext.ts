import { createContext } from 'react'

export interface MemeTokenDetailContextState {
  liquidity?: number
}

export const MemeTokenDetailContext = createContext<MemeTokenDetailContextState>({})
