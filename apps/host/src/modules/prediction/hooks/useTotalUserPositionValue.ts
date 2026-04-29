import { useQuery } from '@tanstack/react-query'
import { userService } from '@/modules/prediction/services/user.service.ts'

export const useTotalUserPositionValue = (walletAddress: string) => {
  return useQuery({
    queryKey: ['prediction', 'users', walletAddress, 'total-position-value'],
    queryFn: async () => {
      return userService.getUserBalance(walletAddress)
    },
    enabled: !!walletAddress,
  })
}
