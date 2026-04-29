import { useEffect, useState, useRef, memo, forwardRef, useMemo } from 'react'
import { Datafeeds, intervalMap, resolutionToHyperliquidInterval } from '@/components/futuresDetails/datafeeds/index'
import { overRides as overRidesPC, studiesOverrides as studiesOverridesPC } from '@/components/futuresDetails/datafeeds/configPC'
import { TvConfig } from '@/components/futuresDetails/datafeeds/configPC'
import { useTheme } from '@/components/theme-provider.js'
import { capitalizeFirstLetter } from '@/lib/utils.js'
import { xPositions, xOpenOrders, TriggerOrderTypeEnum } from '@/components/futuresDetails/trade/types'
import { useAppSelector } from '@/redux/store'
import { useCandleData } from '@hooks/hyperliquid/useCandleData'
import eventBus from '@/lib/eventBus'
import { useTranslation } from 'react-i18next'
import {
  selectFuturesTradePreferences
} from '@/redux/modules/futuresTradePreferences.slice'
import {
  ChartingLibraryWidgetOptions,
  EntityId,
  IChartingLibraryWidget,
  IChartWidgetApi,
  LanguageCode,
  ResolutionString,
  ThemeName,
  ChartPropertiesOverrides,
} from '../../../../../public/charting_library/charting_library'
import { AdapterFactory } from '../AdapterFactory'
import { tConst } from '@/utils/helpers'
import { EVENT_OPEN_INDICATORS } from '../indicatorEvents'
// import { getCandleSnapshot } from '@/api/hyperliquid'
// import type { CandleSnapshot } from '@/types/hyperliquid'
import { symbolInfoSelector } from '@/redux/modules/futuresCurrentSymbol.slice'
import { useWebData2 } from '@/hooks/hyperliquid/useWebData2'
import { Loading } from '@/components/common/Loading'

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

type TvChartProps = {
  period?: string
  candleType: number
  pairName: string
  percision: number | null
  xPosition?: xPositions | null
  openOrders?: xOpenOrders[]
  onChartReady?: () => void
  isWebview: boolean
  periodWebview: string
}


const getTimeZone = () => {
  let timezone = 'UTC'
  if (Intl && Intl.DateTimeFormat() && Intl.DateTimeFormat().resolvedOptions()) {
    const tempObj = Intl.DateTimeFormat().resolvedOptions()
    timezone = (tempObj && tempObj.timeZone) || 'UTC'
  }
  return timezone
}

// 将项目语言代码映射到TradingView支持的语言代码
const mapToTradingViewLocale = (lang: string): LanguageCode => {
  const localeMap: Record<string, LanguageCode> = {
    'zh': 'zh',     // 简体中文
    'hk': 'zh_TW',  // 繁体中文
    'en': 'en',     // 英文
    'ja': 'ja',     // 日文
    'hi': 'en',     // 印地语 (TradingView不支持 hi，使用 en 作为替代)
    'vi': 'vi',     // 越南语
  }
  return localeMap[lang] || 'en'
}

const tagBgColor = '#0F0F0F'

const isValidPrecision = (p: any) => {
  if (p === null) return false
  return p >= 0
}

const TvChart = memo(
  forwardRef(({ periodWebview, candleType = 1, pairName = 'BTC', percision = 2, xPosition, openOrders, onChartReady, isWebview = false }: TvChartProps, _ref) => {
    const { quoteCoin } = useAppSelector(symbolInfoSelector)
    const { theme } = useTheme()
    const { i18n } = useTranslation()
    const { positions: positionsWebData2, openOrders: openOrdersWebData2 } = useWebData2()
    const priceChangeColor = useAppSelector((state: any) => state.preference?.priceChangeColor)
    const updown = priceChangeColor === 'inverse' ? 'rg' : 'gr'
    const updownRef = useRef<'gr' | 'rg'>(updown)
    useEffect(() => {
      updownRef.current = priceChangeColor === 'inverse' ? 'rg' : 'gr'
    }, [priceChangeColor])
    type IndicatorKey = keyof typeof indicatorsRef.current;
    const { t } = useTranslation()
    const [activeIndicators, setActiveIndicators] = useState({
      macd: false,
      rsi: false,
      kdj: false,
      boll: false,
      ma: false,
      ema: false,
      sar: false,
      volume: true, // 默认显示Volume指标
    })

    // 内部 loading 状态
    const [loading, setLoading] = useState(false)

    const { klinePeriod } = useAppSelector((state) => selectFuturesTradePreferences(state))

    const period = isWebview ? periodWebview : intervalMap.find(item => item.label === klinePeriod)?.value || '60'

    const wsInterval = useMemo(() => {
      const baseInterval = resolutionToHyperliquidInterval[period] || '1h'
      const wsIntervalMap: Record<string, string> = {
        '3d': '1d',
        '1w': '1d',
        '1M': '1d'
      }
      return wsIntervalMap[baseInterval] || baseInterval
    }, [period])

    const { ticker } = useCandleData(pairName, wsInterval)

    const chartContainerRef = useRef<HTMLDivElement>(null) as React.MutableRefObject<HTMLDivElement>
    const tvWidgetRef = useRef<IChartingLibraryWidget | null>(null)
    const isResolutionChangingRef = useRef<boolean>(false) // 标记是否正在切换周期
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

    // 性能统计：组件挂载起点与是否已记录K线完成加载
    const mountStartRef = useRef<number>(typeof performance !== 'undefined' ? performance.now() : Date.now())
    const klineLoadedLoggedRef = useRef<boolean>(false)

    // 画图保存相关的引用
    const drawingsStorageKey = `tv_drawings_${pairName}`
    const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const isUnmountedRef = useRef<boolean>(false) // 标记组件是否已卸载

    // 清理损坏的本地存储数据
    const clearCorruptedStorage = () => {
      try {
        localStorage.removeItem(drawingsStorageKey)
        console.log('已清理图表本地存储数据')
      } catch (error) {
        console.error('清理本地存储失败:', error)
      }
    }

    const timeoutRefs = useRef<NodeJS.Timeout[]>([])

    const addTimeout = (cb: () => void, delay: number) => {
      const id = setTimeout(() => {
        cb()
        timeoutRefs.current = timeoutRefs.current.filter(t => t !== id)
      }, delay)
      timeoutRefs.current.push(id)
    }
    
    // 指标共享（跨币种共享指标，绘图仍按币种隔离）
    const SHARED_STUDIES_KEY = 'tv_shared_studies'
    const getCurrentStudyNames = (chart: IChartWidgetApi) => {
      try {
        const studies = chart.getAllStudies() || []
        return studies.map((s: any) => s?.name).filter((n: any) => typeof n === 'string') as string[]
      } catch {
        return []
      }
    }
    const saveSharedStudies = (chart: IChartWidgetApi) => {
      try {
        const names = getCurrentStudyNames(chart)
          .filter((n: string) => {
            if (!n) {
              return false
            }
            return !n.toLowerCase().includes('volume')
          })
        localStorage.setItem(SHARED_STUDIES_KEY, JSON.stringify(names))
      } catch {}
    }
    const loadSharedStudies = (chart: IChartWidgetApi) => {
      try {
        const raw = localStorage.getItem(SHARED_STUDIES_KEY)
        if (!raw) {
          return
        }
        const names = JSON.parse(raw)
        if (!Array.isArray(names)) {
          return
        }
        const existing = new Set(getCurrentStudyNames(chart).map((n: string) => n.toLowerCase()))
        names.forEach((name: any) => {
          if (typeof name !== 'string') {
            return
          }
          const key = name.toLowerCase()
          if (key.includes('volume')) {
            return
          }
          if (existing.has(key)) {
            return
          }
          try {
            // 不强制 overlay，交由 TV 默认逻辑决定
            chart.createStudy(name)
          } catch {}
        })
      } catch {}
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

    const adapterRef = useRef<AdapterFactory>(new AdapterFactory());
    const limitOrderKeysRef = useRef<Set<string>>(new Set())
    const tpAdapterKeysRef = useRef<Set<string>>(new Set())
    const slAdapterKeysRef = useRef<Set<string>>(new Set())

    useEffect(() => {
      const eventName = EVENT_CANDLE_UPDATE
      if (ticker && (pairName === ticker?.s as string)) {
        eventBus.dispatch(eventName, ticker as any)
      }
      return () => {
      }
    }, [period, ticker])

    // 使用 ref 存储 pairName 以便在 getSymbol 中动态获取最新值
    const pairNameRef = useRef<string>(pairName)
    useEffect(() => {
      pairNameRef.current = pairName
    }, [pairName])

    // 使用 ref 存储 percision 以便在 getSymbol 中动态获取最新值
    const percisionRef = useRef<number | null>(percision)
    useEffect(() => {
      percisionRef.current = percision
    }, [percision])

    const getSymbol = () => {
      const precisionSafe = isValidPrecision(percisionRef.current) ? Number(percisionRef.current) : 2
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
        // has_daily: true,
        exchange: 'XBIT',
        listed_exchange: '',
        description: `${pairNameRef.current}/${quoteCoin}`,
        pricescale: Math.pow(10, precisionSafe),
        ticker: pairNameRef.current,
        has_weekly_and_monthly: true,
        // daily_multipliers: ['1', '3'],
        supported_resolutions: ['1', '3', '5', '15', '30', '60', '120', '240', '480', '720', '1D', '3D', '1W', '1M'],
        has_seconds: true,
        has_empty_bars: true,
        seconds_multipliers: ['1', '5', '15', '30'],
        format: 'price',
        // v28: 使用 visible_plots_set 替代 has_no_volume
        visible_plots_set: ['ohlcv'],
        volume_precision: 6
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
      getWidget: () => tvWidgetRef.current
    }

    const adjustHeightForIndicators = () => {
      // v28: 避免直接调用不存在的 resize，交由 TV 自身自适应
      // 这里保持空实现，防止产生无意义的告警
    }

    // 监听“打开原生指标对话框”事件
    useEffect(() => {
      const openIndicators = () => {
        try {
          const chart = tvWidgetRef.current?.chart?.()
          chart?.executeActionById?.('insertIndicator')
        } catch { }
      }
      eventBus.on(EVENT_OPEN_INDICATORS, openIndicators)
      return () => {
        eventBus.remove(EVENT_OPEN_INDICATORS, openIndicators)
      }
    }, [])

    const addIndicator = (
      chart: IChartWidgetApi,
      { name, overlay, options, key  }: {
        name: string; overlay: boolean; options: Record<string, any>; key: IndicatorKey; adjustHeight?: boolean;
      }
    ) => {
      // 检查是否已经存在该指标，避免重复添加
      if (indicatorsRef.current[key]) {
        console.log(`指标 ${key} 已存在，跳过添加`)
        return
      }

      // 对于Volume指标，额外检查是否存在同类指标
      if (key === 'volume') {
        const studies = chart.getAllStudies()
        const hasVolumeStudy = studies.some((study: any) =>
          study.name.toLowerCase().includes('volume')
        )
        if (hasVolumeStudy) {
          console.log('检测到已存在Volume指标，跳过添加')
          return
        }
      }

      // v28: createStudy(name, forceOverlay?, lock?, inputs?, overrides?, options?)
      chart.createStudy(name, overlay, false, options, undefined, { priceScale: 'as-series' }).then((entityId) => {
        if (entityId) {
          indicatorsRef.current[key] = entityId

          setActiveIndicators((prev) => {
            const updated = { ...prev, [key]: true };
            return updated;
          })
        }
      })
    }

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

    // 保存整个图表状态
    const saveChartLayoutToLocal = async (widget: IChartingLibraryWidget) => {
      try {
        // 检查组件是否已卸载
        if (isUnmountedRef.current || !tvWidgetRef.current || !widget) {
          return
        }
        
        widget.save((chartLayout) => {
          // 再次检查组件状态，防止异步回调时组件已卸载
          if (isUnmountedRef.current || !tvWidgetRef.current) {
            return
          }
          
          if (chartLayout) {
            localStorage.setItem(drawingsStorageKey, JSON.stringify(chartLayout))
            // console.log('图表布局已保存到本地存储')
          } else {
            // console.log('没有图表布局数据需要保存')
          }
        })
      } catch (error) {
        console.error('保存图表布局失败:', error)
      }
    }

    // 统一应用涨跌配色（封装）
    const applyColorOverrides = (widget: IChartingLibraryWidget) => {
      try {
        widget.applyOverrides(overRidesPC(updownRef.current) as Partial<ChartPropertiesOverrides>)
        widget.applyStudiesOverrides(studiesOverridesPC(updownRef.current))
      } catch {}
    }

    // K线渲染完成后的统一初始化逻辑（封装，去重）
    const onKlineRendered = (tvWidget: IChartingLibraryWidget) => {
      tvWidgetRef.current = tvWidget

      // 重置指标状态
      indicatorsRef.current = {}
      setActiveIndicators({
        macd: false,
        rsi: false,
        kdj: false,
        boll: false,
        ma: false,
        ema: false,
        sar: false,
        volume: true,
      })
      // 应用颜色（一次）
      applyColorOverrides(tvWidget)

      const chart = tvWidget.chart()

      // 监听图表区域点击，用于通知外部（例如关闭下拉框）
      try {
        const mouseDownEvent = (chart as any).onMouseDown?.()
        if (mouseDownEvent && mouseDownEvent.subscribe) {
          mouseDownEvent.subscribe(null, () => {
            try {
              window.dispatchEvent(new CustomEvent('futures-tv-click'))
            } catch {}
          })
        }
      } catch {}

      // 数据渲染完成后再次应用颜色，防止后续流程覆盖
      try {
        ;(chart as any).dataReady?.(() => {
          setLoading(false)
          try { applyColorOverrides(tvWidget) } catch {}
          if (klineLoadedLoggedRef.current) return
          klineLoadedLoggedRef.current = true
          const nowTs = Date.now()
          const base = typeof performance !== 'undefined' ? performance.now() : Date.now()
          const cost = Math.round(base - mountStartRef.current)
          console.log(`[perf][TvPC] K线完成加载 ${pairName} ${period} @ ${new Date(nowTs).toISOString()} (耗时 ${cost}ms)`)
          if (onChartReady) {
            onChartReady()
          }
        })
      } catch {}

      // 设置画图自动保存
      setupDrawingsAutoSave(tvWidget)

      // 移除默认Volume，添加自定义Volume
      const studies = chart.getAllStudies()
      addTimeout(() => {
        try {
          studies.forEach(async (study: any) => {
            if (study.name.toLowerCase().includes('volume')) {
              console.log('移除默认Volume指标:', study.name)
              await chart.removeEntity(study.id)
            }
          })
        } catch {}
      }, 100)

      addTimeout(() => {
        if (tvWidgetRef.current) {
          if (activeIndicators.volume) {
            console.log('添加自定义Volume指标')
            addVolumeIndicator(tvWidgetRef.current.chart())
          }
        }
      }, 200)

      // 根据指标调整高度
      addTimeout(() => {
        adjustHeightForIndicators()
      }, 100)

      // 加载（仅绘图）布局，并在加载后再次确保颜色正确
      loadSavedChartLayout(tvWidget, xPosition)

      // 初次绘制爆仓线与限价单线
      try { drawLiquidationLine(chart) } catch {}
      try { drawLimitOrderLines(chart) } catch {}
    }

    // 加载图表布局
    const loadSavedChartLayout = async (widget: IChartingLibraryWidget, xPosition: any) => {
      // 绘制止盈止损线
      setTimeout(() => {
        // 检查组件是否已卸载
        if (isUnmountedRef.current || !tvWidgetRef.current || !widget) {
          return
        }
        
        const chart = widget.chart()
        if (!chart) {
          return
        }
        
        // 确保清空旧币种残留的线
        try { adapterRef.current.clearAdapter() } catch {}
        try { limitOrderKeysRef.current.clear() } catch {}

        if (xPosition) {
          // 同步刷新爆仓线，避免被清理后短暂缺失
          try { drawLiquidationLine(chart) } catch {}
        }
        if (openOrdersWebData2) {
          drawLimitOrderLines(chart)
          drawPositionShapes(chart)
          // 绘制限价单线
          try { drawLimitOrderLines(chart) } catch {}
        }
      }, 1000)

      try {
        const savedLayout = localStorage.getItem(drawingsStorageKey)
        if (!savedLayout) {
          console.log('没有找到保存的图表布局')
          try {
            const chartNoLayout = widget?.chart()
            if (chartNoLayout) {
              // 确保自定义 Volume 与共享指标也能生效
              if (activeIndicators.volume) {
                try { addVolumeIndicator(chartNoLayout) } catch {}
              }
              try { loadSharedStudies(chartNoLayout) } catch {}
            }
          } catch {}
          return
        }

        const chartLayout = JSON.parse(savedLayout)
        console.log('尝试加载图表布局:', chartLayout)

        // 验证布局数据的基本结构，避免加载损坏的数据
        if (!chartLayout || typeof chartLayout !== 'object' || !chartLayout.charts || !Array.isArray(chartLayout.charts)) {
          console.warn('图表布局数据格式异常，跳过加载')
          localStorage.removeItem(drawingsStorageKey)
          return
        }

        // 检查图表是否已准备就绪
        const chart = widget?.chart()
        if (!chart) {
          console.warn('图表尚未准备就绪，延迟加载布局')
          setTimeout(() => {
            if (isUnmountedRef.current || !tvWidgetRef.current) {
              return
            }
            loadSavedChartLayout(widget, xPosition)
          }, 500)
          return
        }

        // 清理可能导致加载异常的状态
        if (chartLayout.charts && chartLayout.charts[0]) {
          // 清除加载状态，避免图表卡在加载中
          delete chartLayout.charts[0].loading

          // 确保左上角显示的时间周期与当前设置一致
          try {
            const panes = chartLayout.charts?.[0]?.panes
            if (!Array.isArray(panes)) {
              return
            }
            panes.forEach((pane: any) => {
              const sources = pane?.sources
              if (!Array.isArray(sources)) {
                return
              }
              sources.forEach((src: any) => {
                // 仅修改包含 interval 的源（通常为主图 series 或对比 series）
                if (src && src.state && typeof src.state === 'object' && 'interval' in src.state) {
                  src.state.interval = period
                }
              })
            })
          } catch {}
        }

        // 设置加载超时，避免无限等待
        let loadTimeout: NodeJS.Timeout | null = null
        let hasLoaded = false

        const onLoadComplete = (chartLoaded: boolean) => {
          if (hasLoaded) return // 防止重复调用
          hasLoaded = true

          if (loadTimeout) {
            clearTimeout(loadTimeout)
            loadTimeout = null
          }

          if (chartLoaded) {
            console.log('图表布局加载成功')
          } else {
            console.warn('图表布局加载失败，清除本地数据')
            localStorage.removeItem(drawingsStorageKey)
          }
        }

        // 设置10秒超时
        loadTimeout = setTimeout(() => {
          if (!hasLoaded) {
            console.warn('图表布局加载超时，清除本地数据')
            localStorage.removeItem(drawingsStorageKey)
            hasLoaded = true
          }
        }, 10000)

        // 使用Promise来确保加载操作的正确性
        try {
          widget.load(chartLayout)
          // 布局加载后立即再应用一次颜色，避免布局里的样式覆盖
          try { applyColorOverrides(widget) } catch {}
          onLoadComplete(true)
          // 加载布局后：移除布局自带指标，仅保留绘图；随后恢复共享指标与自定义Volume
          addTimeout(() => {
            try {
              const chartAfterLoad = widget.chart()
              if (chartAfterLoad) {
                try {
                  const loadedStudies = chartAfterLoad.getAllStudies() || []
                  loadedStudies.forEach((st: any) => {
                    try { chartAfterLoad.removeEntity(st.id) } catch {}
                  })
                } catch {}
                // 再次确保颜色覆盖
                try { applyColorOverrides(widget) } catch {}
                if (activeIndicators.volume) {
                  try { addVolumeIndicator(chartAfterLoad) } catch {}
                }
                try { loadSharedStudies(chartAfterLoad) } catch {}
              }
            } catch {}
          }, 50)
        } catch (loadError) {
          console.error('widget.load执行失败:', loadError)
          onLoadComplete(false)
        }

      } catch (error) {
        console.error('加载图表布局失败:', error)
        // 如果加载失败，清除损坏的数据
        clearCorruptedStorage()
      }
    }

    // 处理绘图编辑和删除事件
    const handleDrawingEvent = (_sourceId: EntityId, eventType: string, widget: IChartingLibraryWidget) => {
      // 检查组件是否已卸载
      if (isUnmountedRef.current) {
        return
      }

      try {
        switch (eventType) {
          case 'move':
          case 'points_changed':
          case 'properties_changed':
            // 编辑操作：使用全量保存而不是增量更新
            // console.log('触发编辑事件，将进行全量保存')
            setTimeout(() => {
              if (isUnmountedRef.current) {
                return
              }
              const activeWidget = tvWidgetRef.current || widget
              if (activeWidget) {
                saveChartLayoutToLocal(activeWidget)
              }
            }, 200) // 稍长的延迟确保状态稳定
            break

          default:
            // 其他事件（create, hide, show, click）不需要特殊处理
            // create事件由原有的自动保存机制处理
            break
        }
      } catch (error) {
        console.error('处理绘图事件失败:', error)
      }
    }

    // 设置画图自动保存和事件监听
    const setupDrawingsAutoSave = (widget: IChartingLibraryWidget) => {
      try {
        // 监听绘图编辑和删除事件
        widget.subscribe('drawing_event', (sourceId: EntityId, eventType: string) => {
          if (isUnmountedRef.current) {
            return
          }
          handleDrawingEvent(sourceId, eventType, widget)
        })

        // 监听图表变化事件，实现自动保存（保持原有逻辑）
        widget.subscribe('onAutoSaveNeeded', () => {
          if (isUnmountedRef.current) {
            return
          }
          
          // 使用防抖机制，避免频繁保存
          if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current)
          }

          autoSaveTimeoutRef.current = setTimeout(() => {
            if (isUnmountedRef.current) {
              return
            }
            saveChartLayoutToLocal(widget)
            try {
              const chart = widget.chart()
              if (chart) {
                saveSharedStudies(chart)
              }
            } catch {}
          }, 500) // 0.5 秒延迟保存
        })

        console.log('画图自动保存和编辑删除监听已启用')
      } catch (error) {
        console.error('设置自动保存失败:', error)
      }
    }

    const drawPositionShapes = async (chart: IChartWidgetApi) => {
      if (!chart) return;

      // 如果正在切换周期，不要尝试创建线条
      if (isResolutionChangingRef.current) {
        // console.log('正在切换周期，跳过绘制持仓/委托线')
        return;
      }

      const pnlKey = `pnl-${pairName}`

      // 1) 持仓盈亏线（仍按持仓绘制；若无持仓或币种不匹配则删除）
      if (xPosition && xPosition.coin === pairName) {
        const entryPrice = Number(xPosition.entryPx)
        const unrealizedPnl = xPosition.unrealizedPnl ?? '0'
        const hasValidEntry = Number.isFinite(entryPrice) && entryPrice > 0
        const pnlColor = '#FBFBFB'
        if (hasValidEntry) {
          if (!adapterRef.current.getAdapter(pnlKey)) {
            try {
              const positionLine = chart.createPositionLine()
              positionLine.setText(`${tConst('position.pnl')}: $${unrealizedPnl}`)
              positionLine.setPrice(entryPrice)
              positionLine.setQuantity('')
              positionLine.setLineColor(pnlColor)
              positionLine.setLineStyle(2) // Dashed - 虚线
              positionLine.setLineLength(-50, 'pixel') // 交错：最左侧
              positionLine.setBodyTextColor(pnlColor)
              positionLine.setBodyBorderColor(pnlColor)
              positionLine.setBodyBackgroundColor(tagBgColor)
              adapterRef.current.setAdapter(pnlKey, positionLine)
            } catch (error) {
              console.warn('创建持仓盈亏线失败:', error)
            }
          } else {
            const positionLine = adapterRef.current.getAdapter(pnlKey)
            try { positionLine.setPrice?.(entryPrice) } catch { }
            try { positionLine.setText?.(`${tConst('position.pnl')}: $${unrealizedPnl}`) } catch { }
            try { positionLine.setLineLength?.(-50, 'pixel') } catch { }
            try { positionLine.setBodyBackgroundColor?.(tagBgColor) } catch { }
            try { positionLine.setLineColor?.(pnlColor) } catch { }
            try { positionLine.setBodyTextColor?.(pnlColor) } catch { }
            try { positionLine.setBodyBorderColor?.(pnlColor) } catch { }
          }
        } else {
          if (adapterRef.current.getAdapter(pnlKey)) {
            adapterRef.current.deleteAdapter(pnlKey)
          }
        }
      } else {
        try { if (adapterRef.current.getAdapter(pnlKey)) adapterRef.current.deleteAdapter(pnlKey) } catch {}
      }

      // 2) 止盈/止损线改用 openOrders（按触发价 triggerPx 绘制）
      const allTpOrders = (openOrders || []).filter(o => o.coin === pairName && o.orderType === TriggerOrderTypeEnum.TakeProfitMarket)
      const allSlOrders = (openOrders || []).filter(o => o.coin === pairName && o.orderType === TriggerOrderTypeEnum.StopMarket)

      // 止损线（多条）
      const stopLossColor = '#EA3B4F'
      const nextSlKeys = new Set<string>()
      allSlOrders.forEach(order => {
        const slPrice = Number(order.triggerPx)
        const hasValidSL = Number.isFinite(slPrice) && slPrice > 0
        if (!hasValidSL) {
          return
        }
        const key = `sl-${pairName}-${order.oid}`
        nextSlKeys.add(key)
        if (!adapterRef.current.getAdapter(key)) {
          try {
            const stopLossLine = chart.createOrderLine()
            stopLossLine.setText(`${tConst('position.stopLoss')}: $${order.triggerPx}`)
            stopLossLine.setPrice(slPrice)
            stopLossLine.setQuantity('')
            stopLossLine.setLineColor(stopLossColor)
            stopLossLine.setLineStyle(2) // Dashed - 虚线
            stopLossLine.setLineLength(-250, 'pixel')
            stopLossLine.setBodyTextColor(stopLossColor)
            stopLossLine.setBodyBorderColor(stopLossColor)
            stopLossLine.setBodyBackgroundColor(tagBgColor)
            adapterRef.current.setAdapter(key, stopLossLine)
          } catch (error) {
            console.warn('创建止损线失败:', error)
          }
        } else {
          const stopLossLine = adapterRef.current.getAdapter(key)
          try { stopLossLine.setPrice?.(slPrice) } catch { }
          try { stopLossLine.setText?.(`${tConst('position.stopLoss')}: $${order.triggerPx}`) } catch { }
          try { stopLossLine.setLineLength?.(-250, 'pixel') } catch { }
          try { stopLossLine.setBodyBackgroundColor?.(tagBgColor) } catch { }
        }
      })
      // 清理已不存在的止损线
      slAdapterKeysRef.current.forEach(prevKey => {
        if (!nextSlKeys.has(prevKey)) {
          try { if (adapterRef.current.getAdapter(prevKey)) adapterRef.current.deleteAdapter(prevKey) } catch {}
        }
      })
      slAdapterKeysRef.current = nextSlKeys

      // 止盈线（多条）
      const takeProfitColor = '#21E09D'
      const nextTpKeys = new Set<string>()
      allTpOrders.forEach(order => {
        const tpPrice = Number(order.triggerPx)
        const hasValidTP = Number.isFinite(tpPrice) && tpPrice > 0
        if (!hasValidTP) {
          return
        }
        const key = `tp-${pairName}-${order.oid}`
        nextTpKeys.add(key)
        if (!adapterRef.current.getAdapter(key)) {
          try {
            const takeProfitLine = chart.createOrderLine()
            takeProfitLine.setText(`${tConst('position.takeProfit')}: $${order.triggerPx}`)
            takeProfitLine.setPrice(tpPrice)
            takeProfitLine.setQuantity('')
            takeProfitLine.setLineColor(takeProfitColor)
            takeProfitLine.setLineStyle(2) // Dashed - 虚线
            takeProfitLine.setLineLength(-380, 'pixel')
            takeProfitLine.setBodyTextColor(takeProfitColor)
            takeProfitLine.setBodyBorderColor(takeProfitColor)
            takeProfitLine.setBodyBackgroundColor(tagBgColor)
            adapterRef.current.setAdapter(key, takeProfitLine)
          } catch (error) {
            console.warn('创建止盈线失败:', error)
          }
        } else {
          const takeProfitLine = adapterRef.current.getAdapter(key)
          try { takeProfitLine.setPrice?.(tpPrice) } catch { }
          try { takeProfitLine.setText?.(`${tConst('position.takeProfit')}: $${order.triggerPx}`) } catch { }
          try { takeProfitLine.setLineLength?.(-380, 'pixel') } catch { }
          try { takeProfitLine.setBodyBackgroundColor?.(tagBgColor) } catch { }
        }
      })
      // 清理已不存在的止盈线
      tpAdapterKeysRef.current.forEach(prevKey => {
        if (!nextTpKeys.has(prevKey)) {
          try { if (adapterRef.current.getAdapter(prevKey)) adapterRef.current.deleteAdapter(prevKey) } catch {}
        }
      })
      tpAdapterKeysRef.current = nextTpKeys
    }

    // 绘制/更新 爆仓线（基于当前币种全部持仓的 liquidationPx）
    const drawLiquidationLine = (chart: IChartWidgetApi) => {
      if (!chart) return

      // 如果正在切换周期，不要尝试创建线条
      if (isResolutionChangingRef.current) {
        // console.log('正在切换周期，跳过绘制爆仓线')
        return;
      }

      try {
        const currentPosition = positionsWebData2?.find((p: any) => p.coin === pairName)
        const liqPxRaw = currentPosition ? Number(currentPosition.liquidationPx || 0) : 0
        const hasValidLiq = Number.isFinite(liqPxRaw) && liqPxRaw > 0
        const liqKey = `liq-${pairName}`
        const liqColor = '#EA963A'
        if (hasValidLiq) {
          const precisionSafe = isValidPrecision(percision) ? Number(percision) : 2
          const liqPxText = Number(liqPxRaw).toFixed(precisionSafe)
          if (!adapterRef.current.getAdapter(liqKey)) {
            try {
              const liqLine = chart.createOrderLine()
              liqLine.setText(`${tConst('position.liquidationPrice')}: $${liqPxText}`)
              liqLine.setPrice(liqPxRaw)
              liqLine.setQuantity('')
              liqLine.setLineColor(liqColor)
              liqLine.setLineStyle(2) // Dashed - 虚线
              liqLine.setLineLength(-100, 'pixel')
              liqLine.setBodyTextColor(liqColor)
              liqLine.setBodyBorderColor(liqColor)
              liqLine.setBodyBackgroundColor(tagBgColor)
              adapterRef.current.setAdapter(liqKey, liqLine)
            } catch (error) {
              console.warn('创建爆仓线失败:', error)
            }
          } else {
            const liqLine = adapterRef.current.getAdapter(liqKey)
            try { liqLine.setPrice?.(liqPxRaw) } catch { }
            try {
              const precisionSafe = isValidPrecision(percision) ? Number(percision) : 2
              const liqPxText = Number(liqPxRaw).toFixed(precisionSafe)
              liqLine.setText?.(`${tConst('position.liquidationPrice')}: $${liqPxText}`)
            } catch { }
            try { liqLine.setLineLength?.(-100, 'pixel') } catch { }
            try { liqLine.setBodyBackgroundColor?.(tagBgColor) } catch { }
          }
        } else {
          if (adapterRef.current.getAdapter(liqKey)) {
            adapterRef.current.deleteAdapter(liqKey)
          }
        }
      } catch (error) {
        console.warn('绘制爆仓线失败:', error)
      }
    }

    // 绘制/更新 限价单线（基于当前币种全部未触发的 Limit 订单）
    const drawLimitOrderLines = (chart: IChartWidgetApi) => {
      if (!chart) return
      if (!openOrdersWebData2) return

      // 如果正在切换周期，不要尝试创建线条
      if (isResolutionChangingRef.current) {
        return
      }

      try {
        const precisionSafe = isValidPrecision(percision) ? Number(percision) : 2
        const orders = (openOrdersWebData2 || []).filter((o: any) => {
          if (!o) return false
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
              orderLine.setLineStyle(1) // 虚线
              orderLine.setLineLength(-120, 'pixel')
              orderLine.setBodyTextColor(color)
              orderLine.setBodyBorderColor(color)
              orderLine.setBodyBackgroundColor(tagBgColor)
              adapterRef.current.setAdapter(key, orderLine)
            } catch (error) {
              console.warn('创建限价单线失败:', error)
            }
          } else {
            const orderLine = adapterRef.current.getAdapter(key)
            try { orderLine.setPrice?.(priceNum) } catch {}
            try { orderLine.setText?.(labelText) } catch {}
            try { orderLine.setLineLength?.(-120, 'pixel') } catch {}
            try { orderLine.setBodyBackgroundColor?.(tagBgColor) } catch {}
          }
        })

        // 删除已不存在的限价单线（仅清理当前币种的）
        Array.from(limitOrderKeysRef.current)
          .filter((k) => k.startsWith(`limit-${pairName}-`) && !currentKeys.has(k))
          .forEach((k) => {
            try { adapterRef.current.deleteAdapter(k) } catch {}
            limitOrderKeysRef.current.delete(k)
          })

        // 记录当前存在的keys
        currentKeys.forEach((k) => limitOrderKeysRef.current.add(k))
      } catch (error) {
        console.warn('绘制限价单线失败:', error)
      }
    }
    useEffect(() => {
      if (!isValidPrecision(percision)) return
      
      // 组件挂载时重置卸载标记
      isUnmountedRef.current = false
      
      if (!pairName) {
        return
      }

      if (tvWidgetRef.current) {
        return
      }
      
      // 切换币对/精度前重置加载标记与计时，确保能够再次触发 onChartReady
      setLoading(true)
      try {
        mountStartRef.current = typeof performance !== 'undefined' ? performance.now() : Date.now()
        klineLoadedLoggedRef.current = false
      } catch {}
      const datafeeds = new Datafeeds({
        ...externalInstance,
        onRendered: () => { },
      })

      const tvConfig = TvConfig(updownRef.current)

      const widgetOptions = {
        symbol: defaultProps.symbol as string,
        datafeed: datafeeds as any,
        interval: period as ResolutionString,
        container: chartContainerRef.current,
        library_path: defaultProps.libraryPath as string,
        locale: mapToTradingViewLocale(i18n.language),
        charts_storage_url: defaultProps.chartsStorageUrl,
        charts_storage_api_version: defaultProps.chartsStorageApiVersion,
        client_id: defaultProps.clientId,
        user_id: defaultProps.userId,
        theme: capitalizeFirstLetter(theme) as ThemeName,
        custom_css_url: '/charting_library/customPc.css',
        timezone: getTimeZone(),
        ...tvConfig,
        // 让顶部时间周期按钮以“横向全尺寸”展示
        header_widget_buttons_mode: 'fullsize',
        // 预设常用的时间周期按钮（分时/1m/15m/1h/4h/1d）
        // 分时通常对应 1 分钟级别，这里用 '1' 表示 1m
        favorites: {
          intervals: ['1', '15', '60', '240', '1D'],
        },
        // debug: true,
      } as any

      let tvWidget = new (window as any).TradingView.widget(widgetOptions)

      tvWidget.onChartReady(async () => {
        onKlineRendered(tvWidget)
      })
      return () => {
        // 标记组件已卸载
        // isUnmountedRef.current = true
        
        // timeoutRefs.current.forEach(clearTimeout)
        // timeoutRefs.current = []

        // if (tvWidgetRef.current) {
        //   // 清理自动保存定时器
        //   if (autoSaveTimeoutRef.current) {
        //     clearTimeout(autoSaveTimeoutRef.current)
        //     autoSaveTimeoutRef.current = null
        //   }
        //   // 清理极值标注监听与形状
        //   try { (tvWidgetRef.current as any).__extremaCleanup__?.() } catch { }
        //   // 先清理自定义适配器中的线对象，避免残留
        //   try { adapterRef.current.clearAdapter() } catch { }
        //   try { limitOrderKeysRef.current.clear() } catch {}
        //   try { adapterRef.current.clearAdapter() } catch { }
        //   try { limitOrderKeysRef.current.clear() } catch {}
        //   // 清理指标引用，避免状态残留
        //   indicatorsRef.current = {}
        //   tvWidget.remove()
        //   tvWidgetRef.current.remove()
        //   tvWidget = null
        //   tvWidgetRef.current = null
        // }
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
          // 清理旧币种的 position/order lines
          adapterRef.current.clearAdapter()
          limitOrderKeysRef.current.clear()
          tpAdapterKeysRef.current.clear()
          slAdapterKeysRef.current.clear()

          // 重置性能计时器
          mountStartRef.current = typeof performance !== 'undefined' ? performance.now() : Date.now()
          klineLoadedLoggedRef.current = false

          const chart = tvWidgetRef.current.chart()
          if (chart) {
            // 使用 setSymbol 切换到新币种
            chart.setSymbol(pairName, () => {
              console.log(`[TvPC] Symbol switched to ${pairName}`)
              // 重新绘制新币种的 lines
              try {
                drawLiquidationLine(chart)
                drawLimitOrderLines(chart)
                drawPositionShapes(chart)
              } catch (e) {
                console.warn('Failed to redraw lines after symbol switch:', e)
              }
              // 触发 onChartReady
              if (onChartReady) {
                onChartReady()
              }
              setLoading(false)
            })
          }
        } catch (e) {
          console.error('[TvPC] Failed to switch symbol:', e)
        }
      }
    }, [pairName])

    // 仓位或币对变化时，更新爆仓线
    useEffect(() => {
      if (!tvWidgetRef.current) return
      const chart = tvWidgetRef.current.chart()
      if (!chart) return
      drawLiquidationLine(chart)
    }, [positionsWebData2, pairName])

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

    // 监听语言变化，重新初始化图表以应用新语言
    useEffect(() => {
      // 如果图表已存在且语言发生变化，需要重新初始化
      if (tvWidgetRef.current && isValidPrecision(percision)) {
        console.log('语言变化，重新初始化K线图:', i18n.language)

        // 保存当前的图表状态
        const currentSymbol = pairName
        const currentPrecision = percision

        // 清理当前图表
        timeoutRefs.current.forEach(clearTimeout)
        timeoutRefs.current = []

        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current)
          autoSaveTimeoutRef.current = null
        }

        try {
          (tvWidgetRef.current as any).__extremaCleanup__?.()
        } catch { }

        try {
          adapterRef.current.clearAdapter()
        } catch { }

        indicatorsRef.current = {}

        if (tvWidgetRef.current) {
          tvWidgetRef.current.remove()
          tvWidgetRef.current = null
        }

        // 短暂延迟后重新初始化，确保清理完成
        setTimeout(() => {
          if (isUnmountedRef.current || !isValidPrecision(currentPrecision)) return

          const datafeeds = new Datafeeds({
            ...externalInstance,
            onRendered: () => { },
          })

          const tvConfig = TvConfig(updownRef.current)

          // 重置性能计时起点与记录标志
          try {
            mountStartRef.current = typeof performance !== 'undefined' ? performance.now() : Date.now()
            klineLoadedLoggedRef.current = false
          } catch {}

          const widgetOptions = {
            symbol: currentSymbol,
            datafeed: datafeeds as any,
            interval: period as ResolutionString,
            container: chartContainerRef.current,
            library_path: defaultProps.libraryPath as string,
            locale: mapToTradingViewLocale(i18n.language),
            charts_storage_url: defaultProps.chartsStorageUrl,
            charts_storage_api_version: defaultProps.chartsStorageApiVersion,
            client_id: defaultProps.clientId,
            user_id: defaultProps.userId,
            theme: capitalizeFirstLetter(theme) as ThemeName,
            custom_css_url: '/charting_library/custom.css',
            timezone: getTimeZone(),
            ...tvConfig,
            header_widget_buttons_mode: 'fullsize',
            favorites: {
              intervals: ['1', '15', '60', '240', '1D'],
            },
          } as any

          let tvWidget = new (window as any).TradingView.widget(widgetOptions)

          tvWidget.onChartReady(async () => {
            onKlineRendered(tvWidget)
          })
        }, 100)
      }
    }, [i18n.language]) // 仅监听语言变化

    // 偏好变更时动态更新图表涨跌配色
    useEffect(() => {
      if (tvWidgetRef.current) {
        try {
          tvWidgetRef.current.applyOverrides(overRidesPC(updownRef.current) as Partial<ChartPropertiesOverrides>)
          tvWidgetRef.current.applyStudiesOverrides(studiesOverridesPC(updownRef.current))
        } catch {}
      }
    }, [priceChangeColor])

    useEffect(() => {
      if (tvWidgetRef && tvWidgetRef.current) {
        const chart = tvWidgetRef.current?.chart?.();
        if (!chart) {
          return;
        }
        // 每次切换持仓/币种，先清理所有已绘制线，避免跨币种残留
        try { adapterRef.current.clearAdapter() } catch {}
        try { limitOrderKeysRef.current.clear() } catch {}
        if (xPosition) {
          drawPositionShapes(chart)
          // 同步刷新爆仓线，保证一致
          try { drawLiquidationLine(chart) } catch {}
          try { drawLimitOrderLines(chart) } catch {}
        }

      }
    }, [xPosition, xPosition?.entryPx, xPosition?.unrealizedPnl, xPosition?.slPrice, xPosition?.tpPrice, xPosition?.coin])

    useEffect(() => {
      if (tvWidgetRef && tvWidgetRef.current) {
        const chart = tvWidgetRef.current.chart()
        if (!chart) return

        // 标记开始切换周期
        isResolutionChangingRef.current = true
        // console.log('开始切换周期:', period)

        // 切换周期前先清理所有持仓线和爆仓线，避免累积和残留
        try {
          adapterRef.current.clearAdapter()
          try { limitOrderKeysRef.current.clear() } catch {}
          // console.log('周期切换：已清理所有持仓线')
        } catch (e) {
          console.warn('清理adapter失败:', e)
        }

        // 切换周期
        chart.setResolution(period as ResolutionString, () => {
          // console.log('周期切换完成:', period)

          // 延迟一段时间后才允许重新绘制线条，确保图表完全稳定
          setTimeout(() => {
            if (isUnmountedRef.current || !tvWidgetRef.current) {
              return
            }
            
            isResolutionChangingRef.current = false
            // console.log('允许重新绘制持仓线')

            // 主动触发一次重绘（如果有持仓数据）
            if (xPosition && xPosition.coin === pairName && tvWidgetRef.current) {
              const currentChart = tvWidgetRef.current.chart()
              if (currentChart) {
                try {
                  drawPositionShapes(currentChart)
                  drawLiquidationLine(currentChart)
                  drawLimitOrderLines(currentChart)
                } catch (e) {
                  console.warn('重绘失败:', e)
                }
              }
            }
          }, 1000) // 延迟1秒确保图表数据完全加载
        })
      }
    }, [period])

    // openOrders 变化时，绘制/更新限价单线
    useEffect(() => {
      if (!tvWidgetRef.current) return
      const chart = tvWidgetRef.current.chart()
      if (!chart) return
      drawLimitOrderLines(chart)
      drawPositionShapes(chart)
    }, [openOrdersWebData2, pairName, percision])

    return (
      <>
        <div
          className='h-full'
          style={{
            cursor: 'ns-resize',
            visibility: !loading ? 'visible' : 'hidden',
          }}
        >
          <div className="watermark relative h-full">
            <div
              id="chartContainer"
              ref={chartContainerRef}
              className='h-full'
              style={{
                touchAction: 'none',
                cursor: 'ns-resize',
                visibility: !loading ? 'visible' : 'hidden',
              }}
            ></div>
          </div>
        </div>
        { loading && (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-[#121214] z-10">
            <Loading />
          </div>
        )}
      </>
    )
  },
  ),
)

export default TvChart
