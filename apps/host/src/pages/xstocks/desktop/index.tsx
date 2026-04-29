import { TokenDetail } from '@/@generated/gql/graphql-future'
import MovingLineTabs from '@/components/common/MovingLineTabs'
import { TradeSettingsButton } from '@/components/v2/desktop/TradeSettingsButton'
import { SwitchWalletFormTrade } from '@/pages/detail/orderForm/desktop/component/wallet/SwitchWalletFormTrade'
import { homeActions } from '@/redux/modules/home.slice'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useAppDispatch } from '@/redux/store'
import { TimeframeOption } from '@components/discover/TimeframeSelector.tsx'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { TabPopularPC } from './components/TabPopularPC'
import { TabVolumePC } from './components/TabVolumePC'
import { TabGainersPC } from './components/TabGainersPC'
import { TabWatchlistPC } from './components/TabWatchlistPC'
import { TabLosersPC } from './components/TabLosersPC'
import QuickBuy from '@/components/discover/QuickBuy'
import { IconFlash2 } from '@components/icon/stroke/IconFlash2.tsx'

const getInitialTab = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const page = urlParams.get('page')
  return page || 'popular'
}

const XStocksTabContent = ({ currentTab, timeframe }: { currentTab: string; timeframe: TimeframeOption }) => {
  if (currentTab === 'watchlist') {
    return <TabWatchlistPC timeframe={timeframe} />
  }
  if (currentTab === 'gainers') {
    return <TabGainersPC timeframe={timeframe} />
  }
  if (currentTab === 'losers') {
    return <TabLosersPC timeframe={timeframe} />
  }
  if (currentTab === 'volume') {
    return <TabVolumePC timeframe={timeframe} />
  }
  return <TabPopularPC timeframe={timeframe} />
}

const XStocksDesktopPage = () => {
  const [currentTab, setCurrentTab] = useState<string>(() => getInitialTab())
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeWallet = useSelector(_activeWallet)

  const tabs = useMemo(() => {
    return [
      { value: 'watchlist', label: t('xstocks.tabs.watchlist') },
      { value: 'popular', label: t('xstocks.tabs.popular') },
      { value: 'gainers', label: t('xstocks.tabs.gainers') },
      { value: 'losers', label: t('xstocks.tabs.losers') },
      { value: 'volume', label: t('xstocks.tabs.volume') },
    ]
  }, [t])

  useEffect(() => {
    const page = searchParams.get('page') || 'meme'
    setCurrentTab(page)
  }, [searchParams.get('page')])

  useEffect(() => {
    dispatch(homeActions.setXStockTab(currentTab))
  }, [currentTab, dispatch])

  useEffect(() => {
    searchParams.set('page', currentTab)
    setSearchParams(searchParams)
  }, [currentTab])

  return (
    <div className="pt-2">
      <div className="w-full flex justify-between items-center border-b border-[#ECECED0A] py-2">
        <MovingLineTabs
          tabs={tabs}
          defaultTab={currentTab}
          onTabChange={setCurrentTab}
          containerClassName="bg-transparent justify-start after:hidden after:h-0 after:w-0 w-full"
          tabsListClassName="justify-start w-full"
        />
        <div className="pr-4 flex gap-3 items-center">
          <QuickBuy
            presetSelectType="list"
            className="rounded-full h-[26px] border-none bg-[#212127] "
            icon={<IconFlash2 className="text-[#FBFBFB]" />}
            showUnitIcon={true}
          />
          <TradeSettingsButton />
          {activeWallet?.isConnected && <SwitchWalletFormTrade tokenDetail={{} as TokenDetail} screen="home" />}
        </div>
      </div>
      <div className="px-4 py-2">
        <XStocksTabContent currentTab={currentTab} timeframe="24h" />
      </div>
    </div>
  )
}

export default XStocksDesktopPage
