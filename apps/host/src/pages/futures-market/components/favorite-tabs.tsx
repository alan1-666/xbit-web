import { useState, useMemo, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import FavoriteList from './favorite-list'
import FavoriteMemeList from '@/components/watchlistTab/FavoriteMemeList'
import FavoriteXStockWrapper from '@/components/watchlistTab/FavoriteXStockWrapper'
import IconEdit from '@/components/icon/stroke/IconEdit'
import { APP_PATH } from '@/lib/constant'
import { useRecommendedContracts } from '@/hooks/useRecommendedContracts'
import { RootState, useAppSelector } from '@/redux/store'
import { SymbolListState } from '@/redux/modules/symbolList.slide'
import { useWatchlistTokens } from '@/pages/meme/discover/desktop/hooks/useWatchlistTokens'
import { useQuery } from '@tanstack/react-query'
import { futureClient } from '@/lib/gql/apollo-client'
import { getXStocksTokens } from '@services/tokens.service.ts'
import { SortDirection, TokenSortFields } from '@/@generated/gql/graphql-future.ts'
import { Configs } from '@/const/configs'
import { FavoritesPage } from '@/modules/prediction/pages/FavoritesPage.tsx'

import { useActiveWallet } from '@hooks/useActiveWallet.ts'

const TAB_VALUE = {
  CONTRACT: 'contract',
  MEME: 'meme',
  PREDICTION: 'prediction',
  XSTOCKS: 'xstocks',
} as const

type TabValue = (typeof TAB_VALUE)[keyof typeof TAB_VALUE]

interface FavoriteTabsProps {
  symbolData: any[]
  type: string
  initialTab?: string | null
  scrollElement?: HTMLDivElement | null
}

const FavoriteTabs = ({ symbolData, type, initialTab: initialTabParam, scrollElement }: FavoriteTabsProps) => {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // 从 URL 参数或 props 初始化 tab
  const initialTab = useMemo(() => {
    // 优先从 URL 参数读取 subtab
    const subtabParam = searchParams.get('subtab')
    if (subtabParam && Object.values(TAB_VALUE).includes(subtabParam as TabValue)) {
      if (subtabParam === TAB_VALUE.XSTOCKS && !Configs.enableSolana()) {
        return TAB_VALUE.CONTRACT
      }
      return subtabParam as TabValue
    }

    // 其次从 props 读取（从编辑页面返回时传入）
    if (initialTabParam && Object.values(TAB_VALUE).includes(initialTabParam as TabValue)) {
      if (initialTabParam === TAB_VALUE.XSTOCKS && !Configs.enableSolana()) {
        return TAB_VALUE.CONTRACT
      }
      return initialTabParam as TabValue
    }

    return TAB_VALUE.CONTRACT
  }, [initialTabParam, searchParams])

  const [currentTab, setCurrentTab] = useState<TabValue>(initialTab)

  // 当 URL 参数变化时更新当前 tab
  useEffect(() => {
    const subtabParam = searchParams.get('subtab')
    if (subtabParam && Object.values(TAB_VALUE).includes(subtabParam as TabValue)) {
      if (subtabParam === TAB_VALUE.XSTOCKS && !Configs.enableSolana()) {
        setCurrentTab(TAB_VALUE.CONTRACT)
      } else {
        setCurrentTab(subtabParam as TabValue)
      }
    } else if (initialTabParam && Object.values(TAB_VALUE).includes(initialTabParam as TabValue)) {
      if (initialTabParam === TAB_VALUE.XSTOCKS && !Configs.enableSolana()) {
        setCurrentTab(TAB_VALUE.CONTRACT)
      } else {
        setCurrentTab(initialTabParam as TabValue)
      }
    }
  }, [initialTabParam, searchParams])

  // 获取推荐合约（持仓额前8个，每小时更新）
  const { recommendedContracts } = useRecommendedContracts({
    enableHourlyRefresh: true,
    limit: 8,
  })

  // 获取合约收藏数据
  const { favorites, isEmptyFavorites } = useAppSelector<RootState, SymbolListState>((state) => state.symbolListSlice)

  // 获取 Meme 收藏数据
  const activeWallet = useActiveWallet()
  const { data: memeFavorites = [], isLoading: isLoadingMeme } = useWatchlistTokens({
    excludeBlacklisted: false,
  })

  // 获取美股收藏数据
  const fetchXStockWatchlist = useCallback(async () => {
    const res = await futureClient.query({
      query: getXStocksTokens,
      variables: {
        input: {
          chainId: 501424,
          categoryId: 'XStock',
          page: 1,
          limit: 100,
          sortBy: TokenSortFields.MarketCap,
          sortType: SortDirection.Desc,
        },
      },
    })
    const tokens = res.data.tokensByCategory?.data || []
    return tokens.filter((token) => token.isFavorite)
  }, [])

  const { data: xstockFavorites = [], isLoading: isLoadingXStock } = useQuery({
    enabled: activeWallet.isConnected,
    queryKey: ['xstock-watchlist'],
    queryFn: fetchXStockWatchlist,
  })

  // 判断当前 tab 是否有收藏数据
  const hasFavoriteData = useMemo(() => {
    switch (currentTab) {
      case TAB_VALUE.CONTRACT:
        return favorites.length > 0 && !isEmptyFavorites
      case TAB_VALUE.MEME:
        return !isLoadingMeme && memeFavorites.length > 0
      case TAB_VALUE.XSTOCKS:
        return activeWallet.isConnected && !isLoadingXStock && xstockFavorites.length > 0
      default:
        return false
    }
  }, [
    currentTab,
    favorites.length,
    isEmptyFavorites,
    isLoadingMeme,
    memeFavorites.length,
    activeWallet.isConnected,
    isLoadingXStock,
    xstockFavorites.length,
  ])

  const tabs = useMemo(
    () =>
      [
        { value: TAB_VALUE.CONTRACT, label: t('assets.futures.futures') },
        { value: TAB_VALUE.MEME, label: t('header.meme') },
        { value: TAB_VALUE.XSTOCKS, label: t('header.xstocks') },
        // { value: TAB_VALUE.PREDICTION, label: t('assets.prediction.prediction') },
      ].filter((t) => t.value !== TAB_VALUE.XSTOCKS || Configs.enableSolana()),
    [t],
  )

  const handleTabChange = useCallback(
    (tab: TabValue) => {
      setCurrentTab(tab)

      // 将二级 tab 记录到 URL 参数中
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.set('subtab', tab)
      setSearchParams(newSearchParams, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const handleEditClick = useCallback(() => {
    // 将当前 tab 作为 query 参数传递
    navigate(`${APP_PATH.EDIT_FAVORITES}?tab=${currentTab}&source=market`, {
      state: { from: `${location.pathname}?favoriteTab=${currentTab}` },
    })
  }, [navigate, currentTab, location.pathname])

  const renderContent = useCallback(() => {
    switch (currentTab) {
      case TAB_VALUE.CONTRACT:
        return (
          <FavoriteList
            symbolData={symbolData}
            type={type}
            recommendedContracts={recommendedContracts}
            scrollElement={scrollElement}
          />
        )
      case TAB_VALUE.MEME:
        return <FavoriteMemeList type={type} />
      case TAB_VALUE.XSTOCKS:
        return <FavoriteXStockWrapper type={type} />
      // case TAB_VALUE.PREDICTION:
      //   return (
      //     <div className="mt-2">
      //       <FavoritesPage />
      //     </div>
      //   )
      default:
        return null
    }
  }, [currentTab, symbolData, type, recommendedContracts])

  return (
    <div className="flex flex-col w-full min-h-full">
      {/* 次级分类 tabs */}
      {activeWallet.isConnected && (
        <div className="flex items-center justify-between pt-2 pb-1 w-full mt-2 sticky top-[36px] z-10 bg-[#0A0A0A]">
          <div className="flex gap-[8px] items-center">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={cn(
                  'flex items-center justify-center px-2 py-1 h-[20px] rounded-full',
                  'text-[12px] leading-[12px] text-center whitespace-nowrap',
                  currentTab === tab.value ? 'bg-[#18181d] text-[#fafafa]' : 'text-[#908e98]',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {hasFavoriteData && (
            <button
              onClick={handleEditClick}
              className="flex items-center justify-center w-[12px] h-[12px]"
              aria-label="edit"
            >
              <IconEdit />
            </button>
          )}
        </div>
      )}

      {/* 内容区域 */}
      <div className="w-full flex-1 min-h-full">{renderContent()}</div>
    </div>
  )
}

export default FavoriteTabs
