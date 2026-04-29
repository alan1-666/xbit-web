import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'
import { EChartsOption, MarkLineComponentOption } from 'echarts'
import { TimeRange } from '@components/chart/purchaseMarkDrawer/TimeRange.ts'
import dayjs from 'dayjs'
import { formatAmount, formatPrice, formatVolume } from '@/lib/format.ts'
import { useQuery } from '@tanstack/react-query'
import { gqlMeme2 } from '@/lib/gql/apollo-client.ts'
import { getOHLCWithUsdVolumeQuery } from '@services/pairs.service.ts'
import { EventType, Timeframe, TransactionDto } from '@/@generated/gql/graphql-meme2.ts'
import { useTranslation } from 'react-i18next'

type MarkPointDataItemOption = {
  name: string
  value?: string | number
  xAxis?: number | string
  yAxis?: number | string
  symbolOffset?: [number, number]
  label?: {
    formatter?: string
    show?: boolean
    fontSize?: number
    backgroundColor?: string
    width?: number
    height?: number
    borderRadius?: number
    borderColor?: string
    borderWidth?: number
  }
  itemStyle?: {
    color?: string
  }
}

type LabelPosition =
  | 'start'
  | 'middle'
  | 'end'
  | 'insideStart'
  | 'insideStartTop'
  | 'insideStartBottom'
  | 'insideMiddle'
  | 'insideMiddleTop'
  | 'insideEnd'
  | 'insideEndTop'
  | 'insideEndBottom'
  | 'insideMiddleBottom'

export interface LineChartProps {
  className?: string
  timeRange: TimeRange
  tokenAddress: string
  chainId: number
  transactions?: TransactionDto[]
  avgBuyPrice?: number
  avgSellPrice?: number
  currentPrice?: number
}

const baseOption: EChartsOption = {
  backgroundColor: 'transparent',
  grid: {
    left: 6,
    right: 0,
    top: 0,
    bottom: 0,
    containLabel: false,
  },
  graphic: [],
  // dataZoom: [
  //   {
  //     type: 'inside',
  //     xAxisIndex: 0,
  //     zoomOnMouseWheel: true,
  //     moveOnMouseMove: true,
  //     preventDefaultMouseMove: true,
  //     filterMode: 'none',
  //   },
  //   {
  //     type: 'inside',
  //     yAxisIndex: 0,
  //     zoomOnMouseWheel: true,
  //     moveOnMouseMove: true,
  //     moveOnMouseWheel: true,
  //     preventDefaultMouseMove: true,
  //     filterMode: 'none',
  //   },
  // ],
}

const timeframeMap: Record<TimeRange, Timeframe> = {
  [TimeRange.H4]: Timeframe.M1,
  [TimeRange.D1]: Timeframe.M5,
  [TimeRange.D7]: Timeframe.H1,
  [TimeRange.D30]: Timeframe.H4,
}

const limitMap: Record<TimeRange, number> = {
  [TimeRange.H4]: 240, // 4 hours of 1-minute intervals
  [TimeRange.D1]: 288, // 1 day of 5-minute intervals
  [TimeRange.D7]: 168, // 7 days of 1-hour intervals
  [TimeRange.D30]: 180, // 30 days of 4-hour intervals
}

const useOHLC = (options: { tokenAddress: string; chainId: number; timeRange: TimeRange }) => {
  const { tokenAddress, chainId, timeRange } = options
  const timeframe = timeframeMap[timeRange]
  const limit = limitMap[timeRange]
  return useQuery({
    queryKey: ['ohlc', timeRange],
    queryFn: async () => {
      const res = await gqlMeme2.query({
        query: getOHLCWithUsdVolumeQuery,
        variables: {
          input: {
            token: tokenAddress,
            chainId: chainId,
            timeframe: timeframe,
            limit,
          },
        },
      })
      return res.data.getOHLC.slice(0, limit)
    },
  })
}

export const LineChart = (props: LineChartProps) => {
  const { className, timeRange, tokenAddress, chainId, transactions, avgBuyPrice = 0, avgSellPrice = 0 } = props

  const { t } = useTranslation()

  const { data } = useOHLC({
    tokenAddress,
    chainId,
    timeRange,
  })

  // Determine the first timestamp based on the selected time range
  const firstTs = useMemo(() => {
    const now = Date.now()
    switch (timeRange) {
      case TimeRange.H4:
        return Math.floor(now - 4 * 60 * 60 * 1000)
      case TimeRange.D1:
        return Math.floor(now - 24 * 60 * 60 * 1000)
      case TimeRange.D7:
        return Math.floor(now - 7 * 24 * 60 * 60 * 1000)
      case TimeRange.D30:
        return Math.floor(now - 30 * 24 * 60 * 60 * 1000)
      default:
        return Math.floor(now - 4 * 60 * 60 * 1000)
    }
  }, [timeRange])

  const chartSeries = useMemo(() => {
    if (!data || data.length === 0) return []
    return data
      .map((item, index, self) => {
        const timestamp = +item.ts
        const price = index === self.length - 1 ? +item.open : +item.close
        return [timestamp * 1000, price]
      })
      .filter((item) => item[0] >= firstTs)
      .reverse()
  }, [data, firstTs])

  const step = useMemo(() => {
    const factor = chartSeries.length < 160 ? 1 : 2
    switch (timeRange) {
      case TimeRange.H4:
        return factor * 60 * 1000 // round to nearest 1 * factor minutes, to downsample 1-minute data
      case TimeRange.D1:
        return factor * 5 * 60 * 1000 // round to nearest 5 * factor minutes, to downsample 5-minute data
      case TimeRange.D7:
        return factor * 60 * 60 * 1000 // round to nearest 1 * factor hours, to downsample 1-hour data
      case TimeRange.D30:
        return factor * 4 * 60 * 60 * 1000 // round to nearest 4 * factor hours, to downsample 4-hour data
      default:
        return factor * 60 * 1000 // round to nearest 1 * factor minutes, to downsample 1-minute data
    }
  }, [timeRange, chartSeries])

  const groupedMarkPoints = useMemo(() => {
    if (!transactions || transactions.length === 0) return []
    const grouped: { [key: number]: TransactionDto[] } = {}
    transactions.forEach((tx) => {
      const timestamp = Math.round(+tx.timestamp / step) * step // round to nearest minute
      const founded = chartSeries.reduce((prev, curr) => {
        return Math.abs(curr[0] - timestamp) < Math.abs(prev[0] - timestamp) ? curr : prev
      }, chartSeries[0])
      if (!founded) return
      const [nearestTimestamp] = founded
      if (!grouped[nearestTimestamp]) {
        grouped[nearestTimestamp] = []
      }
      grouped[nearestTimestamp].push(tx)
    })
    return grouped
  }, [transactions, chartSeries, step])

  const markLine = useMemo(() => {
    const opt: MarkLineComponentOption = {
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
                  position: (avgBuyPrice >= avgSellPrice ? 'insideStartTop' : 'insideStartBottom') as LabelPosition,
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
                  position: (avgSellPrice <= avgBuyPrice ? 'insideStartBottom' : 'insideStartTop') as LabelPosition,
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
      ],
    }
    return opt
  }, [avgBuyPrice, avgSellPrice, t])

  const { maxValue, minValue } = useMemo(() => {
    const maxValue = Math.max(...chartSeries.map((item) => item[1]))
    const minValue = Math.min(...chartSeries.map((item) => item[1]))
    return { maxValue, minValue }
  }, [chartSeries])

  const markPoints = useMemo(() => {
    if (!groupedMarkPoints) return []
    const markPoints: MarkPointDataItemOption[] = []
    const keys = Object.keys(groupedMarkPoints)
    for (const key of keys) {
      const txs = groupedMarkPoints[+key]
      if (txs.length === 0) continue
      const yAxisValue = chartSeries.find((series) => series[0] === +key)?.[1]
      if (yAxisValue === undefined) continue
      const totalTx = txs.length
      const slicedTxs = txs.slice(0, 3)
      const remainingTxCount = totalTx - slicedTxs.length
      const isNearHighest = yAxisValue >= maxValue * 0.95
      const offsetY = isNearHighest ? 8 : -8
      slicedTxs.forEach((tx, index) => {
        markPoints.push({
          name: tx.txHash,
          value: JSON.stringify(tx),
          xAxis: +key,
          yAxis: yAxisValue,
          symbolOffset: [0, index * offsetY],
          label: {
            formatter: tx.type === EventType.Buy ? 'B' : 'S',
            show: true,
            fontSize: 8,
            backgroundColor: tx.type === EventType.Buy ? '#4CAF50' : '#F44336',
            width: 10,
            height: 10,
            borderRadius: 5,
            borderColor: '#222',
            borderWidth: 1,
          },
          itemStyle: {
            color: tx.type === EventType.Buy ? '#4CAF50' : '#F44336',
          },
        })
      })
      if (remainingTxCount > 0) {
        markPoints.push({
          name: `more-${key}`,
          value: remainingTxCount,
          xAxis: +key,
          yAxis: yAxisValue,
          symbolOffset: [0, slicedTxs.length * offsetY + (offsetY >= 0 ? 4 : -4)],
          label: {
            formatter: `+${remainingTxCount}`,
            show: true,
            fontSize: 8,
            backgroundColor: 'transparent',
          },
          itemStyle: {
            color: 'transparent',
          },
        })
      }
    }
    return markPoints
  }, [groupedMarkPoints, maxValue, minValue])

  const xAxisOption = useMemo(() => {
    const opt: EChartsOption['xAxis'] = {
      type: 'time',
      boundaryGap: ['1%', '1%'],
      axisLine: {
        lineStyle: {
          color: '#333333',
        },
      },
      splitLine: {
        show: false,
      },
      min: chartSeries.length > 0 ? chartSeries[0][0] : undefined,
      max: chartSeries.length > 0 ? chartSeries[chartSeries.length - 1][0] : undefined,
      axisLabel: {
        color: '#999999',
        fontSize: 11,
        formatter: (value: number) => {
          const date = dayjs(value)
          if (timeRange === TimeRange.H4 || timeRange === TimeRange.D1) {
            return date.format('HH:mm')
          } else {
            return date.format('MM/DD')
          }
        },
      },
    }
    return opt
  }, [timeRange, chartSeries])

  const yAxisOption = useMemo(() => {
    const opt: EChartsOption['yAxis'] = {
      type: 'value',
      position: 'right',
      boundaryGap: ['5%', '5%'],
      scale: true,
      axisLine: {
        lineStyle: {
          color: '#333333',
        },
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
    }
    return opt
  }, [])

  const tooltipOption = useMemo(() => {
    const opt: EChartsOption['tooltip'] = {
      trigger: 'axis',
      confine: true,
      backgroundColor: 'rgba(0, 0, 0)',
      z: 50,
      borderColor: '#333333',
      borderWidth: 1,
      textStyle: {
        color: '#FFFFFF',
        fontSize: 12,
      },
      formatter: (params) => {
        if (!params) return ''
        if (!Array.isArray(params)) {
          if (params.componentType === 'markPoint') {
            const data = params.data as { xAxis: number; value: string; name: string }
            const name = data.name
            if (name.startsWith('more-')) {
              return ''
            }
            const tx = JSON.parse(data.value) as TransactionDto
            const date = dayjs(+tx.timestamp).format('MM/DD/YYYY HH:mm')
            const txType = tx.type
            const typeColor = txType === EventType.Buy ? '#4CAF50' : '#F44336'
            const price = formatPrice(tx.usdPrice, { showCurrency: true })
            const amount = formatAmount(tx.baseAmount ? +tx.baseAmount : 0)
            const volume = formatVolume(tx.usdAmount ? +tx.usdAmount : 0)
            return `
              <div style="font-weight: bold; margin-bottom: 4px;">
                <span style="color: ${typeColor};">${t(`history.${txType?.toLowerCase()}`)}</span>
              </div>
              <div>${t('history.time')}: ${date}</div>
              <div>${t('history.price')}: ${price}</div>
              <div>${t('history.amount')}: ${amount}</div>
              <div>${t('history.tradeVolume')}: ${volume}</div>
            `
          }
          return ''
        }
        const param = params[0]
        const value = param.value as [number, number]
        const date = dayjs(value[0]).format('MM/DD/YYYY HH:mm')
        const price = formatPrice(value[1], { showCurrency: true })
        return `
            <div>${t('history.time')}: ${date}</div>
            <div>${t('history.price')}: ${price}</div>
          `
      },
    }
    return opt
  }, [t])

  const option = useMemo(() => {
    const chartOption: EChartsOption = {
      ...baseOption,
      tooltip: tooltipOption,
      xAxis: xAxisOption,
      yAxis: yAxisOption,
      series: [
        {
          name: 'Price',
          type: 'line',
          data: chartSeries,
          symbol: 'none',
          markPoint: {
            data: markPoints,
            symbol: 'circle',
            symbolSize: 10,
            z: 10,
            label: {
              show: true,
              formatter: 'B',
              fontSize: 8,
            },
            tooltip: {
              trigger: 'item',
            },
          },
          markLine: markLine,
        },
      ],
    }
    return chartOption
  }, [xAxisOption, yAxisOption, chartSeries, tooltipOption, markPoints, markLine])

  return (
    <div className={className}>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'canvas' }} />
    </div>
  )
}
