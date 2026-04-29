import { useEffect, useRef } from 'react'

export interface PnLChartProps {
  data: number[]
  normalize?: boolean
}

/**
 * Normalizes the data to a range of -1 to 1.
 */
const normalizeData = (data: number[]) => {
  if (data.length === 0) return []
  const maxAbs = Math.max(...data.map(Math.abs)) || 1 // tránh chia cho 0
  return data.map((value) => value / maxAbs)
}

const GAP = 2

const getZeroLineY = (data: number[], height: number) => {
  const isAllPositive = data.every((value) => value >= 0)
  const isAllNegative = data.every((value) => value <= 0)
  if (isAllPositive) return height
  if (isAllNegative) return height / 3
  const min = Math.min(...data)
  const max = Math.max(...data)
  const total = max - min
  const maxNegativeHeight = Math.max((height * Math.abs(min)) / total, 2) // Min for 2px of height
  return height - maxNegativeHeight
  // return height / 2
}

const getMaxBarHeight = (data: number[], height: number) => {
  const isAllPositive = data.every((value) => value >= 0)
  const isAllNegative = data.every((value) => value <= 0)
  if (isAllPositive) return height
  if (isAllNegative) return (height * 2) / 3
  const min = Math.min(...data)
  const max = Math.max(...data)
  const total = max - min
  const maxNegativeHeight = Math.max((height * Math.abs(min)) / total, 2) // Min for 2px of height
  return height - maxNegativeHeight
  // return height * (1-(Math.abs(min) / (max - min)))
  // return height / 2
}

export const PnLChart = (props: PnLChartProps) => {
  const { data, normalize = true } = props
  const chartData = normalize ? normalizeData(data) : data

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = 60
    const height = 24

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1
    const canvasWidth = width * dpr
    const canvasHeight = height * dpr
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw bars
    const barWidth = Math.floor((width - (chartData.length - 1) * GAP) / chartData.length)

    const maxBarHeight = getMaxBarHeight(chartData, height)
    const zeroLineY = getZeroLineY(chartData, height)

    // Get CSS variable values (respects parent element overrides like .inverse or .pc)
    const element = canvas.parentElement || document.documentElement
    const computedStyle = getComputedStyle(element)
    const riseColor = computedStyle.getPropertyValue('--rise').trim() || '#00CE89'
    const fallColor = computedStyle.getPropertyValue('--fall').trim() || '#EA3B4F'

    // Convert hex to rgba with opacity
    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }

    const upGradient = ctx.createLinearGradient(0, 0, 0, height)
    upGradient.addColorStop(0, hexToRgba(riseColor, 0.6))
    upGradient.addColorStop(1, hexToRgba(riseColor, 0.2))

    const downGradient = ctx.createLinearGradient(0, 0, 0, height)
    downGradient.addColorStop(1, hexToRgba(fallColor, 0.6))
    downGradient.addColorStop(0, hexToRgba(fallColor, 0.3))

    // Draw bars
    chartData.reverse().forEach((value, index) => {
      const x = index * (barWidth + GAP)
      const barHeight = Math.max(Math.abs(value * maxBarHeight), 2) // Scale value to fit in height

      if (value >= 0) {
        ctx.beginPath()
        ctx.fillStyle = upGradient
        ctx.roundRect(x, zeroLineY, barWidth, -barHeight, [0, 0, barWidth, barWidth])
        ctx.fill()
      } else {
        ctx.beginPath()
        ctx.fillStyle = downGradient
        ctx.roundRect(x, zeroLineY, barWidth, barHeight, [0, 0, barWidth, barWidth])
        ctx.fill()
      }
    })
  }, [canvasRef.current, chartData])

  return (
    <div className="mr-[3px] mt-1.5">
      <canvas ref={canvasRef} className="w-[60px] h-6" />
    </div>
  )
}
