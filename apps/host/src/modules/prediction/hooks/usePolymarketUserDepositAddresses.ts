import { useQuery } from '@tanstack/react-query'
import { userService } from '@/modules/prediction/services/user.service'

export const usePolymarketUserDepositAddresses = () => {
  return useQuery({
    queryKey: ['polymarket-user-deposit-addresses'],
    queryFn: () => userService.getPolymarketUserDepositAddresses(),
  })
}
