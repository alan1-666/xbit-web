import { futureClient } from '@/lib/gql/apollo-client'
import { PeriodParams, SubscribeBarsCallback } from '../../public/charting_library/datafeed-api'
import DataUpdater from './dataUpdater'
import { symbolFormat } from '@/utils/helpers.ts'
import { getOHLCQuery } from '@/services/pairs.service'
import { resolutionMap, resolutionTimeFrameMap } from '@/datafeeds/index'
import { getChainId, TYPE_CHAIN } from '@/lib/blockchain'

interface SymbolInfo {
  name: string
  address: string
  timezone: string
  minmov: number
  minmov2: number
  pointvalue: number
  data_status: string
  fractional: boolean
  session: string
  has_intraday: boolean
  exchange: string
  description: string
  pricescale: number
  ticker: string
  has_weekly_and_monthly: boolean
  supported_resolutions: string[]
  totalSupply: number
  chainId: number
  isPatch: boolean
}

interface HistoryData {
  time: number
  open: number
  close: number
  high: number
  low: number
  volume: number
  price: number
}

const handleKlineList = (data: any[]): HistoryData[] => {
  if (!Array.isArray(data)) return []
  const list = data
    .map((item) => ({
      time: item.ts * 1000,
      open: parseFloat(item.open) || 0,
      high: parseFloat(item.high) || 0,
      low: parseFloat(item.low) || 0,
      close: parseFloat(item.close) || 0,
      volume: parseFloat(item.usdVolume) || 0,
      price: parseFloat(item.price) || 0,
    }))
    .reverse()
  return list
}

async function fetchOHLCData(requestParams: any) {
  try {
    return futureClient.query({
      query: getOHLCQuery,
      variables: {
        input: requestParams,
      },
    })
  } catch (error) {
    console.error('Error fetching OHLC data:', error)
  }
}
const API_LIMIT = 300
const DEFAULT_BAR_REQUEST = 200

const httpCandleList = async (periodParams: PeriodParams, resolution: string, symbolInfo: SymbolInfo): Promise<HistoryData[]> => {
  const { from, to, countBack } = periodParams
  const timeframe = resolutionMap[resolution]
  const timeframeInSeconds = resolutionTimeFrameMap[resolution]

  if (!timeframe || !timeframeInSeconds) {
    console.warn(`⚠️ Unsupported resolution ${resolution}`)
    return []
  }

  const requestedBars = Math.max(countBack ?? DEFAULT_BAR_REQUEST, 1)

  let remainingBars = requestedBars
  let cursor = to

  const aggregated: HistoryData[] = []

  while (remainingBars > 0) {
    const currentLimit = Math.min(remainingBars, API_LIMIT)
    // limit should be at least 10 to avoid non-continuous data
    const limit = Math.max(currentLimit, 10)

    const requestParams = {
      timeframe,
      token: symbolInfo.address,
      fromTimeStamp: cursor,
      limit,
      chainId: symbolInfo.chainId,
      isMC: symbolInfo.name.includes('-MC'),
      isPatch: symbolInfo.name.includes('-PATCH'),
    }

    const response = await fetchOHLCData(requestParams)
    const chunk = handleKlineList(response?.data?.getOHLC || [])

    if (!chunk.length) {
      break
    }

    aggregated.unshift(...chunk)
    remainingBars -= chunk.length

    const earliestBarTimeMs = chunk[0]?.time
    if (!earliestBarTimeMs) {
      break
    }

    if (!countBack && from && earliestBarTimeMs <= from * 1000) {
      break
    }

    if (countBack && aggregated.length >= countBack) {
      break
    }

    cursor = Math.floor(earliestBarTimeMs / 1000) - timeframeInSeconds
  }

  const deduped = Array.from(
    aggregated
      .reduce((map, bar) => {
        map.set(bar.time, bar)
        return map
      }, new Map<number, HistoryData>())
      .values(),
  )
    .sort((a, b) => a.time - b.time)
    .slice(-requestedBars)

  return deduped
}

// if open of current bar is not equal to close of previous bar,
// then fill the gap with the previous bar's close
function fixNonContinuousData(sortedBars: HistoryData[]): HistoryData[] {
  if (sortedBars.length === 0) return sortedBars

  const fixedBars: HistoryData[] = []
  let previousBar: HistoryData | null = null

  for (const bar of sortedBars) {
    // Create a copy to avoid mutating the original
    const fixedBar: HistoryData = { ...bar }

    if (previousBar && fixedBar.open !== previousBar.close) {
      fixedBar.open = previousBar.close
    }

    previousBar = fixedBar
    fixedBars.push(fixedBar)
  }

  return fixedBars
}

export default class Datafeeds {
  private self: any
  private barsUpdater: DataUpdater
  private history: Record<string, HistoryData | null>
  private retryCounts: Record<string, number>
  private retryTimeouts: Record<string, NodeJS.Timeout>

  constructor(vue: any) {
    this.self = vue
    this.barsUpdater = new DataUpdater(this)
    this.history = {}
    this.retryCounts = {}
    this.retryTimeouts = {}
  }

  onReady(callback: (config: any) => void): void {
    let configuration = this.defaultConfiguration()
    if (this.self.getConfig()) {
      configuration = { ...this.defaultConfiguration(), ...this.self.getConfig() }
    }

    setTimeout(() => {
      callback(configuration)
      // this.self.getOnReadyChart()
    })
  }

  clearAllRetry() {
    Object.keys(this.retryTimeouts).forEach((key) => {
      clearTimeout(this.retryTimeouts[key])
      delete this.retryTimeouts[key]
    })
    this.retryCounts = {}
    console.log('✅ Cleared all retry timeouts')
  }

  resolveSymbol(
    symbolName: string,
    onSymbolResolvedCallback: (symbolInfo: SymbolInfo) => void,
    onResolveErrorCallback: (error: any) => void,
  ): void {
    try {
      let symbolInfo = this.defaultSymbol()

      if (this.self.getSymbol && typeof this.self.getSymbol === 'function') {
        const userSymbol = this.self.getSymbol() // could be dynamic
        symbolInfo = {
          ...symbolInfo,
          ...userSymbol,
          name: userSymbol.name,
          ticker: userSymbol.name,
        }

        // Optionally: handle pricescale for marketcap
        if (userSymbol.name.includes('-MC')) {
          symbolInfo.pricescale = 100000
        }
      }

      setTimeout(() => {
        onSymbolResolvedCallback(symbolInfo)
      }, 0)
    } catch (err) {
      onResolveErrorCallback(err)
    }
  }

  getBars(
    symbolInfo: SymbolInfo,
    resolution: string,
    periodParams: PeriodParams,
    onHistoryCallback: any,
    onErrorCallback: (error: any) => void,
  ): void {
    const firstDataRequest = periodParams.firstDataRequest
    const tempKey = this.self.getCatchName(symbolInfo, resolution)
    const MAX_RETRY = 5

    if (firstDataRequest) {
      this.retryCounts[tempKey] = 0

      if (this.retryTimeouts[tempKey]) {
        clearTimeout(this.retryTimeouts[tempKey])
        delete this.retryTimeouts[tempKey]
      }
    }

    const fetchData = () => {
      const retryCount = this.retryCounts[tempKey] ?? 0

      if (retryCount >= MAX_RETRY) {
        console.warn(`🚫 Stop retrying after ${MAX_RETRY} attempts for ${tempKey}`)
        delete this.retryCounts[tempKey]
        if (this.retryTimeouts[tempKey]) {
          clearTimeout(this.retryTimeouts[tempKey])
          delete this.retryTimeouts[tempKey]
        }
        onHistoryCallback([], { noData: true })
        return
      }

      httpCandleList(periodParams, resolution, symbolInfo)
        .then((bars) => {
          if (!bars.length) {
            if (firstDataRequest) {
              const delay = Math.min(2000 * Math.pow(2, retryCount), 60000)
              console.warn(`⚠️ No OHLC data, retry in ${delay / 1000}s (attempt ${retryCount + 1}/${MAX_RETRY})`)

              this.retryCounts[tempKey] = retryCount + 1
              this.retryTimeouts[tempKey] = setTimeout(fetchData, delay)
            } else {
              onHistoryCallback([], { noData: true })
            }
            return
          }

          const fixedBars = fixNonContinuousData(bars)

          if (firstDataRequest) {
            this.history[tempKey] = fixedBars[fixedBars.length - 1]
          }
          onHistoryCallback(fixedBars, {
            noData: fixedBars.length < (periodParams.countBack ?? 0),
          })

          this.retryCounts[tempKey] = 0
          if (this.retryTimeouts[tempKey]) {
            clearTimeout(this.retryTimeouts[tempKey])
            delete this.retryTimeouts[tempKey]
          }
        })
        .catch((err) => {
          console.error('❌ Error fetching OHLC:', err)
          onHistoryCallback([], { noData: true })
          onErrorCallback(err)
          this.history[tempKey] = null

          if (firstDataRequest) {
            const delay = Math.min(2000 * Math.pow(2, retryCount), 60000)
            console.warn(`⚠️ Retry after error in ${delay / 1000}s (attempt ${retryCount + 1}/${MAX_RETRY})`)

            this.retryCounts[tempKey] = retryCount + 1
            this.retryTimeouts[tempKey] = setTimeout(fetchData, delay)
          }
        })
    }

    fetchData()
  }

  subscribeBars(
    symbolInfo: SymbolInfo,
    resolution: string,
    onTick: SubscribeBarsCallback,
    subscriberUID: string,
    onResetCacheNeededCallback: () => void,
  ): void {
    const tempKey = this.self.getCatchName(symbolInfo, resolution)
    const totalSupply = symbolInfo.totalSupply
    const lastBars = this.history[tempKey]!
    if (this.history[tempKey]!) {
      this.barsUpdater.subscribeBars(
        lastBars,
        symbolInfo,
        resolution,
        onTick,
        subscriberUID,
        totalSupply,
        symbolInfo.chainId,
        onResetCacheNeededCallback,
      )
    }
  }

  unsubscribeBars(subscriberUID: string): void {
    this.barsUpdater.unsubscribeBars(subscriberUID)
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
    }
  }

  defaultSymbol(): SymbolInfo {
    return {
      name: symbolFormat('BTC/USD'),
      address: '',
      timezone: 'Asia/Shanghai',
      minmov: 1,
      minmov2: 0,
      pointvalue: 1,
      data_status: 'streaming',
      fractional: false,
      session: '24x7',
      has_intraday: true,
      exchange: 'XBIT.LIVE',
      description: symbolFormat('BTC/USD'),
      pricescale: 100,
      ticker: symbolFormat('BTC/USD'),
      has_weekly_and_monthly: true,
      supported_resolutions: ['1S', '30S', '1', '5', '15', '30', '60', '240', '1D', '1W'],
      totalSupply: 1,
      chainId: getChainId(TYPE_CHAIN.SOLANA),
    }
  }
}
