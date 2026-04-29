/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ChainType } from '@/@generated/gql/graphql-future'
import AppDrawer from '@/components/common/AppDrawer'
import MovingLineTabs from '@/components/common/MovingLineTabs'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { ServiceConfig } from '@/lib/gql/service-config'
import { cn } from '@/lib/utils'
import useHandleGetData, { CATEGORY_ALL } from '@/pages/futures-market/hooks/useHandleGetData'
import { ISymbolList, setFavorites } from '@/redux/modules/symbolList.slide'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { getFavoriteTokens } from '@/services/tokens.service'
import { TokenTrending } from '@/types/token'
import { useQuery } from '@apollo/client'
import { XStocksSearchList } from '@components/futuresDetails/tokenSearchDrawer/XStocksSearchList.tsx'
import { Dispatch, memo, RefObject, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ContractSection from './ContractSection'
import { ToastProvider } from './CustomToast'
import useHandleLogic from './hooks/useHandleLogic'
import MemeList, { chains } from './MemeList'
import OptionalList from './OptionalList'
import { SearchHistory } from './SearchHistory'
import { SearchSidebar } from './SearchSidebar'
import { TokenSearch } from './TokenSearch'
import { TYPE_CHAIN } from '@/lib/blockchain'
import ls from '@/lib/local-storage'
import { Configs } from '@/const/configs'

interface TokenSearchDrawerProps {
  open: boolean
  type: TokenSearchDrawerType
  allowShowList: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  isHidenFuturesTab?: boolean
  hideFavoriteTokens?: boolean
}

export enum TokenSearchDrawerType {
  MEME = 'meme',
  CRYPTO = 'crypto',
  XSTOCKS = 'xstocks',
  PREDICTION = 'prediction',
}

export const TokenSearchDrawer = memo((props: TokenSearchDrawerProps) => {
  const dispatch = useAppDispatch()
  const selectedChain = useAppSelector((state) => state.newWallet.activeChain)
  const { open, setOpen, type, allowShowList, isHidenFuturesTab, hideFavoriteTokens } = props
  const { t } = useTranslation()
  const [_, setIsFavoriteChange] = useState(false)
  const [symbolsFavorite, setSymbolsFavorite] = useState<ISymbolList[]>([]) // for dex
  const [favoriteTokens, setFavoriteTokens] = useState<TokenTrending[]>([]) // for meme
  const memeChain = useMemo<keyof typeof chains>(() => {
    const raw = ls.get('meme_chain') || TYPE_CHAIN.SOLANA
    return (raw as keyof typeof chains) ?? (TYPE_CHAIN.SOLANA as keyof typeof chains)
  }, [])

  const { data: favoriteTokensData, refetch: refetchFavoriteTokens } = useQuery(getFavoriteTokens, {
    variables: {
      input: {
        page: 1,
        limit: 20,
        //@ts-ignore
        chain: memeChain === TYPE_CHAIN.BSC ? ChainType.Bsc : 'ALL', //@ts-ignore
        dex: 'All', //@ts-ignore
        timeRange: 'h24',
      },
    },
    skip: !ServiceConfig.token,
    client: futureClient,
  })

  const {
    symbolsFavorite: data,
    getFavoriteSymbols,
    isLoadingFavorite,
  } = useHandleGetData({
    condition: 'volume',
    isFavorite: open,
    isDisabledNomalList: true,
  })

  useEffect(() => {
    setSymbolsFavorite(data)
  }, [data])

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    setFavoriteTokens(favoriteTokensData?.getFavoriteToken?.data || [])
  }, [favoriteTokensData?.getFavoriteToken?.data])

  const headerTabs = [
    {
      value: '自选',
      label: t('tokenSearchDrawer.tabs.favorites'),
    },
    {
      value: '合约',
      label: t('tokenSearchDrawer.tabs.contracts'),
    },
    {
      value: 'Meme',
      label: t('tokenSearchDrawer.tabs.meme'),
    },
    {
      value: 'xStocks',
      label: t('header.xstocks'),
      disabled: !Configs.enableSolana(),
    },
  ]

  const { searchHistory, setSearchHistory, saveToHistory, handleClearHistory } = useHandleLogic()
  // 有本地存储 下次读取获取storage，获取不到
  const [currentTab, setCurrentTab] = useState<string>(
    type === TokenSearchDrawerType.CRYPTO ? headerTabs[1].value : headerTabs[2].value,
  )
  const [search, setSearch] = useState('')
  const stickyRef = useRef<HTMLDivElement>(null)
  const drawerContentRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [isShowList] = useState(allowShowList)
  const [categoryValue, setCategoryValue] = useState<string>(CATEGORY_ALL)

  const handleTabChange = (tab: string) => {
    // TODO:  合约搜索tab存储到本地， 记录上次选择tab 只增合约搜索合约和收藏
    if (tab === headerTabs[1].value || tab === headerTabs[0].value) {
      localStorage.setItem('futures_token_search_tab', tab)
    }
    setCurrentTab(tab)
  }

  const handleRenderTab = useCallback(
    (
      tab: string,
      symbolsFavorite: ISymbolList[],
      favoriteTokens: TokenTrending[],
      type: TokenSearchDrawerType,
      selectedCategory: string,
      setSymbolsFavorite: (value: SetStateAction<ISymbolList[]>) => void,
      setCategoryValue: Dispatch<SetStateAction<string>>,
      setFavoriteTokens: Dispatch<SetStateAction<TokenTrending[]>>,
      allowShowList?: boolean,
      isLoadingFavorite?: boolean,
    ) => {
      switch (tab) {
        case headerTabs[0].value:
          return (
            <OptionalList
              search={search}
              symbolsFavorite={symbolsFavorite.map((item) => ({
                ...item,
                isFavorite: true,
              }))}
              favoriteTokens={favoriteTokens.map((item) => ({
                ...item,
                isFavorite: true,
              }))}
              type={type}
              allowShowList={allowShowList}
              isLoadingFavorite={isLoadingFavorite}
              setOpen={setOpen}
              setIsFavoriteChange={setIsFavoriteChange}
              setSymbolsFavorite={setSymbolsFavorite}
              setFavoriteTokens={setFavoriteTokens}
              isHidenFuturesTab={isHidenFuturesTab}
            />
          )
        case headerTabs[2].value:
          return (
            <MemeList
              debounceValue={search}
              allowShowList={allowShowList}
              favoriteTokens={favoriteTokens}
              setOpen={setOpen}
              setFavoriteTokens={setFavoriteTokens}
              allowSwitchChain={!isHidenFuturesTab}
              className="mt-5"
            />
          )
        case headerTabs[3].value:
          return (
            <XStocksSearchList
              debounceValue={search}
              onClose={() => setOpen(false)}
              setFavoriteTokens={setFavoriteTokens}
              tableHeaderClassName="bg-[#212127]"
              allowSwitchChain={!isHidenFuturesTab}
            />
          )
        default:
          return (
            <ContractSection
              search={search}
              allowShowList={allowShowList}
              symbolsFavorite={symbolsFavorite}
              setOpen={setOpen}
              setIsFavoriteChange={setIsFavoriteChange}
              setSymbolsFavorite={setSymbolsFavorite}
              setSelectedCategory={setCategoryValue}
              selectedCategory={selectedCategory}
              hideFavoriteTokens={hideFavoriteTokens}
            />
          )
      }
    },
    [search, symbolsFavorite, favoriteTokens, type, allowShowList, isLoadingFavorite, setOpen, isHidenFuturesTab],
  )

  useEffect(() => {
    setSearchHistory(JSON.parse(localStorage.getItem('searchHistoryv2') || '[]'))
  }, [open])

  // const [tabs, setTabs] = useState(headerTabs)

  // useEffect(() => {
  //   if (memeChain === TYPE_CHAIN.BSC) {
  //     setTabs(headerTabs.slice(0, 3))
  //   } else {
  //     setTabs(headerTabs)
  //   }
  // }, [symbolsFavorite, search, allowShowList, favoriteTokens, isHidenFuturesTab, memeChain])

  useEffect(() => {
    if (open) {
      if (ServiceConfig.token) {
        getFavoriteSymbols()
        refetchFavoriteTokens()
      }
      setCurrentTab(
        type === TokenSearchDrawerType.CRYPTO
          ? headerTabs[1].value
          : type === TokenSearchDrawerType.MEME
            ? headerTabs[2].value
            : headerTabs[3].value,
      )
    }
  }, [open])

  useEffect(() => {
    if (open) {
      if (ServiceConfig.token) {
        getFavoriteSymbols()
        refetchFavoriteTokens()
      }
      setCurrentTab(
        type === TokenSearchDrawerType.CRYPTO
          ? localStorage.getItem('futures_token_search_tab') || headerTabs[1].value
          : type === TokenSearchDrawerType.MEME
            ? headerTabs[2].value
            : headerTabs[3].value,
      )
    }
  }, [open])

  useEffect(() => {
    if (open) {
      dispatch(setFavorites(symbolsFavorite))
    }
  }, [symbolsFavorite, open])

  return (
    <ToastProvider>
      <AppDrawer
        open={open}
        repositionInputs={false}
        setOpen={setOpen}
        rightIcon={<div></div>}
        drawerHeaderClassName="py-1.5"
        drawerContentRef={drawerContentRef as RefObject<HTMLDivElement>}
        drawerContentClassName="_hidescrollbar max-w-[768px] px-0 overflow-x-hidden overflow-y-hidden"
        drawerClassName={'h-full'}
        maxHeight={type === TokenSearchDrawerType.CRYPTO ? '94vh' : '86vh'}
        isShowBgImg={false}
        drawerContent={
          <div className="relative h-full flex flex-col min-h-[86dvh]">
            <div className="sticky top-0 z-[60] flex-shrink-0 px-2">
              <TokenSearch
                setSearch={setSearch}
                currentTab={currentTab}
                closeDialog={() => setOpen(false)}
                open={open}
                isFuturesSearch
                hideBanner
              />
            </div>

            {/* Fixed SearchHistory and SearchSidebar - Only visible when not showing list */}
            <div
              className={cn(
                'sticky top-[60px] z-[55] flex-shrink-0 transition-all duration-300 overflow-hidden px-2',
                !isShowList ? 'opacity-100 max-h-[1000px] translate-y-0' : 'opacity-0 max-h-0 -translate-y-4',
              )}
            >
              <SearchHistory
                setOpen={setOpen}
                searchHistory={searchHistory}
                handleClearHistory={handleClearHistory}
                saveToHistory={saveToHistory}
              />
              <SearchSidebar />
            </div>

            {/* Scrollable Content Section */}
            <div className={cn('flex-1 flex flex-col', isShowList ? 'block' : 'hidden')}>
              {/* Fixed Tabs */}
              <div
                className={cn('sticky top-[60px] z-50 flex-shrink-0 gap-3', isHidenFuturesTab && search && 'hidden')}
                ref={stickyRef}
              >
                <MovingLineTabs
                  tabs={headerTabs.filter((t) => !t.disabled)}
                  defaultTab={currentTab}
                  onTabChange={handleTabChange}
                  containerClassName="after:hidden w-full border-b border-[#343339] rounded-t-[8px] p-0 bg-inherit z-1 relative"
                  tabsClassName="w-full px-2 gap-x-4"
                  wrapperClassName="z-1"
                  forceUpdate={isShowList}
                  itemClassName="font-[330] text-[15px] px-0 text-[#908E98] custom-color-text-nav"
                  tabsListClassName="p-0"
                  itemClassNameActive="!text-base !font-[380] !text-white"
                />
              </div>

              {/* Scrollable Tab Content */}
              <div className="flex-1 overflow-visible mt-2" ref={listRef}>
                <div className="h-full pb-4">
                  {handleRenderTab(
                    currentTab,
                    symbolsFavorite,
                    favoriteTokens,
                    type,
                    categoryValue,
                    setSymbolsFavorite,
                    setCategoryValue,
                    setFavoriteTokens,
                    allowShowList,
                    isLoadingFavorite,
                  )}
                </div>
              </div>
            </div>
          </div>
        }
      />
    </ToastProvider>
  )
})

TokenSearchDrawer.displayName = 'TokenSearchDrawer'
