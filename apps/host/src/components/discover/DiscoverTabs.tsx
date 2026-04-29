import MovingLineTabs from '@components/common/MovingLineTabs.tsx'
import { UITab } from '@/types/uiTabs.ts'
import { useTranslation } from 'react-i18next'
import { useContext, useEffect, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { DiscoverPageContext } from '@components/discover/DiscoverPageContext.tsx'
import { DiscoverFilterButton } from '@components/discover/DiscoverFilterButton.tsx'
import { useActiveChain, useActiveChainId } from '@hooks/useActiveChain.ts'
import { ChainIds } from '@/types/enums.ts'
import { useAppSelector, useAppDispatch } from '@/redux/store'
import { HomeState } from '@/redux/modules/home.slice.ts'
import { MEME_TABS, MEME_TABS_MAP } from '@/lib/constant.ts'
import { LifecycleStates } from '@/@generated/gql/graphql-core.ts'
import SwitchChains from '../header/switch-chains'
import { NewChangeWalletButton } from './header/NewChangeWalletButton'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { APP_PATH } from '@/lib/constant'

export const TAB_WATCHLIST = 'watchlist'
export const TAB_MEME = 'meme'
export const TAB_TRENDING = 'trending'
export const TAB_CLASSIFICATION = 'classification'
export const TAB_X_STOCKS = 'xstocks'

export interface DiscoverTabsProps {
  tabs: UITab[]
  onTabChange: (tabId: string) => void
}

export const DiscoverTabs = () => {
  const { filters, memeSubTab } = useContext(DiscoverPageContext)
  const location = useLocation()
  const dispatch = useAppDispatch()
  const currentTab = useMemo(() => {
    const lastSegment = location.pathname.split('/').pop()
    if (lastSegment === 'discover' || location.pathname.includes('/market/meme')) {
      return TAB_MEME
    }
    return lastSegment || TAB_MEME
  }, [location.pathname])
  const { t } = useTranslation()
  const navigate = useNavigate()
  const activeChainId = useActiveChainId()
  const activeChain = useActiveChain()
  const activeWallet = useSelector(_activeWallet)
  const allTabs: UITab[] = useMemo(() => {
    const tabs = [
      // {
      //   value: TAB_WATCHLIST,
      //   label: t('listCoin.tabs.optional'),
      // },
      {
        value: TAB_MEME,
        label: t('listCoin.tabs.meme'),
      },
      {
        value: TAB_TRENDING,
        label: t('listCoin.tabs.mainstream'),
      },
      {
        value: TAB_CLASSIFICATION,
        label: t('listCoin.tabs.category'),
      },
      // {
      //   value: TAB_X_STOCKS,
      //   label: 'xStocks',
      // },
    ]
    if (activeChainId === ChainIds.Bsc) {
      return tabs.filter((tab) => tab.value !== TAB_CLASSIFICATION)
    }
    return tabs
  }, [t, activeChainId])

  const hasFilter = useMemo(() => {
    const filterKey = currentTab === TAB_MEME && memeSubTab ? `TAB_MEME_${memeSubTab}` : currentTab
    const filter = filters[filterKey]

    if (!filter) return false

    const { timeframe, dexList, bscDexList, ethDexList, arbDexList, solDexList, ...rest } = filter
    const dexes = filter?.[`${activeChain}DexList`]

    if (dexes && dexes.length > 0) return true

    return Object.values(rest).some((value) => {
      if (Array.isArray(value)) {
        return value.length > 0
      }
      return value !== undefined && value !== null
    })
  }, [filters, currentTab, memeSubTab, activeChain])

  const headerTabs = useMemo(() => {
    if (activeChainId == ChainIds.Solana || activeChainId === ChainIds.Bsc || activeChainId === ChainIds.Mon) {
      return allTabs
    }
    return allTabs.filter((tab) => tab.value !== TAB_MEME)
  }, [activeChainId])

  const handleTabChange = (page: string) => {
    if (page === TAB_MEME) {
      navigate(`${APP_PATH.MARKET}/meme/${page}?tab=${MEME_TABS_MAP[memeSubTab] || MEME_TABS.NEW}`, { replace: true })
    } else {
      navigate(`${APP_PATH.MARKET}/meme/${page}`, { replace: true })
    }
  }

  // useEffect(() => {
  //   // Check if currentTab is still valid
  //   const tabExists = allTabs.some((tab) => tab.value === currentTab)
  //   if (!tabExists) {
  //     handleTabChange(TAB_MEME)
  //   }
  // }, [allTabs, currentTab])

  const shouldShowFilterButton = useMemo(() => {
    return currentTab !== TAB_CLASSIFICATION && currentTab !== TAB_WATCHLIST
  }, [currentTab])

  console.log("currentTab", currentTab, headerTabs)
  return (
    <div id="discover-tabs" className="sticky top-0 z-10 w-full bg-[#0A0A0A] pt-2 pr-2.5">
      <div className="sticky top-0 flex w-full max-w-screen items-center justify-between gap-2 rounded-t-[8px]">
        <div className="no-scrollbar flex-1 overflow-x-auto">
          <MovingLineTabs
            tabs={headerTabs}
            defaultTab={currentTab}
            onTabChange={handleTabChange}
            containerClassName="bg-transparent justify-start after:hidden after:h-0 after:w-0 w-full"
            tabsListClassName="h-7 justify-start w-full px-0"
            itemClassName="pt-0 text-[#908E98]"
            labelClassName="text-[14px] leading-none font-normal tracking-[-0.3px]"
            labelActiveClassName="scale-100! font-semibold"
            tabLineClassName="before:h-[2px] before:rounded-t-[4px] before:bg-[#AB70FF]"
          />
        </div>
        <div className="flex items-center gap-3">
          {/* <NewChangeWalletButton /> */}
          {activeWallet?.isConnected ? <NewChangeWalletButton /> : <SwitchChains isMemePage />}
          {shouldShowFilterButton && <DiscoverFilterButton hasFilters={hasFilter} className="mt-1 h-5 min-h-5! w-5" />}
        </div>
      </div>
      {/* <div className="w-full h-[0.5px] bg-[linear-gradient(90deg,#ECECED00_0%,#D3F5EC80_4%,#C6FAEBBF_50%,#BAFFEA80_96%,#86868700_100%)] opacity-10" /> */}
    </div>
  )
}
