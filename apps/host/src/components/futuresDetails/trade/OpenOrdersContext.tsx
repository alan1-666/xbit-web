import { createContext, useContext } from 'react'
import { xOpenOrders } from './types'

export const OpenOrdersContext = createContext<xOpenOrders[]>([])

export const useOpenOrders = () => useContext(OpenOrdersContext)
