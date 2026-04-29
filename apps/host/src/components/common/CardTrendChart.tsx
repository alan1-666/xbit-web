import { useEffect, useRef } from 'react'

interface CardTrendChartProps {
  lineData: number[]
  barData: number[]
  maxValue: number
  lineColor: string
  barColor: string
  padding: number
  length?: number
}

export default function CardTrendChart({
  lineData,
  barData,
  maxValue,
  lineColor,
  barColor,
  padding,
  length = Math.min(lineData.length, barData.length),
}: CardTrendChartProps) {

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {

    const canvas = canvasRef.current!

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const chartWidth = canvas.width - 2 * padding
    const chartHeight = canvas.height - 2 * padding

    const stepX = chartWidth / (length - 1)

    function getY(value: number) {
      return canvas.height - padding - (value / maxValue) * chartHeight
    }

    // draw bar
    for (let i = 0; i < length; i++) {
      const barWidth = stepX * 0.6
      const x = padding + i * stepX - barWidth / 2
      const y = getY(barData[i])
      const barHeight = canvas.height - padding - y

      ctx.fillStyle = barColor
      ctx.fillRect(x, y, barWidth, barHeight)
    }

    // draw line
    ctx.beginPath()
    ctx.strokeStyle = lineColor
    ctx.lineWidth = 2

    ctx.moveTo(padding, getY(lineData[0]))

    for (let i = 1; i < length; i++) {
      const x = padding + i * stepX
      const y = getY(lineData[i])
      ctx.lineTo(x, y)
    }

    ctx.stroke()

  }, [lineData, barData, maxValue, lineColor, barColor, padding])

  return <canvas className="w-18 h-7" ref={canvasRef}></canvas>
}
