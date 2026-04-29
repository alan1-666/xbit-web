import { Timeframe, TransactionDto } from '@/@generated/gql/graphql-meme2'
import { useOHLCWithUsdVolume } from '@/hooks/useOHLCWithUsdVolume'
import { formatAmount, formatPrice, formatVolume } from '@/lib/format'
import dayjs from 'dayjs'
import type { EChartsOption } from 'echarts'
import ReactECharts from 'echarts-for-react'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { TimeRange } from './index'

type OhlcWithUsdVolumeRecord = {
  ts: number | string | null | undefined
  usdVolume: number | string | null | undefined
  price: number | string | null | undefined
}

interface EChartsLineChartProps {
  className?: string
  token: string
  chainId: number
  timeRange: TimeRange
  transactions?: TransactionDto[]
  avgBuyPrice?: number
  avgSellPrice?: number
  currentPrice?: number
}

const EChartsLineChart: React.FC<EChartsLineChartProps> = ({
  className,
  token,
  chainId,
  timeRange,
  transactions = [],
  avgBuyPrice = 0,
  avgSellPrice = 0,
  currentPrice = 0,
}) => {
  const { t } = useTranslation()

  // Helper function to convert timestamp to seconds
  const toSeconds = (timestamp: number | string | null | undefined): number => {
    if (!timestamp) return 0
    const num = typeof timestamp === 'string' ? Number(timestamp) : timestamp
    return Math.floor(num / 1000)
  }

  const firstTimeStamp = useMemo(() => {
    const now = Math.floor(Date.now() / 1000)
    const ranges: Record<TimeRange, number> = {
      [TimeRange['4H']]: 4 * 60 * 60,
      [TimeRange['1D']]: 24 * 60 * 60,
      [TimeRange['7D']]: 7 * 24 * 60 * 60,
      [TimeRange['30D']]: 30 * 24 * 60 * 60,
    }
    return now - (ranges[timeRange] ?? ranges[TimeRange['4H']])
  }, [timeRange])

  // getOHLC return max 500 records from now backwards so we need to adjust timeframe based on timeRange
  const timeframe = useMemo(() => {
    const timeframes: Record<TimeRange, Timeframe> = {
      [TimeRange['4H']]: Timeframe.S30, // maximum: 4*60*60/30 = 480 points
      [TimeRange['1D']]: Timeframe.M5, // maximum: 24*60/5 = 288 points
      [TimeRange['7D']]: Timeframe.M30, // maximum: 7*24*60/30 = 336 points
      [TimeRange['30D']]: Timeframe.H2, // maximum: 30*24/2 = 360 points
    }
    return timeframes[timeRange] ?? Timeframe.S30
  }, [timeRange])

  const { data: ohlcWithUsdVolumeData } = useOHLCWithUsdVolume({
    variables: { input: { token, chainId, timeframe } },
    skip: !token || !chainId,
  })

  const chartData = useMemo<[Date, number][]>(() => {
    const currentTimeStamp = Math.floor(Date.now() / 1000)

    let records = (ohlcWithUsdVolumeData?.getOHLC as OhlcWithUsdVolumeRecord[]) ?? []
    records = records.filter((record) => {
      if (!record.ts) return false
      const ts = typeof record.ts === 'string' ? Number(record.ts) : record.ts
      return ts >= firstTimeStamp
    })

    // Add transaction records within valid range
    const transactionRecords: OhlcWithUsdVolumeRecord[] = transactions
      .filter((tx) => {
        const timestamp = Number(tx.timestamp ?? 0)
        if (timestamp <= 0) return false
        const tsInSeconds = toSeconds(timestamp)
        return tsInSeconds >= firstTimeStamp && tsInSeconds <= currentTimeStamp
      })
      .map((tx) => {
        const timestamp = Number(tx.timestamp ?? 0)
        const tsInSeconds = toSeconds(timestamp)
        return {
          ts: tsInSeconds as number | string | null | undefined,
          price: Number(tx.usdPrice ?? tx.price ?? 0) as number | string | null | undefined,
          usdVolume: Number(tx.usdAmount ?? 0) as number | string | null | undefined,
        }
      })

    if (transactionRecords.length === 0) {
      // If no transaction records, add a dummy record at firstTimeStamp to ensure chart covers the range
      transactionRecords.push({
        ts: firstTimeStamp,
        price: 0,
        usdVolume: 0,
      })
    }

    // Add currentPrice point if valid
    if (currentPrice > 0 && Number.isFinite(currentPrice)) {
      transactionRecords.push({
        ts: currentTimeStamp,
        price: currentPrice,
        usdVolume: 0,
      })
    }

    // Merge and sort all records
    const allRecords = [...records, ...transactionRecords].sort((a, b) => {
      const tsA = typeof a.ts === 'string' ? Number(a.ts) : (a.ts ?? 0)
      const tsB = typeof b.ts === 'string' ? Number(b.ts) : (b.ts ?? 0)
      return tsA - tsB
    })

    // Map to chart data format
    return allRecords
      .map((record) => {
        const ts = typeof record.ts === 'string' ? Number(record.ts) : (record.ts ?? 0)
        const price = typeof record.price === 'string' ? Number(record.price) : (record.price ?? 0)
        const priceNumber = Number.isFinite(price) ? price : 0
        return [new Date(ts * 1000), priceNumber] as [Date, number]
      })
      .filter(([, price]) => price >= 0)
  }, [ohlcWithUsdVolumeData, firstTimeStamp, transactions, currentPrice, timeRange])

  // Helper to check if price is valid
  const isValidPrice = (price: number): boolean => {
    return price > 0 && Number.isFinite(price)
  }

  // Calculate yAxis min/max from data
  const { yAxisMin, yAxisMax, yAxisInterval } = useMemo(() => {
    // Collect all relevant price values
    const relevantPrices: number[] = []

    // Add chart data prices
    chartData.forEach(([, value]) => {
      if (isValidPrice(value)) relevantPrices.push(value)
    })

    // Add average buy/sell prices if valid
    if (isValidPrice(avgBuyPrice)) relevantPrices.push(avgBuyPrice)
    if (isValidPrice(avgSellPrice)) relevantPrices.push(avgSellPrice)
    if (isValidPrice(currentPrice)) relevantPrices.push(currentPrice)

    // Add transaction prices
    transactions.forEach((tx) => {
      const price = Number(tx.usdPrice ?? tx.price ?? 0)
      if (isValidPrice(price)) relevantPrices.push(price)
    })

    // If no valid prices, return defaults
    if (relevantPrices.length === 0) {
      return { yAxisMin: 0, yAxisMax: 1000, yAxisInterval: 200 }
    }

    const min = Math.min(...relevantPrices)
    const max = Math.max(...relevantPrices)
    const range = max - min

    // Handle case when min === max
    if (range === 0) {
      const padding = max * 0.1 || 1
      return {
        yAxisMin: Math.max(0, max - padding),
        yAxisMax: max + padding,
        yAxisInterval: padding / 2 || 1,
      }
    }

    // Add padding (15% on each side)
    const padding = range * 0.15
    const adjustedMin = Math.max(0, min - padding)
    const adjustedMax = max + padding
    const adjustedRange = adjustedMax - adjustedMin

    // Calculate nice interval
    const targetIntervals = 5
    const rawInterval = adjustedRange / targetIntervals

    if (!isValidPrice(rawInterval)) {
      return {
        yAxisMin: adjustedMin,
        yAxisMax: adjustedMax,
        yAxisInterval: adjustedRange / 5 || 1,
      }
    }

    // Calculate magnitude and normalize
    const logValue = Math.log10(rawInterval)
    if (!Number.isFinite(logValue)) {
      return { yAxisMin: adjustedMin, yAxisMax: adjustedMax, yAxisInterval: rawInterval }
    }

    let magnitude = Math.pow(10, Math.floor(logValue)) || 1
    const normalized = rawInterval / magnitude
    let niceInterval: number

    if (normalized <= 1) niceInterval = magnitude
    else if (normalized <= 2) niceInterval = 2 * magnitude
    else if (normalized <= 5) niceInterval = 5 * magnitude
    else niceInterval = 10 * magnitude

    if (!isValidPrice(niceInterval)) niceInterval = rawInterval

    // Round min and max to nice intervals
    const roundedMin = Math.floor(adjustedMin / niceInterval) * niceInterval
    const roundedMax = Math.ceil(adjustedMax / niceInterval) * niceInterval
    const finalMin = Math.max(0, roundedMin)
    const finalMax = Math.max(finalMin + niceInterval, roundedMax)

    return { yAxisMin: finalMin, yAxisMax: finalMax, yAxisInterval: niceInterval }
  }, [chartData, avgBuyPrice, avgSellPrice, currentPrice, transactions])

  // Calculate xAxis min/max from data
  const { xAxisMin, xAxisMax } = useMemo(() => {
    if (chartData.length === 0) {
      const now = Date.now()
      return { xAxisMin: now, xAxisMax: now }
    }

    const firstTimestamp = chartData[0][0].getTime()
    const lastTimestamp = chartData[chartData.length - 1][0].getTime()
    const timeRange = lastTimestamp - firstTimestamp

    // Add small padding (1% on each side)
    const padding = timeRange * 0.01 || 3600000 // 1 hour default padding
    return {
      xAxisMin: firstTimestamp - padding,
      xAxisMax: lastTimestamp + padding,
    }
  }, [chartData])

  // Prepare transaction data for scatter series
  const transactionPoints = useMemo(() => {
    const buyPoints: [number, number][] = []
    const sellPoints: [number, number][] = []

    transactions.forEach((tx) => {
      const timestamp = Number(tx.timestamp ?? 0)
      const price = Number(tx.usdPrice ?? tx.price ?? 0)

      if (timestamp > 0 && isValidPrice(price)) {
        const point: [number, number] = [timestamp, price]
        if (tx.type === 'Buy') {
          buyPoints.push(point)
        } else if (tx.type === 'Sell') {
          sellPoints.push(point)
        }
      }
    })

    return { buyPoints, sellPoints }
  }, [transactions])

  const option: EChartsOption = useMemo(() => {
    // Format xAxis label based on time range
    const formatXAxisLabel = (value: number): string => {
      const date = dayjs(value)
      // If time range is more than 24 hours, show date and time
      if (timeRange === TimeRange['7D'] || timeRange === TimeRange['30D']) {
        return date.format('DD/MM')
      }
      // Otherwise just show time
      return date.format('HH:mm')
    }

    // Check if avgBuyPrice and avgSellPrice are close to each other
    const arePricesClose = (() => {
      if (avgBuyPrice <= 0 || avgSellPrice <= 0) return false
      const priceRange = yAxisMax - yAxisMin
      const priceDiff = Math.abs(avgBuyPrice - avgSellPrice)
      // Consider them close if difference is less than 5% of the price range
      return priceDiff < priceRange * 0.05
    })()

    // Determine line color based on first and last point comparison
    const lineColor = (() => {
      if (chartData.length === 0) return '#21E09D'
      const firstPrice = chartData[0][1]
      const lastPrice = chartData[chartData.length - 1][1]
      return lastPrice >= firstPrice ? '#21E09D' : '#EA3B4F'
    })()

    return {
      backgroundColor: 'transparent',
      grid: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        containLabel: false,
      },
      xAxis: {
        type: 'time',
        min: xAxisMin,
        max: xAxisMax,
        axisLine: {
          lineStyle: {
            color: '#333333',
          },
        },
        splitLine: {
          show: false,
        },
        axisLabel: {
          color: '#999999',
          fontSize: 11,
          formatter: formatXAxisLabel,
        },
      },
      yAxis: {
        type: 'value',
        position: 'right',
        min: yAxisMin,
        max: yAxisMax,
        interval: yAxisInterval,
        axisLine: {
          lineStyle: {
            color: '#333333',
          },
          label: { show: false },
        },
        axisLabel: {
          color: '#999999',
          fontSize: 11,
          formatter: (value: number) => {
            const formatted = formatPrice(value, {
              showCurrency: true,
            })
            return typeof formatted === 'string' ? formatted : String(formatted)
          },
        },
        splitLine: {
          lineStyle: {
            color: '#1a1a1a',
            type: 'dashed',
          },
        },
      },
      series: [
        {
          name: t('history.price'),
          type: 'line',
          showSymbol: false,
          data: chartData.map(([time, price]) => [time.getTime(), price]),
          smooth: true,
          lineStyle: {
            color: lineColor,
            width: 2,
          },
          itemStyle: {
            color: lineColor,
          },
          symbol: 'none',
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: {
              type: 'dashed' as const,
              width: 1,
            },
            data: [
              ...(avgBuyPrice > 0
                ? [
                    {
                      yAxis: avgBuyPrice.toString(),
                      name: t('walletStats.avgBoughtPrice'),
                      lineStyle: {
                        color: '#ffd039',
                        type: 'dashed' as const,
                        width: 1,
                      },
                      label: {
                        show: true,
                        position: arePricesClose
                          ? avgBuyPrice >= avgSellPrice
                            ? 'insideStartTop'
                            : 'insideStartBottom'
                          : 'insideStart',
                        formatter: () => {
                          const priceFormatted = formatPrice(avgBuyPrice, {
                            showCurrency: true,
                            roundMode: 'floor',
                          })
                          return `${t('walletStats.avgBoughtPrice')}: ${String(priceFormatted)}`
                        },
                        backgroundColor: '#ffd039',
                        color: '#222',
                        padding: [2, 2],
                        fontSize: 10,
                      },
                    },
                  ]
                : []),
              ...(avgSellPrice > 0
                ? [
                    {
                      yAxis: avgSellPrice.toString(),
                      name: t('walletStats.avgSoldPrice'),
                      lineStyle: {
                        color: '#94d8ff',
                        type: 'dashed' as const,
                        width: 1,
                      },
                      label: {
                        show: true,
                        position: arePricesClose
                          ? avgSellPrice <= avgBuyPrice
                            ? 'insideStartBottom'
                            : 'insideStartTop'
                          : 'insideStart',
                        formatter: () => {
                          const priceFormatted = formatPrice(avgSellPrice, {
                            showCurrency: true,
                          })
                          return `${t('walletStats.avgSoldPrice')}: ${String(priceFormatted)}`
                        },
                        backgroundColor: '#94d8ff',
                        color: '#222',
                        padding: [2, 2],
                        fontSize: 10,
                      },
                    },
                  ]
                : []),
            ] as any,
          },
        },
        {
          name: t('history.buy'),
          type: 'scatter',
          data: transactionPoints.buyPoints,
          symbol: 'circle',
          symbolSize: 14,
          itemStyle: {
            color: '#21E09D',
            borderColor: '#1a1a1a',
            borderWidth: 1,
            opacity: 1,
          },
          emphasis: {
            itemStyle: {
              opacity: 1,
            },
          },
          label: {
            show: true,
            position: 'inside',
            formatter: 'B',
            color: '#fff',
            fontSize: 10,
          },
          zlevel: 1,
        },
        {
          name: t('history.sell'),
          type: 'scatter',
          data: transactionPoints.sellPoints,
          symbol: 'circle',
          symbolSize: 14,
          itemStyle: {
            color: '#EA3B4F',
            borderColor: '#1a1a1a',
            borderWidth: 1,
            opacity: 1,
          },
          emphasis: {
            itemStyle: {
              opacity: 1,
            },
          },
          label: {
            show: true,
            position: 'inside',
            formatter: 'S',
            color: '#fff',
            fontSize: 10,
          },
          zlevel: 1,
        },
      ],
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#333',
        textStyle: {
          color: '#fff',
        },
        formatter: (params: any) => {
          // Handle scatter points (transactions)
          if (params.seriesType === 'scatter') {
            const [timestamp, price] = params.value
            const date = dayjs(timestamp)
            const timeStr = date.format('DD/MM HH:mm:ss')
            const txType = params.seriesName === 'Buy' ? 'buy' : 'sell'
            const typeColor = txType === 'buy' ? '#21E09D' : '#EA3B4F'

            // Find the exact transaction by timestamp
            // Use small tolerance (60 seconds) to handle rounding differences
            const targetTimestamp = Math.floor(timestamp / 1000) // Convert to seconds
            const tolerance = 60 // 1 minute tolerance for rounding

            let exactTx: TransactionDto | undefined

            transactions.forEach((tx) => {
              if (!tx.timestamp) return
              const txTimestamp = toSeconds(Number(tx.timestamp))
              const diff = Math.abs(txTimestamp - targetTimestamp)

              // Check if transaction type matches and is within tolerance
              const typeMatches = (txType === 'buy' && tx.type === 'Buy') || (txType === 'sell' && tx.type === 'Sell')

              if (typeMatches && diff <= tolerance) {
                // Prefer exact match, but accept within tolerance
                if (!exactTx || diff < Math.abs(toSeconds(Number(exactTx.timestamp)) - targetTimestamp)) {
                  exactTx = tx
                }
              }
            })

            if (exactTx) {
              const txAmount = Number(exactTx.baseAmount ?? 0)
              const txUsdAmount = Number(exactTx.usdAmount ?? 0)
              const amountStr = String(
                formatAmount(txAmount, {
                  roundMode: 'floor',
                }),
              )
              const volumeStr = String(formatVolume(txUsdAmount, { showCurrency: true, roundMode: 'floor' }))
              return `<div style="font-weight: bold; margin-bottom: 4px;">
                <span style="color: ${typeColor};">${t(`history.${txType}`)}</span>
              </div>
              <div>${t('history.time')}: ${timeStr}</div>
              <div>${t('history.price')}: ${formatPrice(price, {
                showCurrency: true,
              })}</div>
              <div>${t('history.amount')}: ${amountStr}</div>
              <div>${t('history.tradeVolume')}: ${volumeStr}</div>`
            }

            return `<div style="font-weight: bold; margin-bottom: 4px;">
              <span style="color: ${typeColor};">${t(`history.${txType}`)}</span>
            </div>
            <div>${t('history.time')}: ${timeStr}</div>
            <div>${t('history.price')}: ${formatPrice(price, {
              showCurrency: true,
            })}</div>`
          }

          return ''
        },
        axisPointer: {
          type: 'cross',
          animation: false,
          label: {
            formatter: (params: any): string => {
              const value = params.value
              if (params.axisDimension === 'y') {
                const formatted = formatPrice(value, { showCurrency: true })
                return typeof formatted === 'string' ? formatted : String(formatted)
              } else if (params.axisDimension === 'x') {
                const date = dayjs(value)
                return date.format('YYYY-MM-DD HH:mm:ss')
              }
              return String(value)
            },
          },
        },
      },
      graphic: [],
    }
  }, [
    chartData,
    yAxisMin,
    yAxisMax,
    yAxisInterval,
    xAxisMin,
    xAxisMax,
    timeRange,
    transactionPoints,
    transactions,
    avgBuyPrice,
    avgSellPrice,
    t,
  ])

  return (
    <div className={className}>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'canvas' }} />
    </div>
  )
}

export default EChartsLineChart
