import { useQuery } from '@tanstack/react-query'
import { userService } from '@/modules/prediction/services/user.service.ts'
import { GetWithdrawQuoteInput } from '@/modules/prediction/types'

export interface UseWithdrawQuoteOptions extends GetWithdrawQuoteInput {
  enabled?: boolean
}

export const useWithdrawQuote = (options: UseWithdrawQuoteOptions) => {
  const { amount, fromChainId, toChainId, toAddress, toTokenAddress, enabled = true } = options

  return useQuery({
    queryKey: ['prediction', 'withdraw-quote', amount, fromChainId, toChainId, toAddress, toTokenAddress],
    queryFn: async () => {
      return userService.getWithdrawQuote({
        amount,
        fromChainId,
        toChainId,
        toTokenAddress,
        toAddress,
      })
    },
    enabled: enabled && !!amount && !!toAddress && fromChainId > 0 && toChainId > 0,
    staleTime: 1000 * 30, // 30 seconds - quotes can change frequently
    gcTime: 1000 * 60, // 1 minute
  })
}
