import { useState, useRef, useEffect } from 'react'
import BalanceExpendChart from './BalanceExpendChart'
import BalanceExpendChartOverlay from './BalanceExpendChartOverlay'
import { DataItem, NullableDataItem } from './WalletChangeBox'
import { isMacOs } from 'react-device-detect'
import dayjs from 'dayjs'
import { ChartItem } from '@hooks/useAssetChart.ts'

interface BalanceExpendChartProps {
  data: DataItem[]
  width: number
  height: number
  isThumb: boolean
  period: string
  firstItem?: ChartItem
  onHoverChange?: (point: NullableDataItem) => void
  formatChartValue?: (value: number) => string
  isFilterPoints?: boolean
}

const checkIsTouchDevice = () => {
  const hasTouchEvents = 'ontouchstart' in window
  const hasTouchScreen = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0
  const hasTouch = hasTouchEvents || hasTouchScreen
  return hasTouch && !isMacOs
}

const getHoverablePoints1D = (data: DataItem[]) => {
  // Each point represents 15 or 20 minutes, so we take every point that is on the hour
  return data.filter(
    (item, index) => index === 0 || index === data.length - 1 || dayjs.unix(item.timestamp / 1000).minute() === 0,
  )
}

const getHoverablePoints1W = (data: DataItem[]) => {
  // Each point represents 2 hours, so we take every 3rd point to reach 6 hours swiping
  return data.filter((_, index) => index === 0 || index % 3 === 2 || index === data.length - 1)
}

const getHoverablePoints1M = (data: DataItem[]) => {
  const hoverablePoints = []
  for (let i = 0; i < data.length; i++) {
    if (i === 0 || i === data.length - 1) {
      hoverablePoints.push(data[i])
    } else {
      const lastPoint = hoverablePoints[hoverablePoints.length - 1]
      const currentPoint = data[i]
      const diff = dayjs.unix(currentPoint.timestamp / 1000).diff(dayjs.unix(lastPoint.timestamp / 1000), 'hour')
      if (diff >= 24) {
        hoverablePoints.push(currentPoint)
      }
    }
  }
  return hoverablePoints
}

const getHoverablePoints1Y = (data: DataItem[]) => {
  const hoverablePoints = []
  for (let i = 0; i < data.length; i++) {
    if (i === 0 || i === data.length - 1) {
      hoverablePoints.push(data[i])
    } else {
      const lastPoint = hoverablePoints[hoverablePoints.length - 1]
      const currentPoint = data[i]
      const diff = dayjs.unix(currentPoint.timestamp / 1000).diff(dayjs.unix(lastPoint.timestamp / 1000), 'day')
      if (diff >= 13) {
        hoverablePoints.push(currentPoint)
      }
    }
  }
  return hoverablePoints
}

const getHoverablePoints = (data: DataItem[], period: string) => {
  if (period === '1day') {
    return getHoverablePoints1D(data)
  }
  if (period === '1week') {
    return getHoverablePoints1W(data)
  }
  if (period === '1month') {
    return getHoverablePoints1M(data)
  }
  return getHoverablePoints1Y(data)
}

const BalanceExpendChartWrapper = ({
  data,
  width,
  height,
  isThumb,
  period,
  onHoverChange,
  formatChartValue,
  firstItem,
  isFilterPoints = true
}: BalanceExpendChartProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const [hoverPoint, setHoverPoint] = useState<NullableDataItem>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current!
    const isTouchDevice = checkIsTouchDevice()

    const hoverablePoints = isFilterPoints ? getHoverablePoints(data, period) : data

    function handleMove(event: MouseEvent | TouchEvent) {
      let clientX
      if ('touches' in event) {
        clientX = event.touches[0].clientX
      } else if (!isTouchDevice) {
        clientX = event.clientX
      } else {
        // Touch devices should not trigger mouse events
        return
      }
      if (wrapper) {
        const rect = wrapper.getBoundingClientRect()
        const mouseX = clientX - rect.left

        let closestPointIndex = 0
        let closestDiff = 0

        for (let i = 0; i < hoverablePoints.length; i++) {
          const index = data.findIndex((item) => item.timestamp === hoverablePoints[i].timestamp)
          const pointX = (index / (data.length - 1)) * width
          const diff = Math.abs(pointX - mouseX)
          if (i === 0 || diff < closestDiff) {
            closestDiff = diff
            closestPointIndex = i
          }
        }

        const closestPoint = hoverablePoints[closestPointIndex]

        setHoverPoint(closestPoint as any)
        if (onHoverChange) {
          onHoverChange(closestPoint as any)
        }
      }
    }

    const clearTouch = () => {
      setHoverPoint(null)
      if (onHoverChange) {
        onHoverChange(null)
      }
    }

    if (!isThumb) {
      wrapper.addEventListener('mousemove', handleMove)
      wrapper.addEventListener('touchmove', handleMove)
      wrapper.addEventListener('touchstart', handleMove)
      wrapper.addEventListener('mouseleave', clearTouch)
      wrapper.addEventListener('touchend', clearTouch)
      wrapper.addEventListener('touchcancel', clearTouch)
    }

    return () => {
      if (!isThumb) {
        wrapper.removeEventListener('mousemove', handleMove)
        wrapper.removeEventListener('touchmove', handleMove)
        wrapper.removeEventListener('touchstart', handleMove)
        wrapper.removeEventListener('mouseleave', clearTouch)
        wrapper.removeEventListener('touchend', clearTouch)
        wrapper.removeEventListener('touchcancel', clearTouch)
      }
    }
  })

  return (
    <div ref={wrapperRef} className="select-none touch-none" style={{ position: 'relative', width, height }}>
      {data.length > 0 && (
        <>
          <BalanceExpendChart
            data={data}
            width={width}
            height={height}
            paddingTop={24}
            paddingBottom={24}
            hoverPoint={hoverPoint}
            isThumb={isThumb}
            firstBalance={firstItem?.balance ?? 0}
          />
          <BalanceExpendChartOverlay
            data={data}
            width={width}
            height={height}
            paddingTop={24}
            paddingBottom={24}
            hoverPoint={hoverPoint}
            isThumb={isThumb}
            period={period}
            firstPrice={firstItem?.balance ?? 0}
            formatMinValue={formatChartValue}
            formatMaxValue={formatChartValue}
          />
        </>
      )}
    </div>
  )
}

export default BalanceExpendChartWrapper
