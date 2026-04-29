import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { userService } from '@/modules/prediction/services/user.service'
import { RelayChain } from '@/@generated/gql/graphql-xpUser'
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'

export const useSupportedRelayChains = (
  options?: Omit<UseQueryOptions<RelayChain[], Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<RelayChain[], Error>({
    queryKey: QUERY_KEYS_CONFIGS.supportedRelayChains(),
    queryFn: async () => {
      return await userService.getSupportedRelayChains()
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  })
}
