import { TokenTrendingSearchBarData } from '@/@generated/gql/graphql-future'
import { TOKEN_TRENDING_SEARCH_BAR_KEY, TOKEN_TRENDING_SEARCH_BAR_MS } from '@/components/futuresDiscover/futuresSearch'
import { futureClient } from '@/lib/gql/apollo-client'
import { GetTokenTrendingSearchBarPC } from '@/services/tokens.service'
import { getFromLocalStorageWithTTL, saveToLocalStorageWithTTL } from '@/utils/storage'
import { useQueryClient, useQuery as useReactQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'

// Custom hook for cache-first data loading
export const useTokenTrendingSearchBarPC = (trendingVariables: {
  input: {
    chain: string
    dex: string
    direction: string
    timeRange: string
  }
}) => {
  const [data, setData] = useState<TokenTrendingSearchBarData[]>(
    getFromLocalStorageWithTTL<TokenTrendingSearchBarData[]>(TOKEN_TRENDING_SEARCH_BAR_KEY) ?? [],
  )
  const [isFromCache, setIsFromCache] = useState(false)
  const latestDataRef = useRef<TokenTrendingSearchBarData[]>([])
  const queryClient = useQueryClient()

  // Fetch from API (always enabled)
  const { data: apiData, isLoading: isQueryLoading } = useReactQuery({
    queryKey: ['GetTokenTrendingSearchBarPC', trendingVariables],
    queryFn: async () => {
      const res = await futureClient.query({
        query: GetTokenTrendingSearchBarPC,
        variables: trendingVariables,
      })
      return res?.data?.getTokenTrendingSearchBar?.data || []
    },
    staleTime: 30_000, // 30 seconds — prevent excessive refetching from multiple hook instances
    refetchOnWindowFocus: false,
  })

  const handleSetCache = async (data: TokenTrendingSearchBarData[]) => {
    saveToLocalStorageWithTTL<TokenTrendingSearchBarData[]>(
      TOKEN_TRENDING_SEARCH_BAR_KEY,
      data ?? [],
      TOKEN_TRENDING_SEARCH_BAR_MS,
    )
  }

  // Replace cache data with API data when API responds
  useEffect(() => {
    if (apiData !== undefined) {
      setData(apiData)
      setIsFromCache(false)
      latestDataRef.current = apiData
    }
  }, [apiData])

  // Save to cache on unmount
  useEffect(() => {
    return () => {
      if (latestDataRef.current.length > 0) {
        handleSetCache(latestDataRef.current)
      }
    }
  }, [])

  // Loading state: true only when loading cache AND no data yet
  const loading = isQueryLoading && data.length === 0

  const updateCacheWithFavorite = (tokenAddress: string, isFavorite: boolean) => {
    const updatedData = data.map((item) => (item.token === tokenAddress ? { ...item, isFavorite } : item))
    queryClient.setQueryData(
      ['GetTokenTrendingSearchBarPC', trendingVariables],
      (oldData: TokenTrendingSearchBarData[]) => {
        return updatedData
      },
    )
    setData(updatedData)
    saveToLocalStorageWithTTL(TOKEN_TRENDING_SEARCH_BAR_KEY, updatedData, TOKEN_TRENDING_SEARCH_BAR_MS)
  }

  return {
    getTokenTrendingSearchBar: data,
    loading,
    isFromCache,
    updateCacheWithFavorite,
  }
}
