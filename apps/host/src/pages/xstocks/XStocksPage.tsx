import { useEffect, useMemo, useState } from 'react'
import { useAppDispatch } from '@/redux/store'
import { homeActions } from '@/redux/modules/home.slice.ts'
import { NewDiscoverHeader } from '@/components/discover/NewDiscoverHeader'
import MovingLineTabs from '@/components/common/MovingLineTabs'
import styles from '@/styles/discover.module.scss'
import { cn } from '@/lib/utils.ts'
import TabPopular from '@components/xstocks/tabs/TabPopular.tsx'
import TabGainers from '@components/xstocks/tabs/TabGainers.tsx'
import { TabLosers } from '@components/xstocks/tabs/TabLosers.tsx'
import TabVolume from '@components/xstocks/tabs/TabVolume.tsx'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { useXStockTokensByActiveChain } from '@components/xstocks/hooks/useXStockTokens.ts'
import { StockTokensContext } from '@/contexts/xstocks/StockTokensContext.ts'
import TabMarketCap from '@/components/xstocks/tabs/TabMarketCap'
import TabWatchList from '@/components/watchlistTab'

const getInitialTab = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const page = urlParams.get('page')
  return page || 'popular'
}

const XStocksTabContent = ({ currentTab }: { currentTab: string }) => {
  if (currentTab === 'watchlist') {
    return <TabWatchList />
  }
  if (currentTab === 'gainers') {
    return <TabGainers />
  }
  if (currentTab === 'losers') {
    return <TabLosers />
  }
  if (currentTab === 'volume') {
    return <TabVolume />
  }
  if (currentTab === 'marketCap') {
    return <TabMarketCap />
  }
  return <TabPopular />
}

const XStocksPage = () => {
  const [currentTab, setCurrentTab] = useState<string>(() => getInitialTab())
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { tokens, isLoading } = useXStockTokensByActiveChain()

  const tabs = useMemo(() => {
    return [
      { value: 'watchlist', label: t('xstocks.tabs.watchlist') },
      { value: 'popular', label: t('xstocks.tabs.popular') },
      { value: 'gainers', label: t('xstocks.tabs.gainers') },
      { value: 'losers', label: t('xstocks.tabs.losers') },
      { value: 'volume', label: t('xstocks.tabs.volume') },
      { value: 'marketCap', label: t('xstocks.tabs.marketCap') },
    ]
  }, [t])

  useEffect(() => {
    dispatch(homeActions.setXStockTab(currentTab))
  }, [currentTab, dispatch])

  useEffect(() => {
    searchParams.set('page', currentTab)
    setSearchParams(searchParams)
  }, [currentTab])

  const contextValue = useMemo(
    () => ({
      tokens,
      isLoading,
    }),
    [tokens, isLoading],
  )

  return (
    <div
      className={cn(
        '@container mx-auto mt-2 flex flex-col items-stretch -mb-20 min-h-[calc(100dvh-139px)] pb-[95px]',
        styles['discover'],
      )}
    >
      <NewDiscoverHeader />
      <div className="sticky top-0 bg-[#0A0A0A] z-10 pt-2 mt-2">
        <MovingLineTabs
          tabs={tabs}
          defaultTab={currentTab}
          onTabChange={setCurrentTab}
          containerClassName="bg-transparent justify-start after:hidden after:h-0 after:w-0 w-full"
          tabsListClassName="h-7 justify-start w-full"
          itemClassName="pl-[11px] pt-0 text-[#908E98]"
          labelClassName="text-[15px] leading-none font-normal tracking-[-0.3px]"
          labelActiveClassName="scale-100! font-semibold"
        />
        {/* <div className="w-full h-[0.5px] bg-[linear-gradient(90deg,#ECECED00_0%,#D3F5EC80_4%,#C6FAEBBF_50%,#BAFFEA80_96%,#86868700_100%)] opacity-10" /> */}
      </div>
      <StockTokensContext.Provider value={contextValue}>
        <XStocksTabContent currentTab={currentTab} />
      </StockTokensContext.Provider>
    </div>
  )
}

export default XStocksPage
