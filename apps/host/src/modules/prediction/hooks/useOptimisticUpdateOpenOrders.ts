import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { IPolymarketOpenOrder } from '@/modules/prediction/models/PortfolioModel.ts'

/**
 * Hook to optimistically update open orders for a specific market
 */
export const useOptimisticUpdateOpenOrders = () => {
  const queryClient = useQueryClient()

  const addOrder = useCallback(
    (marketId: string, newOrder: IPolymarketOpenOrder) => {
      queryClient.setQueriesData<IPolymarketOpenOrder[]>({
        predicate: (query) => {
          const queryKey = query.queryKey
          return queryKey[0] === 'prediction' && queryKey[1] === 'user' && queryKey[2] === 'openOrders' && (queryKey[3] === marketId || queryKey[3] === undefined)
        },
      }, (oldOrders = []) => {
        // Check if order already exists (by orderID)
        const existingOrderIndex = oldOrders.findIndex((order) => order.orderID === newOrder.orderID)

        if (existingOrderIndex !== -1) {
          // Update existing order
          const updatedOrders = [...oldOrders]
          updatedOrders[existingOrderIndex] = newOrder
          return updatedOrders
        } else {
          // Add new order
          return [newOrder, ...oldOrders]
        }
      })

      console.log(`Optimistically added/updated order ${newOrder.orderID} for market ${marketId}`)
    },
    [queryClient],
  )

  const removeOrder = useCallback(
    (marketId: string, orderId: string) => {
      const queryKey = ['prediction', 'user', 'openOrders']

      queryClient.setQueriesData<IPolymarketOpenOrder[]>({ queryKey, exact: false }, (oldOrders = []) => {
        return oldOrders.filter((order) => order.orderID !== orderId)
      })

      console.log(`Optimistically removed order ${orderId} from market ${marketId}`)
    },
    [queryClient],
  )

  const updateOrder = useCallback(
    (marketId: string, orderId: string, updates: Partial<IPolymarketOpenOrder>) => {
      const queryKey = ['prediction', 'user', 'openOrders']

      queryClient.setQueriesData<IPolymarketOpenOrder[]>({ queryKey, exact: false }, (oldOrders = []) => {
        return oldOrders.map((order) => (order.orderID === orderId ? { ...order, ...updates } : order))
      })

      console.log(`Optimistically updated order ${orderId} for market ${marketId}`)
    },
    [queryClient],
  )

  return {
    addOrder,
    removeOrder,
    updateOrder,
  }
}
