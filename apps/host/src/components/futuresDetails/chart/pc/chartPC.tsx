import ChartHead, { Interval } from '../ChartHeadPC'
import Tv from './TvPC'
import { memo, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn, getDecimalPlaces } from '@/lib/utils'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { TradingViewChartTypeItem, tradingviewChartTypeList } from '@/datafeeds/resolution-map'
import { xPositions, xOpenOrders } from '../../trade/types'
import { intervalMap } from '../../datafeeds'
import { chartActions } from '@/redux/modules/chart.slice'
import TradingViewWidget from '@/components/chart/TradingViewWidget'
import { selectTiersBySymbol } from '@/redux/modules/futuresMeta.slice'
import ls from '@/lib/local-storage.ts'

interface ChartProps {
  disabledExpand?: boolean
  baseCoin: string
  positions?: xPositions[]
  openOrders?: xOpenOrders[]
}

const Chart = memo(({ baseCoin, disabledExpand = false, positions, openOrders }: ChartProps) => {
  // 价格精度使用 OrderBook 的默认初始精度（tiers 的第一个值），不随 OrderBook 精度切换而变化
  const tiers = useAppSelector(selectTiersBySymbol(baseCoin)) || []
  const defaultTick = tiers[0]?.tick
  const tokenAccuracy = defaultTick
  const pricePrecision = tokenAccuracy ? getDecimalPlaces(tokenAccuracy) : 2
  const isExpandKline = useAppSelector((state) => (state.futuresTradePreferences as any)?.preferences?.isExpandKline ?? false)
  const dispatch = useAppDispatch()
  const [isInternalFullscreen, setIsInternalFullscreen] = useState<boolean>(false)
  const defaultChartTypeList = tradingviewChartTypeList
  const [showChartTypeList, setShowChartTypeList] = useState<TradingViewChartTypeItem[]>(defaultChartTypeList)
  const [currentChartType, setCurrentChartType] = useState<number>(showChartTypeList[1].value)

  const currentInterval = ls.get('futuresIntervalMapList') || intervalMap
  const [showIntervalMapList, setShowIntervalMapList] = useState<Interval[]>(currentInterval)

  const tvChartRef = useRef<any>(null)

  const handleShowPeriodListChange = (value: Interval[]) => {
    ls.set('futuresIntervalMapList', value)
    setShowIntervalMapList(value)
  }

  const handleChartTypeChange = (value: number) => {
    setCurrentChartType(value)
    dispatch(chartActions.updateChartType(value))
    // 保持完整的图表类型列表（6个），不根据选择进行过滤
    setShowChartTypeList(defaultChartTypeList)
  }


  const handleSettingClick = () => {
    tvChartRef?.current?.tvSetting()
  }

  const [filterPosition, setFilterPostion] = useState<xPositions | null>(null)

  useEffect(() => {
    if (positions && positions.length > 0) {
      const filtered = positions.filter(p => p.coin === baseCoin)
      if (filtered.length > 0) {
        setFilterPostion(filtered[0])
      } else {
        setFilterPostion(null)
      }
    } else {
      setFilterPostion(null)
    }
  }, [positions])

  // 进入/退出页面内全屏时：锁定滚动并触发resize，让TV自适应
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    if (isInternalFullscreen) {
      document.body.style.overflow = 'hidden'
      try { window.dispatchEvent(new Event('resize')) } catch {}
    } else {
      try { window.dispatchEvent(new Event('resize')) } catch {}
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsInternalFullscreen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [isInternalFullscreen])
  const env = import.meta.env.VITE_STAGE
  return (
    <div
      className={cn('transition-all w-full', !disabledExpand || isExpandKline ? 'bg-none mb-[10px]' : 'bg-[#1D2324]')}
    >
      <div
        className={cn('relative transition-all duration-500 ease-in-out w-full h-full min-h-0 flex flex-col')}
      >
        {env === '' ? (
          <TradingViewWidget />
        ) : (
          <>
            <ChartHead
              onChartTypeChange={handleChartTypeChange}
              chartTypeList={showChartTypeList}
              defaultChartType={currentChartType}
              onSettingClick={handleSettingClick}
              showPeriodList={showIntervalMapList}
              onShowPeriodListChange={handleShowPeriodListChange}
              // 新增：页面内全屏控制
              isInternalFullscreen={isInternalFullscreen}
              onToggleInternalFullscreen={() => {
                setIsInternalFullscreen((prev) => !prev)
              }}
            />
            <div className="flex-1 min-h-0">
              <Tv
                ref={tvChartRef}
                pairName={baseCoin}
                candleType={currentChartType}
                percision={pricePrecision}
                xPosition={filterPosition}
                openOrders={openOrders}
                isWebview={false}
                periodWebview={''}
              />
            </div>
          </>
        )}
      </div>

      {isInternalFullscreen && createPortal(
        (
          <div
            className="fixed inset-0 z-[9999] bg-[#0B0D10] flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex-shrink-0">
              <ChartHead
                onChartTypeChange={handleChartTypeChange}
                chartTypeList={showChartTypeList}
                defaultChartType={currentChartType}
                onSettingClick={handleSettingClick}
                showPeriodList={showIntervalMapList}
                onShowPeriodListChange={handleShowPeriodListChange}
                isInternalFullscreen={isInternalFullscreen}
                onToggleInternalFullscreen={() => {
                  setIsInternalFullscreen(false)
                }}
              />
            </div>
            <div className="flex-1 min-h-0">
              <Tv
                ref={tvChartRef}
                pairName={baseCoin}
                candleType={currentChartType}
                percision={pricePrecision}
                xPosition={filterPosition}
                isWebview={false}
                periodWebview={''}
              />
            </div>
          </div>
        ),
        document.body
      )}
    </div>
  )
})
export default Chart