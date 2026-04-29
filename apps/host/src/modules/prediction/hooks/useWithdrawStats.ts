import { useQuery } from '@tanstack/react-query'
import { userService } from '@/modules/prediction/services/user.service.ts'

export const useWithdrawStats = () => {
  return useQuery({
    queryKey: ['prediction', 'withdraw-stats'],
    queryFn: async () => {
      return userService.getWithdrawStats()
    },
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60, // 1 minute
  })
}
