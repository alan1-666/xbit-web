import { useRef, useEffect } from 'react'
import { useAppSelector } from '@/redux/store'

export interface CanvasChartProps {
  lineData: number[]
  barData: number[]
  barLength?: number
  trend: 'up' | 'down'
  glowingEffect?: boolean
  showLine?: boolean
  paddingColumn?: number
}

const TrendChart = (props: CanvasChartProps) => {
  const { lineData, barData, barLength, trend, glowingEffect = false, showLine = true, paddingColumn = 2 } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const priceChangeColor = useAppSelector((state) => state.preference.priceChangeColor)
  const isInverse = priceChangeColor === 'inverse'
  const upColor = isInverse ? '#EA3B4F' : '#00CE89'
  const downColor = isInverse ? '#00CE89' : '#EA3B4F'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    const padding = paddingColumn ?? 2
    const width = 48
    const height = 30
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)

    const length = barLength ?? Math.min(lineData.length, barData.length)

    const canvasWidth = width
    const canvasHeight = height
    const barWidth = (canvasWidth - 2 * padding) / 10

    // Draw bars
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    if (trend === 'up') {
      ctx.fillStyle = '#0D1F15'
    } else {
      ctx.fillStyle = '#2B1519'
    }

    const maxBarValue = Math.max(...barData)
    for (let i = 0; i < length; i++) {
      const value = barData[i]
      const calculatedPercent = value > 0 ? value / maxBarValue : 0
      const percent = Math.max(calculatedPercent, 0.05)
      const barHeight = percent * (canvasHeight - 2 * padding)
      const x = padding + i * barWidth
      const y = canvasHeight - padding - barHeight
      const barW = barWidth * 0.6
      ctx.roundRect(x, y, barW, barHeight, [barW, barW, 0, 0])
      ctx.fill()
    }

    // Draw line
    ctx.strokeStyle = trend === 'down' ? downColor : upColor
    ctx.lineWidth = 1.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()

    if (showLine) {
      let lastPoint: { x: number; y: number } | null = null
      const max = Math.max(...lineData)
      const min = Math.min(...lineData)
      if (max === min) {
        const centerY = (canvasHeight - padding) / 2
        ctx.moveTo(padding, centerY)
        ctx.lineTo(width - padding * 2, centerY)
        ctx.stroke()
      } else {
        for (let i = 0; i < length; i++) {
          const value = lineData[i]
          const x = padding + i * barWidth + barWidth / 2
          const y = canvasHeight - padding - (value / Math.max(...lineData)) * (canvasHeight - 2 * padding)
          if (i === 0) {
            ctx.moveTo(padding, y)
          } else if (value > 0) {
            ctx.lineTo(x, y)
            lastPoint = { x, y }
          } else if (i === 9 && !value && lastPoint) {
            ctx.lineTo(lastPoint.x, width - padding)
          }
        }
        ctx.stroke()
      }

      // close the path
      ctx.lineTo(width - padding, height - padding)
      ctx.lineTo(padding, height - padding)
      ctx.closePath()
      ctx.clip()

      if (glowingEffect) {
        const gradient = ctx.createLinearGradient(width / 2, 0, width / 2, height)
        if (!isInverse) {
          gradient.addColorStop(0, trend === 'down' && !isInverse ? '#F25461' : '#00FFB4')
          gradient.addColorStop(1, trend === 'down' && !isInverse ? '#AB57FF00' : '#00996C00')
        } else {
          gradient.addColorStop(0, trend === 'down' && isInverse ? '#00FFB4' : '#F25461')
          gradient.addColorStop(1, trend === 'down' && isInverse ? '#00FFB400' : '#00996C00')
        }
        ctx.fillStyle = gradient
        ctx.globalAlpha = 0.15
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)
        ctx.save()
      }
    }
  }, [lineData, barData, barLength, showLine, glowingEffect, trend, isInverse, upColor, downColor])

  return <canvas ref={canvasRef} width={62} height={30} />
}

export default TrendChart
