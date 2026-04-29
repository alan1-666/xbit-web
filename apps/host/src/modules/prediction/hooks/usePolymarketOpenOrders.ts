import { useQuery, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/modules/prediction/services/user.service'
import { useProxyWallet } from '@/modules/prediction/hooks/useProxyWallet.ts'
import { IPolymarketOpenOrder } from '../models/PortfolioModel'

export interface UsePolymarketOpenOrdersOptions {
  enabled?: boolean
}

export const usePolymarketOpenOrders = (marketId?: string, options?: UsePolymarketOpenOrdersOptions) => {
  return useQuery({
    queryKey: ['prediction', 'user', 'openOrders', marketId],
    queryFn: async () => {
      return userService.getUserOpenOrders(marketId)
    },
    enabled: options?.enabled,
  })
}

export const optimisticUpdateOpenOrder = (
  queryClient: ReturnType<typeof useQueryClient>,
  { orderId, size }: { marketId: string; orderId: string; size: number },
) => {
  // console.log('optimisticUpdateOpenOrder', { orderId, size })

  queryClient.setQueriesData<IPolymarketOpenOrder[]>(
    {
      predicate: (query) => {
        const key = query.queryKey as string[]
        return key[0] === 'prediction' && key[1] === 'user' && key[2] === 'openOrders'
      },
    },
    (oldOrders = []) => {
      const hasOrder = oldOrders.some((o) => o.orderID === orderId)
      if (!hasOrder) return oldOrders
      console.log('optimisticUpdateOpenOrder: found order in cache', { orderId, oldOrders })
      return oldOrders.reduce<IPolymarketOpenOrder[]>((acc, order) => {
        if (order.orderID === orderId) {
          const newSize = Number(order.size) - size
          if (newSize < 0.1) return acc
          acc.push({ ...order, size: String(newSize) })
        } else {
          acc.push(order)
        }
        return acc
      }, [])
    },
  )
}

/**
 * Hook to get Polymarket open orders for the current user.
 * Only enabled when proxyWallet is available.
 */
export const useMyPolymarketOpenOrders = (marketId?: string, options?: UsePolymarketOpenOrdersOptions) => {
  const proxyWallet = useProxyWallet()
  return usePolymarketOpenOrders(marketId, {
    ...options,
    enabled: !!proxyWallet && options?.enabled !== false,
  })
}
