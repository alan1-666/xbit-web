import { useEffect, useRef, useState } from 'react'
import { TokenTrendingSearchBarData } from '@/@generated/gql/graphql-future'
import { TOKEN_TRENDING_SEARCH_BAR_KEY, TOKEN_TRENDING_SEARCH_BAR_MS } from '@/components/futuresDiscover/futuresSearch'
import { getFromLocalStorageWithTTL, saveToLocalStorageWithTTL } from '@/utils/storage'
import { useQueryClient, useQuery as useReactQuery } from '@tanstack/react-query'
import { futureClient } from '@/lib/gql/apollo-client'
import { GetTokenTrendingSearchBar } from '@/services/tokens.service'

// Custom hook for cache-first data loading
export const useTokenTrendingSearchBar = (trendingVariables: {
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
  const queryClient = useQueryClient()

  // Fetch from API (always enabled)
  const { data: apiData, isFetching } = useReactQuery({
    queryKey: ['GetTokenTrendingSearchBar', trendingVariables],
    queryFn: async () => {
      const res = await futureClient.query({
        query: GetTokenTrendingSearchBar,
        variables: trendingVariables,
      })
      return res?.data?.getTokenTrendingSearchBar?.data || []
    },
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (apiData !== undefined && apiData.length > 0) {
      setData(apiData)
      setIsFromCache(false)

      saveToLocalStorageWithTTL<TokenTrendingSearchBarData[]>(
        TOKEN_TRENDING_SEARCH_BAR_KEY,
        apiData,
        TOKEN_TRENDING_SEARCH_BAR_MS,
      )
    }
  }, [apiData])

  const loading = isFetching && data.length === 0

  const updateCacheWithFavorite = (tokenAddress: string, isFavorite: boolean) => {
    const updatedData = data.map((item) => (item.token === tokenAddress ? { ...item, isFavorite } : item))
    queryClient.setQueryData(
      ['GetTokenTrendingSearchBar', trendingVariables],
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
