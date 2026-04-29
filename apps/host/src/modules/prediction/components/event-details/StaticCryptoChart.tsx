import { useResponsive } from '@/hooks/useResponsive'
import dayjs from 'dayjs'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import {
  AreaSeries,
  ColorType,
  createChart,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  LineStyle,
  LineType,
  Time,
} from 'lightweight-charts'
import { TargetLabelPlugin } from './TargetLabelPlugin'
import { PulsingDotPlugin } from './PulsingDotPlugin'

interface PriceSnapshotPoint {
  price: string
  timestamp: number
}

interface StaticCryptoChartProps {
  priceSnapshot: PriceSnapshotPoint[] | null | undefined
  lineColor: string
  currentPrice: number | null
  targetPrice: number | null
  decimals?: number
  isFetching?: boolean
}

interface DataPoint {
  time: number
  value: number
}

const getRgbaColor = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// --- HELPER ---
const easeInOutQuad = (t: number): number => {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

const densifyData = (data: DataPoint[], resolutionMs: number = 50): DataPoint[] => {
  if (data.length < 2) return data
  const result: DataPoint[] = []

  for (let i = 0; i < data.length - 1; i++) {
    const curr = data[i]
    const next = data[i + 1]

    if (isNaN(curr.value) || isNaN(next.value)) continue

    result.push(curr)

    const diff = next.time - curr.time
    const steps = Math.floor(diff / resolutionMs)

    if (steps > 1 && steps < 500) {
      for (let s = 1; s < steps; s++) {
        const progress = s / steps
        const eased = easeInOutQuad(progress)
        const value = curr.value + (next.value - curr.value) * eased

        if (!isNaN(value)) {
          result.push({ time: Math.floor(curr.time + s * resolutionMs), value })
        }
      }
    }
  }

  const lastPoint = data[data.length - 1]
  if (lastPoint && !isNaN(lastPoint.value)) {
    result.push(lastPoint)
  }

  return result
}

const StaticCryptoChart = ({
  priceSnapshot,
  lineColor,
  currentPrice,
  targetPrice,
  decimals = 2,
  isFetching = false,
}: StaticCryptoChartProps) => {
  const { isMobile } = useResponsive()
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null)
  const toolTipRef = useRef<HTMLDivElement>(null)
  const tooltipPriceRef = useRef<HTMLDivElement>(null)
  const tooltipTimeRef = useRef<HTMLDivElement>(null)

  const targetLabelPluginRef = useRef<TargetLabelPlugin | null>(null)
  const pulsingDotPluginRef = useRef<PulsingDotPlugin | null>(null)
  const lastDataSignatureRef = useRef<string>('')
  const lastTargetLabelRef = useRef<{ targetPrice: number | null; currentPrice: number | null }>({
    targetPrice: null,
    currentPrice: null,
  })

  const [isChartReady, setIsChartReady] = useState(false)

  const incomingChartData = useMemo<DataPoint[]>(() => {
    if (!priceSnapshot || priceSnapshot.length === 0) return []
    const rawData = priceSnapshot
      .map((point) => ({
        time: point.timestamp * 1000,
        value: +point.price,
      }))
      .filter((point) => Number.isFinite(point.value) && Number.isFinite(point.time))
      .sort((a, b) => a.time - b.time)

    return densifyData(rawData, 50)
  }, [priceSnapshot])

  useEffect(() => {
    const isReadyToDraw = incomingChartData.length > 0 && targetPrice !== null && currentPrice !== null
    if (!isReadyToDraw || !chartContainerRef.current) {
      setIsChartReady(false)
      return
    }

    if (chartRef.current) return

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0b0b0b00' },
        textColor: '#d1d4dc',
        attributionLogo: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: 260,
      localization: {
        priceFormatter: (price: number) =>
          price.toLocaleString('en-US', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }),
        timeFormatter: (time: number) => dayjs(time).format('hh:mm:ss A'),
      },
      rightPriceScale: {
        borderColor: '#2B2B43',
        scaleMargins: { top: 0.1, bottom: 0.1 },
        borderVisible: false,
        minimumWidth: 60,
        alignLabels: true,
      },
      timeScale: {
        borderColor: '#2B2B43',
        timeVisible: true,
        secondsVisible: true,
        minBarSpacing: isMobile ? 0.06 : 0.01,
        tickMarkMaxCharacterLength: 13,
        tickMarkFormatter: (time: number) => dayjs(time).format('hh:mm:ss A'),
        shiftVisibleRangeOnNewBar: false,
        fixLeftEdge: true,
        fixRightEdge: false,
        allowBoldLabels: false,
      },
      handleScale: false,
      handleScroll: false,
      grid: { vertLines: { visible: false }, horzLines: { color: '#232632', style: 1 } },
      crosshair: {
        mode: CrosshairMode.Magnet,
        vertLine: { visible: true, color: '#3d3d43', style: LineStyle.Solid, width: 2, labelVisible: false },
        horzLine: { visible: false },
      },
    })

    const series = chart.addSeries(AreaSeries, {
      lineColor,
      topColor: getRgbaColor(lineColor, 0.08),
      bottomColor: getRgbaColor(lineColor, 0),
      lineWidth: 2,
      lineType: LineType.Curved,
      lastValueVisible: false,
      priceLineVisible: true,
      priceLineStyle: LineStyle.LargeDashed,
      priceLineColor: lineColor,
      crosshairMarkerVisible: false,
      priceFormat: {
        type: 'price',
        precision: decimals,
        minMove: 0.00001,
      },
    })

    const targetLabelPlugin = new TargetLabelPlugin()
    series.attachPrimitive(targetLabelPlugin)
    targetLabelPluginRef.current = targetLabelPlugin

    const pulsePlugin = new PulsingDotPlugin()
    pulsePlugin.color = lineColor
    series.attachPrimitive(pulsePlugin)
    pulsingDotPluginRef.current = pulsePlugin

    chartRef.current = chart
    seriesRef.current = series

    // Set series data
    const firstPoint = incomingChartData[0]
    const lastPoint = incomingChartData[incomingChartData.length - 1]
    const signature = `${incomingChartData.length}-${firstPoint.time}-${firstPoint.value}-${lastPoint.time}-${lastPoint.value}`

    series.setData(incomingChartData.map((point) => ({ time: point.time as Time, value: point.value })))
    chart.timeScale().fitContent()
    lastDataSignatureRef.current = signature

    // Set initial Target Label & Pulse
    targetLabelPlugin.setData(targetPrice, currentPrice)
    lastTargetLabelRef.current = { targetPrice, currentPrice }
    pulsePlugin.setData(lastPoint.time, lastPoint.value)

    // Update Camera (Visible Range)
    const TIME_WINDOW_DATA = isMobile ? 20 * 1000 : 30 * 1000
    const RIGHT_PADDING = 2 * 1000
    const RESOLUTION_MS = 50

    requestAnimationFrame(() => {
      try {
        const timeScale = chart.timeScale()
        const x = timeScale.timeToCoordinate(lastPoint.time as Time)
        if (x !== null) {
          const currentLogical = timeScale.coordinateToLogical(x)
          if (currentLogical !== null) {
            const viewPoints = TIME_WINDOW_DATA / RESOLUTION_MS
            const paddingPoints = RIGHT_PADDING / RESOLUTION_MS
            timeScale.setVisibleLogicalRange({
              from: currentLogical - viewPoints,
              to: currentLogical + paddingPoints,
            })
          }
        }
      } catch (e) {
        chart.timeScale().fitContent() // Fallback
      }
      setIsChartReady(true)
    })

    chart.subscribeCrosshairMove((param) => {
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > chartContainerRef.current!.clientWidth ||
        param.point.y < 0 ||
        param.point.y > chartContainerRef.current!.clientHeight
      ) {
        if (toolTipRef.current) toolTipRef.current.style.display = 'none'
        return
      }

      const pointData = param.seriesData.get(series) as DataPoint | undefined

      if (pointData && toolTipRef.current && tooltipPriceRef.current && tooltipTimeRef.current) {
        toolTipRef.current.style.display = 'flex'
        toolTipRef.current.style.left = `${param.point.x}px`
        tooltipPriceRef.current.textContent = pointData.value.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: decimals,
        })
        tooltipTimeRef.current.textContent = dayjs(pointData.time).format('MMM DD, YYYY h:mm:ss A')
      }
    })

    const resizeObserver = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect
      if (chartRef.current) {
        chartRef.current.applyOptions({ width })
      }
    })

    resizeObserver.observe(chartContainerRef.current)

    return () => {
      resizeObserver.disconnect()
      series.detachPrimitive(targetLabelPlugin)
      series.detachPrimitive(pulsePlugin)
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
        seriesRef.current = null
      }
    }
  }, [incomingChartData, targetPrice, currentPrice, decimals, isMobile, lineColor])

  if (!isFetching && (!priceSnapshot || priceSnapshot.length === 0 || !currentPrice || !targetPrice)) {
    return (
      <div className="h-65 flex items-center justify-center text-gray-500 flex-col gap-2 text-sm">
        <img src="/images/icons/ic-empty.png" className="w-20 h-20" />
        No data available{' '}
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '260px',
        overflow: 'hidden',
        opacity: isChartReady ? 1 : 0,
        transition: 'opacity 120ms ease',
      }}
    >
      <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
      <div ref={toolTipRef} className="chart-tooltip">
        <div
          ref={tooltipPriceRef}
          style={{
            fontSize: '14px',
            color: lineColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        ></div>
        <div ref={tooltipTimeRef} style={{ fontSize: '11px', color: '#787b86', marginTop: '4px' }}></div>
      </div>
    </div>
  )
}

export default memo(StaticCryptoChart)
