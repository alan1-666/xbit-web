import MovingLineTabs from '@/components/common/MovingLineTabs'
import { TokenSearchDrawerType } from '@/components/futuresDetails/tokenSearchDrawer'
import { ToastProvider } from '@/components/futuresDetails/tokenSearchDrawer/CustomToast'
import useHandleLogic from '@/components/futuresDetails/tokenSearchDrawer/hooks/useHandleLogic'
import MemeList, { chains } from '@/components/futuresDetails/tokenSearchDrawer/MemeList'
import { SearchSidebar } from '@/components/futuresDetails/tokenSearchDrawer/SearchSidebar'
import { TokenSearch } from '@/components/futuresDetails/tokenSearchDrawer/TokenSearch'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { ServiceConfig } from '@/lib/gql/service-config'
import useHandleGetData from '@/pages/futures-market/hooks/useHandleGetData'
import { ISymbolList } from '@/redux/modules/symbolList.slide'
import { useAppSelector } from '@/redux/store'
import { getFavoriteTokens } from '@/services/tokens.service'
import { TokenTrending } from '@/types/token'
import { removeUrlParam } from '@/utils/helpers'
import { useQuery } from '@apollo/client'
import { XStocksSearchList } from '@components/futuresDetails/tokenSearchDrawer/XStocksSearchList.tsx'
import { Dispatch, memo, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ContractSectionWithCache from '../futuresDetails/tokenSearchDrawer/ContractSectionWithCache'
import { SearchHistoryMobile } from '../futuresDetails/tokenSearchDrawer/SearchHistoryMobile'
import ls from '@/lib/local-storage'
import { TYPE_CHAIN } from '@/lib/blockchain'
import { Configs } from '@/const/configs'
import { PredictionList } from '../PC/TokenSelect/PredictionList'
import { usePredictionSearch } from '@/modules/prediction/hooks/usePredictionSearch'

export const TOKEN_TRENDING_SEARCH_BAR_MS = 3600000 // 1 hour
export const TOKEN_TRENDING_SEARCH_BAR_KEY = 'TOKEN_TRENDING_SEARCH_BAR'

export const TAB_CONTRACT = '合约'
export const TAB_MEME = 'Meme'
export const TAB_XSTOCKS = 'xStocks'
export const TAB_PREDICTION = 'Prediction'

interface TokenSearchProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  type: TokenSearchDrawerType
  allowSwitchChain: boolean
  board?: 'CONTRACT' | 'MEME' | 'USTOCK'
}

const SearchView = memo((props: TokenSearchProps) => {
  const { open, setOpen, type, allowSwitchChain, board } = props
  const allowShowList = true
  const { t } = useTranslation()
  const selectedChain = useAppSelector((state) => state.newWallet.activeChain)
  const memeChain = useMemo<keyof typeof chains>(() => {
    const raw = ls.get('meme_chain') || TYPE_CHAIN.SOLANA
    return (raw as keyof typeof chains) ?? (TYPE_CHAIN.SOLANA as keyof typeof chains)
  }, [])

  const headerTabs = useMemo(() => {
    const tabs = [
      {
        value: TAB_CONTRACT,
        label: t('tokenSearchDrawer.tabs.contracts'),
      },
      {
        value: TAB_MEME,
        label: t('tokenSearchDrawer.tabs.meme'),
      },
      {
        value: TAB_PREDICTION,
        label: t('Prediction'),
      },
    ]

    if (Configs.enableSolana()) {
      tabs.push({
        value: TAB_XSTOCKS,
        label: t('header.xstocks'),
      })
    }
    return tabs
  }, [t])

  const [_, setIsFavoriteChange] = useState(false)
  const [symbolsFavorite, setSymbolsFavorite] = useState<ISymbolList[]>([]) // for dex
  const [favoriteTokens, setFavoriteTokens] = useState<TokenTrending[]>([]) // for meme
  const [isShowList, setIsShowList] = useState(false)
  const { searchHistory, saveToHistory, handleClearHistory } = useHandleLogic()
  const [currentTab, setCurrentTab] = useState<string>(() => {
    if (type === TokenSearchDrawerType.XSTOCKS && Configs.enableSolana()) {
      return TAB_XSTOCKS
    }
    if (type === TokenSearchDrawerType.MEME) {
      return TAB_MEME
    }
    if (type === TokenSearchDrawerType.PREDICTION) {
      return TAB_PREDICTION
    }
    return TAB_CONTRACT
  })

  const [search, setSearch] = useState('')
  const handleTabChange = (tab: string) => {
    setCurrentTab(tab)
  }

  const { symbolsFavorite: data, loadSymbolListFromCache } = useHandleGetData({
    condition: 'volume',
    isFavorite: open,
    isDisabledNomalList: true,
  })

  const handleSetSymbolsFavorite = async () => {
    const cacheLoaded = await loadSymbolListFromCache('favorite')
    const dataFavorite = cacheLoaded ? cacheLoaded : data
    setSymbolsFavorite(dataFavorite)
  }
  useEffect(() => {
    handleSetSymbolsFavorite()
  }, [data])

  // Get prediction data (trending or search results)
  const { data: predictionData, isLoading: predictionLoading } = usePredictionSearch(
    search,
    currentTab === TAB_PREDICTION,
  )

  const handleRenderTab = useCallback(
    (
      tab: string,
      symbolsFavorite: ISymbolList[],
      favoriteTokens: TokenTrending[],
      setSymbolsFavorite: (value: SetStateAction<ISymbolList[]>) => void,
      setFavoriteTokens: Dispatch<SetStateAction<TokenTrending[]>>,
      allowShowList?: boolean,
      predictionData?: any[],
      predictionLoading?: boolean,
    ) => {
      switch (tab) {
        case TAB_CONTRACT:
          return (
            <ContractSectionWithCache
              search={search}
              allowShowList={allowShowList}
              symbolsFavorite={symbolsFavorite}
              isfuturesSearch={true}
              setOpen={setOpen}
              setIsFavoriteChange={setIsFavoriteChange}
              setSymbolsFavorite={setSymbolsFavorite}
              className='bg-[#0A0A0A]'
            />
          )
        case TAB_MEME:
          return (
            <MemeList
              debounceValue={search}
              allowShowList={allowShowList}
              isfuturesSearch={true}
              favoriteTokens={favoriteTokens}
              setOpen={setOpen}
              setFavoriteTokens={setFavoriteTokens}
              allowSwitchChain={allowSwitchChain}
              // className="mt-2"
            />
          )
        case TAB_XSTOCKS:
          return (
            <XStocksSearchList
              debounceValue={search}
              onClose={() => setOpen(false)}
              scrollable={false}
              allowSwitchChain={allowSwitchChain}
              setFavoriteTokens={setFavoriteTokens}
              tableHeaderClassName="bg-[#0A0A0A]"
              isHidenFuturesTab={true}
            />
          )
        case TAB_PREDICTION:
          return (
            <PredictionList
              data={predictionData || []}
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
      type,
      allowShowList,
      setOpen,
      allowSwitchChain,
      predictionData,
      predictionLoading,
      saveToHistory,
    ],
  )

  const { data: favoriteTokensData } = useQuery(getFavoriteTokens, {
    variables: {
      input: {
        page: 1,
        limit: 20,
        chain: 'ALL',
        dex: 'All',
        timeRange: 'h24',
      },
    },
    skip: !ServiceConfig.token,
    client: futureClient,
  })

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    setFavoriteTokens(favoriteTokensData?.getFavoriteToken?.data || [])
  }, [favoriteTokensData?.getFavoriteToken?.data])

  useEffect(() => {
    setIsShowList(Boolean(search))
  }, [search])

  return (
    <ToastProvider>
      <div className="w-full min-h-dvh h-full overflow-hidden relative max-w-[768px] mx-auto">
        <div className="-z-10 bg-[url('/images/home-bg.png')] bg-cover h-[212px] w-full"></div>
        <div className="absolute top-0 left-0 right-0 min-h-dvh bg-transparent h-full">
          <div className="relative h-full flex flex-col">
            {/* Search Header - Fixed at top */}
            <div className="sticky top-0 z-60 flex-shrink-0 px-2 pt-2 flex items-center bg-transparent">
              <div className="flex-1">
                <TokenSearch
                  setSearch={(value) => {
                    const strValue = (typeof value === 'string' ? value : '').trim()
                    // Keep spaces for Prediction search (event titles contain spaces)
                    const newValue = currentTab === TAB_PREDICTION ? strValue : strValue.replace(/\s/g, '')
                    setSearch(newValue)
                  }}
                  currentTab={currentTab}
                  closeDialog={() => {
                    setOpen(false)
                    // removeUrlParam('search')
                  }}
                  isPredictionSearch={currentTab === TAB_PREDICTION}
                  open={open}
                  isFuturesSearch={true}
                  board={board}
                />
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-0">
              {/* Search History and Sidebar - Show only when not searching */}
              <div
                className="px-2 flex-shrink-0"
                style={{
                  display: search ? 'none' : 'block',
                }}
              >
                <SearchHistoryMobile
                  searchHistory={searchHistory}
                  handleClearHistory={handleClearHistory}
                  saveToHistory={saveToHistory}
                  type={type}
                />
                {/* <SearchSidebar type={type} /> */}
              </div>

              {/* Hot Tokens Section */}
              <div className="flex flex-col mt-2.5 min-h-0 flex-1">
                {/* Section Title */}
                <div
                  className="text-base text-white pl-2 mb-2 app-font-regular flex-shrink-0"
                  style={{
                    display: search ? 'none' : 'block',
                  }}
                >
                  {t('tokenSearchDrawer.popularTokens')}
                </div>

                {/* Tabs*/}
                <div className="flex-shrink-0 bg-transparent z-[50]">
                  <MovingLineTabs
                    tabs={headerTabs}
                    defaultTab={currentTab}
                    onTabChange={handleTabChange}
                    containerClassName="after:hidden w-full border-b border-[#25242B] rounded-t-[8px] p-0 bg-transparent z-1 relative top-[1px]"
                    tabsClassName="w-full px-2 gap-x-4"
                    wrapperClassName="z-1"
                    forceUpdate={isShowList}
                    itemClassName="font-[330] text-[15px] px-0 text-[#908E98] custom-color-text-nav"
                    tabsListClassName="p-0"
                    itemClassNameActive="!text-base !font-[380] !text-white"
                  />
                </div>

                {/* Tab Content */}
                <div className="flex-1 w-full min-h-full h-full overflow-auto _hidescrollbar">
                  {handleRenderTab(
                    currentTab,
                    symbolsFavorite,
                    favoriteTokens,
                    setSymbolsFavorite,
                    setFavoriteTokens,
                    allowShowList,
                    predictionData,
                    predictionLoading,
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToastProvider>
  )
})
export default SearchView
