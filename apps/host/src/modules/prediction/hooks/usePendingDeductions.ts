import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { userService } from '@/modules/prediction/services/user.service'
import { PendingDeductionItemDto } from '@/@generated/gql/graphql-xpUser'
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'

export const usePendingDeductions = (
  options?: Omit<UseQueryOptions<PendingDeductionItemDto[], Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<PendingDeductionItemDto[], Error>({
    queryKey: QUERY_KEYS_CONFIGS.pendingDeductions(),
    queryFn: async () => {
      return await userService.getPendingDeductions()
    },
    staleTime: 0, // Ensure data is always considered stale and can be refetched
    ...options,
  })
}
