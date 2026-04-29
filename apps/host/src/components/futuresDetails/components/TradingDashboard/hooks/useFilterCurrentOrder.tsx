import { xOpenOrders } from '@/components/futuresDetails/trade/types';
import { useMemo } from 'react';
import { useTradingDashboardContext } from '../context/TradingDashboardContext';

const useFilterCurrentOrder = ({ orders, baseCoin }: { orders: xOpenOrders[]; baseCoin: string }) => {
  const { showOnlyBaseCoin, side, type } = useTradingDashboardContext()

  const filterOrders = useMemo(() => {
    if (type === 'All' && side === 'All' && !showOnlyBaseCoin) {
      return orders
    }

    return orders.filter((item) => {
      return (
        (item.orderType === type || type === 'All') &&
        (item.side === side || side === 'All') &&
        (!showOnlyBaseCoin || baseCoin === item.coin)
      )
    })
  }, [showOnlyBaseCoin, side, type, orders, baseCoin])

  return {
    filterOrders,
  }
}

export default useFilterCurrentOrder
