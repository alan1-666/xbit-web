import React, { useEffect, useState } from 'react'

interface HorizontalScrollbarProps {
  containerRef: React.RefObject<HTMLDivElement | null>
  height?: number
  trackColor?: string
  thumbColor?: string
}

export const HorizontalScrollbar = ({
  containerRef,
  height = 8,
  trackColor = '#e0e0e0',
  thumbColor = '#888',
}: HorizontalScrollbarProps) => {
  const [thumbWidth, setThumbWidth] = useState(0)
  const [thumbLeft, setThumbLeft] = useState(0)

  const updateThumb = () => {
    const container = containerRef.current
    if (!container) return

    const ratio = container.clientWidth / container.scrollWidth
    setThumbWidth(container.clientWidth * ratio)

    const left = (container.scrollLeft / container.scrollWidth) * container.clientWidth
    setThumbLeft(left)
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    updateThumb()
    container.addEventListener('scroll', updateThumb)
    window.addEventListener('resize', updateThumb)

    return () => {
      container.removeEventListener('scroll', updateThumb)
      window.removeEventListener('resize', updateThumb)
    }
  }, [containerRef])

  return (
    <div
      style={{
        height,
        backgroundColor: trackColor,
        borderRadius: height / 2,
        position: 'relative',
        marginTop: 4,
      }}
    >
      <div
        style={{
          width: thumbWidth,
          height: '100%',
          backgroundColor: thumbColor,
          borderRadius: height / 2,
          position: 'absolute',
          left: thumbLeft,
        }}
      />
    </div>
  )
}
