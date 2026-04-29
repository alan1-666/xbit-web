import { useRef, useEffect, useMemo } from 'react'
import { NullableDataItem } from './WalletChangeBox'
import dayjs from 'dayjs'
import { COLORS } from '@/lib/constant.ts'
import { useAppSelector } from '@/redux/store'
import { PriceChangeColor } from '@/redux/modules/preferences.slice.ts'
import { useResponsive } from '@hooks/useResponsive.ts'

interface ChartProps {
  data: { timestamp: number; balance: number }[]
  width: number
  height: number
  paddingTop: number
  paddingBottom: number
  isThumb: boolean
  hoverPoint: NullableDataItem
  period: string
  formatMinValue?: (value: number) => string
  formatMaxValue?: (value: number) => string
  firstPrice?: number
}

const formatTimeLabel = (timeframe: string, timestamp?: number) => {
  switch (timeframe) {
    case '1day':
      return dayjs(timestamp).format('HH:mm')
    case '1week':
      return dayjs(timestamp).format('MM/DD HH:mm')
    case '1month':
      return dayjs(timestamp).format('MM/DD')
    case '1year':
      return dayjs(timestamp).format('MM/DD')
    default:
      return dayjs(timestamp).format('MM/DD')
  }
}

const GridFillChart = ({
  data,
  width,
  height,
  paddingTop = 20,
  paddingBottom = 20,
  isThumb,
  hoverPoint,
  period,
  firstPrice = 0,
  formatMinValue = (value: number) => `${value.toFixed(2)}`,
  formatMaxValue = (value: number) => `${value.toFixed(2)}`,
}: ChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const colorSettings = useAppSelector((state) => state.preference.priceChangeColor as PriceChangeColor)
  const { isDesktop } = useResponsive()

  const { selectedUpColor, selectedDownColor, unselectedDownColor, unselectedUpColor } = useMemo(() => {
    if (isDesktop) {
      return {
        selectedUpColor: colorSettings === 'normal' ? '33,224,157' : COLORS.SEL_FALL_COLOR,
        selectedDownColor: colorSettings === 'normal' ? COLORS.SEL_FALL_COLOR : '33,224,157',
        unselectedUpColor: colorSettings === 'normal' ? COLORS.UNSEL_RISE_COLOR : COLORS.UNSEL_FALL_COLOR,
        unselectedDownColor: colorSettings === 'normal' ? COLORS.UNSEL_FALL_COLOR : COLORS.UNSEL_RISE_COLOR,
      }
    }
    return {
      selectedUpColor: colorSettings === 'normal' ? COLORS.SEL_RISE_COLOR : COLORS.SEL_FALL_COLOR,
      selectedDownColor: colorSettings === 'normal' ? COLORS.SEL_FALL_COLOR : COLORS.SEL_RISE_COLOR,
      unselectedUpColor: colorSettings === 'normal' ? COLORS.UNSEL_RISE_COLOR : COLORS.UNSEL_FALL_COLOR,
      unselectedDownColor: colorSettings === 'normal' ? COLORS.UNSEL_FALL_COLOR : COLORS.UNSEL_RISE_COLOR,
    }
  }, [colorSettings, isDesktop])

  const chartColor = useMemo(() => {
    if (data.length < 2) return selectedUpColor
    const lastPrice = data[data.length - 1].balance
    return firstPrice > lastPrice ? selectedDownColor : selectedUpColor
  }, [data])

  const getColorRgb = (hoverPoint: NullableDataItem) => {
    if (!hoverPoint) return selectedUpColor
    return hoverPoint.changePercentage >= 0 ? selectedUpColor : selectedDownColor
  }

  const getUnSelColorRgb = (hoverPoint: NullableDataItem) => {
    if (!hoverPoint) return unselectedUpColor
    return hoverPoint.changePercentage >= 0 ? unselectedUpColor : unselectedDownColor
  }

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

    // Disable anti-aliasing
    ctx.imageSmoothingEnabled = false

    const minValue = Math.min(...data.map((d) => d.balance))
    const maxValue = Math.max(...data.map((d) => d.balance))
    const balanceRange = maxValue - minValue

    const balanceToCanvas = (balance: number) => {
      if (balanceRange === 0) return (height - paddingBottom) / 2
      return height - paddingBottom - ((balance - minValue) / balanceRange) * (height - paddingTop - paddingBottom)
    }

    const balanceToCanvasNoPadding = (balance: number) => {
      return height - ((balance - minValue) / balanceRange) * height
    }

    // Draw background color
    ctx.fillStyle = 'rgba(19,19,19, 1)'
    // ctx.fillStyle = 'rgba(11,46,35, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Calculate the coordinates of each point, using Bresenham's line algorithm
    const map = new Map<number, number[]>() // Store the coordinates of each point
    const blockSize = 5
    const gap = 1
    const stepSize = blockSize + gap

    let currentHoverX = null

    if (hoverPoint) {
      const currentHoverPointIndex = data.findIndex((d) => d.timestamp === hoverPoint.timestamp)
      // currentHoverX = (currentHoverPointIndex / (data.length - 1)) * width
      currentHoverX = Math.round(((currentHoverPointIndex / (data.length - 1)) * width) / stepSize) * stepSize
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

    // Draw grid background (small squares) with gradient effect
    const gridSize = 6
    for (let x = 0; x < width; x += gridSize) {
      for (let y = paddingTop; y < height - paddingBottom; y += gridSize) {
        const alpha = (1 - (y - paddingTop) / (height - paddingTop - paddingBottom)) * 0.5
        // ctx.fillStyle = `rgba(${getUnSelColorRgb(hoverPoint)}, ${alpha - 0.1})`
        if (currentHoverX !== null) {
          if (x <= currentHoverX) {
            ctx.fillStyle = `rgba(${getColorRgb(hoverPoint)}, ${alpha})`
          } else {
            ctx.fillStyle = `rgba(${getUnSelColorRgb(hoverPoint)}, ${alpha})`
          }
        } else {
          ctx.fillStyle = `rgba(${chartColor}, ${alpha})`
        }
        ctx.fillRect(x, y, gridSize - 1, gridSize - 1)
      }
    }

    // Create clipping path for the chart
    ctx.beginPath()
    ctx.moveTo(0, paddingTop)
    for (let x = 0; x < width; x += gridSize) {
      const listY = map.get(x) || []
      const minY = Math.min(...listY) ?? 0
      ctx.lineTo(x, minY)
      ctx.lineTo(x + blockSize, minY)
    }
    ctx.lineTo(width, height)
    ctx.lineTo(0, height)
    ctx.closePath()
    ctx.globalCompositeOperation = 'destination-in'
    ctx.fillStyle = 'rgba(0,0,0, 1)'
    ctx.fill()

    // Draw pixel trend line
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = `rgba(${getColorRgb(hoverPoint)}, 1)`
    const blocks: { x: number; y: number }[] = []
    map.forEach((listY, x) => {
      listY.forEach((y) => {
        blocks.push({ x, y })
      })
    })

    blocks.forEach((block) => {
      const { x, y } = block
      if (currentHoverX !== null) {
        if (x <= currentHoverX) {
          ctx.fillStyle = `rgba(${getColorRgb(hoverPoint)}, 1)`
        } else {
          ctx.fillStyle = `rgba(${getUnSelColorRgb(hoverPoint)}, 1)`
        }
      } else {
        ctx.fillStyle = `rgba(${chartColor}, 1)`
      }
      ctx.fillRect(x, y, blockSize, blockSize)
    })

    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    blocks.forEach((block) => {
      const { x, y } = block
      if (currentHoverX !== null) {
        if (x <= currentHoverX) {
          ctx.fillStyle = `rgba(${getColorRgb(hoverPoint)}, 1)`
          ctx.shadowColor = `rgba(${getColorRgb(hoverPoint)}, 0.5)`
          ctx.shadowBlur = 20
        } else {
          ctx.fillStyle = `rgba(${getUnSelColorRgb(hoverPoint)}, 1)`
          ctx.shadowBlur = 0
        }
      } else {
        ctx.fillStyle = `rgba(${chartColor}, 1)`
        ctx.shadowColor = `rgba(${chartColor}, 0.5)`
        ctx.shadowBlur = x < width ? 20 : 0
      }
      ctx.fillRect(x, y, blockSize, blockSize)
    })

    if (!isThumb && currentHoverX !== null) {
      ctx.strokeStyle = `rgba(${getColorRgb(hoverPoint)}, 1)`
      ctx.setLineDash([3, 2])
      ctx.beginPath()
      ctx.moveTo(currentHoverX + stepSize / 2, paddingTop)
      ctx.lineTo(currentHoverX + stepSize / 2, height - 8)
      ctx.stroke()
      ctx.setLineDash([])

      const isLast = hoverPoint?.timestamp === data[data.length - 1].timestamp
      const ts = isLast ? Date.now() : hoverPoint?.timestamp

      const timeStr = formatTimeLabel(period, ts)

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.font = '12px Arial'
      const timeLabelWidth = ctx.measureText(timeStr).width

      const x = Math.max(0, Math.min(currentHoverX - timeLabelWidth / 2, width - timeLabelWidth))

      ctx.fillText(timeStr, x, 15)

      ctx.fillStyle = `rgba(${getColorRgb(hoverPoint)}, 0.8)`
      const hoverBlocks = blocks.filter((block) => block.x === currentHoverX)
      if (hoverBlocks.length > 0 && hoverBlocks.length <= 3) {
        const fromY = Math.min(...hoverBlocks.map((block) => block.y)) - stepSize
        const toY = Math.max(...hoverBlocks.map((block) => block.y)) + stepSize * 2
        const hoverHeight = toY - fromY
        ctx.fillRect(currentHoverX, fromY, stepSize, hoverHeight)
      } else if (hoverBlocks.length > 3) {
        const fromY = Math.min(...hoverBlocks.map((block) => block.y))
        const toY = Math.max(...hoverBlocks.map((block) => block.y)) + stepSize
        const hoverHeight = toY - fromY
        ctx.fillRect(currentHoverX, fromY, stepSize, hoverHeight)
      }
    } else if (!isThumb && currentHoverX == null) {
      const minBalanceY = balanceToCanvasNoPadding(minValue)
      const maxBalanceY = balanceToCanvasNoPadding(maxValue)

      // Calculate the x positions for the min and max balance
      const minBalanceIndex = data.reduce((prev, curr, currentIndex) => {
        return curr.balance < data[prev].balance ? currentIndex : prev
      }, 0)
      const maxBalanceIndex = data.reduce((prev, curr, currentIndex) => {
        return curr.balance > data[prev].balance ? currentIndex : prev
      }, 0)

      const minBalanceX = (minBalanceIndex / (data.length - 1)) * width
      const maxBalanceX = (maxBalanceIndex / (data.length - 1)) * width

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.font = '12px Arial'

      // Draw the minimum balance label at its corresponding x-axis position

      const minLabelText = formatMinValue(minValue)
      const minLabelWidth = ctx.measureText(minLabelText).width

      const horizontalPadding = 30

      const adjustedMinX = Math.max(
        horizontalPadding + minLabelWidth / 2,
        Math.min(minBalanceX, width - horizontalPadding - minLabelWidth / 2),
      )

      ctx.fillText(minLabelText, adjustedMinX, minBalanceY - 1)

      const maxLabelText = formatMaxValue(maxValue)
      const maxLabelWidth = ctx.measureText(maxLabelText).width

      const adjustedMaxX = Math.max(
        horizontalPadding + maxLabelWidth / 2,
        Math.min(maxBalanceX, width - horizontalPadding - maxLabelWidth / 2),
      )

      // Draw the maximum balance label at its corresponding x-axis position
      ctx.fillText(maxLabelText, adjustedMaxX, maxBalanceY + 20)
    }
  }, [data, width, height, hoverPoint, paddingTop, paddingBottom, formatMaxValue, formatMinValue])

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: '0',
        left: '0',
        zIndex: '2',
        background: 'transparent',
      }}
    />
  )
}

export default GridFillChart
