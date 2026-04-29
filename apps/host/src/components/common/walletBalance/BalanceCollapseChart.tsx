import { DataItem } from '@components/common/walletBalance/WalletChangeBox.tsx'
import { useEffect, useMemo, useRef } from 'react'
import { COLORS } from '@/lib/constant.ts'
import { useAppSelector } from '@/redux/store'
import { PriceChangeColor } from '@/redux/modules/preferences.slice.ts'
import { ChartItem } from '@hooks/useAssetChart.ts'

export interface BalanceCollapseChartProps {
  data: DataItem[]
  width: number
  height: number
  firstItem?: ChartItem
}

const paddingBottom = 18
const paddingTop = 24

export const BalanceCollapseChart = (props: BalanceCollapseChartProps) => {
  const { data, width, height, firstItem } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const colorSettings = useAppSelector((state) => state.preference.priceChangeColor as PriceChangeColor)

  const { chartColor, gridColor } = useMemo(() => {
    if (data.length < 2) {
      return {
        chartColor: colorSettings === 'normal' ? COLORS.SEL_RISE_COLOR : COLORS.SEL_FALL_COLOR,
        gridColor: colorSettings === 'normal' ? COLORS.UNSEL_RISE_COLOR : COLORS.UNSEL_FALL_COLOR,
      }
    }
    const firstBalance = firstItem?.balance ?? data[0].balance
    const lastBalance = data[data.length - 1].balance
    const isDown = firstBalance > lastBalance

    if (colorSettings === 'normal') {
      return {
        chartColor: isDown ? COLORS.SEL_FALL_COLOR : COLORS.SEL_RISE_COLOR,
        gridColor: isDown ? COLORS.UNSEL_FALL_COLOR : COLORS.UNSEL_RISE_COLOR,
      }
    }
    return {
      chartColor: isDown ? COLORS.SEL_RISE_COLOR : COLORS.SEL_FALL_COLOR,
      gridColor: isDown ? COLORS.UNSEL_RISE_COLOR : COLORS.UNSEL_FALL_COLOR,
    }
  }, [data, colorSettings])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

    const dpr = window.devicePixelRatio || 1

    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)

    ctx.clearRect(0, 0, width, height)

    const map = new Map<number, number[]>() // Store the coordinates of each point
    const minTimestamp = data[0].timestamp
    const maxTimestamp = data[data.length - 1].timestamp
    const timeSpan = maxTimestamp - minTimestamp
    const blockSize = 5
    const gap = 1
    const stepSize = blockSize + gap

    const minValue = Math.min(...data.map((d) => d.balance))
    const maxValue = Math.max(...data.map((d) => d.balance))
    const priceRange = maxValue - minValue

    const priceToCanvas = (price: number) => {
      if (priceRange === 0) return (height - paddingBottom) / 2
      return height - paddingBottom - ((price - minValue) / priceRange) * (height - paddingTop - paddingBottom)
    }

    for (let i = 0; i < data.length - 1; i++) {
      const { timestamp: t1, balance: p1 } = data[i]
      const { timestamp: t2, balance: p2 } = data[i + 1]

      let x1 = Math.round((((t1 - minTimestamp) / timeSpan) * width) / stepSize) * stepSize
      let y1 = Math.round(priceToCanvas(p1) / stepSize) * stepSize
      let x2 = Math.round((((t2 - minTimestamp) / timeSpan) * width) / stepSize) * stepSize
      let y2 = Math.round(priceToCanvas(p2) / stepSize) * stepSize

      let dx = Math.abs(x2 - x1)
      let dy = Math.abs(y2 - y1)
      let sx = x1 < x2 ? stepSize : -stepSize
      let sy = y1 < y2 ? stepSize : -stepSize
      let err = dx - dy

      while (true) {
        const listY = map.get(x1) || []
        listY.push(y1)
        map.set(x1, listY)

        if (x1 === x2 && y1 === y2) break
        let e2 = err * 2
        if (e2 > -dy) {
          err -= dy
          x1 += sx
        }
        if (e2 < dx) {
          err += dx
          y1 += sy
        }
      }
    }

    // draw grid
    // draw vertical grid lines
    const gridLineGradient = ctx.createLinearGradient(0, height, 0, 0) // 从下到上渐变
    gridLineGradient.addColorStop(0, `rgba(${chartColor}, 0.4)`)
    gridLineGradient.addColorStop(0.5, `rgba(${chartColor}, 0.2)`)
    gridLineGradient.addColorStop(1, 'transparent')

    ctx.strokeStyle = gridLineGradient // 渐变颜色
    ctx.lineWidth = 0.5
    ctx.lineCap = 'round'
    ctx.globalCompositeOperation = 'source-over'
    for (let x = 0.5 + stepSize; x <= width; x += stepSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height - 1)
      ctx.stroke()
    }

    for (let y = paddingTop - 0.5; y < height - paddingBottom - 1; y += stepSize) {
      const alpha = y / height / 2
      const horizontalLineGradient = ctx.createLinearGradient(0, 0, width, 0) // 从下到上渐变
      horizontalLineGradient.addColorStop(0, `rgba(${chartColor}, ${alpha / 2})`)
      horizontalLineGradient.addColorStop(0.5, `rgba(${chartColor}, ${alpha})`)
      horizontalLineGradient.addColorStop(1, `rgba(${chartColor}, ${alpha / 2})`)
      ctx.strokeStyle = horizontalLineGradient
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(0.5, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // draw line
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = `rgba(${chartColor}, 1)`
    const blocks: { x: number; y: number }[] = []
    map.forEach((listY, x) => {
      listY.forEach((y) => {
        blocks.push({ x, y })
      })
    })

    blocks.forEach((block) => {
      const { x, y } = block
      ctx.clearRect(x, y - 1, stepSize + 1, stepSize + 0.5)
      ctx.fillStyle = `rgba(${chartColor}, 1)`
      ctx.fillRect(x + 1, y, blockSize, blockSize)
    })

    // draw below line
    for (let x = 0; x < width; x += stepSize) {
      const maxY = Math.max(...(map.get(x) || []))
      for (let y = 0; y < height; y += stepSize) {
        if (y > maxY) {
          const alpha = 0.5 - y / height / 2
          ctx.clearRect(x + 0.5, y - 0.5, stepSize + 0.5, stepSize + 0.5)
          ctx.fillStyle = `rgba(${gridColor}, ${alpha - 0.05})`
          ctx.fillRect(x + 1, y, stepSize - 1, stepSize - 1)
        }
      }
    }
  }, [data, width, height, gridColor, chartColor])

  return (
    <div className="select-none touch-none relative" style={{ width, height }}>
      {data.length > 0 && (
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full bg-transparent z-10" />
      )}
    </div>
  )
}
