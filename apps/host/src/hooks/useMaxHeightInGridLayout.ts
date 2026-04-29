import { RefObject, useEffect, useState } from 'react'
import eventBus from '@/lib/eventBus.ts'

export interface UseMaxHeightInGridLayoutOptions {
  containerRef: RefObject<HTMLElement | null>
  padding?: number
}

export const useMaxHeightInGridLayout = (option: UseMaxHeightInGridLayoutOptions) => {
  const { containerRef, padding = 0 } = option
  const [maxHeight, setMaxHeight] = useState<number>(400)

  useEffect(() => {
    // Observe container size changes
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { height } = entry.contentRect
        setMaxHeight(height - padding)
      }
    })

    // Initial setting
    if (containerRef.current) {
      setMaxHeight(containerRef.current.offsetHeight - padding)
      observer.observe(containerRef.current)
    }

    // Handle window resize
    const handleResize = () => {
      if (containerRef.current) {
        setMaxHeight(containerRef.current.offsetHeight - padding)
      }
    }
    window.addEventListener('resize', handleResize)

    // Listen to grid layout change events
    const listener = () => {
      if (containerRef.current) {
        setMaxHeight(containerRef.current.offsetHeight - padding)
      }
    }
    eventBus.on('gridLayoutChange', listener)

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize)
      eventBus.remove('gridLayoutChange', listener)
      observer.disconnect()
    }
  }, [containerRef.current])

  return maxHeight
}
