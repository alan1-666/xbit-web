import { formatBalance } from '@/lib/format'
import { cn } from '@/lib/utils.ts'
import { DataItem, NullableDataItem } from '@components/common/walletBalance/WalletChangeBox.tsx'
import dayjs from 'dayjs'
import { useEffect, useMemo, useRef, useState } from 'react'

export interface BalanceChartProps {
  data: DataItem[]
  initialColor: 'rise' | 'fall' // color of the chart
  onHoverChange?: (point: NullableDataItem) => void
}

const hexToRGBA = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export const BalanceChart = (props: BalanceChartProps) => {
  const { data, initialColor, onHoverChange } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [hoverPointIndex, setHoverPointIndex] = useState<number>(-1)

  // force redraw when size changes
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
  useEffect(() => {
    function handleResize() {
      const canvas = canvasRef.current
      if (canvas) {
        setSize({ width: canvas.offsetWidth, height: canvas.offsetHeight })
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    const computedStyle = getComputedStyle(canvas)
    const riseColor = computedStyle.getPropertyValue('--balance-chart-rise') || '#00CE89'
    const fallColor = computedStyle.getPropertyValue('--balance-chart-fall') || '#FF3D71'

    const padding = 10
    const offsetWidth = Math.floor(canvas.offsetWidth / 6) * 6 // make it multiple of 6 to avoid sub-pixel rendering
    const offsetHeight = Math.floor(canvas.offsetHeight / 6) * 6 // make it multiple of 6 to avoid sub-pixel rendering
    canvas.width = offsetWidth
    canvas.height = offsetHeight
    const width = canvas.width
    const height = canvas.height

    // Handle device pixel ratio
    const dpr = window.devicePixelRatio || 1
    if (dpr !== 1) {
      canvas.width = offsetWidth * dpr
      canvas.height = offsetHeight * dpr
      // canvas.style.width = `${offsetWidth}px`
      // canvas.style.height = `${offsetHeight}px`
      ctx.scale(dpr, dpr)
    }

    // draw 4 lines horizontally
    ctx.strokeStyle = '#333333'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    const step = (height - 2 * padding) / 3
    for (let i = 0; i <= 3; i++) {
      ctx.beginPath()
      ctx.moveTo(0, step * i + padding)
      ctx.lineTo(offsetWidth, step * i + padding)
      ctx.stroke()
    }

    const minValue = Math.min(...data.map((d) => d.balance))
    const maxValue = Math.max(...data.map((d) => d.balance))
    const balanceRange = maxValue - minValue

    const balanceToCanvas = (balance: number) => {
      if (balanceRange === 0) return (height - padding) / 2
      return height - 2 * padding - (((balance - minValue) / balanceRange) * (height - padding - padding) * 3) / 4
    }

    const map = new Map<number, number[]>() // Store the coordinates of each point
    const blockSize = 5
    const gap = 1
    const stepSize = blockSize + gap

    let color
    if (hoverPoint) {
      color = hoverPoint.changePercentage >= 0 ? riseColor : fallColor
    } else {
      color = initialColor === 'rise' ? riseColor : fallColor
    }

    for (let i = 0; i < data.length - 1; i++) {
      const { balance: p1 } = data[i]
      const { balance: p2 } = data[i + 1]

      let x1 = Math.round(((i / (data.length - 1)) * width) / stepSize) * stepSize
      let y1 = Math.round(balanceToCanvas(p1) / stepSize) * stepSize
      let x2 = Math.round((((i + 1) / (data.length - 1)) * width) / stepSize) * stepSize
      let y2 = Math.round(balanceToCanvas(p2) / stepSize) * stepSize

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

    const blocks: { x: number; y: number }[] = []
    map.forEach((listY, x) => {
      listY.forEach((y) => {
        blocks.push({ x, y })
      })
    })

    ctx.fillStyle = color
    blocks.forEach((block) => {
      const { x, y } = block
      ctx.fillRect(x, y, blockSize, blockSize)
    })

    // Draw background
    ctx.moveTo(0, height - padding)
    map.forEach((listY, x) => {
      const lowestY = Math.max(...listY)
      ctx.lineTo(x, lowestY + blockSize)
      ctx.lineTo(x + blockSize, lowestY + blockSize)
    })
    ctx.lineTo(width, height - padding)
    ctx.lineTo(0, height - padding)
    ctx.closePath()
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, hexToRGBA(color, 0.3))
    gradient.addColorStop(1, hexToRGBA(color, 0))

    ctx.fillStyle = gradient
    ctx.fill()

    // Draw hover point
    let hoverPointX =
      hoverPointIndex >= 0 ? Math.round(((hoverPointIndex / (data.length - 1)) * width) / stepSize) * stepSize : -1
    // Normalize if hoverPointX is out of range
    if (hoverPointX < 0) hoverPointX = 0
    if (hoverPointX > width - stepSize) hoverPointX = width - stepSize

    if (hoverPoint) {
      // draw vertical line
      ctx.beginPath()
      ctx.setLineDash([4, 2])
      ctx.moveTo(hoverPointX + blockSize / 2, padding)
      ctx.lineTo(hoverPointX + blockSize / 2, height - padding)
      if (hoverPoint) {
        ctx.strokeStyle = color
      } else {
        ctx.strokeStyle = riseColor
      }
      ctx.lineWidth = 1
      ctx.stroke()
    }

    const tooltip = tooltipRef.current
    if (tooltip) {
      const tooltipWidth = tooltip.offsetWidth
      if (hoverPointX + tooltipWidth > width) {
        tooltip.style.transform = `translateX(-${tooltipWidth}px)`
      } else {
        tooltip.style.transform = 'translateX(0)'
      }
      tooltip.style.left = `${Math.min(Math.max((hoverPointX / width) * 100, 0), 100)}%`
    }
  }, [data, hoverPointIndex, initialColor, size])

  useEffect(() => {
    function handleMove(event: MouseEvent) {
      const clientX = event.clientX
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        const mouseX = clientX - rect.left
        const index = Math.round((mouseX / rect.width) * (data.length - 1))
        setHoverPointIndex(Math.min(Math.max(index, 0), data.length - 1))
      }
    }
    function handleMouseLeave() {
      setHoverPointIndex(-1)
    }
    const canvas = canvasRef.current
    if (canvas) {
      canvas.addEventListener('mousemove', handleMove)
      canvas.addEventListener('mouseleave', handleMouseLeave)
    }
    return () => {
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMove)
        canvas.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [canvasRef.current, data.length])

  const hoverPoint = useMemo<NullableDataItem>(() => {
    if (hoverPointIndex >= 0 && hoverPointIndex < data.length) {
      return data[hoverPointIndex]
    }
    return null
  }, [hoverPointIndex, data])

  useEffect(() => {
    if (onHoverChange) {
      onHoverChange(hoverPoint)
    }
  }, [hoverPoint])

  return (
    <div className="w-full h-[226px] relative">
      <canvas ref={canvasRef} className="w-full h-[226px] cursor-pointer" />
      <div
        ref={tooltipRef}
        className={cn(
          'absolute top-1/3 left-0 transition duration-300 pl-4 pointer-events-none',
          hoverPointIndex >= 0 ? 'block' : 'hidden',
        )}
      >
        {hoverPoint ? (
          <div className="bg-[#212127] px-2 py-1 gap-2 rounded-[8px] flex items-center">
            <div
              className={cn(
                'bg-(--balance-chart-rise) w-1 rounded-full h-8',
                hoverPoint.changePercentage >= 0 ? 'bg-(--balance-chart-rise)' : 'bg-(--balance-chart-fall)',
              )}
            ></div>
            <div className="flex flex-col gap-0.5">
              <div className="text-[#FBFBFB] text-[calc(14rem/16)] leading-[calc(19rem/16)] font-[330] whitespace-nowrap break-keep">
                {dayjs(hoverPoint?.timestamp).format('MM-DD HH:mm')}
              </div>
              <div
                className={cn(
                  'text-[calc(14rem/16)] leading-[calc(19rem/16)] font-[380]',
                  hoverPoint.changePercentage >= 0 ? 'text-(--balance-chart-rise)' : 'text-(--balance-chart-fall)',
                )}
              >
                {formatBalance(hoverPoint?.balance, {
                  roundMode: 'floor',
                  showCurrency: true,
                })}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
