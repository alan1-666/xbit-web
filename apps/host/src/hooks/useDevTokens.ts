import { useInfiniteQuery } from '@tanstack/react-query'
import { gqlMeme2 } from '@/lib/gql/apollo-client.ts'
import { getTokenCreatedByDev } from '@services/tokens2.service.ts'
import { useCallback, useMemo } from 'react'
import { TokenCreatedByDevDataDto } from '@/@generated/gql/graphql-meme2.ts'

export interface UseDevTokensOptions {
  chainId: number
  devAddress: string
}

export const useDevTokens = (options: UseDevTokensOptions) => {
  const { chainId, devAddress } = options
  const result = useInfiniteQuery({
    queryKey: ['devTokens', chainId, devAddress],
    enabled: !!chainId && !!devAddress,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await gqlMeme2.query({
        query: getTokenCreatedByDev,
        variables: {
          input: {
            chainId: chainId,
            devAddress: devAddress,
            page: pageParam,
            limit: 100,
          },
        },
      })
      const devTokens = res.data.getTokenCreatedByDev
      if (pageParam > 1) return devTokens // No need to process total on subsequent pages
      const tokens = devTokens.tokens || []
      if (devTokens.total && devTokens.total > 100) {
        // If total is more than 100, we can't be sure about migrated count
        return devTokens
      }
      const migratedTokens = tokens.filter((t) => !!t.migratedAt)
      const isEnd = devTokens.tokens && tokens.length < 100
      const totalTokens = isEnd ? tokens.length : devTokens.total || 0
      return {
        ...devTokens,
        total: totalTokens,
        totalMigrated: migratedTokens.length,
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      const tokensCount = lastPage.tokens?.length || 0
      return tokensCount < 100 ? undefined : allPages.length + 1
    },
  })

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = result

  const normalizedData = useMemo(() => {
    if (!data || !data.pages || data.pages.length === 0)
      return {
        tokens: [] as TokenCreatedByDevDataDto[],
        total: 0,
        totalRug: 0,
        totalActive: 0,
        totalMigrated: 0,
      }
    const tokens = data.pages.flatMap((page) => page.tokens || [])
    const firstPage = data.pages[0]
    return {
      tokens,
      total: firstPage.total,
      totalRug: firstPage.totalRug,
      totalActive: firstPage.totalActive,
      totalMigrated: firstPage.totalMigrated,
      lastCreatedToken: firstPage.lastCreatedToken,
      lastCreatedAt: firstPage.lastCreatedAt,
    }
  }, [data])

  const loadMore = useCallback(() => {
    console.table({ hasNextPage, isFetchingNextPage })
    if (hasNextPage && !isFetchingNextPage) {
      console.log('Loading more dev tokens...')
      fetchNextPage()
        .then((r) => {
          console.log('Dev tokens loaded more', r.data?.pages)
        })
        .catch((e) => {
          console.error('Error loading more dev tokens', e)
        })
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return {
    ...result,
    data: normalizedData,
    loadMore,
  }
}
