import { useQuery } from '@tanstack/react-query'
import { fetchSmartMoneyRoi } from '@/pages/smart-money-pc/Api/api'

export function useSmartMoneyRoi(userAddress?: string) {
  return useQuery({
    queryKey: ['smart-money-roi', userAddress],
    enabled: !!userAddress,
    queryFn: () => fetchSmartMoneyRoi(userAddress!),
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
    retry: 1,
  })
}
