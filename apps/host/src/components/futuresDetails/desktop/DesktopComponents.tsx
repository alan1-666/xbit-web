import React, { useState, useEffect, useCallback, useMemo } from 'react'
import OrderBook from '@/components/futuresDetails/trade/OrderBookPC'
import OrderBookControl from '@/components/futuresDetails/trade/OrderBookControl'
import DesktopOrderForm from '@/components/futuresDetails/desktop/DesktopOrderForm'
import { useTranslation } from 'react-i18next'
import ChartPC from '@/components/futuresDetails/chart/pc/chartPC'
import CoinDetailHeader from '@/components/futuresDetails/trend/CoinDetailHeader'
import { useWebData2 } from '@/hooks/hyperliquid/useWebData2'
import PriceDisplay from '@/components/futuresDetails/trend/order-book/OrderPercentBar'
import LatestTransaction from '@/components/futuresDetails/trend/latest-transaction/indexPC'
import EquityPannel from '@/components/futuresDetails/trade/EquityPannel'

export interface DesktopComponentsProps {
  baseCoin: string;
  isActive: boolean;
}

// 币种信息头部
export const CoinInfoHeader = ({ baseCoin }: { baseCoin: string }) => {
  
  return (
    <div className="flex items-center justify-between h-full">
      <CoinDetailHeader/>
    </div>
  );
};

// PC版图表组件
export const DesktopChart: React.FC<DesktopComponentsProps> = ({ baseCoin }) => {
  const { positions, openOrders } = useWebData2()
  
  return (
    <div className="w-full h-full">
      {/* 图表区域 */}
      <div className="flex relative h-full w-full">
        <ChartPC baseCoin={baseCoin} positions={positions} openOrders={openOrders}/>
      </div>
    </div>
  );
};

// PC版交易面板组件
export const DesktopTradingPanel: React.FC<DesktopComponentsProps> = ({
  baseCoin,
  isActive,
}) => {
  return (
    <div className="w-full h-full flex flex-col">
      {/* 交易表单区域 */}
      <div className="flex-1 p-3">
        <DesktopOrderForm baseCoin={baseCoin} containerClassName="w-full" />
      </div>
    </div>
  );
};
// pc版账户信息组件
export const DesktopAccountInfo = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 p-3">
        <EquityPannel />
      </div>
    </div>
  );
};  

// PC版订单簿组件
export const DesktopOrderbook: React.FC<DesktopComponentsProps> = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'orderbook' | 'latest'>('orderbook')
  return (
    <div className="w-full h-full flex flex-col">
      {/* 订单簿头部 */}
      <div className="p-3 border-b border-[#101114] flex items-center text-sm ">
        <div
          className={`flex flex-1 items-center justify-center cursor-pointer ${activeTab === 'orderbook' ? 'opacity-100 font-medium' : 'opacity-50'
            }`}
          onClick={() => setActiveTab('orderbook')}
        >
          {t('orderBook.title')}
        </div>
        <div
          className={`flex flex-1 items-center justify-center cursor-pointer ${activeTab === 'latest' ? 'opacity-100 font-medium' : 'opacity-50'
            }`}
          onClick={() => setActiveTab('latest')}
        >
          {t('futuresDetails.tabs.latestTransactions')}
        </div>
      </div>

      {/* 订单簿内容 */}
      {activeTab === 'orderbook' && (
        <div className="flex-1 flex flex-col justify-between p-2 text-xs">
          <OrderBookControl />
          <OrderBook containerHeight={476} className="mt-2 mb-[6px]" />
          <PriceDisplay />
        </div>
      )}

      {/* 最新成交 */}
      {activeTab === 'latest' && (
        <div className="flex-1 p-2 text-xs">
          <LatestTransaction isActive={true} scrollElement={null} />
        </div>
      )}
    </div>
  );
};

