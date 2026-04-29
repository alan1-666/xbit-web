import { useInfiniteQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { gqlMeme2 } from '@/lib/gql/apollo-client.ts'
import { getMemeTrendingTokens } from '@services/tokens.service.ts'
import { Dex, TimeRange, TokenDirection } from '@/@generated/gql/graphql-meme2.ts'
import { convertToChainTypeFromChainId } from '@/utils/chain.ts'

export type UseMemeTrendingTokensQuerySortByField = 'marketCap' | 'liquidity' | 'price' | 'price1hChange'

export type UseMemeTrendingTokensQuerySortBy = {
  field: UseMemeTrendingTokensQuerySortByField
  direction: 'asc' | 'desc'
}

export interface UseMemeTrendingTokensQueryOptions {
  chainId: number
  sortBy?: UseMemeTrendingTokensQuerySortBy
}

export const useMemeTrendingTokensQuery = (options: UseMemeTrendingTokensQueryOptions) => {
  const { sortBy, chainId } = options
  const sorting = useMemo(() => {
    if (!sortBy) return undefined
    const sign = sortBy.direction === 'asc' ? '+' : '-'
    return `${sign}${sortBy.field}`
  }, [sortBy])

  const chainType = useMemo(() => {
    return convertToChainTypeFromChainId(chainId)
  }, [chainId])

  const query = useInfiniteQuery({
    queryKey: ['market', 'meme', 'trending', sorting],
    queryFn: async ({ pageParam }) => {
      const res = await gqlMeme2.query({
        query: getMemeTrendingTokens,
        variables: {
          input: {
            dex: Dex.All,
            chain: chainType,
            timeRange: TimeRange.H24,
            direction: TokenDirection.Popular,
            sortBy: sorting,
            page: pageParam,
            limit: 20,
          },
        },
      })
      return res.data.getTokenTrending.data
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 20) return undefined
      return allPages.length + 1
    },
    select: (data) => {
      return data.pages.flat()
    },
  })

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = query
  const loadMore = useCallback(() => {
    if (isLoading || isFetchingNextPage || !hasNextPage) return
    fetchNextPage().then(() => {})
  }, [isLoading, hasNextPage, isFetchingNextPage, fetchNextPage])

  return {
    ...query,
    data: data || [],
    loadMore,
  }
}
