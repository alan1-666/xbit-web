import { xFundingHistory } from '@/components/futuresDetails/trade/types'
import { useMemo } from 'react'
import { useTradingDashboardContext } from '../context/TradingDashboardContext'

const useFilterFundingHistory = ({ orders, baseCoin }: { orders: xFundingHistory[]; baseCoin: string }) => {
  const { showOnlyBaseCoin, side, type } = useTradingDashboardContext()

  const filterOrders = useMemo(() => {
    if (side === 'All' && !showOnlyBaseCoin) {
      return orders
    }

    const sideConvert = side === 'B' ? 'Long' : 'Short'

    return orders.filter((item) => {
      return (
        (item.delta_side === sideConvert || side === 'All') &&
        (!showOnlyBaseCoin || baseCoin === item.delta_coin)
      )
    })
  }, [type, orders, side, baseCoin, showOnlyBaseCoin])

  return {
    filterOrders,
  }
}

export default useFilterFundingHistory
