import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { TimeframeOption } from '@components/discover/TimeframeSelector.tsx'
import { ApolloClient, useApolloClient } from '@apollo/client'
import { getListTokenStatistics, getMemeTokens } from '@services/tokens.service.ts'
import { ChainType, LifecycleStates, MemeDto, MemeInput, TokenSource } from '@/@generated/gql/graphql-core.ts'
import { tokenTimeRangeMapper } from '@/utils/list-coin-helper.ts'
import MovingBgFilterTags, { MovingBgFilterTagsHandle } from '@components/common/MovingBgFilterTags.tsx'
import { useTranslation } from 'react-i18next'
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
import QuickBuy from '@/components/discover/QuickBuy'
import { useNewMemeTokensListener } from '@hooks/useNewMemeTokensListener.ts'
import { GetMemeOutput } from '@/types/responses'
import { TYPE_CHAIN } from '@/lib/blockchain.ts'
import { useActiveChain, useActiveChainId } from '@hooks/useActiveChain.ts'
import { IconPause } from '@components/icon'
import { useSearchParams } from 'react-router-dom'
import { MEME_TABS_MAP } from '@/lib/constant.ts'
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChainIds } from '@/types/enums.ts'
import { cn } from '@/lib/utils.ts'
import { TabMemeTokenList } from '@components/discover/tabs/TabMemeTokenList2.tsx'
import AIAnalysisDrawer, { AIAnalysisDrawerHandle } from '@components/listCoin/AIAnalysisDrawer.tsx'
import { TooltipProvider } from '@components/discover/TooltipProvider.tsx'
import { fShortenNumber } from '@/lib/number.ts'
import { MemeTokenWithFormatted } from '@/types/token'
import { useNewMemeTokensListenerV2 } from '@hooks/meme/useNewMemeTokensListenerV2.ts'

type GetMemeInput = {
  input: MemeInput
}

const percentageNumberFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

const formatPercentage = (value: number) => {
  const normalizedValue = Math.max(0, Math.min(value, 100))
  return percentageNumberFormat.format(normalizedValue) + '%'
}

const fetchTokens = async (client: ApolloClient<any>, input: MemeInput) => {
  const { data } = await client.query<GetMemeOutput, GetMemeInput>({
    query: getMemeTokens,
    variables: {
      input,
    },
  })
  if (!data.getMemeToken) return undefined
  const res: MemeTokenWithFormatted[] = data.getMemeToken.data.map((token) => {
    return {
      ...token,
      formatted: {
        top10Holders: token.top10Holder ? formatPercentage(token.top10Holder) : '--',
        snipers: token.txBySniperPct ? formatPercentage(token.txBySniperPct) : '--',
        insider: token.insider ? formatPercentage(token.insider) : '--',
        sameSource: token.sameSourceWallet ? formatPercentage(+token.sameSourceWallet) : '--',
        holders: token.numberOfHolder ? fShortenNumber(token.numberOfHolder) : '--',
        smartMoney: token.smartMoneyPct ? formatPercentage(token.smartMoneyPct) : '--',
        devProjects: token.devLaunched ? fShortenNumber(+token.devLaunched) : '--',
      },
    }
  })
  return {
    ...data,
    getMemeToken: {
      ...data.getMemeToken,
      data: res,
    },
  }
}

const lifecycleStates: LifecycleStates[] = [
  LifecycleStates.NewCreation,
  LifecycleStates.Completing,
  LifecycleStates.Soaring,
  LifecycleStates.Completed,
]

const lifecycleStateLabelKeys: Record<LifecycleStates, string> = {
  [LifecycleStates.NewCreation]: 'listCoin.filters.newListing',
  [LifecycleStates.Completing]: 'listCoin.filters.almostFull',
  [LifecycleStates.Soaring]: 'listCoin.filters.pumping',
  [LifecycleStates.Completed]: 'listCoin.filters.launched',
}

const defaultSortByCriteria: Record<LifecycleStates, string> = {
  [LifecycleStates.NewCreation]: '-createdTime',
  [LifecycleStates.Completing]: '-internalMarketProgress',
  [LifecycleStates.Soaring]: '-marketCap5mChangeUsd',
  [LifecycleStates.Completed]: '-createdTime',
}

export const TabMeme = () => {
  const [paused, setPaused] = useState(false)
  const client = useApolloClient()
  const activeChain = useActiveChain()

  const { t } = useTranslation()

  const { onMemeSubTabChanged, memeSubTab } = useContext(DiscoverPageContext)
  const [currentTab, setCurrentTab] = useState<LifecycleStates>(LifecycleStates.NewCreation)
  const { filters } = useContext(DiscoverPageContext)
  const tabRef = useRef<MovingBgFilterTagsHandle>(null)
  const aiAnalysisDrawer = useRef<AIAnalysisDrawerHandle>(null)

  const filterKey = useMemo(() => `TAB_MEME_${memeSubTab}`, [memeSubTab])
  const [searchParams, setSearchParams] = useSearchParams()

  const currentTimeframe = useMemo(() => {
    const filter = filters[filterKey]
    return filter.timeframe as TimeframeOption
  }, [filters])

  const queryKey = useMemo(() => {
    return ['tokens', 'meme', currentTab, JSON.stringify(filters[filterKey]), activeChain]
  }, [currentTab, filters[filterKey], activeChain])

  const handleAIAnalysisClick = useCallback(
    (tokenAddress: string) => {
      aiAnalysisDrawer.current?.open(tokenAddress)
    },
    [aiAnalysisDrawer],
  )

  const queryParams = useMemo(() => {
    const filter = filters[filterKey]
    return {
      limit: 20,
      chain: activeChain === TYPE_CHAIN.ETH ? ChainType.Evm : ChainType.Solana,
      lifecycleStates: currentTab ?? LifecycleStates.NewCreation,
      timeRange: tokenTimeRangeMapper(currentTimeframe),
      dex: TokenSource.All,
      sortBy: filter.sortBy ? toSortBy(filter.sortBy, currentTimeframe) : defaultSortByCriteria[currentTab],
      ...(filter.dexList.length < 2 ? { dexes: filter.dexList.join(',') } : {}),
      ...(toMarketCap(filter) ?? {}),
      ...(toHolders(filter) ?? {}),
      ...(toLiquidityPool(filter) ?? {}),
      ...(toTransactions(filter) ?? {}),
      ...(toVolumes(filter) ?? {}),
      ...(toProgress(filter) ?? {}),
    }
  }, [filters, filterKey, activeChain, currentTab, currentTimeframe])

  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: queryKey,
    queryFn: async ({ pageParam }) => {
      return fetchTokens(client, {
        page: pageParam,
        ...queryParams,
      })
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage?.getMemeToken.data.length < 20) return undefined
      return lastPage?.getMemeToken.page + 1
    },
    initialPageParam: 1,
    enabled: !paused,
    staleTime: 0,
    refetchOnWindowFocus: false,
    gcTime: 60000, // 1 minute
    refetchInterval: 5000, // 5 seconds
  })

  const rawTokens = useMemo(() => {
    const allTokens = data?.pages.flatMap((page) => page?.getMemeToken.data ?? [])
    if (currentTab === LifecycleStates.NewCreation) {
      return allTokens?.sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()) ?? []
    }
    return allTokens ?? []
  }, [data, currentTab])

  const { updateQuery } = useNewMemeTokensListenerV2({
    shouldSkip: paused || currentTab !== LifecycleStates.NewCreation,
    callback: (newTokens) => {
      const eligibleTokens = newTokens
        .filter(isEligibleForNewMemeTokens)
        .filter((token) => !rawTokens.find((item) => item.token === token.token))
      const newList: MemeTokenWithFormatted[] = eligibleTokens.map(
        (token) =>
          ({
            ...token,
            formatted: {
              top10Holders: token.top10Holder ? formatPercentage(token.top10Holder) : '--',
              snipers: token.txBySniperPct ? formatPercentage(token.txBySniperPct) : '--',
              insider: token.insider ? formatPercentage(token.insider) : '--',
              sameSource: token.sameSourceWallet ? formatPercentage(+token.sameSourceWallet) : '--',
              holders: token.numberOfHolder ? fShortenNumber(token.numberOfHolder) : '--',
              smartMoney: token.smartMoneyPct ? formatPercentage(token.smartMoneyPct) : '--',
              devProjects: token.devLaunched ? fShortenNumber(+token.devLaunched) : '--',
            },
          }) as MemeTokenWithFormatted,
      )
      updateQuery(queryKey, newList)
    },
    dexList: filters[filterKey].dexList,
  })

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab as LifecycleStates)
    onMemeSubTabChanged(tab as LifecycleStates)
  }

  const { data: devHoldData } = useQuery({
    queryKey: ['devHoldData', activeChain, currentTab],
    queryFn: async () => {
      const tokenAddresses = rawTokens.map((token) => token.token)
      const res = await client.query({
        query: getListTokenStatistics,
        variables: {
          input: {
            tokens: tokenAddresses,
            chainId: activeChain === TYPE_CHAIN.ETH ? ChainIds.Ethereum : ChainIds.Solana,
          },
        },
      })
      return res.data.getDevHold
    },
    refetchInterval: 5000, // 10 seconds
  })

  const tokens = useMemo(() => {
    if (!rawTokens || rawTokens.length === 0) return []
    if (!devHoldData) return rawTokens
    return rawTokens.map((token) => {
      const devHold = devHoldData?.find((hold) => hold.token === token.token)
      if (devHold) {
        return {
          ...token,
          devHold: devHold?.devHold,
        }
      } else {
        return token
      }
    })
  }, [rawTokens, devHoldData])

  const handleOnLoadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage || isLoading) return
    fetchNextPage().then(() => {})
  }, [hasNextPage, isFetchingNextPage, isLoading])

  useEffect(() => {
    if (currentTab !== memeSubTab) {
      tabRef?.current?.selectTab(memeSubTab)
    }
  }, [memeSubTab, currentTab])

  useEffect(() => {
    searchParams.set('tab', MEME_TABS_MAP[memeSubTab] ?? MEME_TABS_MAP[LifecycleStates.NewCreation])
    setSearchParams(searchParams, { replace: true })
  }, [memeSubTab])

  useEffect(() => {
    const stickyHeader = document.getElementById('discover-tabs')
    window.addEventListener('scroll', () => {
      if (stickyHeader) {
        setPaused(stickyHeader.offsetTop > 114)
      }
    })
  }, [])

  const queryClient = useQueryClient()
  useEffect(() => {
    return () => {
      // Cancel any ongoing queries related to meme tokens when the component unmounts
      queryClient.cancelQueries({
        queryKey: ['tokens', 'meme'],
      })

      // Clear the query cache for meme tokens, except first page
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          pages: oldData.pages.slice(0, 1), // Keep only the first page
          pageParams: oldData.pageParams.slice(0, 1), // Keep only the first page param
        }
      })
    }
  }, [])

  const activeChainId = useActiveChainId()

  const isEligibleForNewMemeTokens = useCallback(
    (token: MemeDto) => {
      const currentFilter = filters[filterKey]

      // Check if the token's chain matches the current filter's chain
      const isChainMatch = token.chainId === activeChainId
      if (!isChainMatch) return false

      // Check if the token's dexList matches the current filter's dexList
      const isDexListMatch =
        currentFilter.dexList.length === 2 ||
        currentFilter.dexList.some((allowedDex) => token.dexes?.includes(allowedDex) ?? false)
      if (!isDexListMatch) return false

      // Check the token's market cap
      const filteredMarketCap = currentFilter.marketCap
      if (filteredMarketCap) {
        const allowedMax = filteredMarketCap.max ?? Number.MAX_SAFE_INTEGER
        const allowedMin = filteredMarketCap.min ?? 0
        const tokenMarketCap = token.marketcap ?? 0
        if (tokenMarketCap < allowedMin || tokenMarketCap >= allowedMax) return false
      }

      // Check the token's holders
      const filteredHolders = currentFilter.holders
      if (filteredHolders) {
        const allowedMax = filteredHolders.max ?? Number.MAX_SAFE_INTEGER
        const allowedMin = filteredHolders.min ?? 0
        const tokenHolders = token.numberOfHolder ?? 0
        if (tokenHolders < allowedMin || tokenHolders >= allowedMax) return false
      }

      // Check the token's liquidity pool
      const filteredLiquidityPool = currentFilter.liquidityPool
      if (filteredLiquidityPool) {
        const allowedMax = filteredLiquidityPool.max ?? Number.MAX_SAFE_INTEGER
        const allowedMin = filteredLiquidityPool.min ?? 0
        const tokenLiquidityPool = token.liquidity ?? 0
        if (tokenLiquidityPool < allowedMin || tokenLiquidityPool >= allowedMax) return false
      }

      // Check the token's transactions
      const filteredTransactions = currentFilter.transactions
      if (filteredTransactions) {
        const allowedMax = filteredTransactions.max ?? Number.MAX_SAFE_INTEGER
        const allowedMin = filteredTransactions.min ?? 0
        const tokenTransactions = token[`txs${currentTimeframe}`] ?? 0
        if (tokenTransactions < allowedMin || tokenTransactions >= allowedMax) return false
      }

      // Check the token's volumes
      const filteredVolumes = currentFilter.volumes
      if (filteredVolumes) {
        const allowedMax = filteredVolumes.max ?? Number.MAX_SAFE_INTEGER
        const allowedMin = filteredVolumes.min ?? 0
        const tokenVolumes = token[`volume${currentTimeframe}`] ?? 0
        if (tokenVolumes < allowedMin || tokenVolumes >= allowedMax) return false
      }

      // Check the token's progress
      const filteredProgress = currentFilter.progress
      if (filteredProgress) {
        const allowedMax = filteredProgress.max ?? Number.MAX_SAFE_INTEGER
        const allowedMin = filteredProgress.min ?? 0
        const tokenProgress = token.internalMarketProgress ?? 0
        if (tokenProgress < allowedMin || tokenProgress >= allowedMax) return false
      }

      // If all checks pass, the token is eligible
      return true
    },
    [filters, currentTimeframe, activeChainId],
  )

  // const refreshFn = useCallback(
  //   (pages: number[]) => {
  //     Promise.all(
  //       pages.map(async (page) => {
  //         return fetchTokens(client, {
  //           page,
  //           ...queryParams,
  //         })
  //       }),
  //     ).then((results) => {
  //       const newTokens = results.flatMap((result) => result?.getMemeToken.data ?? [])
  //       queryClient.setQueryData(queryKey, (oldData: any) => {
  //         if (!oldData) return oldData
  //         const newPages = oldData.pages.map((pageData: any) => {
  //           const pageTokens = pageData.getMemeToken.data.map((token: MemeTokenWithFormatted) => {
  //             const newToken = newTokens.find((newToken) => newToken.token === token.token)
  //             if (newToken) {
  //               return {
  //                 ...token,
  //                 ...newToken,
  //                 formatted: {
  //                   ...token.formatted,
  //                   ...newToken.formatted,
  //                 },
  //               }
  //             }
  //             return token
  //           })
  //           return {
  //             ...pageData,
  //             getMemeToken: {
  //               ...pageData.getMemeToken,
  //               data: pageTokens,
  //             },
  //           }
  //         })
  //         return {
  //           ...oldData,
  //           pages: newPages,
  //         }
  //       })
  //     })
  //   },
  //   [queryKey, queryClient, paused],
  // )

  return (
    <TooltipProvider>
      <div className="px-2.5 bg-[#0A0A0A] space-y-3 z-0 pb-[95px]">
        <div className="flex items-center justify-between gap-3 sticky top-[40px] pt-2 pb-1 z-[1] bg-[#0A0A0A]">
          <MovingBgFilterTags
            ref={tabRef}
            tabs={lifecycleStates}
            defaultTab={lifecycleStates[0]}
            activeTab={currentTab}
            onTabChange={handleTabChange}
            formatTabLabel={(tab) => t(lifecycleStateLabelKeys[tab as LifecycleStates])}
            containerId="meme-new-pairs"
            containerClassName="h-[24px] w-[calc(100%-36px)] overflow-x-auto no-scrollbar flex-1"
          />
          <QuickBuy />
        </div>
        <div className="sticky top-[81px] z-[2]">
          <div
            className={cn(
              'absolute top-0 left-0 right-0 flex justify-center items-center transition pointer-events-none',
              !paused ? 'opacity-0 scale-95' : 'opacity-100 scale-100',
            )}
          >
            <div className="bg-gradient-to-b from-[#111] to-black/60 px-3 py-2 -translate-y-[2px] rounded-b-[8px] flex items-center gap-1 text-[#FACC14]">
              <IconPause />
              <div className="text-[calc(12rem/16)] leading-[calc(12rem/16)]">{t('listCoin.filters.paused')}</div>
            </div>
          </div>
        </div>
        <AIAnalysisDrawer includeTrigger={false} ref={aiAnalysisDrawer} />
        <div className="relative">
          <TabMemeTokenList
            isLoading={isLoading}
            hasNextPage={hasNextPage}
            tokens={tokens}
            onLoadMore={handleOnLoadMore}
            timeframe={currentTimeframe}
            showProgress={currentTab !== LifecycleStates.Completed}
            useFallbackLogo={currentTab !== LifecycleStates.NewCreation}
            onAiClick={handleAIAnalysisClick}
            // refreshFn={refreshFn}
          />
        </div>
      </div>
    </TooltipProvider>
  )
}
