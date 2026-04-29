/* eslint-disable @typescript-eslint/ban-ts-comment */
import CheckboxWithLabel from '@/components/common/CheckboxWithLabel'
import MovingLineTabs from '@/components/common/MovingLineTabs'
import React, { memo, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { DesktopComponentsProps } from '../../desktop/DesktopComponents'
import { xOpenOrders } from '../../trade/types'
import CloseAllBtn from '../CloseAllBtn'
import { useTradingDashboardContext } from './context/TradingDashboardContext'
import DesktopBalance from './DesktopBalance'
import DesktopCurrentOrders from './DesktopCurrentOrders'
import DesktopEntrustedHistory from './DesktopEntrustedHistory'
import DesktopFundingHistory from './DesktopFundingHistory'
import DesktopHistoryOrder from './DesktopHistoryOrder'
import DesktopMyPositions from './DesktopMyPositions'
import DropdownDirection from './DropdownDirection'
import { IBalance } from './hooks/TableColumns/DesktopBalanceColumns'
import { KEY_ENUM, default as useTradingDashboard } from './hooks/useTradingDashboard'

const TradingDashboard: React.FC<DesktopComponentsProps> = ({ baseCoin }) => {
  const {
    currentListTabs,
    currentTab,
    handleChangeTab,
    handleMouseDown,
    positions,
    currentOpenOrders,
    loadingSocket,
    balanceData,
  } = useTradingDashboard()
  const { t } = useTranslation()

  const { showOnlyBaseCoin, setShowOnlyBaseCoin, setSide } = useTradingDashboardContext()
  const { handleClickCloseAll, handleCancelOrders, directionsOptions } = useTradingDashboard()

  useEffect(() => {
    setSide('All')
  }, [currentTab])

  const renderTab = useCallback(
    ({
      tab,
      loadingSocket,
    }: {
      tab: string
      loadingSocket: boolean
      balanceData: IBalance[]
      orders: xOpenOrders[]
    }) => {
      switch (tab) {
        case KEY_ENUM.BALANCE:
          return <DesktopBalance baseCoin={baseCoin} loadingSocket={loadingSocket} balanceData={balanceData} />

        case KEY_ENUM.POSITION:
          return (
            <DesktopMyPositions
              setCurrentTab={handleChangeTab}
              baseCoin={baseCoin}
              positions={positions}
              loadingSocket={loadingSocket}
            />
          )
        case KEY_ENUM.ORDER:
          return <DesktopCurrentOrders baseCoin={baseCoin} orders={currentOpenOrders} loadingSocket={loadingSocket} />

        case KEY_ENUM.HISTORY:
          return <DesktopHistoryOrder baseCoin={baseCoin} />

        case KEY_ENUM.FUNDING:
          return <DesktopFundingHistory baseCoin={baseCoin} />

        case KEY_ENUM.ENTRUSTED:
          return <DesktopEntrustedHistory baseCoin={baseCoin} />

        default:
          return <></>
      }
    },
    [baseCoin, loadingSocket, positions, currentOpenOrders, balanceData, currentTab],
  )


  return (
    <div className="w-full h-full flex flex-col">
      {/* The header can be dragged. */}
      <div className="relative flex justify-between border-b border-[#ECECED14] pr-2">
        <MovingLineTabs
          tabs={currentListTabs}
          onTabChange={handleChangeTab}
          defaultTab={currentTab}
          showContainerBottomLine={false}
          containerClassName="bg-[none] w-full"
          tabsClassName="w-full"
        />
        {currentTab !== KEY_ENUM.BALANCE && (
          <div className="flex gap-2 items-center">
            <CheckboxWithLabel
              label={t('currentOrdersList.showCurrentCoinOnly')}
              containerClassName="ml-4"
              checked={showOnlyBaseCoin}
              onChange={(checked) => setShowOnlyBaseCoin(checked ?? false)}
            />

            {currentTab === KEY_ENUM.POSITION && (
              <CloseAllBtn
                onClickCloseAll={handleClickCloseAll}
                disabled={!positions || positions.length === 0}
                title={t('futuresDetails.common.closeAll')}
                cancelAllConfirm={t('futuresDetails.common.closeAllConfirm')}
              />
            )}
            {currentTab === KEY_ENUM.ORDER && (
              <CloseAllBtn
                onClickCloseAll={() => handleCancelOrders(currentOpenOrders)}
                disabled={!currentOpenOrders || currentOpenOrders.length === 0}
                title={t('futuresDetails.tips.cancelAllOrders')}
                cancelAllConfirm={t('futuresDetails.tips.cancelAllOrdersConfirm')}
              />
            )}

            <DropdownDirection
              directionsOptionsProps={currentTab === KEY_ENUM.HISTORY ? directionsOptions : undefined}
            />
          </div>
        )}
      </div>
      {/* Interactive content - prevent drag */}
      <div
        className="flex-1 overflow-hidden pb-[8px]"
        onMouseDown={handleMouseDown}
        //@ts-ignore
        onTouchStart={handleMouseDown}
      >
        {renderTab({
          tab: currentTab,
          loadingSocket,
          orders: currentOpenOrders,
          balanceData,
        })}
      </div>
    </div>
  )
}

export default memo(TradingDashboard, (prevProps, nextProps) => prevProps.baseCoin === nextProps.baseCoin)
