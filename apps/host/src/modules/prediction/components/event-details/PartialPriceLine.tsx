import React, { memo, useEffect, useRef } from 'react'
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  AreaSeries,
  LineType,
  Time,
  LineStyle,
  WhitespaceData,
  CrosshairMode,
} from 'lightweight-charts'
import dayjs from 'dayjs'
import { useResponsive } from '@/hooks/useResponsive'
import { PulsingDotPlugin } from './PulsingDotPlugin'
import { TargetLabelPlugin } from './TargetLabelPlugin'

export interface DataPoint {
  time: number
  value: number
}

interface ChartProps {
  dataPoints: DataPoint[]
  lineColor: string
  currentPrice: number | null
  targetPrice: number | null
  decimals?: number
}

const easeInOutQuad = (t: number): number => {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

// --- HELPER ---
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

const RealTimeChart: React.FC<ChartProps> = ({ dataPoints, lineColor, targetPrice, currentPrice, decimals = 2 }) => {
  const { isMobile } = useResponsive()
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null)
  const toolTipRef = useRef<HTMLDivElement>(null)
  const tooltipPriceRef = useRef<HTMLDivElement>(null)
  const tooltipTimeRef = useRef<HTMLDivElement>(null)
  const frameId = useRef<number>(0)
  const pulsePluginRef = useRef<PulsingDotPlugin | null>(null)
  const targetLabelPluginRef = useRef<TargetLabelPlugin | null>(null)
  // --- CONFIG ---
  const TIME_WINDOW_DATA = isMobile ? 20 * 1000 : 40 * 1000
  const RIGHT_PADDING = 2 * 1000
  const TOTAL_VIEW_DURATION = TIME_WINDOW_DATA + RIGHT_PADDING
  const DRAW_DURATION = 1000
  const RESOLUTION_MS = 50

  // --- REFS ---
  const bufferRef = useRef<DataPoint[]>([])
  const isInitializedRef = useRef<boolean>(false)
  const processedTimeRef = useRef<number>(0)
  const lastUpdateRef = useRef<number>(0)

  const animStateRef = useRef({
    isActive: false,
    startPoint: null as DataPoint | null,
    endPoint: null as DataPoint | null,
    startTime: 0,
    duration: DRAW_DURATION,
  })

  const currentDrawRef = useRef({ time: 0, value: 0 })

  // 1. SETUP CHART
  useEffect(() => {
    if (!chartContainerRef.current) return

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
        minBarSpacing: 0.01,
        tickMarkMaxCharacterLength: 13,
        tickMarkFormatter: (time: number) => {
          return dayjs(time).format('hh:mm:ss A')
        },
        shiftVisibleRangeOnNewBar: false,
        fixLeftEdge: false,
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

    const lineSeries = chart.addSeries(AreaSeries, {
      lineColor: lineColor,
      topColor: getRgbaColor(lineColor, 0.08),
      bottomColor: getRgbaColor(lineColor, 0.0),
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
    const pulsePlugin = new PulsingDotPlugin()
    pulsePlugin.color = lineColor
    lineSeries.attachPrimitive(pulsePlugin)
    pulsePluginRef.current = pulsePlugin

    const targetLabelPlugin = new TargetLabelPlugin()
    lineSeries.attachPrimitive(targetLabelPlugin)
    targetLabelPluginRef.current = targetLabelPlugin

    chartRef.current = chart
    seriesRef.current = lineSeries

    // --- LOGIC CUSTOM TOOLTIP ---
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

      const data = param.seriesData.get(lineSeries) as DataPoint | undefined

      if (data && toolTipRef.current && tooltipPriceRef.current && tooltipTimeRef.current) {
        toolTipRef.current.style.display = 'flex'
        toolTipRef.current.style.left = `${param.point.x}px`
        tooltipPriceRef.current.textContent = data.value.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: decimals,
        })
        tooltipTimeRef.current.textContent = dayjs(data.time).format('MMM DD, YYYY h:mm:ss A')
      }
    })

    // --- LOOP ---
    const loop = () => {
      const state = animStateRef.current
      const now = performance.now()

      if (!state.isActive && bufferRef.current.length > 0) {
        const nextPoint = bufferRef.current.shift()
        if (nextPoint) {
          const startVal = currentDrawRef.current.time > 0 ? currentDrawRef.current : nextPoint
          state.startPoint = { ...startVal }
          state.endPoint = nextPoint
          state.startTime = now
          state.isActive = true
          const timeDiff = nextPoint.time - startVal.time
          state.duration = bufferRef.current.length > 5 ? 200 : Math.max(timeDiff, 1000)
        }
      }

      if (state.isActive && state.startPoint && state.endPoint) {
        const elapsed = now - state.startTime
        let progress = elapsed / state.duration
        if (progress > 1) progress = 1

        const eased = easeInOutQuad(progress)
        const newTime = state.startPoint.time + (state.endPoint.time - state.startPoint.time) * progress
        const newValue = state.startPoint.value + (state.endPoint.value - state.startPoint.value) * eased

        if (progress >= 1 || newTime - lastUpdateRef.current >= RESOLUTION_MS) {
          if (newTime > currentDrawRef.current.time && seriesRef.current) {
            if (!Number.isFinite(newValue) || !Number.isFinite(newTime) || isNaN(newValue) || isNaN(newTime)) return
            currentDrawRef.current = { time: newTime, value: newValue }
            lastUpdateRef.current = newTime
            try {
              seriesRef.current.update({ time: newTime as Time, value: newValue })
              updateMarkerDirectly(newTime as Time, newValue)
            } catch (e) {
              // no op
            }
          }
        }

        if (chartRef.current) updateCameraFixed(newTime)

        if (progress >= 1) {
          state.isActive = false
          state.startPoint = null
          state.endPoint = null
        }
      }

      frameId.current = requestAnimationFrame(loop)
    }
    frameId.current = requestAnimationFrame(loop)

    const resizeObserver = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect

      if (chartRef.current) {
        chartRef.current.applyOptions({ width: width })
      }
    })

    resizeObserver.observe(chartContainerRef.current)
    return () => {
      resizeObserver.disconnect()
      lineSeries.detachPrimitive(pulsePlugin)
      lineSeries.detachPrimitive(targetLabelPlugin)

      cancelAnimationFrame(frameId.current)
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
        seriesRef.current = null
      }
      bufferRef.current = []
      isInitializedRef.current = false
      processedTimeRef.current = 0
    }
  }, [decimals])

  useEffect(() => {
    if (targetLabelPluginRef.current) {
      targetLabelPluginRef.current.setData(targetPrice, currentPrice)
    }
  }, [targetPrice, currentPrice])

  // HANDLE VISIBILITY CHANGE
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        animStateRef.current = {
          isActive: false,
          startPoint: null,
          endPoint: null,
          startTime: 0,
          duration: DRAW_DURATION,
        }
        bufferRef.current = []
        isInitializedRef.current = false
        processedTimeRef.current = 0
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // 2. DATA PROCESSING
  useEffect(() => {
    if (!dataPoints || dataPoints.length === 0 || !seriesRef.current) return

    const cleanData = [...dataPoints]
      .filter((d) => d && typeof d.value === 'number' && !isNaN(d.value))
      .sort((a, b) => a.time - b.time)

    if (cleanData.length === 0) return
    const newPointsRaw = cleanData.filter((d) => d.time > processedTimeRef.current)
    if (newPointsRaw.length === 0) return

    const lastNewPoint = newPointsRaw[newPointsRaw.length - 1]
    processedTimeRef.current = lastNewPoint.time

    const isBurst = !isInitializedRef.current || newPointsRaw.length > 1

    if (isBurst) {
      animStateRef.current.isActive = false
      animStateRef.current.startPoint = null
      animStateRef.current.endPoint = null
      bufferRef.current = []

      const cutoffTimeForView = lastNewPoint.time - TOTAL_VIEW_DURATION
      const staticData = cleanData.filter((d) => d.time >= cutoffTimeForView)

      const denseHistory = densifyData(staticData as DataPoint[], RESOLUTION_MS)

      if (denseHistory.length > 0) {
        seriesRef.current.setData(denseHistory as any)
      }

      currentDrawRef.current = { time: lastNewPoint.time, value: lastNewPoint.value }
      updateMarkerDirectly(lastNewPoint.time as Time, lastNewPoint.value)
      requestAnimationFrame(() => updateCameraFixed(lastNewPoint.time))

      isInitializedRef.current = true
    } else {
      bufferRef.current.push(...newPointsRaw)
    }
  }, [dataPoints])

  // --- SAFE CAMERA UPDATE ---
  const updateCameraFixed = (currentTime: number) => {
    if (!chartRef.current || !currentTime) return
    try {
      const timeScale = chartRef.current.timeScale()
      const x = timeScale.timeToCoordinate(currentTime as Time)
      if (x === null) return
      const currentLogical = timeScale.coordinateToLogical(x)
      if (currentLogical === null) return
      const viewPoints = TIME_WINDOW_DATA / RESOLUTION_MS
      const paddingPoints = RIGHT_PADDING / RESOLUTION_MS
      timeScale.setVisibleLogicalRange({
        from: currentLogical - viewPoints,
        to: currentLogical + paddingPoints,
      })
    } catch (e) {
      // no op
    }
  }

  const updateMarkerDirectly = (time: Time, value: number) => {
    if (pulsePluginRef.current) {
      pulsePluginRef.current.setData(time as number, value)
    }
  }

  // Convert hex color to rgba for pulse ring
  const getRgbaColor = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '260px',
        overflow: 'hidden',
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

export default memo(RealTimeChart)
