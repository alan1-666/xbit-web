import { useQuery } from '@tanstack/react-query'
import { fetchTraderTagsByAddress } from '@/pages/smart-money-pc/Api/api'

export const useTraderTagsByAddress = (opts: { userAddress?: string; enabled?: boolean }) => {
  const userAddress = (opts.userAddress ?? '').trim()
  const enabled = (opts.enabled ?? true) && !!userAddress

  return useQuery({
    queryKey: ['trader-tags-by-address', userAddress],
    queryFn: () => fetchTraderTagsByAddress(userAddress),
    enabled,
    retry: 0,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  })
}
