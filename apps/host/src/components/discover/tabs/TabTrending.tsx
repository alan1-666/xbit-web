import { TokenDirection, TokenStatisticPagination } from '@/@generated/gql/graphql-core.ts'
import { TYPE_CHAIN } from '@/lib/blockchain.ts'
import { TRENDING_TABS } from '@/lib/constant.ts'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { cn } from '@/lib/utils.ts'
import { homeActions } from '@/redux/modules/home.slice.ts'
import { useAppDispatch } from '@/redux/store'
import { Loading } from '@components/common/Loading.tsx'
import { TrendingCard } from '@components/discover/cards/TrendingCard.tsx'
import { DiscoverPageContext } from '@components/discover/DiscoverPageContext.tsx'
import { TAB_TRENDING } from '@components/discover/DiscoverTabs.tsx'
import { EmptyList } from '@components/discover/EmptyList.tsx'
import {
  toHolders,
  toLiquidityPool,
  toMarketCap,
  toProgress,
  toSortBy,
  toTransactions,
  toVolumes,
} from '@components/discover/filter/mapper.ts'
import { ListTokenSkeleton } from '@components/discover/ListTokenSkeleton.tsx'
import { TimeframeAndQuickBuy } from '@components/discover/TimeframeAndQuickBuy.tsx'
import { TimeframeOption } from '@components/discover/TimeframeSelector.tsx'
import AIAnalysisDrawer, { AIAnalysisDrawerHandle } from '@components/listCoin/AIAnalysisDrawer.tsx'
import { useActiveChain } from '@hooks/useActiveChain.ts'
import { getTrendingTokens, getTrendingTokensWithDebug } from '@services/tokens.service.ts'
import { useQueryClient } from '@tanstack/react-query'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { Key, memo, useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChainType, Dex, TokenTrendingInput } from '@/@generated/gql/graphql-future.ts'
import { listCoinHelper } from '@/utils/list-coin-helper.ts'
import { useTrendingTokens } from '@pages/meme/discover/desktop/hooks/useTrendingTokens.ts'
import { MemeDto } from '@/@generated/gql/graphql-meme2.ts'

type GetTokenTrendingInput = {
  input: TokenTrendingInput
}

type GetTokenTrendingOutput = {
  getTokenTrending: TokenStatisticPagination
}

const getSortBy = (direction: TokenDirection, timeframe: TimeframeOption) => {
  if (direction === TokenDirection.Popular) return undefined
  if (direction === TokenDirection.Gainer) return `-price${timeframe}Change`
  if (direction === TokenDirection.Loser) return `price${timeframe}Change`
  return undefined
}

const useQueryFn = () => {
  const isDebug = window.location.search.includes('debug=1')
  return async ({ pageParam, input }: { pageParam: number; input: TokenTrendingInput }) => {
    const { data } = await futureClient.query<GetTokenTrendingOutput, GetTokenTrendingInput>({
      query: isDebug ? getTrendingTokensWithDebug : getTrendingTokens,
      variables: {
        input: {
          page: pageParam,
          limit: 20,
          debug: isDebug,
          ...input,
        },
      },
    })
    return data
  }
}

const useCurrentChainType = () => {
  const activeChain = useActiveChain()
  switch (activeChain) {
    case TYPE_CHAIN.SOLANA:
      return ChainType.Solana
    case TYPE_CHAIN.ETH:
      return ChainType.Evm
    case TYPE_CHAIN.BSC:
      return ChainType.Bsc
    case TYPE_CHAIN.MON:
      return ChainType.Mon
    default:
      return ChainType.All
  }
}

const OVERSCAN = 50

const OVERSCAN_PADDING = 90 * 8

type SkeletonItem = {
  type: 'skeleton'
  key: Key
  start: number
  index: number
}

type CardItem = {
  type: 'card'
  key: Key
  token: MemeDto
  start: number
  index: number
}

const MemoTimeframeAndQuickBuy = memo(TimeframeAndQuickBuy, (prevProps, nextProps) => {
  return (
    prevProps.currentTimeframe === nextProps.currentTimeframe &&
    prevProps.onTimeframeChange === nextProps.onTimeframeChange
  )
})

const MemoTrendingCard = memo(TrendingCard, (prevProps, nextProps) => {
  return prevProps.token.token === nextProps.token.token && prevProps.timeframe === nextProps.timeframe
})

type RenderItem = SkeletonItem | CardItem

export const TabTrending = () => {
  const { filters, onFiltersChanged } = useContext(DiscoverPageContext)
  // const currentTab = useAppSelector((state) => state.home.trendingSubTab)
  const currentTab = TokenDirection.Popular // Temporary disable tab switching
  const currentChainType = useCurrentChainType()
  const dispatch = useAppDispatch()
  const activeChain = useActiveChain()
  const [_, setSearchParams] = useSearchParams()

  const filter = useMemo(() => filters.trending, [filters])
  const currentTimeframe = useMemo(() => filter.timeframe as TimeframeOption, [filter])
  const setCurrentTimeframe = useCallback(
    (timeframe: TimeframeOption) => {
      onFiltersChanged(TAB_TRENDING, {
        ...filter,
        timeframe,
      })
    },
    [filter, onFiltersChanged],
  )

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const tab = searchParams.get('tab')
    if (tab) {
      if (tab === TRENDING_TABS.HOT) {
        dispatch(homeActions.setTrendingSubTab(TokenDirection.Popular))
      } else if (tab === TRENDING_TABS.GAINERS) {
        dispatch(homeActions.setTrendingSubTab(TokenDirection.Gainer))
      } else if (tab === TRENDING_TABS.LOSERS) {
        dispatch(homeActions.setTrendingSubTab(TokenDirection.Loser))
      } else if (tab === TRENDING_TABS.AI_MINING) {
        dispatch(homeActions.setTrendingSubTab(TokenDirection.AiAnalysis))
      }
    } else {
      // If no valid tab in URL, set to default
      dispatch(homeActions.setTrendingSubTab(TokenDirection.Popular))
    }
  }, [])

  // const setCurrentTab = (tab: TokenDirection) => {
  //   if (tab === TokenDirection.Popular) {
  //     dispatch(homeActions.setTrendingSubTab(TokenDirection.Popular))
  //   } else if (tab === TokenDirection.Gainer) {
  //     dispatch(homeActions.setTrendingSubTab(TokenDirection.Gainer))
  //   } else if (tab === TokenDirection.Loser) {
  //     dispatch(homeActions.setTrendingSubTab(TokenDirection.Loser))
  //   } else if (tab === TokenDirection.AiAnalysis) {
  //     dispatch(homeActions.setTrendingSubTab(TokenDirection.AiAnalysis))
  //   }
  // }

  useEffect(() => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)
      if (currentTab === TokenDirection.Popular) {
        params.set('tab', TRENDING_TABS.HOT)
      } else if (currentTab === TokenDirection.Gainer) {
        params.set('tab', TRENDING_TABS.GAINERS)
      } else if (currentTab === TokenDirection.Loser) {
        params.set('tab', TRENDING_TABS.LOSERS)
      } else if (currentTab === TokenDirection.AiAnalysis) {
        params.set('tab', TRENDING_TABS.AI_MINING)
      }
      return params
    })
  }, [currentTab])

  const dexList = useMemo(() => {
    const key = `${activeChain || TYPE_CHAIN.SOLANA}DexList` as
      | 'ethDexList'
      | 'solDexList'
      | 'bscDexList'
      | 'arbDexList'
    if (!activeChain) return undefined
    return filter[key]
  }, [filter, activeChain])

  const queryInput = useMemo(() => {
    return {
      chain: currentChainType,
      direction: currentTab,
      timeRange: listCoinHelper.timeframeMapper(currentTimeframe),
      dex: Dex.All,
      sortBy: filter.sortBy ? toSortBy(filter.sortBy, currentTimeframe) : getSortBy(currentTab, currentTimeframe),
      ...(dexList ? { dexes: dexList.join(',') } : {}),
      ...(toMarketCap(filter) ?? {}),
      ...(toHolders(filter) ?? {}),
      ...(toLiquidityPool(filter) ?? {}),
      ...(toTransactions(filter) ?? {}),
      ...(toVolumes(filter) ?? {}),
      ...(toProgress(filter) ?? {}),
    }
  }, [currentChainType, currentTab, currentTimeframe, filter])

  // const { tokens, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage, dataUpdatedAt } = useTokens({
  //   input: queryInput,
  // })
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage, dataUpdatedAt } = useTrendingTokens({
    direction: currentTab,
  })

  const tokens = useMemo(() => {
    return data || ([] as MemeDto[])
  }, [data])

  const parentRef = useRef<HTMLDivElement>(null)
  const aiRef = useRef<AIAnalysisDrawerHandle>(null)

  const virtualizer = useWindowVirtualizer({
    count: tokens.length,
    estimateSize: () => 105,
    overscan: OVERSCAN,
    scrollMargin: parentRef.current?.offsetTop ?? 0,
    useAnimationFrameWithResizeObserver: true,
    isScrollingResetDelay: 50,
    getItemKey: (index) => `trending-token-${tokens[index]?.token}-${index}-${dataUpdatedAt}`,
    gap: 8,
  })

  const handleAiAnalysisClick = useCallback((token: MemeDto) => {
    aiRef.current?.open(token.token)
  }, [])

  const virtualItems = virtualizer.getVirtualItems()

  const lastItem = useMemo(() => {
    return virtualItems[virtualItems.length - 1]
  }, [virtualItems])

  const listRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    return () => {
      // clean up the listRef to prevent memory leaks
      if (listRef.current) {
        listRef.current.innerHTML = ''
      }

      // cancel any ongoing virtualizer operations
      virtualizer.scrollToIndex(0, { align: 'start' })

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

  const renderItems: RenderItem[] = useMemo(() => {
    const scrollOffset = virtualizer.scrollOffset ?? 0
    const viewportHeight = window.innerHeight
    const viewportStart = scrollOffset - OVERSCAN_PADDING
    const viewportEnd = scrollOffset + viewportHeight + OVERSCAN_PADDING

    return virtualItems.map((item) => {
      const itemStart = item.start
      const itemEnd = item.start + item.size
      if (itemEnd > viewportStart && itemStart < viewportEnd && tokens[item.index]) {
        return {
          type: 'card',
          key: item.key,
          token: tokens[item.index],
          start: item.start,
          index: item.index,
        }
      } else {
        return {
          type: 'skeleton',
          key: item.key,
          start: item.start,
          index: item.index,
        }
      }
    })
  }, [virtualItems, tokens, virtualizer.scrollOffset])

  useEffect(() => {
    const visibleItems = renderItems.filter((item) => item.type === 'card')
    const lastVisibleItem = visibleItems[visibleItems.length - 1]
    if (!lastVisibleItem) return
    const lastIndex = lastVisibleItem.index
    if (lastIndex >= tokens.length - 3) {
      handleOnLoadMore()
    }
  }, [renderItems])

  const queryFn = useQueryFn()
  useEffect(() => {
    const visibleItems = renderItems.filter((item) => item.type === 'card')
    const firstVisibleIndex = visibleItems[0]?.index ?? 0
    const lastVisibleIndex = visibleItems[visibleItems.length - 1]?.index ?? 0
    const firstPage = Math.floor(firstVisibleIndex / 20) + 1
    const lastPage = Math.floor(lastVisibleIndex / 20) + 1
    const pages = Array.from({ length: lastPage - firstPage + 1 }, (_, i) => i + firstPage)

    const iv = setInterval(() => {
      Promise.all(
        pages.map(async (page) => {
          return await queryFn({ pageParam: page, input: queryInput })
        }),
      ).then((results) => {
        results.forEach((result, index) => {
          const page = pages[index]
          queryClient.setQueryData(['tokens', 'trending', queryInput], (oldData: any) => {
            if (!oldData) return oldData
            // Update the specific page with new data
            const newPages = [...oldData.pages]
            newPages[page - 1] = result
            return {
              ...oldData,
              pages: newPages,
            }
          })
        })
      })
    }, 10000) // Polling interval for refreshing trending tokens
    return () => {
      clearInterval(iv)
    }
  }, [queryInput, renderItems])

  const handleOnLoadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage || isLoading) return
    fetchNextPage().then(() => {})
  }, [hasNextPage, isFetchingNextPage, renderItems])

  return (
    <div className="bg-[#0A0A0A] flex flex-col z-0 pb-[75px]">
      <div className="sticky top-[35px] py-3 z-[1] space-y-2 bg-[#0A0A0A] px-2.5">
        {/*<TrendingTabs currentTab={currentTab} setCurrentTab={setCurrentTab} />*/}
        <div className="flex items-center gap-1.5 md:gap-2.5">
          <div className="flex-1">
            <MemoTimeframeAndQuickBuy currentTimeframe={currentTimeframe} onTimeframeChange={setCurrentTimeframe} />
          </div>
          {/* <DiscoverFilterButton className="mx-0" /> */}
        </div>
      </div>
      <AIAnalysisDrawer ref={aiRef} includeTrigger={false} />
      {isLoading && <ListTokenSkeleton />}
      {!isLoading && tokens.length === 0 && <EmptyList />}
      {!isLoading && tokens.length > 0 && (
        <div
          ref={listRef}
          className="relative w-full"
          style={{ height: `${virtualizer.getTotalSize() + (hasNextPage ? 90 : 0)}px` }}
        >
          {renderItems.map((item) => (
            <div
              key={item.key}
              className="absolute top-0 left-0 w-full h-[90px]"
              style={{ transform: `translateY(${item.start - virtualizer.options.scrollMargin}px)` }}
            >
              {item.type === 'card' ? (
                item.token && (
                  <MemoTrendingCard
                    token={item.token}
                    timeframe={currentTimeframe}
                    onAiAnalysisClick={handleAiAnalysisClick}
                  />
                )
              ) : (
                <div
                  className={cn(
                    'size-full flex items-end border-[0.6px] border-[#ECECED14] rounded-[6px] bg-[#0A0A0A] box-border',
                  )}
                >
                  <div className="mt-auto bg-[#ECECED0F] w-full h-[24px] rounded-b-[6px]"></div>
                </div>
              )}
            </div>
          ))}
          {hasNextPage && (
            <div
              className={cn('absolute top-0 left-0 w-full h-[84px] flex justify-center items-center pt-3 pb-[5px]')}
              style={{
                transform: lastItem ? `translateY(${lastItem.start + 84 - virtualizer.options.scrollMargin}px)` : '',
              }}
            >
              <Loading />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
