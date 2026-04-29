import { InfiniteData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { getFavoriteTokens } from '@services/tokens.service.ts'
import { useAppSelector } from '@/redux/store'
import { FilterFormData } from '@components/discover/filter/FilterFormData.ts'
import { useCallback, useMemo } from 'react'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import { TYPE_CHAIN } from '@/lib/blockchain.ts'
import {
  toHolders,
  toLiquidityPool,
  toMarketCap,
  toProgress,
  toSortBy,
  toTransactions,
  toVolumes,
} from '@components/discover/filter/mapper.ts'
import { listCoinHelper } from '@/utils/list-coin-helper.ts'
import { useActiveChain, useActiveChainType } from '@hooks/useActiveChain.ts'
import { Dex, MemeDto, Query, QueryGetFavoriteTokenArgs } from '@/@generated/gql/graphql-future.ts'
import { TimeframeOption } from '@components/discover/TimeframeSelector.tsx'
import { useAllBacklistAddresses } from '@pages/meme/discover/desktop/hooks/useBlacklistAddress.ts'

export interface UseWatchlistTokensOptions {
  excludeBlacklisted?: boolean // whether to exclude blacklisted tokens and devs
  favoriteType?: string // favorite type filter (e.g., 'MEME', 'XSTOCK')
}

export const useWatchlistTokens = (options: UseWatchlistTokensOptions = {}) => {
  const { excludeBlacklisted = true, favoriteType } = options
  const filter = useAppSelector((state) => state.home.filters.watchlist as FilterFormData)
  const currentTimeframe = useMemo(() => filter.timeframe as TimeframeOption, [filter])

  const activeWallet = useActiveWallet()
  const { blacklistTokens, blacklistDevs } = useAllBacklistAddresses()
  const activeChain = useActiveChain()
  const activeChainType = useActiveChainType()

  const queryClient = useQueryClient()

  const dexList = useMemo(() => {
    const key = `${activeChain || TYPE_CHAIN.SOLANA}DexList` as
      | 'ethDexList'
      | 'solDexList'
      | 'bscDexList'
      | 'arbDexList'
    if (!activeChain) return undefined
    return filter[key]
  }, [filter, activeChain])

  const queryInput: QueryGetFavoriteTokenArgs['input'] = useMemo(() => {
    return {
      chain: activeChainType,
      dex: Dex.All,
      sortBy: filter.sortBy ? toSortBy(filter.sortBy, currentTimeframe) : undefined,
      timeRange: listCoinHelper.timeframeMapper(currentTimeframe),
      ...(dexList ? { dexes: dexList.join(',') ?? '' } : {}),
      ...(favoriteType ? { favoriteType } : {}),
      ...(toMarketCap(filter) ?? {}),
      ...(toHolders(filter) ?? {}),
      ...(toLiquidityPool(filter) ?? {}),
      ...(toTransactions(filter) ?? {}),
      ...(toVolumes(filter) ?? {}),
      ...(toProgress(filter) ?? {}),
    }
  }, [filter, activeChain, favoriteType])

  const result = useInfiniteQuery({
    queryKey: ['tokens', 'watchlist', currentTimeframe, queryInput, activeWallet?.walletAddress],
    getNextPageParam: (lastPage: MemeDto[], allPages) => {
      if (lastPage.length < 20) return undefined
      return allPages.length + 1
    },
    initialPageParam: 1,
    refetchInterval: 10000, // 10 seconds
    queryFn: async ({ pageParam }) => {
      const res = await futureClient.query<Pick<Query, 'getFavoriteToken'>, QueryGetFavoriteTokenArgs>({
        query: getFavoriteTokens,
        variables: {
          input: {
            page: pageParam,
            limit: 20,
            ...queryInput,
          },
        },
      })
      const tokens = res.data.getFavoriteToken.data as MemeDto[]
      return tokens.map((token) => ({
        ...token,
        insider: token.insider ? +token.insider * 100 : 0,
        devHold: token.devHold ? +token.devHold * 100 : 0,
        top10Holder: token.top10Holder ? +token.top10Holder * 100 : 0,
        sniperHoldPct: token.sniperHoldPct ? +token.sniperHoldPct * 100 : 0,
      }))
    },
    enabled: activeWallet.isConnected,
    select: (data) => data.pages.flat() ?? [],
  })
  const { hasNextPage, isFetchingNextPage, fetchNextPage, isLoading } = result
  const loadMore = useCallback(() => {
    if (isLoading || isFetchingNextPage || !hasNextPage) return
    fetchNextPage().then()
  }, [hasNextPage, isLoading, isFetchingNextPage, fetchNextPage])

  const removeToken = useCallback((tokenAddress: string) => {
    queryClient.setQueryData(
      ['tokens', 'watchlist', currentTimeframe, queryInput, activeWallet?.walletAddress],
      (oldData: InfiniteData<MemeDto[]>) => {
        if (!oldData) return oldData
        const newPages = oldData.pages.map((page) => page.filter((token) => token.token !== tokenAddress))
        return {
          ...oldData,
          pages: newPages,
        }
      },
    )
  }, [])

  const filteredTokens = useMemo(() => {
    const tokens = result.data
    if (!tokens) return []
    if (!excludeBlacklisted) return tokens
    return tokens.filter((token) => {
      const isBlacklistedToken = blacklistTokens.some(
        (blacklist) => blacklist.address.toLowerCase() === token.token?.toLowerCase(),
      )
      const isBlacklistedDev = token.creator
        ? blacklistDevs.some((blacklist) => blacklist.address.toLowerCase() === token.creator?.toLowerCase())
        : false
      return !isBlacklistedToken && !isBlacklistedDev
    })
  }, [result.data, blacklistTokens, blacklistDevs, excludeBlacklisted])

  return {
    ...result,
    currentTimeframe,
    loadMore,
    removeToken,
    data: filteredTokens,
  }
}
