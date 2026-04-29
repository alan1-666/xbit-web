import { xHistoryTrade } from '@/components/futuresDetails/trade/types'
import { useMemo } from 'react'
import { useTradingDashboardContext } from '../context/TradingDashboardContext'

const useFilterHistoryOrder = ({ orders, baseCoin }: { orders: xHistoryTrade[]; baseCoin: string }) => {
  const { showOnlyBaseCoin, side, type } = useTradingDashboardContext()

  const filterOrders = useMemo(() => {
    if (side === 'All' && !showOnlyBaseCoin) {
      return orders
    }

    return orders.filter((item) => {
      return (item.dir === side || side === 'All') && (!showOnlyBaseCoin || baseCoin === item.coin)
    })
  }, [type, orders, side, showOnlyBaseCoin, baseCoin])

  return {
    filterOrders,
  }
}

export default useFilterHistoryOrder
