import { createContext } from 'react'

export interface XStockListContextProps {
  primaryMetric: 'marketCap' | 'volume24h'
}

export const XStockListContext = createContext<XStockListContextProps>({
  primaryMetric: 'marketCap',
})

export const XStockListContextProvider = XStockListContext.Provider
