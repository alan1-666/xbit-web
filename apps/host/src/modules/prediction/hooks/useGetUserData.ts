import { useQuery } from '@tanstack/react-query'
import { userService } from '@/modules/prediction/services/user.service.ts'

export const useGetUserData = (walletAddress: string) => {
  return useQuery({
    queryKey: ['prediction', 'users', walletAddress, 'user-data'],
    queryFn: async () => {
      return userService.getUserData(walletAddress)
    },
    enabled: !!walletAddress,
  })
}
