import { useQuery } from '@tanstack/react-query'
import { userService } from '@/modules/prediction/services/user.service'

export const usePolymarketSupportedAssets = () => {
  return useQuery({
    queryFn: () => userService.getPolymarketSupportedAssets(),
    queryKey: ['polymarket-supported-assets'],
  })
}
