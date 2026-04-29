// import TvChart from '@/components/chart/TvChart'
import Tv, { getFuturesChartConfig, saveFuturesChartConfig } from '@/components/futuresDetails/chart/Tv'
import { FuturesChartConfig, xPositions } from '@/components/futuresDetails/trade/types'
import { useEffect, useMemo, useRef, useState } from 'react'
import { notifyChartReady, notifyParamReceived } from './klineChannel'

// token:
// period:
// 1,3,5,15,30,60,120,240,480,720,1D,3D,1W,1M
// chartType:
// 0: Bars
// 1: Candles
// 2: Line
// 3: Area
// 8: Heikin Ashi
// 9: Hollow candles
// xPositions 持仓数据
// isTrendPage 是否是趋势图

const DEFAULT_PERIOD = '1'
const DEFAULT_CANDLE_TYPE = 1
// const DEFAULT_OLHC_TYPE = 'price'
// const DEFAUTL_CHART_COLOR = 'normal'

const CHART_CONFIG_KEY = 'futures_chart_config'

const FuturesChart = () => {
  const chartConfig = useMemo(() => getFuturesChartConfig(CHART_CONFIG_KEY), [])

  const tvChartRef = useRef<any>(null)
  const [baseCoin, setBaseCoin] = useState<string>('') //币种
  const [period, setPeriod] = useState<string>(chartConfig?.period || DEFAULT_PERIOD) // k线时间
  const [chartType, setChartType] = useState<number>(chartConfig?.chartType ?? DEFAULT_CANDLE_TYPE) // 图表类型
  const [xPositions, setXPositions] = useState<xPositions>({} as xPositions) // 持仓数据
  // const [isTrendPage, setIsTrendPage] = useState<boolean>(false) // 是否是趋势图
  const [percision, setPercision] = useState<number>(0) // 是否是趋势图

  // JS 环境准备好后，立即向 app 发送一次 WEB_READY
  // useEffect(() => {
  //   notifyWebReady()
  // }, [])

  // window.addEventListener('message', (event: MessageEvent) => {
  //   const data = event?.data
  //   if (data && data.baseCoin) {
  //     setPeriod(data?.period)
  //     setChartType(Number(data?.chartType))
  //     setBaseCoin(data?.baseCoin)
  //     setXPositions(data?.xPositions)
  //     setIsTrendPage(data?.isTrendPage)
  //     notifyParamReceived()
  //   }
  // })
  // const initedHeight = useRef(false)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event?.data
      if (!data || !data.baseCoin) return

      const updateHeight = tvChartRef.current?.updateHeight
      if (updateHeight != null) {
        updateHeight()
      }
      const newConfig: FuturesChartConfig = {
        period: data?.period ?? period,
        chartType: Number(data?.chartType) ?? chartType,
      }
      saveFuturesChartConfig(CHART_CONFIG_KEY, newConfig)

      setPeriod(data?.period)
      setChartType(Number(data?.chartType))
      setBaseCoin(data?.baseCoin)
      setXPositions(data?.xPositions)
      // setIsTrendPage(data?.isTrendPage)
      if (data?.pxDecimals != null) {
        setPercision(+data?.pxDecimals)
      }
      notifyParamReceived()
    }

    window.addEventListener('message', handleMessage)

    // 清理函数：组件卸载时移除事件监听器
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  return (
    <div className="relative h-screen">
      <Tv
        ref={tvChartRef}
        pairName={baseCoin ? baseCoin : 'BTC'}
        periodWebview={period}
        candleType={chartType}
        percision={percision}
        isTrendPage={true}
        onChartReady={() => {
          notifyChartReady()
        }}
        xPosition={xPositions}
        initHeight={window.innerHeight - 44}
        isWebview={true}
      />
    </div>
  )
}

export default FuturesChart
