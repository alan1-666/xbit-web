import { AssetOverviewContext } from '@/components/assets/overview/AssetOverviewContext.tsx'
import Loader from '@/components/common/Loader'
import IconClock from '@/components/icon/stroke/IconClock.tsx'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useResponsive } from '@/hooks/useResponsive'
import { APP_PATH } from '@/lib/constant'
import { formatBalance } from '@/lib/format'
import { NAVIGATIONS } from '@/lib/navigations'
import { DepositDialog } from '@/modules/prediction/components/home/DepositDialog.tsx'
import { ClaimWinnings } from '@/modules/prediction/components/portfolio/ClaimWinnings'
import { PortfolioContent } from '@/modules/prediction/components/portfolio/PortfolioContent'
import { PortfolioOverview } from '@/modules/prediction/components/portfolio/PortfolioOverview'
import { PredictionHeader } from '@/modules/prediction/components/portfolio/PredictionHeader'
import { PortfolioProvider } from '@/modules/prediction/context/PortfolioContext'
import { useClaimablePositions } from '@/modules/prediction/hooks/useClaimablePositions'
import { useMyBalance } from '@/modules/prediction/hooks/useMyBalance.ts'
import SelectHistory from '@components/assets/history/SelectHistory.tsx'
import { useNavigateWithLocation } from '@hooks/useNavigateWithLocation.ts'
import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

export const PredictionAsset = () => {
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()
  const navigate = useNavigateWithLocation()

  const { hideBalance, toggleHideBalance } = useContext(AssetOverviewContext)
  const { totalBalance, usdcBalance, totalPositionValue, isLoading } = useMyBalance()
  const { data: claimableData } = useClaimablePositions()

  const [openDeposit, setOpenDeposit] = useState(false)
  const [openSelectHistory, setOpenSelectHistory] = useState(false)

  const toggle = () => {
    toggleHideBalance(!hideBalance)
  }

  const handleDeposit = () => {
    if (isDesktop) {
      setOpenDeposit(true)
    } else {
      navigate(NAVIGATIONS.prediction.deposit())
    }
  }

  const handleWithdraw = () => {
    navigate(APP_PATH.PREDICTION_WITHDRAW)
  }

  const renderMobileAccountList = () => {
    return (
      <>
        {/* Account Details Section matching Overview UI */}
        <div className="mt-5 pt-3 flex-1 bg-[#0A0A0A] rounded-t-2xl">
          <div className="px-4">
            <ClaimWinnings data={claimableData} />
          </div>
          <div className="sticky top-0 z-20 bg-[#0A0A0A] px-4 py-1 flex items-center justify-between">
            <div className="font-medium text-[18px] text-white">{t('assets.perps.positions')}</div>
            <IconClock
              className="size-4 text-[#908E98] hover:text-white cursor-pointer"
              onClick={() => {
                setOpenSelectHistory(true)
              }}
            />
          </div>

          <div className="mt-3.75 px-4 space-y-2 pb-[80px]">
            {/* Position Value */}
            <div className="rounded-[10px] p-3.5 bg-[#212127] flex items-center justify-between h-18">
              <div className="font-normal text-sm leading-5.5 text-[#908E98]">
                {t('prediction.asset.positionValue')}
              </div>
              <div className="text-[16px] leading-4 font-semibold text-white">
                {isLoading ? (
                  <Loader />
                ) : hideBalance ? (
                  '******'
                ) : (
                  formatBalance(totalPositionValue || 0, {
                    showCurrency: true,
                    roundMode: 'floor',
                  })
                )}
              </div>
            </div>

            {/* Balance */}
            <div className="rounded-[10px] p-3.5 bg-[#212127] flex items-center justify-between h-18">
              <div className="font-normal text-sm leading-5.5 text-[#908E98]">
                {t('futuresAsset.labels.availableBalance')}
              </div>
              <div className="text-[16px] leading-4 font-semibold text-white">
                {isLoading ? (
                  <Loader />
                ) : hideBalance ? (
                  '******'
                ) : (
                  formatBalance(usdcBalance || 0, {
                    showCurrency: true,
                    roundMode: 'floor',
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  const renderDesktopView = () => {
    return (
      <PortfolioProvider>
        <div className="flex h-full flex-col gap-4">
          <PortfolioOverview />
          <div className="flex-1 overflow-hidden">
            <PortfolioContent />
          </div>
        </div>
      </PortfolioProvider>
    )
  }

  return (
    <TooltipProvider>
      <div className="h-full">
        {/* Mobile View */}
        <div className="xl:hidden">
          <PredictionHeader
            changeAmount={0}
            changePercent={0}
            totalBalance={totalBalance}
            usdcBalance={usdcBalance}
            isPending={isLoading}
            hideBalance={hideBalance}
            onToggleBalance={toggle}
            onDeposit={handleDeposit}
            onWithdraw={handleWithdraw}
            t={t}
          />
          {!isDesktop && renderMobileAccountList()}
        </div>
        {/* PC View */}
        {isDesktop && <div className="">{renderDesktopView()}</div>}
        {/* Dialogs */}
        <DepositDialog open={openDeposit} onOpenChange={setOpenDeposit} />
        <SelectHistory
          open={openSelectHistory}
          onSelected={(type) => {
            if (type === 'assetHistory') {
              navigate(APP_PATH.ASSET_HISTORY + '?page=prediction')
            } else if (type === 'tradeHistory') {
              navigate(APP_PATH.PREDICTION_PORTFOLIO + '?page=prediction')
            }
          }}
          setOpen={setOpenSelectHistory}
        />
      </div>
    </TooltipProvider>
  )
}
