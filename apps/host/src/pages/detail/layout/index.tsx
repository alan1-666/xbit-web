import React, { useEffect, useMemo, useRef } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { useGridLayout } from './useGridLayout'
import { cn } from '@/lib/utils'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import './index.css'
import eventBus from '@/lib/eventBus'
import ls from '@/lib/local-storage'
const ResponsiveGridLayout = WidthProvider(Responsive)

interface DesktopLayoutProps {
  baseCoin: string
  tradesPanelPosition: 'side' | 'bottom'
  children: {
    header: React.ReactNode
    tradingCore: React.ReactNode
    tradingPanel: React.ReactNode
    // chart: React.ReactNode
    // orderbook: React.ReactNode
    // positions: React.ReactNode
  }
}

export const EVENT_MESSAGE_CHANGE_LAYOUT = 'EVENT_MESSAGE_CHANGE_LAYOUT'
const DesktopLayout: React.FC<DesktopLayoutProps> = ({ baseCoin, tradesPanelPosition, children }) => {
  const { fullLayouts, isDragging, onLayoutChange, resetLayout, onDragStart, onDragStop } =
    useGridLayout('tab-meme-layout')

  useEffect(() => {
    if (ls.get('new-list-meme-grid-layout')) {
      ls.remove('new-list-meme-grid-layout')
    }
    if (ls.get('trade-meme-grid-layout')) {
      ls.remove('trade-meme-grid-layout')
    }
    if (ls.get('trade-meme-grid-layout-1')) {
      ls.remove('trade-meme-grid-layout-1')
    }
  }, [])

  const breakpoints = { lg: 1440, md: 1200, sm: 768, xs: 480, xxs: 0 }
  const cols = { lg: 24, md: 24, sm: 20, xs: 16, xxs: 12 }
  const gridItems = useMemo(
    () => [
      {
        key: 'header',
        content: children.header,
        className: 'border border-[#1a1a1a]',
      },
      // {
      //   key: 'chart',
      //   content: children.chart,
      //   className: 'rounded-none overflow-hidden',
      // },
      {
        key: 'trading-panel',
        content: children.tradingPanel,
        className: 'rounded-none overflow-hidden',
      },
      // {
      //   key: 'orderbook',
      //   content: children.orderbook,
      //   className: 'border border-[#1a1a1a] rounded-none overflow-hidden',
      // },
      // ...(tradesPanelPosition === 'bottom'
      //   ? [
      //       {
      //         key: 'orderbook',
      //         content: children.orderbook,
      //         className: 'border border-[#1a1a1a] rounded-none overflow-hidden',
      //       },
      //     ]
      //   : []),
      // {
      //   key: 'positions',
      //   content: children.positions,
      //   className: 'border border-[#1a1a1a] rounded-none overflow-hidden',
      // },
      {
        key: 'trading-core',
        content: children.tradingCore,
        className: 'rounded-none overflow-hidden',
      },
    ],
    [children],
  )

  useEffect(() => {
    eventBus.on(EVENT_MESSAGE_CHANGE_LAYOUT, (data: any) => {
      if (data?.data === 'reset') {
        resetLayout()
      }
    })
    return () => {
      eventBus.remove(EVENT_MESSAGE_CHANGE_LAYOUT)
    }
  }, [])

  const containerRef = useRef(null)
  const rowHeight = useMemo(() => {
    if (!containerRef.current) return 24
    return Math.round((containerRef?.current?.offsetHeight - 30) / 24)
    // return 24
  }, [containerRef.current])

  return (
    <div className=" h-full w-full overflow-y-hidden overflow-x-hidden bg-[#121214] no-scrollbar">
      {/* 网格布局容器 */}
      <div
        className="h-full relative overflow-y-hidden no-scrollbar"
        ref={containerRef}
        style={{ minWidth: window.innerWidth }}
      >
        <ResponsiveGridLayout
          className="layout"
          resizeHandles={['se', 'sw', 'ne', 'nw']}
          // layouts={test}
          layouts={fullLayouts}
          breakpoints={breakpoints}
          cols={cols}
          rowHeight={rowHeight}
          onLayoutChange={onLayoutChange}
          // measureBeforeMount={true}
          onDragStart={onDragStart}
          onDragStop={onDragStop}
          isDraggable={true}
          isResizable={true}
          margin={[1, 1]}
          containerPadding={[0, 0]}
          useCSSTransforms={true}
          draggableHandle=".drag-handle"
          draggableCancel={`input,textarea,button,select,a,canvas,[data-no-drag="true"],.no-drag`}
          onBreakpointChange={(bp) => console.log('Current breakpoint:', bp)}
        >
          {/* {gridItems.map(({ key, content, className }) => (
            <div
              key={key}
              className={cn(
                'relative transition-all duration-200',
                className,
                isDragging && 'shadow-lg shadow-blue-500/20',
              )}
            >
              <div className="drag-handle grid grid-cols-4 gap-0.5 absolute left-1/2 translate-x-[-50%] top-1 cursor-grab active:cursor-grabbing z-100">
                {[...Array(8)].map((_, index) => (
                  <div className="h-0.5 w-0.5 rounded-full bg-[#c6c3c3]" key={index}></div>
                ))}
              </div>
              <div className="w-full h-full">{content}</div>
            </div>
          ))} */}
          {gridItems.map(({ key, content, className }) => {
            // if (key === 'orderbook' && tradesPanelPosition !== 'bottom') {
            //   return null
            // }
            return (
              <div
                key={key}
                className={cn(
                  'drag-container relative transition-all duration-200',
                  className,
                  isDragging && 'shadow-lg shadow-blue-500/20',
                )}
              >
                {key !== 'orderbook' && (
                  <div className="btn-drop-layout drag-handle absolute top-1 left-1/2 z-100 h-[20px] w-[20px] translate-x-[-50%] cursor-grab opacity-0 hover:opacity-100 active:cursor-grabbing">
                    <div className="mx-auto grid w-fit grid-cols-4 gap-0.5">
                      {[...Array(8)].map((_, index) => (
                        <div className="h-0.5 w-0.5 rounded-full bg-[#c6c3c3]" key={index}></div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="h-full w-full">{content}</div>
              </div>
            )
          })}
        </ResponsiveGridLayout>
      </div>
    </div>
  )
}

export default DesktopLayout
