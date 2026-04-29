import { useState, useMemo, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { APP_PATH } from '@/lib/constant'
import useSymbolListSubscription from '@/pages/futures-market/hooks/useSymbolListSubscription'
import { useRecommendedContracts } from '@/hooks/useRecommendedContracts'
import FavoriteList from '@/pages/futures-market/components/favorite-list'
import FavoriteMemeList from './FavoriteMemeList'
import FavoriteXStockWrapper from './FavoriteXStockWrapper'
import { EditIcon } from 'lucide-react'
import { ButtonConnectWallet } from '../common/ButtonConnectWallet'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'

const TAB_VALUE = {
  CONTRACT: '合约',
  MEME: 'Meme',
  XSTOCKS: '美股',
} as const

const PARENT_PAGES = {
  FUTURE_DISCOVER: APP_PATH.FUTURES_DISCOVER,
  MEME_DISCOVER: APP_PATH.MEME_DISCOVER,
  XSTOCKS: APP_PATH.XSTOCKS,
  FUTURE_MARKET: APP_PATH.MARKET,
}
type TabValue = (typeof TAB_VALUE)[keyof typeof TAB_VALUE]

interface TabWatchListProps {
  className?: string
}
const TabWatchList: React.FC<TabWatchListProps> = ({ className }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { symbolData } = useSymbolListSubscription({
    shouldSkip: false,
  })
  const activeWallet = useSelector(_activeWallet)
  const location = useLocation()
  const type = 'home'
  const [searchParams] = useSearchParams()
  // 获取推荐合约（持仓额前8个，每小时更新）
  const { recommendedContracts } = useRecommendedContracts({
    enableHourlyRefresh: true,
    limit: 8,
  })
  const initialTabParam = searchParams.get('favoriteTab')
  // 从 props 初始化 tab（从编辑页面返回时传入）
  const initialTab = useMemo(() => {
    if (initialTabParam === 'meme') return TAB_VALUE.MEME
    if (initialTabParam === 'xstocks') return TAB_VALUE.XSTOCKS
    if (initialTabParam === 'contract') return TAB_VALUE.CONTRACT
    return TAB_VALUE.CONTRACT
  }, [initialTabParam])

  const [currentTab, setCurrentTab] = useState<TabValue>(initialTab)

  const renderTab = (pathname: string) => {
    if (pathname == PARENT_PAGES.FUTURE_DISCOVER) {
      return [{ value: TAB_VALUE.CONTRACT, label: t('assets.futures.futures') }]
    }
    if (pathname == PARENT_PAGES.MEME_DISCOVER) {
      return [{ value: TAB_VALUE.MEME, label: t('header.meme') }]
    }
    if (pathname == PARENT_PAGES.XSTOCKS) {
      return [{ value: TAB_VALUE.XSTOCKS, label: t('header.xstocks') }]
    }
    return [
      // { value: TAB_VALUE.CONTRACT, label: t('assets.futures.futures') },
      { value: TAB_VALUE.MEME, label: t('header.meme') },
      // { value: TAB_VALUE.XSTOCKS, label: t('header.xstocks') },
    ]
  }

  const tabs = useMemo(() => renderTab(location.pathname), [location.pathname])

  // 当 initialTabParam 变化时更新当前 tab（从编辑页面返回时）
  useEffect(() => {
    if (initialTabParam && location.pathname === PARENT_PAGES.FUTURE_MARKET) {
      if (initialTabParam === 'meme') setCurrentTab(TAB_VALUE.MEME)
      else if (initialTabParam === 'xstocks') setCurrentTab(TAB_VALUE.XSTOCKS)
      else if (initialTabParam === 'contract') setCurrentTab(TAB_VALUE.CONTRACT)
    } else {
      setCurrentTab(tabs[0].value)
    }
  }, [initialTabParam, tabs, location.pathname])

  const handleTabChange = useCallback((tab: TabValue) => {
    setCurrentTab(tab)
  }, [])

  const handleEditClick = useCallback(() => {
    const tabParam = currentTab === TAB_VALUE.CONTRACT ? 'contract' : currentTab === TAB_VALUE.MEME ? 'meme' : 'xstocks'
    navigate(`${APP_PATH.EDIT_FAVORITES}?tab=${tabParam}&source=discover`)
  }, [navigate, currentTab])

  const renderContent = useCallback(() => {
    switch (currentTab) {
      case TAB_VALUE.CONTRACT:
        return <FavoriteList symbolData={symbolData} type={type} recommendedContracts={recommendedContracts} />
      case TAB_VALUE.MEME:
        return <FavoriteMemeList type={type} />
      case TAB_VALUE.XSTOCKS:
        return <FavoriteXStockWrapper type={type} />
      default:
        return null
    }
  }, [currentTab, symbolData, type, recommendedContracts])

  if (!activeWallet.isConnected)
    return (
      <div className={cn('mt-[124px]')}>
        <ButtonConnectWallet />
      </div>
    )
  return (
    <div className={cn('px-3 flex flex-col w-full', className)}>
      {/* 次级分类 tabs */}
      <div className="flex items-center justify-between w-full pt-3 sticky top-9 z-10 bg-[#0A0A0A]">
        <div className="flex gap-2 items-center">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={cn(
                'flex items-center justify-center px-2 py-1 h-5 rounded-full',
                'text-[12px] leading-3 text-center whitespace-nowrap',
                currentTab === tab.value ? 'bg-[#18181d] text-[#fafafa]' : 'text-[#908e98]',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleEditClick}
          className="flex items-center justify-center w-[12px] h-[12px]"
          aria-label="edit"
        >
          <EditIcon />
        </button>
      </div>

      {/* 内容区域 */}
      <div className="w-full flex-1 pb-20">{renderContent()}</div>
    </div>
  )
}

export default TabWatchList
