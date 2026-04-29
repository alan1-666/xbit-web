import { useQuery } from '@tanstack/react-query'
import { userService } from '@/modules/prediction/services/user.service.ts'
import { GetUserPnlInput } from '@/modules/prediction/types'
import { UserPnlFidelity, UserPnlInterval } from '@/@generated/gql/graphql-prediction.ts'

export const useUserPnl = (input: GetUserPnlInput) => {
  const { userAddress, interval = UserPnlInterval.OneWeek, fidelity = UserPnlFidelity.OneHour } = input

  return useQuery({
    queryKey: ['prediction', 'users', userAddress, 'pnl', interval, fidelity],
    queryFn: async () => {
      return userService.getUserPnl({ userAddress, interval, fidelity })
    },
    enabled: !!userAddress,
    staleTime: 30000,
  })
}
