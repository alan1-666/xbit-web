import { useQuery } from '@tanstack/react-query'
import { userService } from '@/modules/prediction/services/user.service.ts'

export const useWithdrawChains = () => {
  return useQuery({
    queryKey: ['prediction', 'withdraw-chains'],
    queryFn: async () => {
      return userService.getWithdrawChains()
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - chain data doesn't change frequently
    gcTime: 1000 * 60 * 10, // 10 minutes
  })
}
