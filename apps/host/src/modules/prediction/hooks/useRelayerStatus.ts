import { useQuery } from '@tanstack/react-query'
import { userService } from '@/modules/prediction/services/user.service.ts'

export const useRelayerStatus = (transactionId: string | undefined) => {
  return useQuery({
    queryKey: ['prediction', 'relayer-status', transactionId],
    queryFn: async () => {
      if (!transactionId) return null
      const res = await userService.getRelayerStatus({ transactionIds: [transactionId] })
      return res?.[0] ?? null
    },
    enabled: !!transactionId,
    refetchInterval: (query) => {
      // Stop refetching if transaction is completed or failed
      const state = query.state.data?.state
      if (state === 'COMPLETED' || state === 'FAILED') {
        return false
      }
      // Refetch every 3 seconds while pending
      return 3000
    },
  })
}
