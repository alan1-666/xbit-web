import { useMutation } from '@tanstack/react-query'
import { userService } from '@/modules/prediction/services/user.service.ts'

export interface UseWithdrawUSDCParams {
  address: string
  amount: number
}

export const useWithdrawUSDCMutation = () => {
  return useMutation({
    mutationKey: ['prediction', 'withdraw-usdc'],
    mutationFn: async (params: UseWithdrawUSDCParams) => {
      return userService.withdrawPolymarketUSDC({
        destinationAddress: params.address,
        amount: params.amount,
      })
    },
  })
}
