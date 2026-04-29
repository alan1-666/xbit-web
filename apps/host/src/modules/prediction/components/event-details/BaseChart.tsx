import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import { ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import { Timeframe } from '@/@generated/gql/graphql-prediction.ts'
import { useMultipleMarketPricesHistoryV2 } from '@/modules/prediction/hooks/useMultipleMarketPricesHistory.ts'
import { EChartsOption } from 'echarts'
import { SeriesOption } from 'echarts/types/dist/echarts'
import dayjs from 'dayjs'
import { cn } from '@/lib/utils.ts'
import { formatVolume } from '@/lib/format'
import { useEventDetailsPageContext } from '../../contexts/EventDetailsPageContext'
import { useTranslation } from 'react-i18next'
import { getPriceHistoryTimeframe } from './event-series/utils'

/** Payload passed to onDataReady when chart data or timeframe changes */
export interface ChartDataReadyPayload {
  selectedTimeframe: Timeframe
  /** Price change % = (lastPrice - firstPrice) / firstPrice * 100. For first series. */
  priceHistoryValue: number | null
}

export interface BaseChartProps {
  markets: MarketModel[]
  isPending: boolean
  isLive?: boolean
  volume?: number | null
  /** Hide the volume / "new" header row */
  hideVolumeHeader?: boolean
  recurrence?: string | null
  /** Optional initial timeframe override. Defaults to 1D (or 1M for variant='market'). */
  initialTimeframe?: Timeframe
  /** Called when chart data or selected timeframe changes. Only for this chart instance. */
  onDataReady?: (data: ChartDataReadyPayload) => void
  /** When 'market', uses compact timeframe style (1H, 24H, 7D, 30D, All) with purple active state */
  variant?: 'default' | 'market'
  /** Content to render on the right of timeframe row (e.g. price). Used with variant="market" */
  timeframeRowEnd?: ReactNode
}

const timeframeOptions = [
  { label: '1H', value: Timeframe.Timeframe1H },
  { label: '6H', value: Timeframe.Timeframe6Hour },
  { label: '1D', value: Timeframe.Timeframe1Day },
  { label: '1W', value: Timeframe.Timeframe1Week },
  { label: '1M', value: Timeframe.Timeframe1Month },
  { label: 'All', value: Timeframe.TimeframeAll },
]

const marketTimeframeOptions = [
  { label: '1H', value: Timeframe.Timeframe1H },
  { label: '24H', value: Timeframe.Timeframe1Day },
  { label: '7D', value: Timeframe.Timeframe1Week },
  { label: '30D', value: Timeframe.Timeframe1Month },
  { label: 'All', value: Timeframe.TimeframeAll },
]

const formatAxisLabel = (value: number, timeframe: Timeframe) => {
  const date = dayjs(value)
  switch (timeframe) {
    case Timeframe.Timeframe1H:
    case Timeframe.Timeframe6Hour:
      return date.format('HH:mm')
    case Timeframe.Timeframe1Day:
      return date.format('MMM DD HH:mm')
    case Timeframe.Timeframe1Week:
    case Timeframe.Timeframe1Month:
    case Timeframe.TimeframeAll:
      return date.format('MMM DD')
    default:
      return date.format('MMM DD')
  }
}
// ECharts default color palette (used for custom DOM legend on mobile)
const CHART_COLORS = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']

// Static configs - defined outside component to avoid recreation
const baseAxisConfig: EChartsOption['xAxis'] = {
  type: 'time',
  // @ts-expect-error disable type check
  scale: true,
  splitLine: { show: false },
  axisLine: { show: false },
  axisTick: { show: false },
}

export const BaseChart = (props: BaseChartProps) => {
  const {
    markets,
    isLive,
    volume,
    hideVolumeHeader,
    recurrence,
    initialTimeframe,
    onDataReady,
    variant = 'default',
    timeframeRowEnd,
  } =
    props
  const { t } = useTranslation()
  const { isFetching } = useEventDetailsPageContext()

  const chartRef = useRef<ReactECharts>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [selectedTimeframe, setSelectedTimeframe] = useState(
    initialTimeframe ?? (variant === 'market' ? Timeframe.Timeframe1Month : getPriceHistoryTimeframe(recurrence) || Timeframe.Timeframe1Day),
  )
  const [isMobile, setIsMobile] = useState(false)
  const [displayTimeFrame, setDisplayTimeFrame] = useState(false)

  useEffect(() => {
    if (variant === 'market') {
      setDisplayTimeFrame(true)
    } else if (!recurrence || (recurrence && recurrence == 'monthly')) {
      setDisplayTimeFrame(true)
    } else {
      setDisplayTimeFrame(false)
    }
  }, [recurrence, variant])
  // Detect mobile screen
  useLayoutEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fetch price history
  // const { data: pricesHistoryMap, isLoading } = useMultipleMarketPricesHistory(marketIds, selectedTimeframe)
  const { data: pricesHistoryMap = {}, isLoading } = useMultipleMarketPricesHistoryV2(markets, selectedTimeframe)

  // Check if we have data
  const isDataReady = useMemo(() => {
    if (!pricesHistoryMap || isLoading) return false
    return Object.values(pricesHistoryMap).some((history) => history.length > 0)
  }, [pricesHistoryMap, isLoading])

  // Build series data and chance per series (same as MarketItem2: outcomePrices[0] as %).
  const { series, chanceBySeries } = useMemo(() => {
    if (!isDataReady) return { series: [] as SeriesOption[], chanceBySeries: [] as (number | null)[] }

    const result: SeriesOption[] = []
    const chances: (number | null)[] = []
    markets.forEach((market, index) => {
      const clobId = market?.clobTokenIds?.[0]
      if (clobId) {
        const pricesHistory = pricesHistoryMap[clobId] || []

        // Sort history by time to ensure line chart renders correctly
        // Copy array to avoid mutating read-only data from Apollo
        const sortedHistory = [...pricesHistory].sort((a, b) => Number(a.t) - Number(b.t))

        if (sortedHistory.length === 0) return

        const chance =
          market?.outcomePrices?.[0] != null ? Math.round(Number(market.outcomePrices[0]) * 100) : null
        chances.push(chance)
        result.push({
          name: market.groupItemTitle || '',
          type: 'line',
          // Ensure t/p are numbers. Check for validity.
          data: sortedHistory
            .filter((p) => !isNaN(Number(p.t)) && !isNaN(Number(p.p)))
            .map((price) => [Math.round(Number(price.t) / 10) * 10000, Number(price.p) * 100]),
          // Show symbol if points are sparse (length < 2) otherwise line is invisible
          symbol: sortedHistory.length < 2 ? 'circle' : 'none',
          showSymbol: sortedHistory.length < 2,
          smooth: true,
          connectNulls: true,
          color: CHART_COLORS[index % CHART_COLORS.length],
        })
      }
    })
    return { series: result, chanceBySeries: chances }
  }, [markets, pricesHistoryMap, isDataReady])

  // Notify parent when chart data or timeframe changes (only when data is ready and not loading)
  useEffect(() => {
    if (!onDataReady || isLoading || !isDataReady || series.length === 0) return

    const firstSeries = series[0]
    const dataPoints = firstSeries?.data as [number, number][] | undefined
    let priceHistoryValue: number | null = null
    if (dataPoints && dataPoints.length >= 2) {
      const firstPrice = dataPoints[0][1]
      const lastPrice = dataPoints[dataPoints.length - 1][1]
      if (firstPrice !== 0) {
        priceHistoryValue = lastPrice - firstPrice
      }
    } else if (dataPoints && dataPoints.length === 1) {
      priceHistoryValue = 0
    }

    onDataReady({ selectedTimeframe, priceHistoryValue })
  }, [onDataReady, series, selectedTimeframe, isDataReady, isLoading])

  // Placeholder time range for loading state
  const placeholderRange = useMemo(() => {
    const now = dayjs()
    const durations: Record<string, [number, dayjs.ManipulateType]> = {
      [Timeframe.Timeframe1H]: [1, 'hour'],
      [Timeframe.Timeframe6Hour]: [6, 'hour'],
      [Timeframe.Timeframe1Day]: [1, 'day'],
      [Timeframe.Timeframe1Week]: [1, 'week'],
      [Timeframe.Timeframe1Month]: [1, 'month'],
      [Timeframe.TimeframeAll]: [1, 'month'],
    }
    const [amount, unit] = durations[selectedTimeframe] || [1, 'day']
    return { min: now.subtract(amount, unit).valueOf(), max: now.valueOf() }
  }, [selectedTimeframe])

  // Build chart options
  const chartOption = useMemo(() => {
    const labelColor = isDataReady ? 'rgba(156, 163, 175, 1)' : 'rgba(156, 163, 175, 0.5)'
    const fontSize = isMobile ? 10 : 12
    const tooltipFontSize = isMobile ? 12 : 14
    const splitNumber = isMobile ? 3 : 4
    return {
      animation: true,
      animationDuration: 800,
      animationEasing: 'cubicOut',
      grid: {
        top: isMobile ? 12 : 16,
        left: isMobile ? 4 : 0,
        right: isMobile ? 4 : 0,
        bottom: 0,
        containLabel: true,
      },
      xAxis: {
        ...baseAxisConfig,
        ...(isDataReady ? {} : { min: placeholderRange.min, max: placeholderRange.max }),
        axisLabel: {
          formatter: (value: number) => formatAxisLabel(value, selectedTimeframe),
          margin: isMobile ? 12 : 20,
          fontSize,
          fontWeight: 500,
          interval: 'auto',
          hideOverlap: true,
          color: labelColor,
        },
        splitNumber,
      },
      yAxis: {
        type: 'value',
        position: 'right',
        scale: isDataReady,
        ...(isDataReady ? {} : { min: 0, max: 100, interval: 25 }),
        splitNumber,
        axisLabel: {
          formatter: '{value}%',
          fontSize,
          fontWeight: 500,
          color: labelColor,
        },
        splitLine: {
          show: true,
          lineStyle: { type: 'dashed', color: '#3b3b3b', width: 1 },
        },
      },
      series,
      tooltip: {
        trigger: 'axis',
        show: isDataReady,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#333',
        textStyle: { fontSize: tooltipFontSize },
        valueFormatter: (value: number) => `${Number(value).toFixed(0)}%`,
        confine: true, // Keep tooltip inside chart container
        axisPointer: {
          type: 'line',
          snap: false,
          lineStyle: { color: '#6b7280', type: 'dashed' },
          label: {
            show: !isMobile, // Hide axis pointer label on mobile
            position: 'top',
            backgroundColor: '#0f172a',
            color: '#e5e7eb',
            padding: [4, 8],
            borderRadius: 4,
            fontSize: 11,
            formatter: (p: any) => dayjs(p.value).format(isMobile ? 'MM/DD HH:mm' : 'YYYY-MM-DD HH:mm'),
          },
        },
      },
      legend: { show: false },
    }
  }, [series, selectedTimeframe, isDataReady, placeholderRange, isMobile])

  // Debounced resize handler with ResizeObserver
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>
    let resizeObserver: ResizeObserver | null = null

    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        chartRef.current?.getEchartsInstance()?.resize()
      }, 100)
    }

    // Use ResizeObserver for better container resize detection
    if (containerRef.current && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(handleResize)
      resizeObserver.observe(containerRef.current)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      clearTimeout(timeoutId)
      resizeObserver?.disconnect()
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  if (isFetching && !isDataReady && !isLoading) return null

  if (!isDataReady && !isLoading && !isFetching)
    return (
      <div className="h-75 flex items-center justify-center text-gray-500 flex-col gap-2 text-sm">
        <img src="/images/icons/ic-empty.png" className="w-20 h-20" />
        No data available{' '}
      </div>
    )

  const options = variant === 'market' ? marketTimeframeOptions : timeframeOptions

  return (
    <div className="relative w-full space-y-2 pb-4 md:space-y-4">
      <div className="flex items-center justify-between w-full">
        {!hideVolumeHeader && (
          <div className="hidden xl:block whitespace-nowrap text-xl font-semibold text-white">
          {!volume || Number(volume) === 0 ? (
            <span className="text-xs font-medium bg-[#230D43] text-[#AB70FF] px-2 py-0.5 rounded-full">
              {t('prediction.eventCard.new')}
            </span>
          ) : (
            `$${formatVolume(volume)} Vol.`
          )}
        </div>)}
        {/* Timeframe buttons */}
        {!isLive && displayTimeFrame && (
          <div
            className={cn(
              'flex flex-wrap items-center w-full md:w-fit',
              variant === 'market' ? 'justify-between px-3' : 'gap-3',
            )}
          >
            <div
              className={cn(
                'flex flex-wrap items-center w-full md:justify-start md:w-fit',
                variant === 'market' ? 'gap-5 ' : 'gap-3 justify-between',
              )}
            >
              {options.map((timeframe) => (
                <button
                  key={timeframe.value}
                  className={cn(
                    variant === 'market'
                      ? 'flex items-center justify-center px-0 py-1.5 text-xs font-normal leading-3 transition-colors hover:text-white capitalize'
                      : 'flex h-6 items-center justify-center rounded-xl bg-[#1E1E1EB2] px-4 text-xs text-[#908E98] hover:text-white uppercase',
                    variant === 'market'
                      ? selectedTimeframe === timeframe.value
                        ? 'text-[#AB70FF]'
                        : 'text-[#908E98]'
                      : selectedTimeframe === timeframe.value && 'bg-[#230D43] text-[#AB70FF]',
                  )}
                  onClick={() => setSelectedTimeframe(timeframe.value)}
                >
                  {timeframe.label}
                </button>
              ))}
            </div>
            {variant === 'market' && timeframeRowEnd && (
              <div className="text-xs font-normal leading-3 text-[#908E98]">{timeframeRowEnd}</div>
            )}
          </div>
        )}
      </div>

      <div ref={containerRef} className="relative w-full overflow-hidden rounded-lg h-[256px] px-2">
        <ReactECharts
          ref={chartRef}
          option={chartOption}
          className="h-full w-full"
          autoResize={true}
          style={{ width: '100%', height: '256px' }}
          lazyUpdate
          notMerge
        />

        {/* Loading overlay */}
        <div
          className={cn(
            'pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300',
            !isFetching ? 'opacity-0' : 'bg-black/40 opacity-100',
          )}
        >
          {!isFetching && (
            <div className="relative">
              <div className="h-10 w-10 rounded-full border-2 border-gray-700" />
              <div className="absolute inset-0 h-10 w-10 animate-spin rounded-full border-2 border-transparent border-t-blue-500" />
            </div>
          )}
        </div>
      </div>

      {series.length > 1 && (
        <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-[#2A2A3A] pt-3 xl:grid-cols-4 xl:place-items-center">
          {series.map((s, i) => {
            const chance = chanceBySeries[i] ?? null
            const displayChance = chance != null ? (chance ? chance : '<1') : '--'

            return (
              <div key={i} className="flex min-w-0 items-center gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-1">
                  <div
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  <span className="min-w-0 wrap-break-word text-xs text-[#908E98] line-clamp-2">
                    {s.name as string}
                  </span>
                </div>
                <span className="text-xs text-[#ffffffc9]">{displayChance}%</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
