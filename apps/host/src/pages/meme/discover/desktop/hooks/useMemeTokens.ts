import { useInfiniteQuery } from '@tanstack/react-query'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { getMemeTokens } from '@services/tokens.service.ts'
import { MemeInput, Query, TimeRange } from '@/@generated/gql/graphql-future.ts'
import { MemeTokenWithFormatted } from '@/types/token.ts'
import { useCallback, useEffect } from 'react'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'

export type UseMemeTokensOptions = {
  queryKey: any[]
  input: MemeInput
  paused: boolean
  refetchInterval: number
  timeframe?: '1m' | '5m' | '1h' | '6h' | '24h'
  maxPages?: number
  firstPageLimit?: number
}

const convertTimeframeToTimeRange = (timeframe: '1m' | '5m' | '1h' | '6h' | '24h') => {
  switch (timeframe) {
    case '1m':
      return TimeRange.M1
    case '5m':
      return TimeRange.M5
    case '1h':
      return TimeRange.H1
    case '6h':
      return TimeRange.H6
    case '24h':
      return TimeRange.H24
    default:
      return TimeRange.H1
  }
}

export const useMemeTokens = (options: UseMemeTokensOptions) => {
  const { queryKey, input, paused, refetchInterval, timeframe = '1h', maxPages = 3, firstPageLimit = 60 } = options

  const activeWallet = useActiveWallet()

  const query = useInfiniteQuery({
    queryKey: queryKey,
    queryFn: async ({ pageParam }) => {
      const pageOffset = firstPageLimit / 20 - 1
      const res = await futureClient.query<Pick<Query, 'getMemeToken'>, { input: MemeInput }>({
        query: getMemeTokens,
        variables: {
          input: {
            ...input,
            timeRange: convertTimeframeToTimeRange(timeframe),
            page: pageParam === 1 ? 1 : pageParam + pageOffset,
            limit: pageParam === 1 ? firstPageLimit : 20,
          },
        },
      })
      const tokens = (res?.data.getMemeToken.data || []) as MemeTokenWithFormatted[]
      return tokens.map((token) => {
        const decimals = token.decimals ? +token.decimals : 0
        const exponential = Math.pow(10, decimals)
        const top10Balance = token.memeTooltip?.top10HolderAmount ?? 0
        return {
          ...token,
          txBySniperPct: token.txBySniperPct ? +token.txBySniperPct * 100 : undefined,
          devHold: token.devHold ? +token.devHold * 100 : undefined,
          sniperHoldPct: (token.sniperHoldPct || 0) * 100,
          top10Balance: (top10Balance / exponential).toString(),
          devHoldBalance: token.memeTooltip?.devHoldAmount
            ? (Number(token.memeTooltip.devHoldAmount) / exponential).toString()
            : undefined,
          top10Holder: token.top10Holder !== undefined ? +token.top10Holder * 100 : undefined,
          insider: token.insider !== undefined && token.insider !== null ? +token.insider * 100 : undefined,
        }
      }) as MemeTokenWithFormatted[]
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length >= 20 && allPages.length < maxPages) {
        return allPages.length + 1
      }
      return undefined
    },
    select: (data) => {
      return data.pages.flat()
    },
    initialPageParam: 1,
    enabled: !paused,
    staleTime: 60000,
    refetchInterval: refetchInterval,
    maxPages: maxPages,
  })
  const { isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = query
  const loadMore = useCallback(() => {
    if (!isLoading && !isFetchingNextPage && hasNextPage) {
      fetchNextPage().then()
    }
  }, [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage])

  useEffect(() => {
    query.refetch().then()
  }, [activeWallet.walletAddress])

  return {
    ...query,
    loadMore,
  }
}
