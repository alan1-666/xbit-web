import Container from '@/components/common/Container'
import MovingLineTabs from '@/components/common/MovingLineTabs'
import { cn } from '@/lib/utils'
import { setData, setFavorites } from '@/redux/modules/symbolList.slide'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useHandleGetData from '../hooks/useHandleGetData'
import useSymbolListSubscription from '../hooks/useSymbolListSubscription'
// import { headerTabs } from '../type'
import ClassificationList from './classification-list'
import FavoriteList from './favorite-list'
import GianerList from './gianer-list'
import LoserList from './loser-list'
import MarketCapList from './market-cap-list'
import PositionList from './position-list'
import SearchBar from '@/components/futuresDiscover/search-bar'
import Transactions from './transactions'
import TrendingTable from './trending-table'
import VolumeList from './volume-list'
import MemeList from './meme-list'
import { UITab } from '@/types/uiTabs'
import { useTranslation } from 'react-i18next'
import FavoriteTabs from './favorite-tabs'
import MarketXStockWrapper from './market-xstock-wrapper'
import MobileAdBanner from '@/components/mobile/MobileAdBanner'
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom'
import { useRecommendedContracts } from '@/hooks/useRecommendedContracts'
import { Configs } from '@/const/configs'
import { APP_PATH } from '@/lib/constant'
import MarketPrediction from '@/modules/prediction/pages/Market'
import { MemeDiscoverPage } from '@pages/meme/new-discover.tsx'
import { useResponsive } from '@/hooks/useResponsive'
import { useFeatureIsOn } from '@growthbook/growthbook-react'

const TAB_VALUE = {
  FAVORITE: 'favorite',
  HOT: 'hot',
  CLASSIFICATION: 'classification',
  GAINERS: 'gainers',
  LOSERS: 'losers',
  VOLUME: 'volume',
  POSITION: 'position',
  MARKET_CAP: 'market_cap',

  CONTRACT: 'contract',
  MEME: 'meme',
  XSTOCKS: 'xstocks',
  PREDICTION: 'prediction',
} as const

type MarketOverviewListContentProps = {
  currentTab: string
  type: string
  symbolData: any[]
  favoriteTab: string | null
  recommendedContracts: any[]
}

const MarketOverviewListContent = memo(
  ({ currentTab, type, symbolData, favoriteTab, recommendedContracts }: MarketOverviewListContentProps) => {
    switch (currentTab) {
      case TAB_VALUE.FAVORITE:
        return type === 'market' ? (
          <FavoriteTabs symbolData={symbolData} type={type} initialTab={favoriteTab} />
        ) : (
          <FavoriteList symbolData={symbolData} type={type} recommendedContracts={recommendedContracts} />
        )
      case TAB_VALUE.HOT:
        return <VolumeList symbolData={symbolData} type={type} marketKind="futures" />
      case TAB_VALUE.CLASSIFICATION:
        return <ClassificationList symbolData={symbolData} type={type} />
      case TAB_VALUE.GAINERS:
        return <GianerList symbolData={symbolData} type={type} marketKind="futures" />
      case TAB_VALUE.LOSERS:
        return <LoserList symbolData={symbolData} type={type} marketKind="futures" />
      case TAB_VALUE.VOLUME:
        return <Transactions symbolData={symbolData} type={type} marketKind="futures" />
      case TAB_VALUE.POSITION:
        return <PositionList symbolData={symbolData} type={type} marketKind="futures" />
      case TAB_VALUE.MARKET_CAP:
        return <MarketCapList symbolData={symbolData} type={type} marketKind="futures" />
      case TAB_VALUE.CONTRACT:
        return <ClassificationList symbolData={symbolData} type={type} />
      case TAB_VALUE.MEME:
        return <MemeDiscoverPage />
      case TAB_VALUE.XSTOCKS:
        return <MarketXStockWrapper className="px-3" />
      case TAB_VALUE.PREDICTION:
        return <MarketPrediction />
      default:
        return null
    }
  },
)

MarketOverviewListContent.displayName = 'MarketOverviewListContent'

const MarketOverviewList = ({ type }: { type: string }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDesktop } = useResponsive()
  const { loadSymbolListFromCache } = useHandleGetData({
    condition: 'volume',
    skip: true,
  })
  const enablePrediction = useFeatureIsOn('enable_prediction')

  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const gainer = useAppSelector((state: RootState) => state.symbolListSlice.lists.gainer)
  const loser = useAppSelector((state: RootState) => state.symbolListSlice.lists.loser)
  const marketCap = useAppSelector((state: RootState) => state.symbolListSlice.lists.marketCap)
  const openInterest = useAppSelector((state: RootState) => state.symbolListSlice.lists.openInterest)
  const favorites = useAppSelector((state: RootState) => state.symbolListSlice.favorites)
  const { t } = useTranslation()
  const headerTabs: UITab[] = useMemo(
    () => [
      {
        value: TAB_VALUE.FAVORITE,
        label: t('futuresMarket.tabs.favorite'),
      },
      {
        value: TAB_VALUE.HOT,
        label: t('futuresMarket.tabs.hot'),
      },
      {
        value: TAB_VALUE.CLASSIFICATION,
        label: t('futuresMarket.tabs.classification'),
      },
      {
        value: TAB_VALUE.GAINERS,
        label: t('futuresMarket.tabs.increase'),
      },
      {
        value: TAB_VALUE.LOSERS,
        label: t('futuresMarket.tabs.decrease'),
      },
      {
        value: TAB_VALUE.VOLUME,
        label: t('futuresMarket.tabs.volume'),
      },
      {
        value: TAB_VALUE.POSITION,
        label: t('futuresMarket.tabs.position'),
      },
      {
        value: TAB_VALUE.MARKET_CAP,
        label: t('futuresMarket.tabs.marketCap'),
      },
    ],
    [t],
  )
  const marketTabs: UITab[] = useMemo(
    () => [
      {
        value: TAB_VALUE.FAVORITE,
        label: t('futuresMarket.tabs.favorite'),
      },
      {
        value: TAB_VALUE.CONTRACT,
        label: t('assets.futures.futures'),
      },
      {
        value: TAB_VALUE.MEME,
        label: t('header.meme'),
      },
      {
        value: TAB_VALUE.XSTOCKS,
        label: t('header.xstocks'),
        hidden: !Configs.enableSolana(),
      },
      {
        value: TAB_VALUE.PREDICTION,
        label: t('assets.prediction.prediction'),
        hidden: !enablePrediction,
      },
    ],
    [enablePrediction, t],
  )

  const defaultTabs = useMemo(() => [...headerTabs.slice(0, 2), ...headerTabs.slice(3)], [headerTabs])
  const tabsToShow = useMemo(
    () => (type === 'market' ? marketTabs : defaultTabs).filter((t) => !t.hidden),
    [defaultTabs, marketTabs, type],
  )

  const defaultTab = useMemo(() => tabsToShow[1]?.value || tabsToShow[0]?.value || '', [tabsToShow])
  const [currentTab, setCurrentTab] = useState<string>(() => {
    // 如果是 market 类型，优先从 URL 参数读取 tab
    if (type === 'market') {
      const lastSegment = location.pathname.split('/').pop()
      if (lastSegment) {
        const values = new Set(tabsToShow.map((item) => item.value))
        if (values.has(lastSegment)) {
          return lastSegment
        }
      }

      // 如果有 favoriteTab 参数，说明是从编辑页面返回，应该定位到自选 tab
      const favoriteTab = searchParams.get('favoriteTab')
      if (favoriteTab) {
        return TAB_VALUE.FAVORITE
      }
    }

    // 否则从 localStorage 读取
    const storedTab = localStorage.getItem('marketTab') || ''
    const values = new Set(tabsToShow.map((item) => item.value))
    if (storedTab && values.has(storedTab)) {
      return storedTab
    }
    return defaultTab
  })
  const { symbolData } = useSymbolListSubscription({
    shouldSkip: false,
  })

  const tabScrollPositionsRef = useRef<Record<string, number>>({})
  const visitedTabsRef = useRef<Set<string>>(new Set())

  const saveCurrentScrollPosition = useCallback(() => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    tabScrollPositionsRef.current[currentTab] = scrollTop
  }, [currentTab])

  const handleTabChange = useCallback(
    (tab: string) => {
      saveCurrentScrollPosition()
      localStorage.setItem('marketTab', tab)
      // 如果是 market 类型，将 tab 记录到 URL 参数中
      if (type === 'market') {
        // const newSearchParams = new URLSearchParams(searchParams)
        // newSearchParams.set('page', tab)
        // // 清除 favoriteTab 参数（如果存在）
        // newSearchParams.delete('favoriteTab')
        // setSearchParams(newSearchParams, { replace: true })
        navigate(`${APP_PATH.MARKET}/${tab}`, { replace: true })
      } else {
        setCurrentTab(tab)
      }
    },
    [navigate, saveCurrentScrollPosition, setCurrentTab, type],
  )

  // 获取推荐合约（持仓额前8个，每小时更新）
  const { recommendedContracts } = useRecommendedContracts({
    enableHourlyRefresh: true,
    limit: 8,
  })

  const favoriteTab = useMemo(() => searchParams.get('favoriteTab'), [searchParams])

  const isXStocksTab = currentTab === TAB_VALUE.XSTOCKS

  const checkAndLoadFromCache = async () => {
    const conditions = [
      { condition: 'gainer', data: gainer },
      { condition: 'loser', data: loser },
      { condition: 'marketCap', data: marketCap },
      { condition: 'openInterest', data: openInterest },
      { condition: 'favorite', data: favorites },
    ]

    for (const { condition, data } of conditions) {
      if (!data || data.length === 0) {
        try {
          const cachedData = await loadSymbolListFromCache(condition)
          if (cachedData && cachedData?.length > 0) {
            dispatch(
              setData({
                condition,
                data: cachedData as any[],
              }),
            )

            if (condition === ('favorite' as any)) {
              dispatch(setFavorites(cachedData))
            }
          }
        } catch (error) {
          console.warn(`Error loading ${condition} from cache:`, error)
        }
      }
    }
  }

  useEffect(() => {
    checkAndLoadFromCache()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      tabScrollPositionsRef.current[currentTab] = scrollTop
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [currentTab])

  useEffect(() => {
    const isVisited = visitedTabsRef.current.has(currentTab)
    const savedScrollTop = tabScrollPositionsRef.current[currentTab]
    const targetScrollTop = isVisited && typeof savedScrollTop === 'number' ? savedScrollTop : 0
    requestAnimationFrame(() => {
      const maxOffset = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0)
      window.scrollTo({ top: Math.min(targetScrollTop, maxOffset), behavior: 'auto' })
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event('scroll'))
      })
    })
    if (!isVisited) {
      visitedTabsRef.current.add(currentTab)
    }
  }, [currentTab])

  useEffect(() => {
    const values = new Set(tabsToShow.map((item) => item.value))
    // Only reset if currentTab is truly not in the available tabs
    if (!values.has(currentTab)) {
      setCurrentTab(defaultTab)
      localStorage.setItem('marketTab', defaultTab)
    }
  }, [type, tabsToShow])

  useEffect(() => {
    // Only sync URL to currentTab for market type
    if (type !== 'market') return

    const pathname = location.pathname
    let newTab = null

    // Check for meme route first (has highest priority as it's most specific)
    if (pathname.includes('/market/meme')) {
      newTab = 'meme'
    } else if (pathname.includes('/market/prediction')) {
      newTab = 'prediction'
    } else {
      // Get last segment of URL
      const lastSegment = pathname.split('/').pop()
      if (lastSegment && tabsToShow.some((t) => t.value === lastSegment)) {
        newTab = lastSegment
      }
    }

    // Only update if we found a valid tab
    if (newTab) {
      setCurrentTab(newTab)
    }
  }, [location, type, tabsToShow])

  // console.log(type, 'type')
  // Figma 组件映射: 市场概览列表 - 对应 Figma 节点 50457-156019

  return (
    <div className="relative h-full">
      <div className="flex min-h-dvh flex-1 flex-col bg-transparent">
        <div className={cn('flex h-full w-full max-w-[768px] flex-col')}>
          {type === 'market' && (
            <div className="w-full bg-gradient-to-b from-[#38245D] to-[#060606] px-3 pt-1">
              <SearchBar />
              <MobileAdBanner size="small" className="mb-1" />
            </div>
          )}

          {/* tabs 这样写是因为首页不展示分类tab */}
          <div className="sticky top-0 z-10 w-full bg-[#0A0A0A] pt-2">
            <MovingLineTabs
              tabs={tabsToShow}
              defaultTab={currentTab}
              onTabChange={handleTabChange}
              showContainerBottomLine={true}
              containerClassName="bg-transparent justify-start w-full"
              tabsListClassName="h-7 justify-start w-full"
              itemClassName="pl-[11px] pt-0 text-[#908E98] pb-2"
              labelClassName="text-[14px] leading-none font-normal tracking-[-0.3px]"
              labelActiveClassName="scale-100! font-medium text-[#FFFFFF]"
              tabLineClassName="before:h-[1.33px]"
            />
          </div>
          <div
            className={cn('w-full flex-1 bg-[#0A0A0A]', isXStocksTab ? '' : 'px-3', isDesktop ? 'pb-0' : 'pb-[80px]')}
          >
            <MarketOverviewListContent
              currentTab={currentTab}
              type={type}
              symbolData={symbolData}
              favoriteTab={favoriteTab}
              recommendedContracts={recommendedContracts}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MarketOverviewList
