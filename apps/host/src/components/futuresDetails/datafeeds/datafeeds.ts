// import { SubscribeBarsCallback, Bar } from '../../../../public/charting_library/datafeed-api'
import DataUpdater from './dataUpdater'
import { symbolFormat } from '@/utils/helpers.ts'
import { getCandleSnapshot } from '@/api/hyperliquid'
import { CandleSnapshot } from '@/types/hyperliquid.ts'
import { Bar, SubscribeBarsCallback } from '../../../../public/charting_library/datafeed-api'

interface SymbolInfo {
  name: string
  timezone: string
  minmov: number
  minmov2: number
  pointvalue: number
  data_status: string
  fractional: boolean
  session: string
  has_intraday: boolean
  has_daily?: boolean
  exchange: string
  description: string
  pricescale: number
  ticker: string
  has_weekly_and_monthly: boolean
  daily_multipliers?: string[]
  supported_resolutions: string[]
  has_seconds: boolean
  has_empty_bars: boolean
  seconds_multipliers: string[]
}

interface PeriodParams {
  from?: number
  countBack?: number
  to?: number
  firstDataRequest?: boolean
}

interface HistoryData {
  time: number
  open: number
  close: number
  high: number
  low: number
  volume: number
}

const handleKlineList = (data: CandleSnapshot): HistoryData[] => {
  if (!Array.isArray(data)) return []
  return data.map((item) => ({
    time: Number(item.t),
      open: parseFloat(item.o),
      high: parseFloat(item.h),
      low: parseFloat(item.l),
      close: parseFloat(item.c),
      volume: parseFloat(item.v) || 0,
    }))
}

// 判断是否为“日线及以上”分辨率（例如 1D / 3D / 1W / 1M）
function isDailyOrHigherResolution(resolution: string): boolean {
  if (!resolution) return false

  // 标准形式：以 D / W / M 结尾
  if (resolution.endsWith('D')) return true
  if (resolution.endsWith('W')) return true
  if (resolution.endsWith('M')) return true

  // 兼容形式：单字符
  if (resolution === 'D' || resolution === 'W' || resolution === 'M') return true

  return false
}

function getResolutionInSeconds(resolution: string): number {
  if (resolution === 'D') return 1 * 86400
  if (resolution === 'W') return 1 * 7 * 86400
  if (resolution === 'M') return 1 * 30 * 86400
  if (resolution.endsWith('D')) return parseInt(resolution) * 86400
  if (resolution.endsWith('W')) return parseInt(resolution) * 7 * 86400
  if (resolution.endsWith('M')) return parseInt(resolution) * 30 * 86400
  return parseInt(resolution) * 60 // 默认分钟
}

// 历史 K 线时间处理：排序 + 按原始时间去重；1M 额外对齐到自然月起点
function normalizeBarsTime(bars: HistoryData[], resolution: string): HistoryData[] {
  const map = new Map<number, HistoryData>()

  // 1M 特殊处理：使用自然月起点（UTC 00:00），其余周期保持接口原始时间
  const isMonthly = resolution === '1M' || resolution === 'M'

  const startOfUtcMonth: (ts: number) => number = (ts: number) => {
    const d = new Date(ts)
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)
  }

  for (const b of bars) {
    const t = Number(b.time)
    const alignedTime = isMonthly ? startOfUtcMonth(t) : t
    const merged = { ...b, time: alignedTime }
    // 如果同一时间戳出现多条，保留最后一条（通常更接近真实收盘）
    map.set(alignedTime, merged)
  }

  return Array.from(map.values()).sort((a, b) => a.time - b.time)
}

// 将一组基础 K 线（通常为 1d）聚合为更高周期的 K 线
function aggregateDailyBarsToHigherResolution(
  dailyBars: HistoryData[],
  resolution: string
): HistoryData[] {
  // 非日线及以上周期：不做聚合
  if (!isDailyOrHigherResolution(resolution)) {
    return dailyBars
  }

  // 1D 本身不需要聚合，直接返回
  if (resolution === '1D' || resolution === 'D') {
    return dailyBars
  }

  // 基础的聚合函数：按时间排序后合并为一根高周期 K 线
  const mergeGroup = (group: HistoryData[], explicitTime?: number): HistoryData => {
    if (group.length === 0) {
      // 理论上不会走到这里，兜底返回一个空的占位
      return {
        time: explicitTime || Date.now(),
        open: 0,
        high: 0,
        low: 0,
        close: 0,
        volume: 0,
      }
    }

    const sorted = [...group].sort((a, b) => a.time - b.time)
    const first = sorted[0]
    const last = sorted[sorted.length - 1]

    let high = first.high
    let low = first.low
    let volume = 0

    for (const b of sorted) {
      if (b.high > high) high = b.high
      if (b.low < low) low = b.low
      volume += b.volume
    }

    return {
      time: explicitTime ?? first.time,
      open: first.open,
      high,
      low,
      close: last.close,
      volume,
    }
  }

  // 将时间戳截断到对应周期的 bucket 起点（严格对齐后端逻辑，全部使用 UTC）
  const truncateToBucketStart = (ts: number, res: string): number => {
    const dayMs = 24 * 60 * 60 * 1000

    // 工具函数：截断到 UTC 当日 00:00:00
    const truncateToUtcDay = (tsMs: number): number => {
      const d = new Date(tsMs)
      return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
    }

    // 1D：对齐到当日 UTC 00:00
    if (res === '1D' || res === 'D') {
      return truncateToUtcDay(ts)
    }

    // 3D：使用与后端一致的“days since year zero % 3”算法
    if (res === '3D') {
      const startOfDayMs = truncateToUtcDay(ts)
      const yearOneMs = Date.UTC(1, 0, 1) // 0001-01-01 UTC
      const daysSinceYearOne = Math.floor((startOfDayMs - yearOneMs) / dayMs)
      const daysSinceYearZero = daysSinceYearOne + 366 // 年 0 是闰年 (366 天)
      const offset = ((daysSinceYearZero % 3) + 3) % 3 // 确保为 0,1,2
      return startOfDayMs - offset * dayMs
    }

    // 1W：对齐到当周周一 00:00 UTC
    if (res === '1W' || res === 'W') {
      const d = new Date(ts)
      const year = d.getUTCFullYear()
      const month = d.getUTCMonth()
      const date = d.getUTCDate()
      let weekday = d.getUTCDay() // 0 = Sunday ... 6 = Saturday
      if (weekday === 0) {
        weekday = 7 // Sunday = 7，与后端逻辑保持一致
      }
      const mondayDate = date - (weekday - 1)
      return Date.UTC(year, month, mondayDate)
    }

    // 1M：对齐到自然月第一天 00:00 UTC
    if (res === '1M' || res === 'M') {
      const d = new Date(ts)
      return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)
    }

    // 兜底：不截断
    return ts
  }

  // 通用逻辑：按 bucketStart 分组后聚合（3D / 1W / 1M 都统一走这条路径）
  const buckets = new Map<number, HistoryData[]>()

  for (const bar of dailyBars) {
    const bucketKey = truncateToBucketStart(bar.time, resolution)
    const list = buckets.get(bucketKey) ?? []
    list.push(bar)
    buckets.set(bucketKey, list)
  }

  return Array.from(buckets.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([bucketTime, group]) => mergeGroup(group, bucketTime))
}

async function fetchOHLCData(
  coin: string,
  resolution: string,
  to: number
): Promise<HistoryData[]> {
  try {
    const resolutionInSec = getResolutionInSeconds(resolution)
    const count = 500 // 固定柱子数量

    const endTime = to * 1000
    const startTime = (to - count * resolutionInSec) * 1000

    const resolutionMap: Record<string, string> = {
      '1': '1m',
      '3': '3m',
      '5': '5m',
      '15': '15m',
      '30': '30m',
      '60': '1h',
      '120': '2h',
      '240': '4h',
      '480': '8h',
      '720': '12h',
      '1D': '1d',
      '3D': '3d',
      '1W': '1w',
      '1M': '1M',
    }

    // 根据 TV v28 文档：日线及以上周期统一使用 1d 作为基础周期请求历史数据
    const interval = isDailyOrHigherResolution(resolution) ? '1d' : (resolutionMap[resolution] || '1h')

    const requestStart = typeof performance !== 'undefined' ? performance.now() : Date.now()

    const response = await getCandleSnapshot({
      coin,
      interval,
      startTime,
      endTime,
    })

    // 性能日志：记录接口返回时间与耗时
    try {
      const receivedAt = new Date().toISOString()
      const durationMs = Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - requestStart)
      // 仅记录关键信息，便于排查首屏加载慢问题
      // console.log(`[perf][datafeeds] 接口已返回 ${coin} ${interval} @ ${receivedAt} (耗时 ${durationMs}ms)`) // eslint-disable-line no-console
    } catch {}

    // 统一历史 K 线时间为“开盘时间”并去重/排序，保证与实时订阅一致
    const raw = handleKlineList(response)
    const normalized = normalizeBarsTime(raw, interval === '1d' ? '1D' : resolution)
    // 对于日线及以上周期，基于 1d 数据聚合出目标周期的 K 线
    const aggregated = aggregateDailyBarsToHigherResolution(normalized, resolution)
    return aggregated
  } catch (error) {
    console.error('Error fetching OHLC data:', error)
    return []
  }
}

const httpCandleList = (
  periodParams: PeriodParams,
  resolution: string,
  symbolInfo: SymbolInfo
): Promise<HistoryData[]> => {
  const { to } = periodParams
  if (!to) return Promise.resolve([])

  // 映射 resolution 到 interval

  const resolutionInSeconds = getResolutionInSeconds(resolution)

  const count = 40
  const from = to - resolutionInSeconds * count

  const coin = symbolInfo.name.split('/')[0]

  return fetchOHLCData(coin, resolution, to)
}

// Bar cache: key is `${symbol}_${resolution}`
const barCache: Record<string, Bar[]> = {};

export default class Datafeeds {
  private self: any
  private barsUpdater: DataUpdater
  private history: Record<string, HistoryData | null>
  private activeSubscriptions: Map<string, { symbol: string, resolution: string }>
  private updateEventName: string
  public newBars: any
  private resetCallbacks: Map<string, () => void>
  // 标记：在断流/网络恢复导致的重置后，下一次历史请求使用当前时间作为 to
  private useCurrentTimeForNextHistory: boolean
  
  // 重试配置
  private readonly MAX_RETRIES = 3
  private readonly BASE_RETRY_DELAY = 1000 // 基础延迟1秒
  
  constructor(vue: any) {
    this.self = vue
    this.updateEventName = this.self.getUpdateEventName()
    this.barsUpdater = new DataUpdater(this)
    this.history = {}
    this.activeSubscriptions = new Map()
    this.newBars = []
    this.resetCallbacks = new Map()
    this.useCurrentTimeForNextHistory = false
  }

  

  onReady(callback: (config: any) => void): void {
    let configuration = this.defaultConfiguration()
    if (this.self.getConfig) {
      configuration = { ...this.defaultConfiguration(), ...this.self.getConfig() }
    }

    setTimeout(() => {
      callback(configuration)
      // this.self.getOnReadyChart()
    })
  }

  resolveSymbol(
    symbolName: string,
    onSymbolResolvedCallback: (symbolInfo: SymbolInfo) => void,
    onResolveErrorCallback: (error: any) => void,
  ): void {
    new Promise((resolve) => {
      let symbolInfo = this.defaultSymbol()
      if (this.self.getSymbol && typeof this.self.getSymbol === 'function') {
        symbolInfo = { ...this.defaultSymbol(), ...this.self.getSymbol() }
      }
      resolve(symbolInfo)
    })
      .then((data) => onSymbolResolvedCallback(data as SymbolInfo))
      .catch((err) => onResolveErrorCallback(err))
  }

  // 计算重试延迟：指数退避策略 (1s, 2s, 4s)
  private getRetryDelay(attemptNumber: number): number {
    return this.BASE_RETRY_DELAY * Math.pow(2, attemptNumber - 1)
  }

  getBars(
    symbolInfo: SymbolInfo,
    resolution: string,
    periodParams: PeriodParams,
    onHistoryCallback: any,
    onErrorCallback: (error: any) => void,
  ): void {
    let newBars: HistoryData[] = []
    const firstDataRequest = periodParams.firstDataRequest
    const tempKey = this.self.getCatchName(symbolInfo, resolution)

    // 如果前一次发生了断流/网络恢复重置，则本次历史请求强制使用当前时间作为 to，
    // 避免只补到“断流发生前”的时间点
    const effectivePeriodParams: PeriodParams = {
      ...periodParams,
    }
    if (this.useCurrentTimeForNextHistory) {
      const nowSec = Math.floor(Date.now() / 1000)
      effectivePeriodParams.to = nowSec
      this.useCurrentTimeForNextHistory = false
    }

    // 带重试的数据获取函数
    const fetchWithRetry = async (attemptNumber = 1): Promise<void> => {
      try {
        const data = await httpCandleList(effectivePeriodParams, resolution, symbolInfo)
        
        if (data && data.length > 0) {
          newBars = data

          // 首屏优先：先设置必要的状态，再立刻回调渲染
          if (firstDataRequest) {
            this.history[tempKey] = newBars[newBars.length - 1]
            this.newBars = newBars
          }

          onHistoryCallback(newBars, {
            noData: false,
          })

          // 非关键路径异步处理，避免阻塞首屏
          setTimeout(() => {
            const cacheKey = `${symbolInfo.name}_${resolution}`
            if (!barCache[cacheKey]) {
              barCache[cacheKey] = []
            }
            // 确保缓存内也使用标准化后的时间戳（开盘时间）
            barCache[cacheKey].push(...data)
          }, 0)
        } else {
          if (Array.isArray(data) && data.length === 0) {
            // 数据为空数组，不重试，直接回调 noData
            onHistoryCallback([], { noData: true })
          } else {
            // 数据不是数组，考虑报错并重试
            if (attemptNumber <= this.MAX_RETRIES) {
              const delay = this.getRetryDelay(attemptNumber)
              console.warn(`[K线数据] 历史数据为空，${delay}ms后进行第${attemptNumber}次重试 (共${this.MAX_RETRIES}次)`)
              setTimeout(() => fetchWithRetry(attemptNumber + 1), delay)
            } else {
              console.error(`[K线数据] 历史数据获取失败：已重试${this.MAX_RETRIES}次，数据仍为空`)
              onHistoryCallback([], { noData: true })
            }
          }
        }
      } catch (err) {
        console.error(`[K线数据] 获取历史数据失败 (第${attemptNumber}次尝试):`, err)
        
        if (attemptNumber <= this.MAX_RETRIES) {
          const delay = this.getRetryDelay(attemptNumber)
          console.log(
            `[K线数据] ${delay}ms后进行第${attemptNumber}次重试 (共${this.MAX_RETRIES}次)`
          )
          setTimeout(() => fetchWithRetry(attemptNumber + 1), delay)
        } else {
          console.error(`[K线数据] 历史数据获取失败：已重试${this.MAX_RETRIES}次`)
          onHistoryCallback([], { noData: true })
        }
      }
    }

    // 开始获取数据（第1次尝试）
    fetchWithRetry(1)
  }


  subscribeBars(
    symbolInfo: SymbolInfo,
    resolution: string,
    onTick: SubscribeBarsCallback,
    subscriberUID: string,
    onResetCacheNeededCallback: () => void,
  ): void {
    const tempKey = this.self.getCatchName(symbolInfo, resolution)
    const lastBars = this.history[tempKey]!
    
    this.activeSubscriptions.set(subscriberUID, {
      symbol: symbolInfo.name,
      resolution: resolution
    });
    // 保存重置回调以便网络恢复后通知图表重新获取历史数据
    this.resetCallbacks.set(subscriberUID, onResetCacheNeededCallback)
    
    this.barsUpdater.subscribeBars(lastBars, symbolInfo, resolution, onTick, subscriberUID)
  }

  unsubscribeBars(subscriberUID: string): void {
    // console.log('[Datafeeds] unsubscribeBars 被调用:', {
    //   subscriberUID,
    //   hasSubscription: this.activeSubscriptions.has(subscriberUID)
    // })
    
    const subscription = this.activeSubscriptions.get(subscriberUID);
    
    if (subscription) {
      // 通知 DataUpdater 移除此订阅者
      // 根据 TradingView 文档：unsubscribeBars 会在用户切换到其他符号或分辨率时被调用
      this.barsUpdater.unsubscribeBarsById(subscriberUID);
      
      this.activeSubscriptions.delete(subscriberUID);
      this.resetCallbacks.delete(subscriberUID);
      
      // console.log('[Datafeeds] 订阅已移除:', subscriberUID, '剩余订阅数量:', this.activeSubscriptions.size)
    }
  }

  // 供 DataUpdater 或其它外部触发：重置所有当前活跃订阅，让 TV 重新拉历史
  public triggerResetForAllActive() {
    try {
      console.log('[trigger] active size', this.activeSubscriptions.size, 'cb size', this.resetCallbacks.size)
      
      // 检查是否有活跃订阅
      if (this.activeSubscriptions.size === 0) {
        console.log('[trigger] no active subscriptions, skipping reset')
        return
      }

      // 下次历史请求强制使用当前时间作为 to，避免只补到“断流发生前”的时间点
      this.useCurrentTimeForNextHistory = true

      this.clearActiveCaches()
      this.callAllResetCallbacks()
      
      // 延迟执行图表刷新，确保回调已执行完成
      setTimeout(() => {
        this.refreshChart()
      }, 0)
    } catch (error) {
      console.error('Error in triggerResetForAllActive:', error)
    }
  }

  // 清理所有活跃订阅的缓存
  private clearActiveCaches() {
    const clearedKeys = new Set<string>()
    for (const { symbol, resolution } of this.activeSubscriptions.values()) {
      const cacheKey = `${symbol}_${resolution}`
      if (!clearedKeys.has(cacheKey)) {
        console.log('[trigger] clear cacheKey', cacheKey)
        delete barCache[cacheKey]
        clearedKeys.add(cacheKey)
      }
    }
  }

  // 调用所有订阅者的重置回调
  private callAllResetCallbacks() {
    for (const cb of this.resetCallbacks.values()) {
      try {
        console.log('[trigger] call one reset cb')
        cb()
      } catch (e) {
        console.error('Error calling onResetCacheNeededCallback:', e)
      }
    }
  }

  // 按文档刷新图表：If you need to change historical data, you should call onResetCacheNeededCallback and then chart.resetData() to redraw the chart.
  private refreshChart() {
    try {
      const widget = this.self.getWidget?.()
      if (!widget) {
        console.warn('[trigger] widget not available, skipping chart refresh')
        return
      }
      
      const chart = widget.chart?.()
      if (!chart) {
        console.warn('[trigger] chart not available, skipping chart refresh')
        return
      }
      
      // 检查图表是否已准备就绪
      if (typeof chart.resetData === 'function') {
        chart.resetData()
        console.log('[trigger] chart reset successfully')
      } else {
        console.warn('[trigger] chart.resetData method not available')
      }
    } catch (e) {
      console.error('[trigger] force refresh failed', e)
    }
  }

  getMarks(
    symbolInfo: SymbolInfo,
    from: number,
    to: number,
    onDataCallback: (marks: any[]) => void,
    resolution: string,
  ): void {
    if (this.self.getMarks && typeof this.self.getMarks === 'function') {
      this.self.getMarks(symbolInfo, from, to, onDataCallback, resolution)
    }
  }

  calculateHistoryDepth(
    resolution: number,
    resolutionBack: (value: string) => void,
    intervalBack: (value: number) => void,
  ): void {
    resolutionBack('D')
    intervalBack(0.5)
  }

  defaultConfiguration() {
    return {
      supports_marks: true,
      supports_timescale_marks: true,
      supports_time: true,
      supported_resolutions: ['1', '3', '5', '15', '30', '60', '120', '240', '480', '720', '1D', '3D', '1W', '1M'],
    }
  }

  defaultSymbol(): SymbolInfo {
    return {
      name: symbolFormat('BTC/USD'),
      timezone: 'Asia/Shanghai',
      minmov: 1,
      minmov2: 0,
      pointvalue: 1,
      data_status: 'streaming',
      fractional: false,
      session: '24x7',
      has_intraday: true,
      has_daily: true,
      exchange: 'KAIROX.LIVE',
      description: symbolFormat('BTC/USD'),
      pricescale: 100,
      ticker: symbolFormat('BTC/USD'),
      has_weekly_and_monthly: true,
      daily_multipliers: ['1', '3'],
      supported_resolutions: ['1', '3', '5', '15', '30', '60', '120', '240', '480', '720', '1D', '3D', '1W', '1M'],
      has_empty_bars: true,
      has_seconds: true,
      seconds_multipliers: ['1', '5', '15', '30'],
    }
  }
  async onHistoryDataLoaded(visibleBars = 40) {
    const bars = this.newBars
    const chartWidget = this.self.getWidget?.()
    if (!chartWidget || bars.length < 2) return

    const lastBar = bars[bars.length - 1]

    // 当数据不足时，使用固定的时间范围而不是拉伸K线
    if (bars.length < visibleBars) {
      // 计算当前分辨率对应的时间间隔（毫秒）
      const chart = chartWidget.chart()
      const resolution = chart.resolution()
      const resolutionMs = this.getResolutionInMs(resolution)

      // 基于最后一根K线时间，向前推算标准的可视范围
      const standardVisibleBars = Math.max(visibleBars, 50) // 至少显示50根K线的时间范围
      const fromTime = lastBar.time - (standardVisibleBars * resolutionMs)

      chartWidget.chart().setVisibleRange({
        from: fromTime / 1000,
        to: lastBar.time / 1000,
      }, {
        percentRightMargin: 6,
        // 强制使用标准K线宽度，不拉伸
        animate: false
      })
    } else {
      // 数据充足时使用原有逻辑
      const fromBar = bars[Math.max(0, bars.length - visibleBars - 1)]

      chartWidget.chart().setVisibleRange({
        from: fromBar.time / 1000,
        to: lastBar.time / 1000,
      }, {
        percentRightMargin: 6
      })
    }
  }

  // 辅助方法：将分辨率转换为毫秒
  private getResolutionInMs(resolution: string): number {
    if (resolution.endsWith('D')) return parseInt(resolution) * 86400 * 1000
    if (resolution.endsWith('W')) return parseInt(resolution) * 7 * 86400 * 1000
    if (resolution.endsWith('M')) return parseInt(resolution) * 30 * 86400 * 1000
    return parseInt(resolution) * 60 * 1000 // 默认分钟
  }
}