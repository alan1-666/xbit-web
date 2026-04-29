import { useQuery } from '@tanstack/react-query'
import { userService } from '@/modules/prediction/services/user.service.ts'

export const useUserProfileStats = (userAddress: string) => {
  return useQuery({
    queryKey: ['prediction', 'users', userAddress, 'profile-stats'],
    queryFn: async () => {
      return userService.getUserProfileStats(userAddress)
    },
    enabled: !!userAddress,
  })
}
