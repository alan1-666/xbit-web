import MovingLineTabs from '@components/common/MovingLineTabs.tsx'
import { useEffect, useMemo } from 'react'
import { UITab } from '@/types/uiTabs.ts'
import TabMainstream from '@components/listCoin/TabMainstream.tsx'
import TabMeme from '@components/listCoin/TabMeme.tsx'
import TabWatchlist from '@components/listCoin/TabWatchlist.tsx'
import TabNewCoin from '@components/listCoin/TabNewCoin.tsx'
import { useTranslation } from 'react-i18next'
import TabClassification from './TabClassification'
import TabCopyTrade from './TabCopyTrade'
import { useSearchParams } from 'react-router-dom'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { homeActions } from '@/redux/modules/home.slice.ts'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice.ts'

const TAB_WATCHLIST = 'watchlist'
const TAB_MEME = 'meme'
const TAB_TRENDING = 'trending'
const TAB_NEW_COIN = 'newCoin'
const TAB_CLASSIFICATION = 'classification'
const TAB_WALLET_COPY = 'walletCopy'

const DEFAULT_TAB = TAB_TRENDING

const ListCoin = () => {
  const { t } = useTranslation()

  const headerTabs: UITab[] = [
    {
      value: TAB_WATCHLIST,
      label: t('listCoin.tabs.optional'),
    },
    {
      value: TAB_MEME,
      label: 'Meme',
    },
    {
      value: TAB_TRENDING,
      label: t('listCoin.tabs.mainstream'),
    },
    {
      value: TAB_NEW_COIN,
      label: t('listCoin.tabs.newCoin'),
    },
    {
      value: TAB_CLASSIFICATION,
      label: t('listCoin.tabs.category'),
    },
    {
      value: TAB_WALLET_COPY,
      label: t('listCoin.tabs.walletCopy'),
    },
  ]

  const [searchParams, setSearchParams] = useSearchParams()

  const dispatch = useAppDispatch()
  const currentTab: string = useAppSelector((state: RootState) => state.home.currentTab)
  const setCurrentTab = (tab: string) => {
    dispatch(homeActions.setCurrentTab(tab))
  }
  const activeWallet = useSelector(_activeWallet)

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab }, { replace: true })
  }

  const disabledTabs = useMemo(() => {
    // const env = import.meta.env.VITE_STAGE
    // const exceptEnv = ['staging', 'prod']
    // const tabs = !exceptEnv.includes(env) ? [] : [headerTabs[5].value]
    const tabs = []
    if (!activeWallet?.isConnected) {
      tabs.push(headerTabs[0].value)
      tabs.push(headerTabs[5].value)
    }
    return tabs
  }, [activeWallet])

  const showTabs = useMemo(() => {
    return headerTabs.filter((tab) => !disabledTabs.includes(tab.value))
  }, [disabledTabs, headerTabs])

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (!tab) return
    if (!showTabs.some((showTab) => showTab.value === tab)) {
      setSearchParams({ tab: DEFAULT_TAB }, { replace: true })
    } else {
      setCurrentTab(tab)
    }
  }, [searchParams, disabledTabs])

  const renderTabContent = (tab: string) => {
    switch (tab) {
      case TAB_WATCHLIST:
        return <TabWatchlist />
      case TAB_MEME:
        return <TabMeme />
      case TAB_TRENDING:
        return <TabMainstream parentTab={tab} />
      case TAB_NEW_COIN:
        return <TabNewCoin />
      case TAB_CLASSIFICATION:
        return <TabClassification />
      case TAB_WALLET_COPY:
        return <TabCopyTrade />
    }
  }

  return (
    <div className="flex flex-1 flex-col items-stretch w-full">
      <div id="sticky-line" className="sticky top-0 z-20 bg-[#141414]">
        <MovingLineTabs
          tabs={showTabs}
          disabledTabs={disabledTabs}
          defaultTab={currentTab}
          onTabChange={handleTabChange}
          widthMoveLine={38}
        />
      </div>
      <div className="w-full flex-1">{renderTabContent(currentTab)}</div>
    </div>
  )
}

export default ListCoin
