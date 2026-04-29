import React, { useEffect, useRef, useCallback, useState } from 'react'
import dayjs from 'dayjs'

/**
 * Interface for a chart data point
 */
export interface DataPoint {
  timestamp: number
  value: number
}

interface RealTimeCanvasChartProps {
  data: DataPoint[]
  windowSize?: number
  color?: string
  isPaused?: boolean
}

// Constants - extracted to avoid recreation
const MARGIN = { top: 30, right: 80, bottom: 40, left: 0 }
const GRID_COUNT = 5
const SYNC_LERP = 0.15
const SMOOTH_LERP = 0.05
const RIGHT_PADDING_RATIO = 0.05
const RIGHT_PADDING_PX = 12
const LOOK_AHEAD = 5000
const FILTER_BUFFER = 10000
const DOT_RADIUS = 5
const LINE_WIDTH = 2.5
const DOT_STROKE_WIDTH = 2
const GRID_LINE_WIDTH = 1
const PULSE_FREQUENCY = 200
const SHADOW_BLUR_BASE = 12
const SHADOW_BLUR_PULSE = 8
const GRID_COLOR = '#1e293b'
const GRID_TEXT_COLOR = '#64748b'
const DOT_STROKE_COLOR = '#fff'
const FONT = '10px sans-serif'
const HOVER_LINE_COLOR = '#64748b'
const HOVER_LINE_WIDTH = 1
const TOOLTIP_PADDING = 8
const TOOLTIP_RADIUS = 4

export const RealTimeCanvasChart: React.FC<RealTimeCanvasChartProps> = ({
  data = [],
  windowSize = 15000,
  color = '#10b981',
  isPaused = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const [hoverX, setHoverX] = useState<number | null>(null)
  const [hoverValue, setHoverValue] = useState<number | null>(null)
  const [hoverTimestamp, setHoverTimestamp] = useState<number | null>(null)

  const displayTimeRef = useRef<number>(Date.now())
  const animatedValueRef = useRef<number>(0)
  const animatedTimestampRef = useRef<number>(Date.now())
  const yRangeRef = useRef({ min: 0, max: 100 })
  const hasInitialized = useRef(false)

  // Initialize animation values with last data point
  useEffect(() => {
    if (data.length > 0 && !hasInitialized.current) {
      const last = data[data.length - 1]
      animatedValueRef.current = last.value
      animatedTimestampRef.current = last.timestamp
      displayTimeRef.current = last.timestamp
      hasInitialized.current = true
    }
  }, [data])

  // Helper function to draw tooltip and hover line
  const drawTooltip = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      hoverXPos: number,
      value: number,
      timestamp: number,
      chartHeight: number,
      logicalWidth: number,
    ) => {
      // Draw vertical line
      ctx.strokeStyle = HOVER_LINE_COLOR
      ctx.lineWidth = HOVER_LINE_WIDTH
      ctx.beginPath()
      ctx.moveTo(hoverXPos, MARGIN.top)
      ctx.lineTo(hoverXPos, MARGIN.top + chartHeight)
      ctx.stroke()

      // Prepare tooltip text
      const valueText = value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      const timeText = dayjs(timestamp).format('HH:mm')

      // Measure text
      ctx.font = FONT
      ctx.fillStyle = GRID_TEXT_COLOR
      const valueMetrics = ctx.measureText(valueText)
      const timeMetrics = ctx.measureText(timeText)
      const maxTextWidth = Math.max(valueMetrics.width, timeMetrics.width)

      const tooltipWidth = maxTextWidth + TOOLTIP_PADDING * 2
      const tooltipHeight = 40 // Height for two lines of text

      // Calculate tooltip position
      let tooltipX = hoverXPos + 10
      const tooltipY = MARGIN.top + 10

      // Keep tooltip within canvas bounds
      if (tooltipX + tooltipWidth > MARGIN.left + logicalWidth - MARGIN.right) {
        tooltipX = hoverXPos - tooltipWidth - 10
      }

      // Draw tooltip background
      ctx.fillStyle = '#1e293b'
      ctx.strokeStyle = HOVER_LINE_COLOR
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, TOOLTIP_RADIUS)
      ctx.fill()
      ctx.stroke()

      // Draw tooltip text
      ctx.fillStyle = GRID_TEXT_COLOR
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(valueText, tooltipX + tooltipWidth / 2, tooltipY + TOOLTIP_PADDING + 5)
      ctx.fillText(timeText, tooltipX + tooltipWidth / 2, tooltipY + TOOLTIP_PADDING + 20)
    },
    [],
  )

  // ...existing code...
  const updateYRange = useCallback((min: number, max: number) => {
    // Validate inputs
    if (!isFinite(min) || !isFinite(max)) return

    if (min === max) {
      min -= 5
      max += 5
    }
    const targetMin = min
    const targetMax = max + RIGHT_PADDING_PX

    // Only update if values are finite
    if (isFinite(targetMin) && isFinite(targetMax)) {
      yRangeRef.current.min += (targetMin - yRangeRef.current.min) * SMOOTH_LERP
      yRangeRef.current.max += (targetMax - yRangeRef.current.max) * SMOOTH_LERP
    }
  }, [])

  // Helper function to find nearest data point to hover position
  const findNearestDataPoint = useCallback(
    (
      hoverXPos: number,
      currentDisplayMin: number,
      windowSize: number,
      chartWidth: number,
    ): { value: number; timestamp: number } | null => {
      const threshold = 30 // Pixels

      let nearest: { value: number; timestamp: number; distance: number } | null = null

      for (const point of data) {
        const pointX = MARGIN.left + ((point.timestamp - currentDisplayMin) / windowSize) * chartWidth
        const distance = Math.abs(pointX - hoverXPos)

        if (distance <= threshold) {
          if (!nearest || distance < nearest.distance) {
            nearest = { ...point, distance }
          }
        }
      }

      return nearest ? { value: nearest.value, timestamp: nearest.timestamp } : null
    },
    [data],
  )

  // Helper function to draw smooth path using quadratic curves
  const drawSmoothPath = useCallback(
    (ctx: CanvasRenderingContext2D, pts: { x: number; y: number }[], endPoint: { x: number; y: number }) => {
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 0; i < pts.length - 1; i++) {
        const xc = (pts[i].x + pts[i + 1].x) / 2
        const yc = (pts[i].y + pts[i + 1].y) / 2
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc)
      }
      ctx.lineTo(endPoint.x, endPoint.y)
    },
    [],
  )

  // Helper function to draw grid lines and labels
  const drawGrid = useCallback(
    (ctx: CanvasRenderingContext2D, chartWidth: number, chartHeight: number, yMin: number, yMax: number) => {
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.font = FONT
      let yDiff = yMax - yMin

      // Prevent division by zero
      if (yDiff === 0) {
        yDiff = 1
      }

      for (let i = 0; i <= GRID_COUNT; i++) {
        const val = yMin + (yDiff * i) / GRID_COUNT
        const y = MARGIN.top + chartHeight - (i / GRID_COUNT) * chartHeight

        // Draw grid line
        ctx.strokeStyle = GRID_COLOR
        ctx.lineWidth = GRID_LINE_WIDTH
        ctx.beginPath()
        ctx.moveTo(MARGIN.left, y)
        ctx.lineTo(MARGIN.left + chartWidth, y)
        ctx.stroke()

        // Draw grid label
        ctx.fillStyle = GRID_TEXT_COLOR
        const labelText = val.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
        ctx.fillText(labelText, MARGIN.left + chartWidth + 10, y)
      }
    },
    [],
  )

  // Helper function to draw X-axis time labels
  const drawXAxisLabels = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      chartWidth: number,
      chartHeight: number,
      currentDisplayMin: number,
      windowSize: number,
    ) => {
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.font = FONT
      ctx.fillStyle = GRID_TEXT_COLOR

      // Draw 5 time labels evenly distributed across the chart
      const labelCount = 5
      for (let i = 0; i < labelCount; i++) {
        const ratio = i / (labelCount - 1)
        const timestamp = currentDisplayMin + ratio * windowSize
        const x = MARGIN.left + ratio * chartWidth
        const y = MARGIN.top + chartHeight + 5

        // Format time label
        const timeLabel = dayjs(timestamp).format('HH:mm')

        // Draw time label
        ctx.fillText(timeLabel, x, y)
      }
    },
    [],
  )

  // Helper function to draw data line and fill
  const drawDataVisualization = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      displayPoints: { x: number; y: number }[],
      activePoint: { x: number; y: number },
      chartHeight: number,
    ) => {
      if (displayPoints.length < 2) return

      // Validate coordinates
      const hasValidPoints = displayPoints.every((p) => isFinite(p.x) && isFinite(p.y))
      if (!hasValidPoints || !isFinite(activePoint.x) || !isFinite(activePoint.y)) return

      ctx.save()
      // Clipping region to prevent overflow
      const clipWidth = Math.max(0, activePoint.x - MARGIN.left)
      if (clipWidth > 0) {
        ctx.beginPath()
        ctx.rect(MARGIN.left, MARGIN.top, clipWidth, chartHeight)
        ctx.clip()
      }

      // Gradient fill
      // ctx.beginPath()
      // drawSmoothPath(ctx, displayPoints, activePoint)
      // ctx.lineTo(activePoint.x, MARGIN.top + chartHeight)
      // ctx.lineTo(displayPoints[0].x, MARGIN.top + chartHeight)
      // ctx.closePath()
      // const gradient = ctx.createLinearGradient(0, MARGIN.top, 0, MARGIN.top + chartHeight)
      // gradient.addColorStop(0, `${color}33`)
      // gradient.addColorStop(1, `${color}00`)
      // ctx.fillStyle = gradient
      // ctx.fill()

      // Line
      ctx.beginPath()
      ctx.lineWidth = LINE_WIDTH
      ctx.strokeStyle = color
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      drawSmoothPath(ctx, displayPoints, activePoint)
      ctx.stroke()
      ctx.restore()

      // Pulsing dot
      const pulse = (Math.sin(Date.now() / PULSE_FREQUENCY) + 1) / 2
      ctx.save()
      ctx.shadowBlur = SHADOW_BLUR_BASE + pulse * SHADOW_BLUR_PULSE
      ctx.shadowColor = color
      ctx.beginPath()
      ctx.arc(activePoint.x, activePoint.y, DOT_RADIUS, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.strokeStyle = DOT_STROKE_COLOR
      ctx.lineWidth = DOT_STROKE_WIDTH
      ctx.stroke()
      ctx.restore()
    },
    [color, drawSmoothPath],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      if (!canvas || !ctx) return

      const logicalWidth = canvas.clientWidth
      const logicalHeight = canvas.clientHeight
      const dpr = window.devicePixelRatio || 1

      // Ensure canvas physical size matches logical size for DPI
      if (canvas.width !== logicalWidth * dpr || canvas.height !== logicalHeight * dpr) {
        canvas.width = logicalWidth * dpr
        canvas.height = logicalHeight * dpr
        ctx.scale(dpr, dpr)
      }

      const chartWidth = logicalWidth - MARGIN.left - MARGIN.right
      const chartHeight = logicalHeight - MARGIN.top - MARGIN.bottom

      // Update animation
      const lastRealPoint = data[data.length - 1]
      if (lastRealPoint && !isPaused) {
        animatedValueRef.current += (lastRealPoint.value - animatedValueRef.current) * SYNC_LERP
        animatedTimestampRef.current += (lastRealPoint.timestamp - animatedTimestampRef.current) * SYNC_LERP
        displayTimeRef.current = animatedTimestampRef.current
      }

      // Calculate display range
      const rightPaddingTime = windowSize * RIGHT_PADDING_RATIO
      const currentDisplayMax = displayTimeRef.current + rightPaddingTime
      const currentDisplayMin = currentDisplayMax - windowSize

      // Get visible points and update Y-range
      const visiblePoints = data.filter(
        (p) => p.timestamp >= currentDisplayMin - LOOK_AHEAD && p.timestamp <= currentDisplayMax,
      )

      if (visiblePoints.length > 0) {
        const values = visiblePoints.map((p) => p.value)
        updateYRange(Math.min(...values), Math.max(...values))
      }

      const { min: yMin, max: yMax } = yRangeRef.current
      ctx.clearRect(0, 0, logicalWidth, logicalHeight)

      // Draw grid
      drawGrid(ctx, chartWidth, chartHeight, yMin, yMax)

      // Draw X-axis labels
      drawXAxisLabels(ctx, chartWidth, chartHeight, currentDisplayMin, windowSize)

      // Draw data
      if (data.length > 1) {
        let yDiff = yMax - yMin
        // Prevent division by zero
        if (yDiff === 0) {
          yDiff = 1
        }

        const toCanvasX = (t: number) => MARGIN.left + ((t - currentDisplayMin) / windowSize) * chartWidth
        const toCanvasY = (v: number) => MARGIN.top + chartHeight - ((v - yMin) / yDiff) * chartHeight

        const displayPoints = data
          .filter((p) => p.timestamp > currentDisplayMin - FILTER_BUFFER)
          .map((p) => ({
            x: toCanvasX(p.timestamp),
            y: toCanvasY(p.value),
          }))

        const activePoint = {
          x: toCanvasX(animatedTimestampRef.current),
          y: toCanvasY(animatedValueRef.current),
        }
        displayPoints.push(activePoint)

        drawDataVisualization(ctx, displayPoints, activePoint, chartHeight)

        // Update tooltip value if hovering (based on current scroll position)
        if (hoverX !== null) {
          const nearestPoint = findNearestDataPoint(hoverX, currentDisplayMin, windowSize, chartWidth)
          if (nearestPoint) {
            setHoverValue(nearestPoint.value)
            setHoverTimestamp(nearestPoint.timestamp)
          }
        }

        // Draw tooltip if hovering
        if (hoverX !== null && hoverValue !== null && hoverTimestamp !== null) {
          drawTooltip(ctx, hoverX, hoverValue, hoverTimestamp, chartHeight, logicalWidth)
        }
      }

      animationFrameRef.current = requestAnimationFrame(draw)
    }

    animationFrameRef.current = requestAnimationFrame(draw)
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [
    color,
    windowSize,
    isPaused,
    data,
    updateYRange,
    drawGrid,
    drawXAxisLabels,
    drawDataVisualization,
    hoverX,
    hoverValue,
    hoverTimestamp,
    drawTooltip,
    findNearestDataPoint,
  ])

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (canvas && canvas.parentElement) {
        const parent = canvas.parentElement
        const dpr = window.devicePixelRatio || 1
        const rect = parent.getBoundingClientRect()
        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.setTransform(1, 0, 0, 1, 0, 0)
          ctx.scale(dpr, dpr)
        }
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      const x = (e.clientX - rect.left) * dpr
      const y = (e.clientY - rect.top) * dpr

      // Only process if within canvas bounds
      if (x < MARGIN.left || y < MARGIN.top) {
        setHoverX(null)
        setHoverValue(null)
        setHoverTimestamp(null)
        return
      }

      const logicalWidth = canvas.clientWidth
      const chartWidth = logicalWidth - MARGIN.left - MARGIN.right

      // Calculate current display range
      const rightPaddingTime = windowSize * RIGHT_PADDING_RATIO
      const currentDisplayMax = displayTimeRef.current + rightPaddingTime
      const currentDisplayMin = currentDisplayMax - windowSize

      // Find nearest data point
      const nearestPoint = findNearestDataPoint(x, currentDisplayMin, windowSize, chartWidth)

      if (nearestPoint) {
        setHoverX(x)
        setHoverValue(nearestPoint.value)
        setHoverTimestamp(nearestPoint.timestamp)
      } else {
        setHoverX(null)
        setHoverValue(null)
        setHoverTimestamp(null)
      }
    }

    const handleMouseLeave = () => {
      setHoverX(null)
      setHoverValue(null)
      setHoverTimestamp(null)
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [windowSize, findNearestDataPoint])

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  )
}
