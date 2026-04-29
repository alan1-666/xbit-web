import { useQuery, useQueryClient } from '@tanstack/react-query'
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

export interface UseWatchlistTokensAllOptions {
  excludeBlacklisted?: boolean
  favoriteType?: string
}

/**
 * 一次性获取所有收藏的 tokens，不分页
 * 专门用于需要一次性加载所有数据的场景
 */
export const useWatchlistTokensAll = (options: UseWatchlistTokensAllOptions = {}) => {
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

  const result = useQuery({
    queryKey: ['tokens', 'watchlist-all', currentTimeframe, queryInput, activeWallet?.walletAddress],
    refetchInterval: 10000, // 10 seconds
    queryFn: async () => {
      const res = await futureClient.query<Pick<Query, 'getFavoriteToken'>, QueryGetFavoriteTokenArgs>({
        query: getFavoriteTokens,
        variables: {
          input: {
            // 不传 page 和 limit，一次性获取所有数据
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
  })

  const removeToken = useCallback(
    (tokenAddress: string) => {
      queryClient.setQueryData(
        ['tokens', 'watchlist-all', currentTimeframe, queryInput, activeWallet?.walletAddress],
        (oldData: MemeDto[]) => {
          if (!oldData) return oldData
          return oldData.filter((token) => token.token !== tokenAddress)
        },
      )
    },
    [queryClient, currentTimeframe, queryInput, activeWallet?.walletAddress],
  )

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
    removeToken,
    data: filteredTokens,
    // 为了兼容原有的 API，添加这些字段
    hasNextPage: false,
    isFetchingNextPage: false,
    loadMore: () => {},
  }
}
