import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { userService } from '@/modules/prediction/services/user.service'
import { RelayAsset } from '@/@generated/gql/graphql-xpUser'
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'

export const useSupportedRelayAssets = (
  options?: Omit<UseQueryOptions<RelayAsset[], Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<RelayAsset[], Error>({
    queryKey: QUERY_KEYS_CONFIGS.supportedRelayAssets(),
    queryFn: async () => {
      return await userService.getSupportedRelayAssets()
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  })
}
