import MovingLineTabs from '@/components/common/MovingLineTabs'
import { useResponsive } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils'
import { useClaimablePositions } from '@/modules/prediction/hooks/useClaimablePositions'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import ClearTimerPendingPosition from '../shared/ClearTimerPendingPosition'
import ClearTimerPendingClaims from '../shared/ClearTimerPendingClaims'
import { PortfolioPositionsTable } from '../shared/PortfolioPositionsTable'
import { UserTransactionsSubscription } from '../shared/UserTransactionsSubscription'
import { ClaimWinnings } from './ClaimWinnings'
import { PortfolioHistory } from './PortfolioHistory'
import { PortfolioOpenOrders } from './PortfolioOpenOrders'

export const PortfolioContent = () => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'positions'
  const { data: claimableData } = useClaimablePositions()
  const { isDesktop } = useResponsive()

  const handleTabChange = (tab: string) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      newParams.set('tab', tab)
      return newParams
    })
  }

  const tabs = [
    { value: 'positions', label: t('prediction.portfolio.tabs.positions') },
    { value: 'open_orders', label: t('prediction.portfolio.tabs.openOrders') },
    { value: 'history', label: t('prediction.portfolio.tabs.history') },
  ]

  return (
    <>
      <UserTransactionsSubscription />
      <ClearTimerPendingPosition />
      <ClearTimerPendingClaims />
      <div className="hidden xl:block">
        <ClaimWinnings data={claimableData} />
      </div>
      <div className="w-full xl:rounded-lg xl:border xl:bg-[#141418] xl:border-[#79778C29]">
        <div className="w-full">
          {/* Header Section */}
          <div className="sticky top-0 z-30 flex flex-col rounded-lg xl:bg-[#141418] xl:py-2 pb-2 bg-[#0a0a0a]">
            <div className="order-1 h-12 lg:h-auto lg:w-auto">
              <MovingLineTabs
                defaultTab={activeTab}
                onTabChange={handleTabChange}
                tabs={tabs}
                wrapperClassName="h-full"
                containerClassName="bg-transparent h-full justify-start items-center"
                itemClassName="text-sm font-medium text-gray-400 data-[state=active]:text-white hover:text-white transition-colors pb-0 pt-0 h-full content-center"
                itemClassNameActive="text-white "
                tabLineClassName={cn(isDesktop ? '' : 'before:h-[5px] before:rounded-t-[5px] before:bg-[#843BEA]')}
                // containerClassName="mt-1 justify-start bg-transparent after:hidden after:h-0 after:w-0"
              />
            </div>

            {/* <PortfolioToolbar activeTab={activeTab} /> */}
          </div>

          <div className="pt-2 xl:pt-0">
            {activeTab === 'positions' && <PortfolioPositionsTable headerCellClassName="pt-0" />}
            {activeTab === 'open_orders' && <PortfolioOpenOrders />}
            {activeTab === 'history' && <PortfolioHistory />}
          </div>
        </div>
      </div>
    </>
  )
}
