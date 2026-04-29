import { UITab } from '@/types/uiTabs.ts'
import { TAB_CLASSIFICATION, TAB_MEME, TAB_TRENDING, TAB_WATCHLIST } from '@components/discover/DiscoverTabs.tsx'
import MovingLineTabs from '@components/common/MovingLineTabs.tsx'
import { useTranslation } from 'react-i18next'
import { useEffect, useMemo, useState } from 'react'
import { APP_PATH } from '@/lib/constant.ts'
import { useLocation, useNavigate } from 'react-router-dom'
import { TimeframeSelector } from '@components/discover/TimeframeSelector.tsx'
import { BlacklistDialog } from '@pages/meme/discover/desktop/components/BlacklistDialog.tsx'
import { FilterButton } from '@pages/meme/discover/desktop/components/FilterButton.tsx'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { homeActions } from '@/redux/modules/home.slice.ts'
import { TradeSettingsButton } from '@components/v2/desktop/TradeSettingsButton.tsx'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { SwitchWalletFormTrade } from '@/pages/detail/orderForm/desktop/component/wallet/SwitchWalletFormTrade'
import { TokenDetail } from '@/@generated/gql/graphql-future'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { ChainIds } from '@/types/enums.ts'
import QuickBuy from '@components/discover/QuickBuy.tsx'
import { IconFlash2 } from '@/components/icon/stroke/IconFlash2'

const getDefaultTab = () => {
  const location = window.location
  const pathname = location.pathname

  if (pathname === APP_PATH.MEME_SMART_MONEY) {
    return 'sm'
  }

  if (pathname === APP_PATH.MEME_MONITORING) {
    return 'monitoring'
  }

  const page = pathname.split('/').pop() || TAB_MEME
  if (page === TAB_MEME || page === TAB_TRENDING || page === TAB_CLASSIFICATION) {
    return page
  }
  return TAB_MEME
}

type Tab = UITab & { href?: string }

export const NavigationTabs = () => {
  const { t } = useTranslation()
  const [currentTab, setCurrentTab] = useState(getDefaultTab())
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const activeWallet = useSelector(_activeWallet)
  const activeChainId = useActiveChainId()
  const location = useLocation()

  const allTabs: Tab[] = useMemo(() => {
    const tabs = [
      // {
      //   value: TAB_WATCHLIST,
      //   label: t('listCoin.tabs.optional'),
      //   href: `${APP_PATH.MEME_DISCOVER}/${TAB_WATCHLIST}`,
      // },
      {
        value: TAB_MEME,
        label: t('listCoin.tabs.meme'),
        href: `${APP_PATH.MEME_DISCOVER}/${TAB_MEME}`,
      },
      {
        value: TAB_TRENDING,
        label: t('listCoin.tabs.mainstream'),
        href: `${APP_PATH.MEME_DISCOVER}/${TAB_TRENDING}`,
      },
      {
        value: TAB_CLASSIFICATION,
        label: t('listCoin.tabs.category'),
        href: `${APP_PATH.MEME_DISCOVER}/${TAB_CLASSIFICATION}`,
      },
      {
        value: 'sm',
        label: t('bottomNav.smartMoney'),
        href: APP_PATH.MEME_SMART_MONEY,
      },
      {
        value: 'monitoring',
        label: t('bottomNav.monitoring'),
        href: APP_PATH.MEME_MONITORING,
      },
    ]
    if (activeChainId === ChainIds.Bsc || activeChainId === ChainIds.Mon) {
      return tabs.filter((tab) => tab.value !== TAB_CLASSIFICATION)
    }
    return tabs
  }, [t, activeChainId])

  useEffect(() => {
    const tab = getDefaultTab()
    handleTabChange(tab)
  }, [location.pathname, location.search])

  const handleTabChange = (tabId: string) => {
    // if current tab is the same as the tabId, do nothing
    if (currentTab === tabId) return
    setCurrentTab(tabId)
    const selectedTab = allTabs.find((tab) => tab.value === tabId)
    if (selectedTab?.href) {
      navigate(selectedTab.href)
    }
  }

  const allFilters = useAppSelector((state) => state.home.filters)

  const filter = useMemo(() => {
    if (currentTab === TAB_TRENDING) return allFilters.trending
  }, [currentTab, allFilters])

  const currentTimeframe = useMemo(() => {
    return filter?.timeframe || '1h'
  }, [filter])

  const onTimeframeChange = (timeframe: string) => {
    dispatch(
      homeActions.setFilters({
        key: currentTab,
        filter: {
          ...filter,
          timeframe,
        },
      }),
    )
  }

  const onFilterChange = (newFilter: typeof filter) => {
    if (!newFilter) return
    dispatch(
      homeActions.setFilters({
        key: currentTab,
        filter: {
          ...newFilter,
        },
      }),
    )
  }

  const onResetAll = () => {
    dispatch(homeActions.resetFilter(currentTab))
  }

  const shouldShowTimeframe = useMemo(() => {
    return currentTab === TAB_TRENDING
  }, [currentTab])

  const shouldShowBlacklist = useMemo(() => {
    return (
      currentTab === TAB_MEME ||
      currentTab === TAB_WATCHLIST ||
      currentTab === TAB_CLASSIFICATION ||
      currentTab === TAB_TRENDING ||
      currentTab === 'monitoring' ||
      currentTab === 'sm'
    )
  }, [currentTab])

  const shouldShowTradeSettings = useMemo(() => {
    return (
      currentTab === TAB_MEME ||
      currentTab === TAB_WATCHLIST ||
      currentTab === TAB_CLASSIFICATION ||
      currentTab === TAB_TRENDING ||
      currentTab === 'monitoring' ||
      currentTab === 'sm'
    )
  }, [currentTab])

  const shouldShowQuickBuy = useMemo(() => {
    if (!activeWallet.isConnected) return
    return currentTab === TAB_WATCHLIST || currentTab === TAB_CLASSIFICATION || currentTab === TAB_TRENDING
  }, [currentTab, activeWallet])

  return (
    <div className="w-full flex justify-between items-center py-2 bg-[#0A0A0A]">
      <MovingLineTabs
        tabs={allTabs}
        defaultTab={currentTab}
        containerClassName="bg-transparent justify-start after:hidden after:h-0 after:w-0 w-full"
        tabsListClassName="justify-start w-full"
        onTabChange={handleTabChange}
      />
      <div className="pr-4 flex gap-3 items-center">
        {shouldShowQuickBuy && (
          <QuickBuy
            presetSelectType="list"
            className="rounded-full h-[26px] border-none bg-[#212127] "
            icon={<IconFlash2 className="text-[#FBFBFB]" />}
            showUnitIcon={true}
          />
        )}
        {shouldShowTimeframe && (
          <TimeframeSelector currentTimeframe={currentTimeframe} onTimeframeChange={onTimeframeChange} />
        )}
        {currentTab === TAB_TRENDING ? (
          <div className="flex items-center text-[calc(14rem/16)] px-2 py-1 rounded-full cursor-pointer text-[#908E98]">
            <FilterButton
              currentFilter={filter}
              onFiltersChanged={onFilterChange}
              onResetAll={onResetAll}
              className="bg-transparent"
            />
            {t('listCoin.filter')}
          </div>
        ) : null}
        {shouldShowBlacklist && <BlacklistDialog />}
        {shouldShowTradeSettings && <TradeSettingsButton />}
        {/* <WalletSwitcher /> */}
        {activeWallet?.isConnected && <SwitchWalletFormTrade tokenDetail={{} as TokenDetail} screen="home" />}
      </div>
    </div>
  )
}
