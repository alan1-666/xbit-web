import { useQuery } from '@tanstack/react-query'
import { userService } from '@/modules/prediction/services/user.service.ts'
import { GetClobAllowanceAndSyncInput } from '@/modules/prediction/types'
import { useProxyWallet } from './useProxyWallet'

export const useCLOBAllowanceAndSync = (input: GetClobAllowanceAndSyncInput) => {
  const proxyWallet = useProxyWallet()

  return useQuery({
    queryKey: ['prediction', 'clob-allowance-sync', input.tokenId, input.forceRefresh],
    queryFn: async () => {
      return await userService.getCLOBAllowanceAndSync(input)
    },
    enabled: !!proxyWallet && !!input.tokenId,
  })
}
