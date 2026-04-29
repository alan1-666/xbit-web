import { All, OrderSide, OrderType } from '@/components/futuresDetails/trade/types'
import { createContext, ReactNode, useContext, useState, useEffect } from 'react'
import ls from '@/lib/local-storage.ts'

interface TradingDashboardContextValue {
  showOnlyBaseCoin: boolean
  setShowOnlyBaseCoin: (value: boolean) => void
  side: OrderSide | All
  type?: OrderType | All
  setSide: (value: OrderSide | All) => void
  setType?: (value: OrderType | All) => void
}

// Context
const TradingDashboardContext = createContext<TradingDashboardContextValue | null>(null)

// Hook
// eslint-disable-next-line react-refresh/only-export-components
export const useTradingDashboardContext = () => {
  const context = useContext(TradingDashboardContext)
  if (!context) {
    throw new Error('useTradingDashboard must be used within a TradingDashboardProvider')
  }
  return context
}

// Provider component
interface TradingDashboardProviderProps {
  children: ReactNode
}

export const TradingDashboardProvider: React.FC<TradingDashboardProviderProps> = ({ children }) => {
  const [showOnlyBaseCoin, setShowOnlyBaseCoin] = useState(!!ls.get('pc_futures_is_show_base_coin'))
  const [side, setSide] = useState<OrderSide | All>('All')
  const [type, setType] = useState<OrderType | All>('All')

  useEffect(() => {
    ls.set('pc_futures_is_show_base_coin', showOnlyBaseCoin)
  }, [showOnlyBaseCoin])

  const value: TradingDashboardContextValue = {
    showOnlyBaseCoin,
    setShowOnlyBaseCoin,
    side,
    setSide,
    type,
    setType,
  }

  return <TradingDashboardContext.Provider value={value}>{children}</TradingDashboardContext.Provider>
}
