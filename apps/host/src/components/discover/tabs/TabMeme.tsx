import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { TimeframeOption } from '@components/discover/TimeframeSelector.tsx'
import { LifecycleStates } from '@/@generated/gql/graphql-core.ts'
import { listCoinHelper } from '@/utils/list-coin-helper.ts'
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
import { TYPE_CHAIN } from '@/lib/blockchain.ts'
import { useActiveChain } from '@hooks/useActiveChain.ts'
import { IconPause } from '@components/icon'
import { useSearchParams } from 'react-router-dom'
import { MEME_TABS_MAP } from '@/lib/constant.ts'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils.ts'
import { TabMemeTokenList } from '@components/discover/tabs/TabMemeTokenList.tsx'
import AIAnalysisDrawer, { AIAnalysisDrawerHandle } from '@components/listCoin/AIAnalysisDrawer.tsx'
import { TooltipProvider } from '@components/discover/TooltipProvider.tsx'
import { uniqBy } from 'lodash-es'
import { memeTokenCache } from '@/utils/memeTokenCache.ts'
import { selectShouldShowMaintenanceNotification } from '@/redux/modules/maintenance.slice'
import { useAppSelector } from '@/redux/store'
import { TokenMigratedHandler } from '@pages/meme/discover/desktop/components/TokenMigratedHandler.tsx'
import { useMemeTokens } from '@pages/meme/discover/desktop/hooks/useMemeTokens.ts'
import { useAddNewMemeTokens } from '@hooks/useAddNewMemeTokens.ts'
import { useMqttSubscribeIncremental } from '@hooks/useMqttSubscribeIncremental.ts'
import { TOPICS } from '@/lib/topics.ts'
import { useDispatch } from 'react-redux'
import { memeTokenInfoActions } from '@/redux/modules/memeTokenInfo.slice.ts'
import { MemeTokenInfoRaw } from '@/types/tokenInfo.ts'

const lifecycleStates: LifecycleStates[] = [
  LifecycleStates.NewCreation,
  LifecycleStates.Completing,
  // LifecycleStates.Soaring,
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
  [LifecycleStates.Completed]: '-migratedAt',
}

const getDefaultTab = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const tab = urlParams.get('tab')
  switch (tab) {
    case LifecycleStates.NewCreation:
      return LifecycleStates.NewCreation
    case LifecycleStates.Completing:
      return LifecycleStates.Completing
    case LifecycleStates.Soaring:
      return LifecycleStates.Soaring
    case LifecycleStates.Completed:
      return LifecycleStates.Completed
    default:
      return LifecycleStates.NewCreation
  }
}

export const TabMeme = () => {
  const [paused, setPaused] = useState(false)
  const activeChain = useActiveChain()

  const { t } = useTranslation()

  const { onMemeSubTabChanged, memeSubTab } = useContext(DiscoverPageContext)
  const [currentTab, setCurrentTab] = useState<LifecycleStates>(getDefaultTab())
  const { filters } = useContext(DiscoverPageContext)
  const tabRef = useRef<MovingBgFilterTagsHandle>(null)
  const aiAnalysisDrawer = useRef<AIAnalysisDrawerHandle>(null)

  const filterKey = useMemo(() => `TAB_MEME_${memeSubTab}`, [memeSubTab])
  const [searchParams, setSearchParams] = useSearchParams()
  const isShowMaintenanceNotification = useAppSelector(selectShouldShowMaintenanceNotification)

  useEffect(() => {
    // Clean up cache
    memeTokenCache.cleanExpired().then(() => {})
  }, [])

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

  const dexList = useMemo(() => {
    const key = `${activeChain || TYPE_CHAIN.SOLANA}DexList` as
      | 'ethDexList'
      | 'solDexList'
      | 'bscDexList'
      | 'arbDexList'
    if (!activeChain) return undefined
    const filter = filters[filterKey]
    return filter[key]
  }, [filters, filterKey, activeChain])

  const dexListFilter = useMemo(() => {
    const list = dexList
    if (!list) {
      return {}
    } else {
      return { dexes: list.join(',') }
    }
  }, [dexList])

  const queryParams = useMemo(() => {
    const filter = filters[filterKey]
    return {
      limit: 20,
      chain: listCoinHelper.getChainType(activeChain || TYPE_CHAIN.SOLANA),
      lifecycleStates: currentTab ?? LifecycleStates.NewCreation,
      timeRange: listCoinHelper.timeframeMapper(currentTimeframe),
      sortBy: filter.sortBy ? toSortBy(filter.sortBy, currentTimeframe) : defaultSortByCriteria[currentTab],
      ...dexListFilter,
      ...(toMarketCap(filter) ?? {}),
      ...(toHolders(filter) ?? {}),
      ...(toLiquidityPool(filter) ?? {}),
      ...(toTransactions(filter) ?? {}),
      ...(toVolumes(filter) ?? {}),
      ...(toProgress(filter) ?? {}),
    }
  }, [filters, filterKey, activeChain, currentTab, currentTimeframe])

  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage, dataUpdatedAt } = useMemeTokens({
    queryKey: queryKey,
    input: queryParams,
    paused: paused,
    refetchInterval: currentTab === LifecycleStates.NewCreation ? Infinity : 10000,
    timeframe: currentTimeframe,
    firstPageLimit: 20,
    maxPages: currentTab === LifecycleStates.Completed ? 10 : 5,
  })

  const rawTokens = useMemo(() => {
    const allTokens = data ?? []
    if (currentTab === LifecycleStates.NewCreation) {
      const list =
        allTokens?.sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()) ?? []
      return uniqBy(list, (token) => token.token)
    }
    return uniqBy(allTokens, (token) => token.token) ?? []
  }, [data, currentTab, filters[filterKey].sortBy])

  const { removeFromPausedList } = useAddNewMemeTokens({
    queryKey,
    paused,
    filter: filters[filterKey],
    dexList,
    timeframe: currentTimeframe,
    enabled: currentTab === LifecycleStates.NewCreation,
  })

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab as LifecycleStates)
    onMemeSubTabChanged(tab as LifecycleStates)
  }

  const tokens = useMemo(() => {
    if (!rawTokens || rawTokens.length === 0) return []
    return rawTokens
  }, [rawTokens])

  const handleOnLoadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage || isLoading) return
    fetchNextPage().then(() => {})
  }, [hasNextPage, isFetchingNextPage])

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
    const maintenanceOffset = isShowMaintenanceNotification ? 72 : 0
    let appBanner = document.getElementById('app_banner')
    window.addEventListener('scroll', () => {
      if (stickyHeader) {
        if (!appBanner) {
          appBanner = document.getElementById('app_banner')
        }
        const appBannerHeight = appBanner ? appBanner.offsetHeight : 0
        setPaused(stickyHeader.offsetTop > 114 + 30 + maintenanceOffset + appBannerHeight)
      }
    })
  }, [isShowMaintenanceNotification])

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

  const topics = useMemo(() => tokens.map((token) => TOPICS.tokenInfo(token.chainId, token.token)), [tokens])

  const dispatch = useDispatch()
  const onMessage = useCallback((_: string, message: MemeTokenInfoRaw[]) => {
    dispatch(memeTokenInfoActions.addInfo(message))
  }, [])

  const { clearSubscriptions } = useMqttSubscribeIncremental({
    topics: topics,
    onMessage: onMessage,
  })

  useEffect(() => {
    return () => {
      const unsubscribedTopics = clearSubscriptions()
      const unsubscribedKeys = unsubscribedTopics?.map((topic) => {
        const [, chainIdStr, tokenAddress] = topic.split('/')
        return `${parseInt(chainIdStr)}-${tokenAddress.toLowerCase()}`
      })
      if (unsubscribedKeys) {
        dispatch(memeTokenInfoActions.clearInfo(unsubscribedKeys))
      }
    }
  }, [])

  const cardType = useMemo(() => {
    switch (currentTab) {
      case LifecycleStates.NewCreation:
        return 'new'
      case LifecycleStates.Completing:
        return 'completing'
      case LifecycleStates.Completed:
        return 'completed'
      default:
        return 'new'
    }
  }, [currentTab])

  return (
    <TooltipProvider>
      <TokenMigratedHandler onMigrated={removeFromPausedList} />
      <div className="z-0">
        <div className="mb-0 flex items-center justify-between gap-3 bg-[#0A0A0A] px-2.5 py-3">
          <MovingBgFilterTags
            ref={tabRef}
            tabs={lifecycleStates}
            defaultTab={currentTab}
            activeTab={currentTab}
            onTabChange={handleTabChange}
            formatTabLabel={(tab) => t(lifecycleStateLabelKeys[tab as LifecycleStates])}
            containerId="meme-new-pairs"
            containerClassName="h-[24px] w-[calc(100%-36px)] overflow-x-auto no-scrollbar flex-1 ml-[3px]"
            tabsListClassName="p-0 bg-[#18171E] rounded-[5px] h-[24px]"
            tabsTriggerClassName="h-[24px] py-0"
            tabBgClassName="top-0 rounded-[5px] bg-[#3E2761] !font-[350]"
            tabsTriggerInactiveClassName="!text-[#908E98]"
            tabsTriggerActiveClassName="!text-[#C8A7FD]"
          />
          <QuickBuy />
        </div>
        <div className="sticky top-[81px] z-[2]">
          <div
            className={cn(
              'pointer-events-none absolute top-0 right-0 left-0 flex items-center justify-center transition',
              !paused ? 'scale-95 opacity-0' : 'scale-100 opacity-100',
            )}
          >
            <div className="flex -translate-y-[2px] items-center gap-1 rounded-b-[8px] bg-gradient-to-b from-[#111] to-black/60 px-3 py-2 text-[#FACC14]">
              <IconPause />
              <div className="text-[calc(12rem/16)] leading-[calc(12rem/16)]">{t('listCoin.filters.paused')}</div>
            </div>
          </div>
        </div>
        <AIAnalysisDrawer includeTrigger={false} ref={aiAnalysisDrawer} />
        <div className="relative flex-1">
          <TabMemeTokenList
            isLoading={isLoading}
            hasNextPage={hasNextPage}
            tokens={tokens}
            onLoadMore={handleOnLoadMore}
            timeframe={currentTimeframe}
            showProgress={currentTab !== LifecycleStates.Completed}
            useFallbackLogo={currentTab !== LifecycleStates.NewCreation}
            onAiClick={handleAIAnalysisClick}
            dataUpdatedAt={currentTab !== LifecycleStates.NewCreation ? dataUpdatedAt : undefined}
            ageType={currentTab === LifecycleStates.Completed ? 'migrated' : 'created'}
            type={cardType}
          />
        </div>
      </div>
    </TooltipProvider>
  )
}
