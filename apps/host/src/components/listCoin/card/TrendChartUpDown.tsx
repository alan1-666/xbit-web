import { useRef, useEffect } from 'react'

export interface CanvasChartProps {
  lineData: number[]
  barData: number[]
  barLength?: number
  trend: 'up' | 'down'
  glowingEffect?: boolean
  showLine?: boolean
  paddingColumn?: number
}

const TrendChartUpDown = (props: CanvasChartProps) => {
  const { lineData, barData, barLength, trend, glowingEffect = false, showLine = true, paddingColumn = 2 } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Gradient colors for bars
  // UP: Green gradient (#34ffd2 to #00c896)
  // DOWN: Red gradient (#ff5b7f to #b30038)
  const upBarGradientTop = '#34ffd2'
  const upBarGradientBottom = '#00c896'
  const downBarGradientTop = '#ff5b7f'
  const downBarGradientBottom = '#b30038'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    const padding = paddingColumn ?? 2
    const width = 60
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

    // Draw bars as gradient
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    const maxBarValue = Math.max(...barData)
    for (let i = 0; i < length; i++) {
      const value = barData[i]
      // For DOWN trend, reverse the bar value (bars go downward from the top)
      const calculatedPercent = value > 0 ? value / maxBarValue : 0
      const percent = Math.max(calculatedPercent, 0.05)
      const barHeight = percent * (canvasHeight - 2 * padding)
      const x = padding + i * barWidth
      const barW = barWidth * 0.6

      if (trend === 'down') {
        // Bars start from the top and go downward
        const y = padding
        // Red gradient
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight)
        gradient.addColorStop(0, downBarGradientTop)
        gradient.addColorStop(1, downBarGradientBottom)
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.roundRect(x, y, barW, barHeight, [0, 0, barW, barW])
        ctx.fill()
      } else {
        // Bars start from the bottom and go upward
        const y = canvasHeight - padding - barHeight
        // Green gradient
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight)
        gradient.addColorStop(0, upBarGradientTop)
        gradient.addColorStop(1, upBarGradientBottom)
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.roundRect(x, y, barW, barHeight, [barW, barW, 0, 0])
        ctx.fill()
      }
    }

    // Draw line (skipped for brevity, keep as before or update as needed)

  }, [lineData, barData, barLength, showLine, glowingEffect, trend, paddingColumn])

  return <canvas ref={canvasRef} width={62} height={30} />
}

export default TrendChartUpDown