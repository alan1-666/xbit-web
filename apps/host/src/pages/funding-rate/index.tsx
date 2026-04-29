import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import RealTimeFundingRate from './component/real-time'
import MovingLineTabs from '@/components/common/MovingLineTabs'
import { useResponsive } from '@/hooks/useResponsive'
import { HistoricalFundingRate } from './component/historical'
import ComparisonFundingRate from './component/comparison'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { NewArrowLeftIcon } from '@/components/icon'
import HeaderWithBack from '@/components/header/HeaderWithBack'

const FundingRatePage = () => {
  const { isDesktop } = useResponsive()
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()

  const TABS = [
    {
      key: 'realtime',
      value: 'realtime',
      label: t('fundingRate.title.realtime'),
    },
    {
      key: 'historical',
      value: 'historical',
      label: t('fundingRate.title.historical'),
    },
    {
      key: 'comparison',
      value: 'comparison',
      label: t('fundingRate.title.comparison'),
    },
  ]

  const [selectedTab, setSelectedTab] = useState(() => {
    const tabFromUrl = searchParams.get('tab')
    return tabFromUrl && TABS.some(t => t.value === tabFromUrl) ? tabFromUrl : 'realtime'
  })
  const [refreshTick, setRefreshTick] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab)
    const newParams = new URLSearchParams(searchParams)
    newParams.set('tab', tab)
    // Keep symbol in URL so it's preserved when switching back to historical
    setSearchParams(newParams, { replace: true })
  }

  const handleRefresh = () => {
    if (isSpinning) return
    setIsSpinning(true)
    setRefreshTick((prev) => prev + 1)
  }
  return (
    <div
      className={cn('@container mx-auto px-0 xl:px-30 mb-12 relative', {
        '': !isDesktop,
      })}
    >
      {!isDesktop && (
        <HeaderWithBack
          title={t('fundingRate.title.header')}
          customIconLeft={<NewArrowLeftIcon className="stroke-white" />}
          className={cn('justify-center bg-transparent top-0 left-0 right-0  mx-auto h-11 py-2.5')}
          titleClassName="ml-0"
          backHref={location?.state?.root}
        />
      )}
      <div
        className={cn('text-[30px] font-semibold leading-none tracking-[0.4px]', {
          'px-4 mt-6 pb-2': !isDesktop,
          'mt-9 pb-5': isDesktop,
        })}
      >
        {t('fundingRate.title.header')}
      </div>
      <div
        className={cn('', {
          'h-full': !isDesktop,
        })}
      >
        {/* Tabs */}
        {!isDesktop ? (
          <MovingLineTabs
            tabs={TABS}
            defaultTab={selectedTab}
            onTabChange={handleTabChange}
            containerClassName="after:hidden w-full linear-gradien-border-buttom rounded-t-[8px] bg-inherit z-1 relative"
            tabsClassName="w-full"
            wrapperClassName="z-1 pl-1.5 sticky top-0 left-0 z-5 bg-[#0a0a0a]"
            itemClassName="px-3.5 text-[14px] font-[400]"
            itemClassNameActive="!text-[14px] !font-[500]"
            tabsListClassName="px-0"
          />
        ) : (
          <div className="flex items-center justify-between">
            <Tabs value={selectedTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="bg-[#27272A] p-1 h-auto rounded-[6px]">
                {TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.key}
                    value={tab.value}
                    className={cn(
                      'px-3 py-1.5 rounded-[6px] transition-all duration-200 text-[#A9A9B3] hover:text-white',
                      {
                        'bg-[#121214] !text-[#FBFBFB]': selectedTab === tab.value,
                      },
                    )}
                  >
                    <p className="text-[16px] font-medium leading-tight">{tab.label}</p>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <img
              src="/images/nodeAgent/rotate-left.svg"
              className={cn('w-[20] h-[20] origin-center cursor-pointer', isSpinning && 'animate-spin')}
              alt="rotate-left"
              onClick={handleRefresh}
            />
          </div>
        )}
        <div>
          {/* className='max-h-[calc(100vh)] overflow-y-auto' */}
          {selectedTab === 'realtime' && (
            <RealTimeFundingRate refreshTick={refreshTick} onRefetchDone={() => setIsSpinning(false)} />
          )}
          {selectedTab === 'historical' && (
            <HistoricalFundingRate refreshTick={refreshTick} onRefetchDone={() => setIsSpinning(false)} />
          )}
          {selectedTab === 'comparison' && (
            <ComparisonFundingRate refreshTick={refreshTick} onRefetchDone={() => setIsSpinning(false)} />
          )}
        </div>
        {/* <FundingRateChart />
        <FundingRateTable /> */}
      </div>
    </div>
  )
}

export default FundingRatePage
