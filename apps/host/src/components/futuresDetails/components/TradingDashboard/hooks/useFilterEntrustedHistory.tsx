import { xEntrustedHistory } from '@/components/futuresDetails/trade/types'
import { useMemo } from 'react'
import { useTradingDashboardContext } from '../context/TradingDashboardContext'

const useFilterEntrustedHistory = ({ orders, baseCoin }: { orders: xEntrustedHistory[]; baseCoin: string }) => {
  const { showOnlyBaseCoin, side, type } = useTradingDashboardContext()

  const filterOrders = useMemo(() => {
    if (side === 'All' && !showOnlyBaseCoin) {
      return orders
    }

    return orders.filter((item) => {
      return (item.order_side === side || side === 'All') && (!showOnlyBaseCoin || baseCoin === item.order_coin)
    })
  }, [type, orders, side, showOnlyBaseCoin, baseCoin])

  return {
    filterOrders,
  }
}

export default useFilterEntrustedHistory
