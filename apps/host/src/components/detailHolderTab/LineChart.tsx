import { useRef, useEffect, useMemo } from 'react'
import { listCoinHelper } from '@/utils/list-coin-helper.ts'

export interface CanvasChartProps {
  lineData: number[]
  glowingEffect?: boolean
  showLine?: boolean
  lastItem?: number
  chartName?: string
  strokeColor?: string
  normalizeMinLength?: number
  numberOfFill?: number
}

const normalizedChartData = (nums: number[], minLength: number, numberOfFill: number = 0) => {
  if (nums.length < minLength) {
    const diff = numberOfFill ? numberOfFill : minLength - nums.length
    const padding = new Array(diff).fill(0)
    return padding.concat(nums)
  }
  return nums
}

const LineChart = (props: CanvasChartProps) => {
  const { lineData, lastItem, strokeColor = '#FFFFFFCC', normalizeMinLength, numberOfFill } = props

  // 1) Start from raw data
  const baseData = useMemo<number[]>(() => (Array.isArray(lineData) ? lineData : []), [lineData])

  // 2) If less than 24 items, prepend a single 0 as startPoint
  const withStartPoint = useMemo<number[]>(() => {
    if (baseData.length < 24) return [0].concat(baseData)
    return baseData
  }, [baseData])

  // 3) Optional: normalize to min length
  const dataChart = useMemo(() => {
    if (!normalizeMinLength) return withStartPoint
    return normalizedChartData(withStartPoint, normalizeMinLength, numberOfFill)
  }, [withStartPoint, normalizeMinLength, numberOfFill])

  // 4) Apply lastItem
  const dataPrepareNormalize = useMemo(
    () =>
      dataChart.map((val, idx) =>
        idx < dataChart.length - 1 ? Number(val) : Number(lastItem ?? val)
      ),
    [dataChart, lastItem]
  )

  // 5) Final normalized values for canvas plotting
  const pricesData = useMemo(
    () => listCoinHelper.normalizeChartData2(dataPrepareNormalize, 50),
    [dataPrepareNormalize]
  )

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const padding = 2
    const width = 60
    const height = 30

    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const canvasWidth = width
    const canvasHeight = height

    // Draw line
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 1.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()

    if (!pricesData.length) {
      // nothing to draw
      return
    }

    const max = Math.max(...pricesData)
    const min = Math.min(...pricesData)

    if (max === min) {
      // Flat line
      const centerY = (canvasHeight - padding) / 2
      ctx.moveTo(padding, centerY)
      ctx.lineTo(width - padding * 2, centerY)
      ctx.stroke()
    } else {
      const n = pricesData.length
      for (let i = 0; i < n; i++) {
        const value = pricesData[i]
        // Distribute points across width; using n yields last x slightly before the right edge (your original behavior)
        const x = padding + (i * canvasWidth) / n
        const y = canvasHeight - padding - (value / max) * (canvasHeight - 2 * padding)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
  }, [pricesData, strokeColor])

  return <canvas ref={canvasRef} width={62} height={30} />
}

export default LineChart
