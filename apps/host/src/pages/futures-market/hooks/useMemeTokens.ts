import { useAppSelector } from '@/redux/store'
import { FilterFormData } from '@components/discover/filter/FilterFormData.ts'
import { useCallback, useEffect, useMemo } from 'react'
import { TimeframeOption } from '@components/discover/TimeframeSelector.tsx'
import { TYPE_CHAIN } from '@/lib/blockchain.ts'
import { listCoinHelper } from '@/utils/list-coin-helper.ts'
import {
  toHolders,
  toLiquidityPool,
  toMarketCap,
  toProgress,
  toSortBy,
  toTransactions,
  toVolumes,
} from '@/components/discover/filter/mapper'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { getFullyTrendingTokens, getFullyTrendingTokensWithDebug } from '@services/tokens.service.ts'
import { InfiniteData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import {
  Dex,
  MemeDto,
  Query,
  QueryGetTokenTrendingArgs,
  TimeRange,
  TokenDirection,
  TokenTrendingInput,
} from '@/@generated/gql/graphql-future'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import { useActiveChain } from '@hooks/useActiveChain.ts'

const useQueryFn = () => {
  const isDebug = window.location.search.includes('debug=1')
  return async ({ pageParam, input }: { pageParam: number; input: TokenTrendingInput }) => {
    const { data } = await futureClient.query<Pick<Query, 'getTokenTrending'>, QueryGetTokenTrendingArgs>({
      query: isDebug ? getFullyTrendingTokensWithDebug : getFullyTrendingTokens,
      variables: {
        input: {
          page: pageParam,
          limit: 20,
          debug: isDebug,
          ...input,
        },
      },
    })
    const tokens = data.getTokenTrending.data ?? []
    return tokens.map((token) => ({
      ...token,
      insider: token.insider ? +token.insider * 100 : 0,
      devHold: token.devHold ? +token.devHold * 100 : 0,
      top10Holder: token.top10Holder ? +token.top10Holder * 100 : 0,
      sniperHoldPct: token.sniperHoldPct ? +token.sniperHoldPct * 100 : 0,
    })) as MemeDto[]
  }
}

export interface UseMemeTokensOptions {
  direction?: TokenDirection
}

export const useMemeTokens = (options: UseMemeTokensOptions = {}) => {
  const filter = useAppSelector((state) => state.home.filters.trending as FilterFormData)
  const currentTimeframe = useMemo(() => filter.timeframe as TimeframeOption, [filter])
  const activeWallet = useActiveWallet()
  const queryClient = useQueryClient()
  const { direction } = options

  const queryFn = useQueryFn()

  // 使用当前活跃的链
  const activeChain = useActiveChain()

  const dexList = useMemo(() => {
    const key = `${activeChain || TYPE_CHAIN.SOLANA}DexList` as
      | 'ethDexList'
      | 'solDexList'
      | 'bscDexList'
      | 'arbDexList'
    return filter[key]
  }, [filter, activeChain])

  const queryInput = useMemo(() => {
    return {
      chain: listCoinHelper.getChainType(activeChain || TYPE_CHAIN.SOLANA),
      direction: direction ?? TokenDirection.Popular,
      timeRange: listCoinHelper.getTimeRangeFilter(currentTimeframe) as unknown as TimeRange,
      dex: Dex.All,
      sortBy: filter.sortBy ? toSortBy(filter.sortBy, currentTimeframe) : undefined,
      ...(dexList ? { dexes: dexList.join(',') } : {}),
      ...(toMarketCap(filter) ?? {}),
      ...(toHolders(filter) ?? {}),
      ...(toLiquidityPool(filter) ?? {}),
      ...(toTransactions(filter) ?? {}),
      ...(toVolumes(filter) ?? {}),
      ...(toProgress(filter) ?? {}),
    } as TokenTrendingInput
  }, [activeChain, currentTimeframe, filter, direction, dexList])

  const queryKey = useMemo(() => ['tokens', 'meme-trending', queryInput], [queryInput])

  const result = useInfiniteQuery({
    queryKey: queryKey,
    getNextPageParam: (lastPage: MemeDto[], allPages) => {
      if (lastPage.length < 20) return undefined
      return allPages.length + 1
    },
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      return await queryFn({ pageParam, input: queryInput })
    },
    select: (data) => data.pages.flat(),
    refetchInterval: 10000,
  })

  const loadMore = () => {
    if (!result.isLoading && !result.isFetchingNextPage && result.hasNextPage) {
      result.fetchNextPage().then()
    }
  }

  useEffect(() => {
    result.refetch().then()
  }, [activeWallet.walletAddress])

  const markTokenFavorite = useCallback((token: string, isFavorite: boolean) => {
    queryClient.setQueriesData(
      { predicate: (query) => query.queryKey[0] === 'tokens' && query.queryKey[1] === 'meme-trending' },
      (oldData: InfiniteData<MemeDto[]>) => {
        if (!oldData) return oldData
        const newPages = oldData.pages.map((page) =>
          page.map((item) => {
            if (item.token === token) {
              return {
                ...item,
                isFavorite,
              }
            }
            return item
          }),
        )
        return {
          ...oldData,
          pages: newPages,
        }
      },
    )
  }, [])

  return {
    ...result,
    currentTimeframe,
    loadMore,
    markTokenFavorite,
  }
}