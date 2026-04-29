import { useRef, useEffect, useMemo } from 'react'
import { NullableDataItem } from './WalletChangeBox'
import { COLORS } from '@/lib/constant.ts'
import { useAppSelector } from '@/redux/store'
import { PriceChangeColor } from '@/redux/modules/preferences.slice.ts'

interface ChartProps {
  data: { timestamp: number; balance: number }[]
  width: number
  height: number
  paddingTop?: number
  paddingBottom?: number
  isThumb: boolean
  hoverPoint: NullableDataItem
  firstBalance?: number
}

const GridFillChart = ({
  data,
  width,
  height,
  paddingTop = 20,
  paddingBottom = 20,
  hoverPoint,
  firstBalance = 0,
}: ChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const colorSettings = useAppSelector((state) => state.preference.priceChangeColor as PriceChangeColor)

  const { unselectedDownColor, unselectedUpColor } = useMemo(() => {
    return {
      selectedUpColor: colorSettings === 'normal' ? COLORS.SEL_RISE_COLOR : COLORS.SEL_FALL_COLOR,
      selectedDownColor: colorSettings === 'normal' ? COLORS.SEL_FALL_COLOR : COLORS.SEL_RISE_COLOR,
      unselectedUpColor: colorSettings === 'normal' ? COLORS.UNSEL_RISE_COLOR : COLORS.UNSEL_FALL_COLOR,
      unselectedDownColor: colorSettings === 'normal' ? COLORS.UNSEL_FALL_COLOR : COLORS.UNSEL_RISE_COLOR,
    }
  }, [colorSettings])

  const gridColor = useMemo(() => {
    if (data.length < 2) return unselectedUpColor
    const lastBalance = data[data.length - 1].balance
    const delta = lastBalance - firstBalance
    if (delta < -0.01) return unselectedDownColor
    return unselectedUpColor
  }, [data, firstBalance])

  const getUnSelColorRgb = (hoverPoint: NullableDataItem) => {
    if (!hoverPoint) return gridColor
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

    ctx.clearRect(0, 0, width, height)

    const minValue = Math.min(...data.map((d) => d.balance))
    const maxValue = Math.max(...data.map((d) => d.balance))

    // 增加映射，确保最高点在顶部，最低点在底部
    const balanceRange = maxValue - minValue
    const balanceToCanvas = (balance: number) => {
      // 将价格映射到画布的垂直位置，底部对应最小值，顶部对应最大值
      return height - paddingBottom - ((balance - minValue) / balanceRange) * (height - paddingTop - paddingBottom)
    }

    // 绘制背景色
    // ctx.fillStyle = 'rgba(0,0,0, 1)';
    // ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 创建折线裁剪路径
    ctx.beginPath()
    ctx.moveTo(0, balanceToCanvas(data[0].balance))
    data.forEach((point, index) => {
      const x = (index / (data.length - 1)) * width
      const y = balanceToCanvas(point.balance)
      ctx.lineTo(x, y)
    })
    ctx.lineTo(width, height)
    ctx.lineTo(0, height)
    ctx.closePath()

    // 裁剪
    ctx.globalCompositeOperation = 'destination-in'
    ctx.fillStyle = 'rgba(0,0,0, 1)'
    ctx.fill()

    // 绘制空心网格线（渐变颜色）
    ctx.globalCompositeOperation = 'source-over' // 恢复默认绘制模式
    const gridLineGradient = ctx.createLinearGradient(0, height, 0, 0) // 从下到上渐变
    gridLineGradient.addColorStop(0, `rgba(${getUnSelColorRgb(hoverPoint)}, 0.6)`)
    gridLineGradient.addColorStop(0.5, `rgba(${getUnSelColorRgb(hoverPoint)}, 0.3)`)
    gridLineGradient.addColorStop(1, 'transparent')

    ctx.strokeStyle = gridLineGradient // 渐变颜色
    ctx.lineWidth = 0.5

    const gridSize = 6

    // 绘制纵向网格线
    for (let x = -0.5; x < width - 2; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, paddingTop)
      ctx.lineTo(x, height - paddingBottom)
      ctx.stroke()
    }

    // 绘制横向网格线
    for (let y = paddingTop - 0.5; y < height - paddingBottom - 1; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
  }, [data, width, height, paddingTop, paddingBottom, hoverPoint])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', position: 'absolute', top: '0', left: '0', zIndex: '1' }}
    />
  )
}

export default GridFillChart
