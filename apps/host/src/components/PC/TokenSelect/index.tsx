/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ToastProvider } from '@/components/futuresDetails/tokenSearchDrawer/CustomToast'
import useHandleLogic, {
  useGetSetHistorySearch,
} from '@/components/futuresDetails/tokenSearchDrawer/hooks/useHandleLogic'
import { useTokenTrendingSearchBarPC } from '@/components/futuresDetails/tokenSearchDrawer/hooks/useTokenTrendingSearchBarPC'
import { SearchHistory } from '@/components/futuresDetails/tokenSearchDrawer/SearchHistory'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useActiveChain } from '@/hooks/useActiveChain'
import { futureClient } from '@/lib/gql/apollo-client'
import { cn } from '@/lib/utils'
import { searchTokensPc } from '@/services/tokens.service'
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { TokenSearch } from './TokenSearch'
import { VirtualTokenList } from './VirtualTokenList'
import { TooltipProvider } from '@components/ui/tooltip.tsx'
import { chains, chainsIds } from '@/components/futuresDetails/tokenSearchDrawer/MemeList'
import MovingLineTabs from '@/components/common/MovingLineTabs'
import ContractSection from '@/components/futuresDetails/tokenSelect/ContractSection'
import { CATEGORY_ALL } from '@/pages/futures-market/hooks/useHandleGetData'
import { XStocksSearchList } from '@components/futuresDetails/tokenSearchDrawer/XStocksSearchList.tsx'
import { ISymbolList } from '@/redux/modules/symbolList.slide'
import { TokenTrending } from '@/types/token'
import useHandleGetData from '@/pages/futures-market/hooks/useHandleGetData'
import { ServiceConfig } from '@/lib/gql/service-config'
import { getFavoriteTokens } from '@/services/tokens.service'
import { useQuery } from '@apollo/client'
import { useQuery as useReactQuery } from '@tanstack/react-query'
import { Configs } from '@/const/configs'
import { getChainId } from '@/lib/blockchain'
import { PredictionList } from './PredictionList'
import { usePredictionSearch } from '@/modules/prediction/hooks/usePredictionSearch'

interface TokenSearchDrawerProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

export const TokenSearchDialog = (props: TokenSearchDrawerProps) => {
  const { open, setOpen } = props
  const { t } = useTranslation()
  const activeChain = useActiveChain()
  const location = useLocation()
  const { handleGetHistorySearch } = useGetSetHistorySearch()
  const chainId = getChainId(activeChain)

  const { searchHistory, setSearchHistory, saveToHistory, handleClearHistory } = useHandleLogic()
  const [search, setSearch] = useState('')

  // Favorites state management
  const [_, setIsFavoriteChange] = useState(false)
  const [symbolsFavorite, setSymbolsFavorite] = useState<ISymbolList[]>([]) // for dex
  const [favoriteTokens, setFavoriteTokens] = useState<TokenTrending[]>([]) // for meme

  const headerTabs = [
    {
      value: 'Futures',
      label: t('tokenSearchDrawer.tabs.contracts'),
    },
    {
      value: 'Meme',
      label: t('tokenSearchDrawer.tabs.meme'),
    },
    {
      value: 'xStocks',
      label: t('header.xstocks'),
      hidden: !Configs.enableSolana(),
    },
    {
      value: 'Prediction',
      label: 'Prediction',
    },
  ]

  // 根据当前路由设置默认 tab
  const getDefaultTab = () => {
    const pathname = location.pathname.toLowerCase()
    if (pathname.includes('futures')) {
      return headerTabs[0].value // Futures
    } else if (pathname.includes('meme')) {
      return headerTabs[1].value // Meme
    } else if (pathname.includes('xstocks') || pathname.includes('x-stocks')) {
      return headerTabs[2].value // xStocks
    } else if (pathname.includes('prediction')) {
      return headerTabs[3].value // Prediction
    }
    return headerTabs[0].value // 默认显示 Futures
  }

  const [currentTab, setCurrentTab] = useState<string>(getDefaultTab())

  const tabs = headerTabs.filter((t) => !t.hidden)

  // Get favorite contracts data
  const { symbolsFavorite: contractsData, loadSymbolListFromCache } = useHandleGetData({
    condition: 'volume',
    isFavorite: open,
    isDisabledNomalList: true,
  })

  const handleSetSymbolsFavorite = async () => {
    const cacheLoaded = await loadSymbolListFromCache('favorite')
    const dataFavorite = cacheLoaded ? cacheLoaded : contractsData
    setSymbolsFavorite(dataFavorite)
  }

  useEffect(() => {
    handleSetSymbolsFavorite()
  }, [contractsData])

  // Get favorite meme tokens data
  const { data: favoriteTokensData } = useQuery(getFavoriteTokens, {
    variables: {
      input: {
        page: 1,
        limit: 20,
        chain: 'ALL' as any,
        dex: 'All' as any,
        timeRange: 'h24' as any,
      },
    },
    skip: !ServiceConfig.token,
    client: futureClient,
  })

  useEffect(() => {
    //@ts-ignore
    setFavoriteTokens(favoriteTokensData?.getFavoriteToken?.data || [])
  }, [favoriteTokensData?.getFavoriteToken?.data])

  // 监听路由变化，自动切换 tab
  useEffect(() => {
    const newTab = getDefaultTab()
    if (newTab !== currentTab) {
      setCurrentTab(newTab)
    }
  }, [location.pathname])

  const trendingVariables = useMemo(
    () => ({
      input: {
        chain: chains[activeChain],
        dex: 'All',
        direction: 'Popular',
        timeRange: 'h24',
      },
    }),
    [activeChain],
  )
  const { getTokenTrendingSearchBar: memeData, loading } = useTokenTrendingSearchBarPC(trendingVariables)

  const searchVariables = useMemo(
    () => ({
      searchString: search,
      chainId: chainId
    }),
    [search, chainId],
  )

  const { data: dataSearch, isLoading: loadingSearch } = useReactQuery({
    queryKey: ['searchTokensV3', search, chainId],
    queryFn: async () => {
      const { data } = await futureClient.query({
        query: searchTokensPc,
        variables: {
          input: searchVariables,
        },
      })
      return data?.searchUniversal?.data || []
    },
    enabled: !!search && currentTab === 'Meme',
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  })

  const tableData: Array<any> = useMemo(() => {
    return search ? dataSearch || [] : memeData
  }, [search, dataSearch, memeData])

  // Get prediction data (trending or search results)
  const { data: predictionData, isLoading: predictionLoading } = usePredictionSearch(
    search,
    currentTab === 'Prediction',
  )

  useEffect(() => {
    setSearchHistory(handleGetHistorySearch())
  }, [open])

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab)
  }

  // Render tab content
  const handleRenderTab = useCallback(
    (
      tab: string,
      symbolsFavorite: ISymbolList[],
      favoriteTokens: TokenTrending[],
      setSymbolsFavorite: (value: SetStateAction<ISymbolList[]>) => void,
      setFavoriteTokens: Dispatch<SetStateAction<TokenTrending[]>>,
    ) => {
      switch (tab) {
        case headerTabs[0].value:
          return (
            <ContractSection
              search={search}
              allowShowList={true}
              isfuturesSearch={true}
              symbolsFavorite={symbolsFavorite}
              setOpen={setOpen}
              setIsFavoriteChange={setIsFavoriteChange}
              setSymbolsFavorite={setSymbolsFavorite}
              setSelectedCategory={() => {}}
              selectedCategory={CATEGORY_ALL}
              isdesktop={true}
            />
          )
        case headerTabs[1].value:
          return (
            <VirtualTokenList
              data={tableData}
              debounceValue={search}
              isLoading={loading || loadingSearch}
              setOpen={setOpen}
              hasAddress={tableData.some((e) => e.__typename === 'SearchWalletData')}
              favoriteTokens={favoriteTokens}
              setFavoriteTokens={setFavoriteTokens}
            />
          )
        case headerTabs[2].value:
          return (
            <XStocksSearchList
              debounceValue={search}
              onClose={() => setOpen(false)}
              scrollable={false}
              allowSwitchChain={true}
              setFavoriteTokens={setFavoriteTokens}
              tableHeaderClassName="bg-[#232329]"
              isHidenFuturesTab={true}
              isdesktop={true}
            />
          )
        case headerTabs[3].value:
          return (
            <PredictionList
              data={predictionData}
              isLoading={predictionLoading}
              setOpen={setOpen}
              saveToHistory={saveToHistory}
              searchText={search}
            />
          )
      }
    },
    [
      search,
      symbolsFavorite,
      favoriteTokens,
      setOpen,
      loading,
      loadingSearch,
      tableData,
      predictionData,
      predictionLoading,
    ],
  )

  return (
    <ToastProvider>
      <TooltipProvider>
        <Dialog
          open={true}
          onOpenChange={(newOpen) => {
            if (!newOpen) {
              setOpen(false)
            }
          }}
        >
          <DialogContent
            className="!max-w-[670px] bg-[#232329] rounded-2xl h-[700px] overflow-hidden p-0 pb-2 gap-0"
            showDialogPrimitiveClose={false}
            onInteractOutside={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setOpen(false)
            }}
            onEscapeKeyDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setOpen(false)
            }}
          >
            <div className="h-[700px] flex flex-col relative">
              {/* <div className="flex items-center justify-between px-3 py-1 border-b border-[#2A2E39] flex-shrink-0">
                <div className="text-[18px] font-[380]">{t('search.search')}</div>
                <button
                  type="button"
                  aria-label="close"
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    setOpen(false)
                  }}
                  className="p-1.5 rounded-md hover:bg-white/5 transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#9AA4B2]">
                    <path
                      fill="currentColor"
                      d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12l-4.9 4.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.9a1 1 0 0 0 1.41-1.41L13.41 12l4.9-4.89a1 1 0 0 0-.01-1.4Z"
                    />
                  </svg>
                </button>
              </div> */}
              <div className="sticky top-0 z-[60] flex-shrink-0 px-3 pt-3 pb-1">
                <TokenSearch setSearch={setSearch} open={open} />
              </div>

              <div className={cn('sticky px-3 flex-shrink-0 mt-1')}>
                <SearchHistory
                  searchHistory={searchHistory}
                  handleClearHistory={handleClearHistory}
                  saveToHistory={saveToHistory}
                  setOpen={setOpen}
                  isPC
                />
              </div>

              <div className={cn('flex-1 flex flex-col min-h-0 px-3')}>
                <div className="text-[16px] font-[500] mb-[16px] flex-shrink-0 mt-2">
                  {search
                    ? t('tokenSearchDrawer.result')
                    : currentTab === 'Prediction'
                      ? 'Trending Predictions'
                      : t('tokenSearchDrawer.popularTokens')}
                </div>
                {/* Tabs */}
                <div className="flex-shrink-0 bg-[#232329] z-[50]">
                  <MovingLineTabs
                    tabs={tabs}
                    defaultTab={currentTab}
                    onTabChange={handleTabChange}
                    containerClassName="after:hidden w-full border-b border-[#2A2E39] rounded-t-[8px] p-0 bg-[#232329] z-1 relative"
                    tabsClassName="w-full gap-x-4"
                    wrapperClassName="z-1"
                    itemClassName="font-[330] text-[15px] px-0 text-[#908E98]"
                    tabsListClassName="p-0"
                    itemClassNameActive="!text-white font-[380]"
                  />
                </div>

                {/* Tab Content */}
                <div className="flex-1 min-h-0 overflow-auto mt-3  _hidescrollbar">
                  {handleRenderTab(currentTab, symbolsFavorite, favoriteTokens, setSymbolsFavorite, setFavoriteTokens)}
                </div>
              </div>
              <div className={cn('absolute left-0 bottom-0 h-3 w-full bg-[#232329]', search && 'bottom-0')} />
            </div>
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    </ToastProvider>
  )
}
