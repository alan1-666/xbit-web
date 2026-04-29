import MovingLineTabs from '@/components/common/MovingLineTabs'
import { ServiceConfig } from '@/lib/gql/service-config'
import { cn } from '@/lib/utils'
import useHandleGetData, { CATEGORY_ALL } from '@/pages/futures-market/hooks/useHandleGetData'
import { ISymbolList, setFavorites } from '@/redux/modules/symbolList.slide'
import { useAppDispatch } from '@/redux/store'
import { getFavoriteTokens } from '@/services/tokens.service'
import { TokenTrending } from '@/types/token'
import { useQuery } from '@apollo/client'
import { useQuery as useReactQuery } from '@tanstack/react-query'
import {
  Dispatch,
  memo,
  RefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { ToastProvider } from '../tokenSearchDrawer/CustomToast'
import useHandleLogic from '../tokenSearchDrawer/hooks/useHandleLogic'
import { SearchHistory } from '../tokenSearchDrawer/SearchHistory'
import { SearchSidebar } from '../tokenSearchDrawer/SearchSidebar'
import ContractSection from './ContractSection'
import OptionalList from './OptionalList'
import { TokenSearch } from './TokenSearch'
import { getPredictedFundings } from '@/api/hyperliquid'

interface TokenSearchDrawerProps {
  open: boolean
  type: TokenSearchDrawerType
  allowShowList: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  isHidenFuturesTab?: boolean
  anchorRef?: RefObject<HTMLElement>
}

export enum TokenSearchDrawerType {
  MEME = 'meme',
  CRYPTO = 'crypto',
  XSTOCKS = 'xstocks',
}

interface FundingRateData {
  fundingRate: string
  nextFundingTime: number
  fundingIntervalHours?: number
}

type ExchangeName = 'BinPerp' | 'HlPerp' | 'BybitPerp'

export type ExchangeEntry = [ExchangeName, FundingRateData | null]

type SymbolFundingEntry = [string, ExchangeEntry[]]

export type FundingRateList = SymbolFundingEntry[]

export const useGetPredictedFundings = () => {
  const {
    data: predictedFundingsData,
    isLoading: isPredictedFundingsLoading,
    error,
  } = useReactQuery({
    queryKey: ['predictedFundings'],
    queryFn: async () => {
      const data = await getPredictedFundings()
      return data as FundingRateList
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
  return { predictedFundingsData, isPredictedFundingsLoading, error }
}

export const TokenSearchDrawer = memo((props: TokenSearchDrawerProps) => {
  const dispatch = useAppDispatch()
  const { open, setOpen, type, allowShowList, isHidenFuturesTab, anchorRef } = props
  const { t } = useTranslation()
  const [_, setIsFavoriteChange] = useState(false)
  const [symbolsFavorite, setSymbolsFavorite] = useState<ISymbolList[]>([]) // for dex
  const [favoriteTokens, setFavoriteTokens] = useState<TokenTrending[]>([]) // for meme
  const isOpened = useRef(false)

  const { data: favoriteTokensData, refetch: refetchFavoriteTokens } = useQuery(getFavoriteTokens, {
    variables: {
      input: {
        page: 1,
        limit: 20,
        chain: 'ALL',
        dex: 'All',
        timeRange: 'h24',
      },
    },
    skip: true,
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
      value: 'favorites',
      label: t('tokenSearchDrawer.tabs.favorites'),
    },
    {
      value: 'contracts',
      label: t('futuresDetails.common.contract'),
    },
  ]

  const { searchHistory, setSearchHistory, saveToHistory, handleClearHistory } = useHandleLogic()
  // 有本地存储 下次读取获取storage，获取不到
  const [currentTab, setCurrentTab] = useState<string>(TokenSearchDrawerType.CRYPTO)
  const [search, setSearch] = useState('')
  const stickyRef = useRef<HTMLDivElement>(null)
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
              isfuturesSearch={false}
              isHidenFuturesTab={isHidenFuturesTab}
            />
          )
        default:
          return (
            <ContractSection
              search={search}
              allowShowList={allowShowList}
              isfuturesSearch
              symbolsFavorite={symbolsFavorite}
              setOpen={setOpen}
              setIsFavoriteChange={setIsFavoriteChange}
              setSymbolsFavorite={setSymbolsFavorite}
              setSelectedCategory={setCategoryValue}
              selectedCategory={selectedCategory}
              isdesktop
              hideFavoriteTokens
            />
          )
      }
    },
    [search, symbolsFavorite, favoriteTokens, type, allowShowList, isLoadingFavorite, setOpen, isHidenFuturesTab],
  )

  useEffect(() => {
    setSearchHistory(JSON.parse(localStorage.getItem('searchHistoryv2') || '[]'))
  }, [open])

  useEffect(() => {
    if (open) {
      if (ServiceConfig.token) {
        getFavoriteSymbols()
        refetchFavoriteTokens()
      }
      setCurrentTab(headerTabs[1].value)
    }
  }, [open])

  useEffect(() => {
    if (open) {
      if (ServiceConfig.token) {
        getFavoriteSymbols()
        refetchFavoriteTokens()
      }
      setCurrentTab(localStorage.getItem('futures_token_search_tab') || headerTabs[1].value)
    }
  }, [open])

  // Dropdown 面板定位与外部点击关闭（参考 CoinSelectDropdown）
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (dropdownRef?.current?.contains(target) || anchorRef?.current?.contains(target)) {
        return
      }
      setOpen(false)
    }

    if (open) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [open, setOpen, anchorRef])

  useLayoutEffect(() => {
    if (!open) return
    const updatePosition = () => {
      const dropdownWidth = 620
      const gap = 8
      const anchorEl = anchorRef?.current
      if (anchorEl) {
        const rect = anchorEl.getBoundingClientRect()
        let left = rect.left
        left = Math.min(left, window.innerWidth - dropdownWidth - 8)
        left = Math.max(8, left)
        const top = rect.bottom + gap
        setPosition({ top, left, width: dropdownWidth })
        return
      }
      const left = Math.max(8, (window.innerWidth - dropdownWidth) / 2)
      const top = Math.max(16, window.innerHeight * 0.15)
      setPosition({ top, left, width: dropdownWidth })
    }
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, anchorRef])

  const dropdownNode = (
    <div
      ref={dropdownRef}
      className={cn('w-[680px] h-[520px] bg-[#232329] rounded-2xl shadow-2xl z-[1100] text-white overflow-hidden')}
      style={{ position: 'fixed', top: position?.top ?? -9999, left: position?.left ?? -9999 }}
    >
      <div className="relative h-full flex flex-col pt-3">
        {/* 顶部标题与关闭 */}
        {/*  <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2E39]">
          <div className="text-sm text-[#C7CBD5]">{t('search.search')}</div>
          <button
            type="button"
            aria-label="close"
            onClick={() => setOpen(false)}
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
        <div className="sticky top-0 z-[60] flex-shrink-0 px-4 py-3">
          <TokenSearch setSearch={setSearch} currentTab={currentTab} closeDialog={() => setOpen(false)} open={open} />
        </div>

        <div
          className={cn(
            'sticky top-[60px] z-[55] flex-shrink-0 transition-all duration-300 overflow-hidden px-2',
            !isShowList ? 'opacity-100 max-h-[300px] translate-y-0' : 'opacity-0 max-h-0 -translate-y-4',
          )}
        >
          <SearchHistory
            searchHistory={searchHistory}
            handleClearHistory={handleClearHistory}
            saveToHistory={saveToHistory}
          />
          <SearchSidebar />
        </div>

        <div className={cn('flex-1 flex-col min-h-0', isShowList ? 'flex' : 'hidden')}>
          <div
            className={cn('sticky top-[60px] z-50 flex-shrink-0 gap-3', isHidenFuturesTab && search && 'hidden')}
            ref={stickyRef}
          >
            <MovingLineTabs
              tabs={headerTabs}
              defaultTab={currentTab}
              onTabChange={handleTabChange}
              containerClassName="after:hidden w-full linear-gradien-border-buttom rounded-t-[8px] p-0 pl-3 bg-inherit z-1 relative "
              tabsClassName="w-full px-2 gap-x-4"
              wrapperClassName="z-1"
              forceUpdate={isShowList}
              itemClassName={'font-[400] text-[calc(1rem*(15/16))] px-0'}
              tabsListClassName="p-0"
              itemClassNameActive="!text-[calc(1rem*(16/16))] !font-[500]"
            />
          </div>

          <div className="flex-1 min-h-0 overflow-auto mt-3  _hidescrollbar pb-4 px-3" ref={listRef}>
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
  )

  return <ToastProvider>{open ? createPortal(dropdownNode, document.body) : null}</ToastProvider>
})

TokenSearchDrawer.displayName = 'TokenSearchDrawer'
