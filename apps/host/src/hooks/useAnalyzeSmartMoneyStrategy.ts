import { useQuery } from '@tanstack/react-query'
import { fetchAnalyzeSmartMoneyStrategy } from '@/pages/smart-money-pc/Api/api'

export const useAnalyzeSmartMoneyStrategy = (opts: { userAddress?: string; enabled?: boolean }) => {
  const userAddress = (opts.userAddress ?? '').trim()
  const enabled = (opts.enabled ?? true) && !!userAddress

  return useQuery({
    queryKey: ['analyze-smart-money-strategy', userAddress],
    queryFn: () => fetchAnalyzeSmartMoneyStrategy(userAddress),
    enabled,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  })
}
