import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/modules/prediction/services/user.service'
import { IPolymarketOpenOrder } from '@/modules/prediction/models/PortfolioModel.ts'

export const useCancelOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await userService.cancelOrder(orderId)
      if (response && !response.success) {
        throw new Error(response.message)
      }
      return { response, orderId }
    },
    onSuccess: ({ orderId }) => {
      // Optimistically remove the cancelled order from all open orders queries
      queryClient.setQueriesData<IPolymarketOpenOrder[]>(
        { queryKey: ['prediction', 'user', 'openOrders'] },
        (oldOrders) => {
          if (!oldOrders) return oldOrders
          return oldOrders.filter((order) => order.orderID !== orderId)
        },
      )
      queryClient.invalidateQueries({ queryKey: ['prediction', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['prediction', 'usdc-balance'] })
    },
  })
}
