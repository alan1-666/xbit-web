import { TimeframeAndQuickBuy } from '@components/discover/TimeframeAndQuickBuy.tsx'
import { useApolloClient } from '@apollo/client'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { getTrendingTokens } from '@services/tokens.service.ts'
import {
  ChainType,
  TokenDirection,
  TokenSource,
  TokenStatisticDto,
  TokenStatisticPagination,
  TokenTimeRange,
  TokenTrendingInput,
} from '@/@generated/gql/graphql-core.ts'
import { memo, useCallback, useContext, useEffect, useMemo, useRef, useTransition } from 'react'
import { TimeframeOption } from '@components/discover/TimeframeSelector.tsx'
import { TrendingCard } from '@components/discover/cards/TrendingCard.tsx'
import { TrendingTabs } from '@components/discover/TrendingTabs.tsx'
import {
  toHolders,
  toLiquidityPool,
  toMarketCap,
  toProgress,
  toSortBy,
  toTransactions,
  toVolumes,
} from '@components/discover/filter/mapper.ts'
import { DiscoverPageContext } from '@components/discover/DiscoverPageContext.tsx'
import { TAB_TRENDING } from '@components/discover/DiscoverTabs.tsx'
import { useActiveChain } from '@hooks/useActiveChain.ts'
import { TYPE_CHAIN } from '@/lib/blockchain.ts'
import { LaunchPlatformOptions, TRENDING_TABS, TRENDING_TABS_MAP } from '@/lib/constant.ts'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { homeActions } from '@/redux/modules/home.slice.ts'
import { useSearchParams } from 'react-router-dom'
import { ListTokenSkeleton } from '@components/discover/ListTokenSkeleton.tsx'
import { EmptyList } from '@components/discover/EmptyList.tsx'
import AIAnalysisDrawer, { AIAnalysisDrawerHandle } from '@components/listCoin/AIAnalysisDrawer.tsx'
import { cn } from '@/lib/utils.ts'
import { Loading } from '@components/common/Loading.tsx'

type GetTokenTrendingInput = {
  input: TokenTrendingInput
}

type GetTokenTrendingOutput = {
  getTokenTrending: TokenStatisticPagination
}

const getSortBy = (direction: TokenDirection, timeframe: TimeframeOption) => {
  if (direction === TokenDirection.Popular) return `-volume${timeframe}`
  if (direction === TokenDirection.Gainer) return `-price${timeframe}Change`
  if (direction === TokenDirection.Loser) return `price${timeframe}Change`
  return undefined
}

const getTimeRangeFilter = (timeframe: TimeframeOption): TokenTimeRange => {
  switch (timeframe) {
    case '1m':
      return TokenTimeRange.M1
    case '5m':
      return TokenTimeRange.M5
    case '1h':
      return TokenTimeRange.H1
    case '6h':
      return TokenTimeRange.H6
    case '24h':
      return TokenTimeRange.H24
    default:
      return TokenTimeRange.H24
  }
}

type UseTokensOptions = {
  input: TokenTrendingInput
}

const useQueryFn = () => {
  const client = useApolloClient()
  return async ({ pageParam, input }: { pageParam: number; input: TokenTrendingInput }) => {
    const { data } = await client.query<GetTokenTrendingOutput, GetTokenTrendingInput>({
      query: getTrendingTokens,
      variables: {
        input: {
          page: pageParam,
          limit: 20,
          ...input,
        },
      },
    })
    return data
  }
}

const useTokens = (options: UseTokensOptions) => {
  const { input } = options
  const queryFn = useQueryFn()
  const { data, ...rest } = useInfiniteQuery({
    queryKey: ['tokens', 'trending', input],
    getNextPageParam: (lastPage: GetTokenTrendingOutput) => {
      if (lastPage.getTokenTrending?.data.length < 20) return undefined
      return lastPage.getTokenTrending?.page + 1
    },
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      return queryFn({ pageParam, input })
    },
  })
  const tokens: TokenStatisticDto[] = useMemo(() => {
    if (!data) return []
    return data.pages.flatMap((page) => page.getTokenTrending?.data)
  }, [data])
  return {
    data,
    tokens,
    ...rest,
  }
}

const useCurrentChainType = () => {
  const activeChain = useActiveChain()
  switch (activeChain) {
    case TYPE_CHAIN.SOLANA:
      return ChainType.Solana
    case TYPE_CHAIN.ETH:
      return ChainType.Evm
    default:
      return ChainType.All
  }
}

const MemoTimeframeAndQuickBuy = memo(TimeframeAndQuickBuy, (prevProps, nextProps) => {
  return prevProps.currentTimeframe === nextProps.currentTimeframe
})

const MemoTrendingCard = memo(TrendingCard, (prevProps, nextProps) => {
  return prevProps.token.token === nextProps.token.token && prevProps.timeframe === nextProps.timeframe
})

export const TabTrending = () => {
  const { filters, onFiltersChanged } = useContext(DiscoverPageContext)
  const currentChainType = useCurrentChainType()
  const currentTab = useAppSelector((state) => state.home.trendingSubTab as TokenDirection)
  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const [_, startTransition] = useTransition()

  const filter = useMemo(() => filters.trending, [filters])
  const currentTimeframe = useMemo(() => filter.timeframe as TimeframeOption, [filter])
  const setCurrentTimeframe = useCallback(
    (timeframe: TimeframeOption) => {
      startTransition(() => {
        onFiltersChanged(TAB_TRENDING, {
          ...filter,
          timeframe,
        })
      })
    },
    [filter],
  )

  const setCurrentTab = useCallback((tab: TokenDirection) => {
    startTransition(() => {
      dispatch(homeActions.setTrendingSubTab(tab))
    })
  }, [])

  useEffect(() => {
    searchParams.set('tab', TRENDING_TABS_MAP[currentTab] ?? TRENDING_TABS.HOT)
    setSearchParams(searchParams, { replace: true })
  }, [currentTab])

  const queryInput = useMemo(() => {
    console.log('TabTrending queryInput useMemo')
    return {
      chain: currentChainType,
      direction: currentTab,
      timeRange: getTimeRangeFilter(currentTimeframe),
      dex: TokenSource.All,
      sortBy: filter.sortBy ? toSortBy(filter.sortBy, currentTimeframe) : getSortBy(currentTab, currentTimeframe),
      ...(filter.dexList.length < LaunchPlatformOptions.length - 1 ? { dexes: filter.dexList.join(',') ?? '' } : {}),
      ...(toMarketCap(filter) ?? {}),
      ...(toHolders(filter) ?? {}),
      ...(toLiquidityPool(filter) ?? {}),
      ...(toTransactions(filter) ?? {}),
      ...(toVolumes(filter) ?? {}),
      ...(toProgress(filter) ?? {}),
    }
  }, [currentChainType, currentTab, currentTimeframe, filter])

  const { tokens, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useTokens({
    input: queryInput,
  })

  const aiRef = useRef<AIAnalysisDrawerHandle>(null)

  const handleAiAnalysisClick = useCallback((token: TokenStatisticDto) => {
    aiRef.current?.open(token.token)
  }, [])

  const listRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    return () => {
      // clean up the listRef to prevent memory leaks
      if (listRef.current) {
        listRef.current.innerHTML = ''
      }

      // cancel all queries related to trending tokens
      queryClient.cancelQueries({ queryKey: ['tokens', 'trending'] }).then(() => {})

      // reset the query data for the trending tokens to keep only the first page
      queryClient.setQueryData(['tokens', 'trending', queryInput], (oldData: any) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          pages: oldData.pages.slice(0, 1), // Keep only the first page
          pageParams: oldData.pageParams.slice(0, 1), // Keep only the first page param
        }
      })
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      // Check if the user has scrolled to the bottom of the list, using window scroll position
      // notice that we are using window.scrollY instead of listRef.current.scrollTop
      if (
        listRef.current &&
        window.scrollY + window.innerHeight >= listRef.current.offsetTop + listRef.current.clientHeight - 100 // 100px from the bottom
      ) {
        if (hasNextPage && !isFetchingNextPage && !isLoading) {
          fetchNextPage().then(() => {})
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [hasNextPage, isFetchingNextPage, isLoading])

  //
  // // useEffect(() => {
  // //   const visibleItems = renderItems.filter((item) => item.type === 'card')
  // //   const firstVisibleIndex = visibleItems[0]?.index ?? 0
  // //   const lastVisibleIndex = visibleItems[visibleItems.length - 1]?.index ?? 0
  // //   const firstPage = Math.floor(firstVisibleIndex / 20) + 1
  // //   const lastPage = Math.floor(lastVisibleIndex / 20) + 1
  // //   // const iv = setInterval(() => {
  // //   // queryFn()
  // //   // queryClient
  // //   //   .fetchInfiniteQuery({
  // //   //     queryKey: ['tokens', 'trending', queryInput],
  // //   //     queryFn: async ({ pageParam }) => {
  // //   //       return queryFn({ pageParam, input: queryInput })
  // //   //     },
  // //   //     initialPageParam: firstPage,
  // //   //   })
  // //   //   .then(() => {
  // //   //     console.log('Refreshed trending tokens')
  // //   //   })
  // //   // update the query cache for the first and last pages
  // //   // refetch({ refetchPage: (page, index) => index === 0 })
  // //   // }, 3000) // Polling interval for refreshing trending tokens
  // //   return () => {
  // //     clearInterval(iv)
  // //   }
  // // }, [queryInput])
  //
  // const handleOnLoadMore = useCallback(() => {
  //   if (!hasNextPage || isFetchingNextPage || isLoading) return
  //   fetchNextPage().then(() => {})
  // }, [hasNextPage, isFetchingNextPage, renderItems])

  return (
    <div className="px-2.5 bg-[#111111] flex flex-col space-y-3 z-[1] pb-[95px]">
      <div className="sticky top-[40px] pt-3 pb-1 z-[1] space-y-3 bg-[#0A0A0A]">
        <TrendingTabs currentTab={currentTab} setCurrentTab={setCurrentTab} />
        <MemoTimeframeAndQuickBuy currentTimeframe={currentTimeframe} onTimeframeChange={setCurrentTimeframe} />
      </div>
      <AIAnalysisDrawer ref={aiRef} includeTrigger={false} />
      {isLoading && <ListTokenSkeleton />}
      {!isLoading && tokens.length === 0 && <EmptyList />}
      {!isLoading && tokens.length > 0 && (
        <div ref={listRef} className="relative w-full">
          {tokens.map((token) => (
            <div className="pb-[5px] z-[1]" key={token.token}>
              <MemoTrendingCard
                key={token.token}
                token={token}
                timeframe={currentTimeframe}
                onAiAnalysisClick={handleAiAnalysisClick}
              />
            </div>
          ))}
          {hasNextPage && (
            <div className={cn('w-full h-[82px] flex justify-center items-center pt-3 pb-[5px]')}>
              <Loading />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
