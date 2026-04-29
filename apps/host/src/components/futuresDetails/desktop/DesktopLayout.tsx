import React, { useMemo, useEffect, useRef } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { useGridLayout } from '@/hooks/useGridLayout'
import { cn } from '@/lib/utils'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import '@/styles/grid-layout.css'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { setSymbolListCtxs } from '@/redux/modules/futuresMeta.slice'
import { futuresUserInfoActions } from '@/redux/modules/futuresUserInfo.slice'
import { MIN_AVAILABLE } from '@/components/futuresDetails/trade/index.tsx'
import { useSelector } from 'react-redux'
import { _walletDex } from '@/redux/modules/newWallet.slice'
import { useActiveAssetData } from '@/hooks/hyperliquid/useActiveAssetData'
import { updateUserFunding } from '@/redux/modules/futuresUserInfo.slice'
import { updatePositionsFromWebData2, UserPositionState } from '@/redux/modules/userPosition.Slice'
import { useWebData2 } from '@/hooks/hyperliquid/useWebData2'

const ResponsiveGridLayout = WidthProvider(Responsive)

interface DesktopLayoutProps {
  baseCoin: string
  children: {
    header: React.ReactNode
    chart: React.ReactNode
    tradingPanel: React.ReactNode
    orderbook: React.ReactNode
    positions: React.ReactNode
    accountInfo: React.ReactNode
  }
}

const DesktopLayout: React.FC<DesktopLayoutProps> = ({ baseCoin, children }) => {
  const { layouts, onLayoutChange, isDragging, resetKey } = useGridLayout(
    `futures-grid-layout`,
  )
  const dispatch = useAppDispatch()
  const {
    positions,
    symbolListCtxs,
    webData2: { clearinghouseState },
    withdrawable,
  } = useWebData2()
  const isDeposit = useAppSelector((state: any) => state.futuresUserInfo?.isDeposit || false)
  const walletDex = useSelector(_walletDex)
  const { activeAssetData } = useActiveAssetData(baseCoin, walletDex.walletAddress)

  const { positions: positionsRedux } = useAppSelector<RootState, UserPositionState>((state) => state.userPosition)

  useEffect(() => {
    dispatch(setSymbolListCtxs(symbolListCtxs))
  }, [symbolListCtxs, dispatch])

  useEffect(() => {
    const available = activeAssetData?.availableToTrade
    const minAvailable = Math.min(Number(available?.[0] || 0), Number(available?.[1] || 0))
    if (minAvailable >= MIN_AVAILABLE && !isDeposit) {
      dispatch(futuresUserInfoActions.updateDepositStatus(true))
    }
    dispatch(updateUserFunding({ available: available, withdrawable: withdrawable }))
  }, [activeAssetData, dispatch, withdrawable, isDeposit])

  useEffect(() => {
    if (clearinghouseState && positions.length !== positionsRedux.length) {
      dispatch(updatePositionsFromWebData2(positions))
    }
  }, [positions, clearinghouseState])

  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }
  const cols = { lg: 30, md: 24, sm: 20, xs: 16, xxs: 12 }
  const idPrefix = 'PC_FUTURES'

  const gridItems = useMemo(
    () => [
      {
        key: 'header',
        content: children.header,
        className: 'bg-[#121214] header-dex-react-grid-layout',
      },
      {
        key: 'chart',
        content: children.chart,
        className: 'rounded-none overflow-hidden header-dex-react-grid-layout bg-[#121214]',
      },
      {
        key: 'trading-panel',
        content: children.tradingPanel,
        className: 'rounded-none overflow-hidden header-dex-react-grid-layout bg-[#121214]',
      },
      {
        key: 'account-info',
        content: children.accountInfo,
        className: 'rounded-none overflow-hidden header-dex-react-grid-layout bg-[#121214]',
      },
      {
        key: 'orderbook',
        content: children.orderbook,
        className: 'bg-[#121214] rounded-none overflow-hidden header-dex-react-grid-layout',
      },
      {
        key: 'positions',
        content: children.positions,
        className: 'bg-[#121214] rounded-none overflow-hidden header-dex-react-grid-layout',
      },
    ],
    [children],
  )

  const handleCloseGridItem = (key: string) => {
    const element = document.getElementById(`${idPrefix}_${key}`);

    if (element && element?.parentNode) {
      // element.parentNode.removeChild(element);
      element.style.display = 'none';

    }
  }
  const containerRef = useRef(null)
  const rowHeight = useMemo(() => {
    if (!containerRef.current) return 25
    return Math.round((containerRef?.current as HTMLElement)?.offsetHeight / 35)
  }, [containerRef.current])
  return (
    <div className="w-full overflow-y-scroll h-[100vh] bg-[#121214]">
      {/* 网格布局容器 */}
      <div className="h-[calc(100vh-30px)] relative overflow-y-scroll futures-desktop-grid" ref={containerRef}>
        <ResponsiveGridLayout
          key={resetKey}
          className="layout bg-[#0A0A0A] pt-[4px]"
          layouts={layouts}   
          breakpoints={breakpoints}
          cols={cols}
          rowHeight={rowHeight}
          // rowHeight={25}
          onLayoutChange={onLayoutChange}
          isDraggable={true}
          // moved={true}
          isResizable={true}
          margin={[4, 4]}
          containerPadding={[0, 0]}
          useCSSTransforms={true}
          // 只允许通过拖拽图标进行拖拽
          draggableHandle=".drag-handle"
          // 降低拖拽敏感度，减少颤抖
          transformScale={1}
        >
          {gridItems.map(({ key, content, className }) => {

            return (
              <div
                key={key}
                id={`${idPrefix}_${key}`}
                className={cn(
                  'relative transition-all duration-200 group',
                  className,
                  isDragging && 'shadow-lg shadow-blue-500/20',
                )}
              >
                {/* 内容区域 */}
                <div className="w-full h-full">
                  {content}
                </div>

                <div className="absolute top-1  right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" onClick={() => { handleCloseGridItem(key)}}>
                  <div className="cursor-pointer pointer-events-auto transition-colors">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.91797 2.91699L11.0841 11.0831" stroke="#9B9B9B" stroke-width="1.05" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M2.91689 11.0831L11.083 2.91699" stroke="#9B9B9B" stroke-width="1.05" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
                
                {/* 拖拽图标 - 只在hover时显示，位于模块顶部中心 */}
                <div className="drag-handle absolute top-0 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="cursor-move pointer-events-auto transition-colors">
                  <svg width="11" height="9" viewBox="0 0 11 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="1" cy="3" r="1" fill="#6C6A74" />
                      <circle cx="4" cy="3" r="1" fill="#6C6A74" />
                      <circle cx="7" cy="3" r="1" fill="#6C6A74" />
                      <circle cx="10" cy="3" r="1" fill="#6C6A74" />
                      <circle cx="1" cy="6" r="1" fill="#6C6A74" />
                      <circle cx="4" cy="6" r="1" fill="#6C6A74" />
                      <circle cx="7" cy="6" r="1" fill="#6C6A74" />
                      <circle cx="10" cy="6" r="1" fill="#6C6A74" />
                      </svg>

                  </div>
                </div>
              </div>
            )
          })}
        </ResponsiveGridLayout>
      </div>
    </div>
  )
}

export default DesktopLayout
