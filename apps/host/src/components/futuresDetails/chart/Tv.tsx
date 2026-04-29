import { useTheme } from '@/components/theme-provider.js'
import { useWebData2 } from '@/hooks/hyperliquid/useWebData2'
import eventBus from '@/lib/eventBus'
import { capitalizeFirstLetter, cn } from '@/lib/utils.js'
import { notifyWebReady } from '@/pages/webview/klineChannel'
import { selectFuturesTradePreferences } from '@/redux/modules/futuresTradePreferences.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { tConst } from '@/utils/helpers'
import { useCandleData } from '@hooks/hyperliquid/useCandleData'
import { forwardRef, memo, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChartingLibraryWidgetOptions,
  EntityId,
  IChartingLibraryWidget,
  IChartWidgetApi,
  LanguageCode,
  ResolutionString,
  ThemeName,
} from '../../../../public/charting_library/charting_library'
import {
  Datafeeds,
  intervalMap,
  overRides,
  resolutionToHyperliquidInterval,
  studiesOverrides,
  TvConfig,
} from '../datafeeds/index'
import { FuturesChartConfig, TriggerOrderTypeEnum, xOpenOrders, xPositions } from '../trade/types'
import { AdapterFactory } from './AdapterFactory'
import { useResizableHeight } from './hooks/useChartResizableHeight'

export const EVENT_CANDLE_UPDATE = 'EVENT_CANDLE_UPDATE'
export interface ChartContainerProps {
  symbol: ChartingLibraryWidgetOptions['symbol']
  interval: ChartingLibraryWidgetOptions['interval']
  datafeedUrl: string
  libraryPath: ChartingLibraryWidgetOptions['library_path']
  chartsStorageUrl: ChartingLibraryWidgetOptions['charts_storage_url']
  chartsStorageApiVersion: ChartingLibraryWidgetOptions['charts_storage_api_version']
  clientId: ChartingLibraryWidgetOptions['client_id']
  userId: ChartingLibraryWidgetOptions['user_id']
  fullscreen: ChartingLibraryWidgetOptions['fullscreen']
  autosize: ChartingLibraryWidgetOptions['autosize']
  studiesOverrides: ChartingLibraryWidgetOptions['studies_overrides']
  container: ChartingLibraryWidgetOptions['container']
}

export function saveFuturesChartConfig(key: string, config: FuturesChartConfig) {
  localStorage.setItem(key, JSON.stringify(config))
}
export function getFuturesChartConfig(key: string) {
  try {
    const data = localStorage.getItem(key)
    if (!data) return null
    return JSON.parse(data) as FuturesChartConfig
  } catch (error) {
    console.warn('Cannot load chart config', error)
    return null
  }
}

type TvChartProps = {
  period?: string
  candleType: number
  pairName: string
  percision: number | null
  isTrendPage: boolean
  xPosition?: xPositions | null
  openOrders?: xOpenOrders[]
  initHeight: number
  onChartReady?: () => void
  isWebview: boolean
  periodWebview: string
}

const getLanguageFromURL = (): LanguageCode | null => {
  const regex = new RegExp('[\\?&]lang=([^&#]*)')
  const results = regex.exec(location.search)
  return results === null ? null : (decodeURIComponent(results[1].replace(/\+/g, ' ')) as LanguageCode)
}

const getTimeZone = () => {
  let timezone = 'UTC'
  if (Intl && Intl.DateTimeFormat() && Intl.DateTimeFormat().resolvedOptions()) {
    const tempObj = Intl.DateTimeFormat().resolvedOptions()
    timezone = (tempObj && tempObj.timeZone) || 'UTC'
  }
  return timezone
}

const isValidPrecision = (p: any) => {
  if (p === null) return false
  return p >= 0
}

const tagBgColor = '#0F0F0F'
const pnlColor = '#FBFBFB'
const stopLossColor = '#EA3B4F'
const takeProfitColor = '#21E09D'
const liquidationColor = '#EA963A'

const INDICATOR_PANEL_HEIGHT = 100
const FIXED_HEIGHT = 450
const INDICATOR_CONTAINER_HEIGHT = 52
const INITIAL_HEIGHT = 193

const TvChart = memo(
  forwardRef(
    (
      {
        periodWebview,
        candleType = 1,
        pairName = 'BTC',
        percision = 2,
        isTrendPage = true,
        xPosition,
        openOrders,
        onChartReady,
        initHeight,
        isWebview = false,
      }: TvChartProps,
      _ref,
    ) => {
      const { theme } = useTheme()
      type IndicatorKey = keyof typeof indicatorsRef.current
      const priceChangeColor = useAppSelector((state: any) => state.preference?.priceChangeColor)
      const updown = priceChangeColor === 'inverse' ? 'rg' : 'gr'
      const updownRef = useRef<'gr' | 'rg'>(updown)
      useEffect(() => {
        updownRef.current = priceChangeColor === 'inverse' ? 'rg' : 'gr'
      }, [priceChangeColor])
      const [activeIndicators, setActiveIndicators] = useState({
        macd: false,
        rsi: false,
        kdj: false,
        boll: false,
        ma: false,
        ema: false,
        sar: false,
        volume: false,
      })
      const [height, setHeight] = useState<number>(initHeight)
      const [isChartReady, setIsChartReady] = useState<boolean>(false)
      const [loading, setLoading] = useState<boolean>(true)

      const updateHeight = () => {
        const chartHeight = window.innerHeight - INDICATOR_CONTAINER_HEIGHT
        setHeight(Math.max(chartHeight, INITIAL_HEIGHT))
      }

      useImperativeHandle(_ref, () => ({ updateHeight }))

      // webview 环境下，当 isTrendPage 为 true 时，高度自适应屏幕
      useEffect(() => {
        if (isWebview && isTrendPage) {
          updateHeight()

          // 监听窗口大小变化
          window.addEventListener('resize', updateHeight)

          return () => {
            window.removeEventListener('resize', updateHeight)
          }
        }
      }, [isWebview, isTrendPage])

      const { klinePeriod } = useAppSelector(selectFuturesTradePreferences)

      const period = isWebview ? periodWebview : intervalMap.find((item) => item.label === klinePeriod)?.value || '60'

      const wsInterval = useMemo(() => {
        const baseInterval = resolutionToHyperliquidInterval[period] || '1h'
        const wsIntervalMap: Record<string, string> = {
          '3d': '1d',
          '1w': '1d',
          '1M': '1d',
        }
        return wsIntervalMap[baseInterval] || baseInterval
      }, [period])

      const { ticker } = useCandleData(pairName, wsInterval)

      const { t, i18n } = useTranslation()
      const currentLang = i18n.language || 'en'

      const dispatch = useAppDispatch()

      const { handleMouseDown } = useResizableHeight({
        height,
        setHeight,
        dispatch,
        minHeight: INITIAL_HEIGHT,
      })

      const chartContainerRef = useRef<HTMLDivElement>(null) as React.MutableRefObject<HTMLDivElement>
      const tvWidgetRef = useRef<IChartingLibraryWidget | null>(null)
      const indicatorsRef = useRef<{
        macd?: EntityId
        rsi?: EntityId
        kdj?: EntityId
        boll?: EntityId
        ma?: EntityId
        ema?: EntityId
        sar?: EntityId
        volume?: EntityId
      }>({})

      const timeoutRefs = useRef<NodeJS.Timeout[]>([])

      const addTimeout = (cb: () => void, delay: number) => {
        cb()
        // const id = setTimeout(() => {
        //   cb()
        //   timeoutRefs.current = timeoutRefs.current.filter((t) => t !== id)
        // }, 0)
        // timeoutRefs.current.push(id)
      }

      const defaultProps: Omit<ChartContainerProps, 'container'> = {
        symbol: pairName,
        interval: period as ResolutionString,
        datafeedUrl: 'https://demo_feed.tradingview.com',
        libraryPath: '/charting_library/',
        chartsStorageUrl: 'https://saveload.tradingview.com',
        chartsStorageApiVersion: '1.1',
        clientId: 'tradingview.com',
        userId: 'public_user_id',
        fullscreen: false,
        autosize: true,
        studiesOverrides: {},
      }

      const adapterRef = useRef<AdapterFactory>(new AdapterFactory())
      const limitOrderKeysRef = useRef<Set<string>>(new Set())
      const tpAdapterKeysRef = useRef<Set<string>>(new Set())
      const slAdapterKeysRef = useRef<Set<string>>(new Set())

      useEffect(() => {
        const eventName = EVENT_CANDLE_UPDATE
        if (ticker && pairName === (ticker?.s as string)) {
          eventBus.dispatch(eventName, ticker as any)
        }
        return () => {}
      }, [period, ticker])

      // 使用 ref 存储 pairName 以便在 getSymbol 中动态获取最新值
      const pairNameRef = useRef<string>(pairName)
      useEffect(() => {
        pairNameRef.current = pairName
      }, [pairName])

      const percisionRef = useRef<number>(percision)
      useEffect(() => {
        percisionRef.current = percision
      }, [pairName, percision])

      const getSymbol = () => {
        return {
          name: pairNameRef.current,
          timezone: getTimeZone(),
          minmov: 1,
          minmov2: 0,
          pointvalue: 1,
          data_status: 'streaming',
          fractional: false,
          session: '24x7',
          has_intraday: true,
          exchange: '',
          listed_exchange: '',
          description: pairNameRef.current,
          pricescale: Math.pow(10, Number(percisionRef.current)),
          ticker: pairNameRef.current,
          has_weekly_and_monthly: true,
          supported_resolutions: ['1', '3', '5', '15', '30', '60', '120', '240', '480', '720', '1D', '3D', '1W', '1M'],
          has_seconds: true,
          has_empty_bars: true,
          seconds_multipliers: ['1', '5', '15', '30'],
          format: 'price',
          has_no_volume: false,
        }
      }
      const getConfig = () => {
        return {
          supports_time: true,
        }
      }

      const getCatchName = (symbolInfo: any, resolution: any) => {
        const tempName = symbolInfo.ticker + '_#_' + resolution
        return tempName
      }

      const getUpdateEventName = () => {
        return EVENT_CANDLE_UPDATE
      }

      const externalInstance = {
        getConfig,
        getSymbol,
        getCatchName,
        getUpdateEventName,
      }

      const adjustHeightForIndicators = (indicators: typeof activeIndicators) => {
        if (isWebview) return
        const activeCount = Object.values(indicators).filter(Boolean).length
        const newHeight = window.innerHeight - FIXED_HEIGHT + activeCount * (INDICATOR_PANEL_HEIGHT + 30)
        setHeight(newHeight)
      }

      const toggleIndicator = ({
        key,
        addFn,
        adjustHeight = false,
      }: {
        key: IndicatorKey
        addFn: (chart: IChartWidgetApi) => void
        adjustHeight?: boolean
      }) => {
        if (!tvWidgetRef.current) return

        const chart = tvWidgetRef.current.chart()

        if (indicatorsRef.current[key]) {
          chart.removeEntity(indicatorsRef.current[key]!)
          indicatorsRef.current[key] = undefined
          setActiveIndicators((prev) => {
            const updated = { ...prev, [key]: false }
            if (adjustHeight) adjustHeightForIndicators(updated)
            return updated
          })
        } else {
          addFn(chart)
          setActiveIndicators((prev) => {
            const updated = { ...prev, [key]: true }
            if (adjustHeight) adjustHeightForIndicators(updated)
            return updated
          })
        }
      }

      const toggleMACD = () => toggleIndicator({ key: 'macd', addFn: addMACDIndicator, adjustHeight: true })
      const toggleRSI = () => toggleIndicator({ key: 'rsi', addFn: addRSIIndicator, adjustHeight: true })
      const toggleKDJ = () => toggleIndicator({ key: 'kdj', addFn: addKDJIndicator, adjustHeight: true })
      const toggleBoll = () => toggleIndicator({ key: 'boll', addFn: addBollIndicator })
      const toggleMA = () => toggleIndicator({ key: 'ma', addFn: addMAIndicator })
      const toggleEMA = () => toggleIndicator({ key: 'ema', addFn: addEMAIndicator })
      const toggleSAR = () => toggleIndicator({ key: 'sar', addFn: addSARIndicator })
      const toggleVolume = () => toggleIndicator({ key: 'volume', addFn: addVolumeIndicator, adjustHeight: true })

      const addIndicator = (
        chart: IChartWidgetApi,
        {
          name,
          overlay,
          options,
          key,
          adjustHeight = false,
        }: {
          name: string
          overlay: boolean
          options: Record<string, any>
          key: IndicatorKey
          adjustHeight?: boolean
        },
      ) => {
        chart.createStudy(name, overlay, false, options).then((entityId) => {
          if (entityId) {
            indicatorsRef.current[key] = entityId
            setActiveIndicators((prev) => {
              const updated = { ...prev, [key]: true }
              if (adjustHeight) adjustHeightForIndicators(updated)
              return updated
            })
          }
        })
      }

      const addMACDIndicator = (chart: IChartWidgetApi) =>
        addIndicator(chart, {
          name: 'MACD',
          overlay: false,
          key: 'macd',
          options: {
            'fast length': 12,
            'slow length': 26,
            source: 'close',
            'signal length': 9,
          },
        })

      const addRSIIndicator = (chart: IChartWidgetApi) =>
        addIndicator(chart, {
          name: 'Relative Strength Index',
          overlay: false,
          key: 'rsi',
          options: { length: 14, source: 'close' },
          adjustHeight: true,
        })

      const addKDJIndicator = (chart: IChartWidgetApi) =>
        addIndicator(chart, {
          name: 'Stochastic RSI',
          overlay: false,
          key: 'kdj',
          options: { length: 14, signal_period: 3, source: 'close' },
          adjustHeight: true,
        })

      const addBollIndicator = (chart: IChartWidgetApi) =>
        addIndicator(chart, {
          name: 'Bollinger Bands',
          overlay: true,
          key: 'boll',
          options: { length: 9, stdDev: 2, source: 'close' },
        })

      const addMAIndicator = (chart: IChartWidgetApi) =>
        addIndicator(chart, {
          name: 'Moving Average',
          overlay: true,
          key: 'ma',
          options: { length: 9, source: 'close' },
        })

      const addEMAIndicator = (chart: IChartWidgetApi) =>
        addIndicator(chart, {
          name: 'Moving Average Exponential',
          overlay: true,
          key: 'ema',
          options: { length: 9, source: 'close' },
        })

      const addSARIndicator = (chart: IChartWidgetApi) =>
        addIndicator(chart, {
          name: 'Parabolic SAR',
          overlay: true,
          key: 'sar',
          options: {
            acceleration: 0.02,
            acceleration_max: 0.2,
            step: 0.02,
            source: 'close',
          },
        })

      const addVolumeIndicator = (chart: IChartWidgetApi) =>
        addIndicator(chart, {
          name: 'Volume',
          overlay: false,
          key: 'volume',
          options: {
            volume: true,
            volume_ma: true,
            ma_length: 20,
          },
          adjustHeight: true,
        })

      const drawPositionShapes = async (chart: IChartWidgetApi) => {
        if (!chart) return

        // 1) PNL 线基于持仓
        if (xPosition && xPosition.coin === pairName) {
          const price = Number(xPosition.entryPx)
          const hasValidEntry = Number.isFinite(price) && price > 0
          if (hasValidEntry) {
            if (!adapterRef.current.hasAdapter(xPosition.coin)) {
              const positionLine = chart.createPositionLine()
              positionLine.setText(`${tConst('position.pnl')}: $${xPosition.unrealizedPnl}`)
              positionLine.setPrice(price)
              positionLine.setQuantity('')
              positionLine.setLineColor(pnlColor)
              positionLine.setLineStyle(2)
              positionLine.setLineLength(-50, 'pixel')
              positionLine.setBodyTextColor(pnlColor)
              positionLine.setBodyBorderColor(pnlColor)
              positionLine.setBodyBackgroundColor(tagBgColor)
              adapterRef.current.setAdapter(xPosition.coin, positionLine)
            } else {
              const positionLine = adapterRef.current.getAdapter(xPosition.coin)
              try {
                positionLine.setPrice?.(price)
              } catch {}
              try {
                positionLine.setText?.(`${tConst('position.pnl')}: $${xPosition.unrealizedPnl}`)
              } catch {}
              try {
                positionLine.setLineLength?.(-50, 'pixel')
              } catch {}
              try {
                positionLine.setBodyBackgroundColor?.(tagBgColor)
              } catch {}
              try {
                positionLine.setLineColor?.(pnlColor)
              } catch {}
              try {
                positionLine.setBodyTextColor?.(pnlColor)
              } catch {}
              try {
                positionLine.setBodyBorderColor?.(pnlColor)
              } catch {}
            }
          }
        } else {
          try {
            if (adapterRef.current.hasAdapter(pairName)) adapterRef.current.deleteAdapter(pairName)
          } catch {}
        }

        // 2) 止盈/止损线使用 openOrders，支持多条
        const tpOrders = (openOrders || []).filter(
          (o) => o.coin === pairName && o.orderType === TriggerOrderTypeEnum.TakeProfitMarket,
        )
        const slOrders = (openOrders || []).filter(
          (o) => o.coin === pairName && o.orderType === TriggerOrderTypeEnum.StopMarket,
        )

        // SL 多条
        const nextSlKeys = new Set<string>()
        slOrders.forEach((order) => {
          const price = Number(order.triggerPx)
          const valid = Number.isFinite(price) && price > 0
          if (!valid) {
            return
          }
          const key = `sl-${pairName}-${order.oid}`
          nextSlKeys.add(key)
          if (!adapterRef.current.getAdapter(key)) {
            const line = chart.createOrderLine()
            line.setText(`${tConst('position.stopLoss')}: $${order.triggerPx}`)
            line.setPrice(price)
            line.setQuantity('')
            line.setLineColor(stopLossColor)
            line.setLineStyle(2)
            line.setLineLength(-250, 'pixel')
            line.setBodyTextColor(stopLossColor)
            line.setBodyBorderColor(stopLossColor)
            line.setBodyBackgroundColor(tagBgColor)
            adapterRef.current.setAdapter(key, line)
          } else {
            const line = adapterRef.current.getAdapter(key)
            try {
              line.setPrice?.(price)
            } catch {}
            try {
              line.setText?.(`${tConst('position.stopLoss')}: $${order.triggerPx}`)
            } catch {}
            try {
              line.setLineLength?.(-250, 'pixel')
            } catch {}
            try {
              line.setBodyBackgroundColor?.(tagBgColor)
            } catch {}
          }
        })
        slAdapterKeysRef.current.forEach((prevKey) => {
          if (!nextSlKeys.has(prevKey)) {
            try {
              if (adapterRef.current.getAdapter(prevKey)) adapterRef.current.deleteAdapter(prevKey)
            } catch {}
          }
        })
        slAdapterKeysRef.current = nextSlKeys

        // TP 多条
        const nextTpKeys = new Set<string>()
        tpOrders.forEach((order) => {
          const price = Number(order.triggerPx)
          const valid = Number.isFinite(price) && price > 0
          if (!valid) {
            return
          }
          const key = `tp-${pairName}-${order.oid}`
          nextTpKeys.add(key)
          if (!adapterRef.current.getAdapter(key)) {
            const line = chart.createOrderLine()
            line.setText(`${tConst('position.takeProfit')}: $${order.triggerPx}`)
            line.setPrice(price)
            line.setQuantity('')
            line.setLineColor(takeProfitColor)
            line.setLineStyle(2)
            line.setLineLength(-350, 'pixel')
            line.setBodyTextColor(takeProfitColor)
            line.setBodyBorderColor(takeProfitColor)
            line.setBodyBackgroundColor(tagBgColor)
            adapterRef.current.setAdapter(key, line)
          } else {
            const line = adapterRef.current.getAdapter(key)
            try {
              line.setPrice?.(price)
            } catch {}
            try {
              line.setText?.(`${tConst('position.takeProfit')}: $${order.triggerPx}`)
            } catch {}
            try {
              line.setLineLength?.(-350, 'pixel')
            } catch {}
            try {
              line.setBodyBackgroundColor?.(tagBgColor)
            } catch {}
          }
        })
        tpAdapterKeysRef.current.forEach((prevKey) => {
          if (!nextTpKeys.has(prevKey)) {
            try {
              if (adapterRef.current.getAdapter(prevKey)) adapterRef.current.deleteAdapter(prevKey)
            } catch {}
          }
        })
        tpAdapterKeysRef.current = nextTpKeys
      }

      // 绘制/更新 爆仓线（基于当前币种全部持仓的 liquidationPx）；遵循与止盈止损线相同的触发逻辑
      const { positions: positionsWebData2, openOrders: openOrdersWebData2 } = useWebData2()
      const drawLiquidationLine = (chart: IChartWidgetApi) => {
        try {
          if (!xPosition) return // 与止盈止损一致，仅在存在持仓上下文时绘制
          const currentPosition = positionsWebData2?.find((p: any) => p.coin === pairName)
          const liqPxRaw = currentPosition ? Number(currentPosition.liquidationPx || 0) : 0
          const hasValidLiq = Number.isFinite(liqPxRaw) && liqPxRaw > 0
          const liqKey = `liq-${pairName}`

          if (hasValidLiq) {
            const precisionSafe = isValidPrecision(percision) ? Number(percision) : 2
            const liqPxText = Number(liqPxRaw).toFixed(precisionSafe)
            if (!adapterRef.current.getAdapter(liqKey)) {
              const liqLine = chart.createOrderLine()
              liqLine.setText(`${tConst('position.liquidationPrice')}: $${liqPxText}`)
              liqLine.setPrice(liqPxRaw)
              liqLine.setQuantity('')
              liqLine.setLineColor(liquidationColor)
              liqLine.setLineStyle(2) // Dashed
              liqLine.setLineLength(-100, 'pixel')
              liqLine.setBodyTextColor(liquidationColor)
              liqLine.setBodyBorderColor(liquidationColor)
              liqLine.setBodyBackgroundColor(tagBgColor)
              adapterRef.current.setAdapter(liqKey, liqLine)
            } else {
              const liqLine = adapterRef.current.getAdapter(liqKey)
              try {
                liqLine.setPrice?.(liqPxRaw)
              } catch {}
              try {
                const precisionSafe2 = isValidPrecision(percision) ? Number(percision) : 2
                const liqPxText2 = Number(liqPxRaw).toFixed(precisionSafe2)
                liqLine.setText?.(`${tConst('position.liquidationPrice')}: $${liqPxText2}`)
              } catch {}
              try {
                liqLine.setLineLength?.(-100, 'pixel')
              } catch {}
              try {
                liqLine.setBodyBackgroundColor?.(tagBgColor)
              } catch {}
              try {
                liqLine.setLineColor?.(liquidationColor)
              } catch {}
              try {
                liqLine.setBodyTextColor?.(liquidationColor)
              } catch {}
              try {
                liqLine.setBodyBorderColor?.(liquidationColor)
              } catch {}
            }
          } else {
            if (adapterRef.current.getAdapter(liqKey)) {
              adapterRef.current.deleteAdapter(liqKey)
            }
          }
        } catch {}
      }

      // 绘制/更新 限价单线（基于当前币种全部未触发的 Limit 订单）
      const drawLimitOrderLines = (chart: IChartWidgetApi) => {
        if (!chart) {
          return
        }
        if (!openOrdersWebData2) {
          return
        }

        try {
          const precisionSafe = isValidPrecision(percision) ? Number(percision) : 2
          const orders = (openOrdersWebData2 || []).filter((o: any) => {
            if (!o) {
              return false
            }
            const isSameCoin = o.coin === pairName
            const isLimitOrder = o.orderType === 'Limit'
            const notTrigger = !o.isTrigger
            return isSameCoin && isLimitOrder && notTrigger
          })

          const currentKeys = new Set<string>()
          orders.forEach((o: any) => {
            const priceNum = Number(o.limitPx)
            if (!Number.isFinite(priceNum) || priceNum <= 0) {
              return
            }

            const isLong = o.side === 'B'
            const color = isLong ? '#21E09D' : '#EA3B4F'
            const key = `limit-${pairName}-${o.oid}`
            currentKeys.add(key)

            const priceText = Number(priceNum).toFixed(precisionSafe)
            const labelText = `${t('futuresDetails.common.limitOrder')} ${priceText} ${isLong ? t('futuresDetails.common.long') : t('futuresDetails.common.short')}`

            if (!adapterRef.current.getAdapter(key)) {
              try {
                const orderLine = chart.createOrderLine()
                orderLine.setText(labelText)
                orderLine.setPrice(priceNum)
                orderLine.setQuantity('')
                orderLine.setLineColor(color)
                orderLine.setLineStyle(1)
                orderLine.setLineLength(-60, 'pixel')
                orderLine.setBodyTextColor(color)
                orderLine.setBodyBorderColor(color)
                orderLine.setBodyBackgroundColor(tagBgColor)
                adapterRef.current.setAdapter(key, orderLine)
              } catch (error) {
                console.warn('创建限价单线失败:', error)
              }
            } else {
              const orderLine = adapterRef.current.getAdapter(key)
              try {
                orderLine.setPrice?.(priceNum)
              } catch {}
              try {
                orderLine.setText?.(labelText)
              } catch {}
              try {
                orderLine.setLineLength?.(-60, 'pixel')
              } catch {}
              try {
                orderLine.setBodyBackgroundColor?.(tagBgColor)
              } catch {}
            }
          })

          // 删除已不存在的限价单线（仅清理当前币种的）
          Array.from(limitOrderKeysRef.current)
            .filter((k) => k.startsWith(`limit-${pairName}-`) && !currentKeys.has(k))
            .forEach((k) => {
              try {
                adapterRef.current.deleteAdapter(k)
              } catch {}
              limitOrderKeysRef.current.delete(k)
            })

          // 记录当前存在的keys
          currentKeys.forEach((k) => limitOrderKeysRef.current.add(k))
        } catch (error) {
          console.warn('绘制限价单线失败:', error)
        }
      }

      useEffect(() => {
        if (!isValidPrecision(percision)) {
          return
        }

        // webview 场景下，native 可能还没通过 postMessage 下发 baseCoin，
        // 此时 pairName 为空字符串，直接初始化 TradingView 会报
        // "Symbol is not defined: either 'symbol' or 'load_last_chart' option must be set"
        if (!pairName) {
          return
        }

        if (tvWidgetRef.current) {
          return
        }

        // setLoading(true)
        const datafeeds = new Datafeeds({
          ...externalInstance,
          getWidget: () => tvWidget,
          onRendered: () => {},
        })

        const tvConfig = TvConfig(updownRef.current)

        const widgetOptions = {
          symbol: defaultProps.symbol as string,
          datafeed: datafeeds as any,
          interval: period as ResolutionString,
          container: chartContainerRef.current,
          library_path: defaultProps.libraryPath as string,
          locale: getLanguageFromURL() || currentLang,
          charts_storage_url: defaultProps.chartsStorageUrl,
          charts_storage_api_version: defaultProps.chartsStorageApiVersion,
          client_id: defaultProps.clientId,
          user_id: defaultProps.userId,
          theme: capitalizeFirstLetter(theme) as ThemeName,
          custom_css_url: '/charting_library/custom.css?v=' + Date.now(),
          // timeframe: '1D',
          timezone: getTimeZone(),
          ...tvConfig,
        } as any

        if (isTrendPage) {
          widgetOptions.enabled_features = [...tvConfig.enabled_features, 'left_toolbar', 'legend_widget']
        } else {
          widgetOptions.disabled_features = [...tvConfig.disabled_features, 'left_toolbar']
          widgetOptions.overrides = {
            ...tvConfig.overrides,
            'paneProperties.topMargin': 30,
          }
        }

        const tvWidget = new (window as any).TradingView.widget(widgetOptions)
        tvWidget.onChartReady(async () => {
          tvWidgetRef.current = tvWidget

          tvWidget.applyOverrides(overRides(updownRef.current))
          tvWidget.applyStudiesOverrides(studiesOverrides(updownRef.current))

          const chart = tvWidget.chart()
          const studies = chart.getAllStudies()
          try {
            ;(chart as any).dataReady?.(() => {
              try {
                chart.setChartType(candleType)
                tvWidget.applyOverrides(overRides(updownRef.current))
                tvWidget.applyStudiesOverrides(studiesOverrides(updownRef.current))
              } catch {}
              if (onChartReady && height) {
                onChartReady()
              }
            })
          } catch {}

          addTimeout(() => {
            studies.forEach(async (study: any) => {
              if (study.name.toLowerCase().includes('volume')) {
                await chart.removeEntity(study.id)
              }
            })
          }, 0)

          addTimeout(() => {
            datafeeds.onHistoryDataLoaded(50)
          }, 500)

          addTimeout(() => {
            if (onChartReady && height) {
              setLoading(false)
              notifyWebReady()
              onChartReady()
            }
          }, 1000)

          // 设置图表为ready状态
          addTimeout(() => {
            setIsChartReady(true)
            if (xPosition) {
              // 绘制爆仓线
              try {
                drawLiquidationLine(chart)
              } catch {}
            }
            if (openOrdersWebData2) {
              drawLimitOrderLines(chart)
              const c = tvWidgetRef.current?.chart?.()
              if (c) {
                drawPositionShapes(c)
              }
            }
          }, 1200)

          if (isTrendPage && tvWidgetRef.current) {
            // Add Volume indicator
            if (activeIndicators.volume) {
              addVolumeIndicator(tvWidgetRef.current.chart())
            }

            // Add MACD indicator
            activeIndicators.macd && addMACDIndicator(tvWidgetRef.current.chart())

            // Add RSI indicator
            activeIndicators.rsi && addRSIIndicator(tvWidgetRef.current.chart())

            // Add KDJ indicator (Stochastic RSI)
            activeIndicators.kdj && addKDJIndicator(tvWidgetRef.current.chart())

            // Add Bollinger Bands indicator
            activeIndicators.boll && addBollIndicator(tvWidgetRef.current.chart())

            // Add MA indicator
            activeIndicators.ma && addMAIndicator(tvWidgetRef.current.chart())

            // Add EMA indicator
            activeIndicators.ema && addEMAIndicator(tvWidgetRef.current.chart())

            // Add SAR indicator
            activeIndicators.sar && addSARIndicator(tvWidgetRef.current.chart())
          }
        })
        ;(window as any).tvWidget = tvWidget
        return () => {
          // timeoutRefs.current.forEach(clearTimeout)
          // timeoutRefs.current = []
          // if (tvWidgetRef.current) {
          //   tvWidget.remove()
          //   tvWidgetRef.current.remove()
          //   tvWidget = null
          //   tvWidgetRef.current = null
          // }
          // // 重置图表ready状态
          // setIsChartReady(false)
        }
      }, [pairName, percision])

      // pairName 变化时使用 setSymbol 切换币种，避免重新初始化整个图表
      const prevPairNameRef = useRef<string>(pairName)
      useEffect(() => {
        // 跳过首次渲染（chart 初始化时已设置 symbol）
        if (prevPairNameRef.current === pairName) {
          return
        }
        prevPairNameRef.current = pairName

        if (tvWidgetRef.current && pairName) {
          try {
            // ❗ 关键：先更新 pairNameRef，确保 resolveSymbol 调用 getSymbol() 时获取新币种
            pairNameRef.current = pairName

            // 清理旧币种的 position/order lines
            adapterRef.current.clearAdapter()
            limitOrderKeysRef.current.clear()
            tpAdapterKeysRef.current.clear()
            slAdapterKeysRef.current.clear()

            // TradingView 会调用 resolveSymbol -> getSymbol() 获取新的 symbol info
            tvWidgetRef.current.chart().setSymbol(pairName, () => {
              // Symbol 切换完成后重新绘制 lines
              addTimeout(() => {
                const chart = tvWidgetRef.current?.chart()
                if (chart) {
                  if (xPosition) {
                    drawPositionShapes(chart)
                    drawLiquidationLine(chart)
                  }
                  if (openOrdersWebData2) {
                    drawLimitOrderLines(chart)
                  }
                }
              }, 500)
            })
          } catch (error) {
            console.warn('Failed to change symbol:', error)
          }
        }
      }, [pairName])

      useEffect(() => {
        const isCheckExactChartPage = () => {
          const isFuturesPage = location.pathname.includes('/futures')
          if (!isFuturesPage) {
            if (tvWidgetRef.current) {
              tvWidgetRef.current.remove()
              tvWidgetRef.current = null
            }
          }
        }
        return () => {
          isCheckExactChartPage()
        }
      }, [location.pathname])

      // 偏好变更时动态更新图表涨跌配色
      useEffect(() => {
        if (tvWidgetRef.current) {
          try {
            tvWidgetRef.current.applyOverrides(overRides(updownRef.current))
            tvWidgetRef.current.applyStudiesOverrides(studiesOverrides(updownRef.current))
          } catch {}
        }
      }, [priceChangeColor])

      useEffect(() => {
        if (tvWidgetRef && tvWidgetRef.current) {
          tvWidgetRef.current.chart().setChartType(candleType)
        }
      }, [candleType])

      useEffect(() => {
        if (tvWidgetRef && tvWidgetRef.current) {
          tvWidgetRef.current.changeTheme(capitalizeFirstLetter(theme) as ThemeName)
        }
      }, [theme])

      useEffect(() => {
        // 只有在图表完全ready且有数据时才绘制
        if (isChartReady && tvWidgetRef && tvWidgetRef.current) {
          if (xPosition) {
            // 绘制爆仓线
            try {
              drawLiquidationLine(tvWidgetRef.current.chart())
            } catch {}
          }
          if (!openOrders && !xPosition) {
            const chart = tvWidgetRef.current?.chart?.()
            if (!chart) {
              return
            }
            adapterRef.current.clearAdapter()
          }
        }
      }, [
        xPosition,
        xPosition?.entryPx,
        xPosition?.unrealizedPnl,
        xPosition?.slPrice,
        xPosition?.tpPrice,
        xPosition?.coin,
        isChartReady,
      ])

      // openOrders 变化时，绘制/更新限价单线和止盈止损线
      useEffect(() => {
        if (!tvWidgetRef.current) {
          return
        }
        const chart = tvWidgetRef.current.chart()
        if (!chart) {
          return
        }
        drawLimitOrderLines(chart)
        drawPositionShapes(tvWidgetRef.current.chart())
      }, [openOrdersWebData2, pairName, percision])

      // 仓位/币对/精度变化时，按同样逻辑刷新爆仓线
      useEffect(() => {
        if (!isChartReady || !xPosition) return
        if (!tvWidgetRef.current) return
        const chart = tvWidgetRef.current.chart()
        if (!chart) return
        drawLiquidationLine(chart)
      }, [positionsWebData2, pairName, percision, isChartReady, xPosition])

      useEffect(() => {
        if (tvWidgetRef && tvWidgetRef.current) {
          tvWidgetRef.current.chart().setResolution(period as ResolutionString, () => {})
        }
      }, [period])

      // 防止绘图后点击编辑栏最后一个更多按钮出现页面滚动现象
      useEffect(() => {
        if (typeof document === 'undefined') {
          return
        }

        const onTouchStart = (event: TouchEvent) => {
          if (window.innerWidth > 768) {
            return
          }
          const target = event.target as HTMLElement | null
          if (!target) {
            return
          }
          if (target.closest('.tv-floating-toolbar')) {
            event.preventDefault()
          }
        }

        const onTouchMove = (event: TouchEvent) => {
          if (window.innerWidth > 768) {
            return
          }
          const target = event.target as HTMLElement | null
          if (!target) {
            return
          }
          if (target.closest('.tv-floating-toolbar')) {
            event.preventDefault()
          }
        }

        document.addEventListener('touchstart', onTouchStart, { passive: false })
        document.addEventListener('touchmove', onTouchMove, { passive: false })

        return () => {
          document.removeEventListener('touchstart', onTouchStart)
          document.removeEventListener('touchmove', onTouchMove)
        }
      }, [])

      return (
        <>
          <div
            style={{
              height: isTrendPage ? `${height + INDICATOR_CONTAINER_HEIGHT}px` : '193px',
              cursor: 'ns-resize',
              visibility: height && !loading ? 'visible' : 'hidden',
            }}
          >
            <div className="watermark relative">
              {!isValidPrecision(percision) ? (
                <div className={isTrendPage ? 'min-h-[600px]' : 'h-[193px]'} />
              ) : (
                <>
                  <div
                    id="chartContainer"
                    ref={chartContainerRef}
                    style={{
                      touchAction: 'none',
                      height: isTrendPage ? `${height}px` : '193px',
                      cursor: 'ns-resize',
                      visibility: !loading && height ? 'visible' : 'hidden',
                    }}
                  ></div>

                  {isTrendPage && (
                    <>
                      <div className={cn('overflow-x-auto _hidescrollbar', isWebview ? 'mb-5' : '')}>
                        <div className="flex gap-2 px-4 pt-1 min-w-max">
                          <button
                            onClick={toggleMA}
                            className={`pr-[20px] py-1 text-sm ${activeIndicators.ma ? 'text-[#FFFFFF]' : 'text-[#FFFFFF80]'}`}
                          >
                            MA
                          </button>
                          <button
                            onClick={toggleEMA}
                            className={`pr-[20px] py-1 rounded text-sm ${activeIndicators.ema ? 'text-[#FFFFFF]' : 'text-[#FFFFFF80]'}`}
                          >
                            EMA
                          </button>
                          <button
                            onClick={toggleBoll}
                            className={`pr-[20px] py-1 text-sm ${activeIndicators.boll ? 'text-[#FFFFFF]' : 'text-[#FFFFFF80]'}`}
                          >
                            BOLL
                          </button>
                          <button
                            onClick={toggleSAR}
                            className={`pr-[20px] py-1 text-sm ${activeIndicators.sar ? 'text-[#FFFFFF]' : 'text-[#FFFFFF80]'}`}
                          >
                            SAR
                          </button>
                          <span className="mr-6 border-solid border-l-1 border-[#ECECED14]"></span>
                          <button
                            onClick={toggleVolume}
                            className={`pr-[20px] py-1 text-sm ${activeIndicators.volume ? 'text-[#FFFFFF]' : 'text-[#FFFFFF80]'}`}
                          >
                            VOL
                          </button>
                          <button
                            onClick={toggleMACD}
                            className={`pr-[20px] py-1 text-sm ${activeIndicators.macd ? 'text-[#FFFFFF]' : 'text-[#FFFFFF80]'}`}
                          >
                            MACD
                          </button>
                          <button
                            onClick={toggleRSI}
                            className={`pr-[20px] py-1 text-sm ${activeIndicators.rsi ? 'text-[#FFFFFF]' : 'text-[#FFFFFF80]'}`}
                          >
                            RSI
                          </button>
                          <button
                            onClick={toggleKDJ}
                            className={`pr-[20px] py-1 text-sm ${activeIndicators.kdj ? 'text-[#FFFFFF]' : 'text-[#FFFFFF80]'}`}
                          >
                            Stoch RSI
                          </button>
                        </div>
                      </div>
                      {!isWebview && (
                        <div
                          className="absolute w-full bottom-[-10px] flex justify-center cursor-row-resize select-none"
                          onMouseDown={handleMouseDown}
                          onTouchStart={handleMouseDown}
                        >
                          <img src="/images/icons/scale-icon.svg" alt="icon scale" />
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
          {/* {loading && (
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-[#0A0A0A] z-10">
              <Loading />
            </div>
          )} */}
        </>
      )
    },
  ),
)

export default TvChart
