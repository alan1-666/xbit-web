import { useQuery } from '@tanstack/react-query'
import { userService } from '@/modules/prediction/services/user.service'
import { useProxyWallet } from './useProxyWallet'

export const useUserCredentials = () => {
  const proxyWallet = useProxyWallet()
  return useQuery({
    queryFn: () => userService.getUserCredentials(),
    queryKey: ['user-credentials'],
    enabled: !!proxyWallet,
  })
}
