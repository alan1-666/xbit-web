import { useQueryClient } from '@tanstack/react-query'
import { useProxyWallet } from '@/modules/prediction/hooks/useProxyWallet.ts'
import { useCallback } from 'react'
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'

export const useRefetchUserPositions = () => {
  const queryClient = useQueryClient()
  const proxyWallet = useProxyWallet()
  return useCallback(
    (onCompleted?: () => void) => {
      queryClient
        .refetchQueries({
          predicate: (query) => QUERY_KEYS_CONFIGS.predicateUserPositions(query.queryKey as string[], proxyWallet!),
        })
        .then(() => {
          console.log('[UserTransactionsSubscription] refetch complete')
          onCompleted?.()
        })
    },
    [proxyWallet],
  )
}
