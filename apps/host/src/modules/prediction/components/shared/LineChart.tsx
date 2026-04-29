import { HTMLAttributes, useEffect, useRef } from 'react'

export interface LineChartProps extends HTMLAttributes<HTMLCanvasElement> {
  data: number[]
}

export const LineChart = (props: LineChartProps) => {
  const { data, ...rest } = props
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const width = canvas.clientWidth * dpr
    const height = canvas.clientHeight * dpr
    canvas.width = width
    canvas.height = height

    const firstPoint = data[0]
    const lastPoint = data[data.length - 1]
    const isUp = lastPoint >= firstPoint
    const rootStyle = getComputedStyle(document.documentElement)

    ctx.clearRect(0, 0, width, height)

    ctx.beginPath()
    ctx.lineWidth = 2 * dpr
    ctx.strokeStyle = isUp ? rootStyle.getPropertyValue('--rise') : rootStyle.getPropertyValue('--fall')

    const maxData = Math.max(...data)
    const minData = Math.min(...data)
    const range = maxData - minData

    data.forEach((point, index) => {
      const x = (index / (data.length - 1)) * width
      const y = range === 0 ? height / 2 : height - ((point - minData) / range) * height
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()
  }, [data])

  return <canvas ref={ref} {...rest} />
}
