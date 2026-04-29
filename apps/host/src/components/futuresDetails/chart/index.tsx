import ChartHead, { Interval } from './ChartHead'
import Tv from './Tv'
import { memo, useEffect, useRef, useState } from 'react'
import { cn, getDecimalPlaces } from '@/lib/utils'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { TradingViewChartTypeItem, tradingviewChartTypeList } from '@/datafeeds/resolution-map'
import { xPositions, xOpenOrders } from '../trade/types'
import { intervalMap } from '../datafeeds'
import { chartActions } from '@/redux/modules/chart.slice'
import TradingViewWidget from '@/components/chart/TradingViewWidget'
import { selectTiersBySymbol } from '@/redux/modules/futuresMeta.slice'
import ls from '@/lib/local-storage.ts'

interface ChartProps {
  disabledExpand?: boolean
  baseCoin: string
  isTrendPage: boolean
  positions?: xPositions[]
  openOrders?: xOpenOrders[]
}

const FIXED_HEIGHT = 450

const Chart = memo(({ baseCoin, disabledExpand = false, isTrendPage = false, positions, openOrders }: ChartProps) => {
  const isExpandKline = useAppSelector((state) => (state.futuresTradePreferences as any)?.preferences?.isExpandKline ?? false)
  const dispatch = useAppDispatch()
  // 价格精度使用 OrderBook 的默认初始精度（tiers 的第一个值），不随 OrderBook 精度切换而变化
  const tiers = useAppSelector(selectTiersBySymbol(baseCoin)) || []
  const defaultTick = tiers[0]?.tick
  const tokenAccuracy = defaultTick
  const pricePrecision = tokenAccuracy ? getDecimalPlaces(tokenAccuracy) : 2

  const defaultChartTypeList = tradingviewChartTypeList.filter((item) => {
    return item.value === 1 || item.value === 2
  })
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
    if (value !== 2) {
      let newChartTypeList = tradingviewChartTypeList.filter((item) => {
        return item.value === value || item.value === 2
      })
      setShowChartTypeList(newChartTypeList)
    }
  }

  // NOTE: period 切换由 ChartHead 的 onShowPeriodListChange 处理


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


  const env = import.meta.env.VITE_STAGE
  return (
    <div
      className={cn('transition-all ', !disabledExpand || isExpandKline ? 'bg-none mb-[10px]' : 'bg-[#1D2324]')}
    >
      <div
        className={cn(
          'relative transition-all duration-500 ease-in-out',
          !disabledExpand || isExpandKline ? (isTrendPage ? 'min-h-[225px]' : 'max-h-[225px]') : 'max-h-0', isTrendPage ? '' : 'overflow-hidden'
        )}
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
              isTrendPage={isTrendPage}
              showPeriodList={showIntervalMapList}
              onShowPeriodListChange={handleShowPeriodListChange}
            />
            <Tv
              ref={tvChartRef}
              pairName={baseCoin}
              candleType={currentChartType}
              percision={pricePrecision}
              isTrendPage={isTrendPage}
              onChartReady={() => {}}
              xPosition={filterPosition}
              openOrders={openOrders}
              initHeight={window.innerHeight - FIXED_HEIGHT}
              isWebview={false}
              periodWebview={''}
            />
          </>
        )}
      </div>
    </div>
  )
})
export default Chart