import React, { useEffect, useRef, useState, useCallback, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ScrollableMenuWrapperProps {
  children: ReactNode
  buttonHeight: string
  containerProps?: string
  onScrollStatusChange?: (status: ScrollStatus) => void
}
export interface ScrollStatus {
  canScrollLeft: boolean
  canScrollRight: boolean
  isOverflowing: boolean
}

const HorizontalScrollWrapper: React.FC<ScrollableMenuWrapperProps> = ({
  children,
  buttonHeight,
  containerProps,
  onScrollStatusChange,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const lastSentStatusRef = useRef<ScrollStatus>({ canScrollLeft: false, canScrollRight: false, isOverflowing: false })

  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

  const calculateScrollState = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) {
      return { canScrollLeft: false, canScrollRight: false, isOverflowing: false }
    }

    const maxScroll = container.scrollWidth - container.offsetWidth
    const currentScroll = container.scrollLeft

    if (maxScroll <= 1) {
      return { canScrollLeft: false, canScrollRight: false, isOverflowing: false }
    }

    const canScrollLeft = currentScroll > 5
    const canScrollRight = currentScroll < maxScroll - 5
    const isOverflowing = maxScroll > 1

    return { canScrollLeft, canScrollRight, isOverflowing }
  }, [])

  const updateScrollState = useCallback(() => {
    const status = calculateScrollState()
    const lastStatus = lastSentStatusRef.current

    setShowLeftArrow(status.canScrollLeft)
    setShowRightArrow(status.canScrollRight)

    if (
      onScrollStatusChange &&
      (status.canScrollLeft !== lastStatus.canScrollLeft ||
        status.canScrollRight !== lastStatus.canScrollRight ||
        status.isOverflowing !== lastStatus.isOverflowing)
    ) {
      onScrollStatusChange(status)
      lastSentStatusRef.current = status
    }
  }, [calculateScrollState, onScrollStatusChange])

  const handleScroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = Math.max(container.offsetWidth / 3, 200)

    container.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    })

    setTimeout(updateScrollState, 150)
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScrollEvent = () => updateScrollState()
    container.addEventListener('scroll', handleScrollEvent)
    window.addEventListener('resize', handleScrollEvent)

    handleScrollEvent()

    return () => {
      container.removeEventListener('scroll', handleScrollEvent)
      window.removeEventListener('resize', handleScrollEvent)
    }
  }, [updateScrollState])

  useEffect(() => {
    const timeoutId = setTimeout(() => updateScrollState(), 50)
    return () => clearTimeout(timeoutId)
  }, [updateScrollState, children])

  return (
    <div className={cn('relative flex w-full items-center', containerProps)}>
      {showLeftArrow && (
        <button
          onClick={() => handleScroll('left')}
          className={cn(
            'absolute left-0 z-20 pr-1 rounded-[4px] bg-[#121214]',
            'flex items-center justify-center transition-opacity duration-200 hover:opacity-100',
          )}
          style={{ height: buttonHeight }}
        >
          <img src="/images/icons/arrow-left.svg" alt="Scroll Left" className="size-4" />
        </button>
      )}

      <div
        ref={scrollContainerRef}
        className="flex items-center gap-2 flex-grow overflow-x-auto scrollbar-hide relative flex-nowrap min-w-0"
      >
        {children}
      </div>

      {showRightArrow && (
        <button
          onClick={() => handleScroll('right')}
          className={cn(
            'absolute right-0 z-20 pl-1 rounded-[4px] bg-[#121214]',
            'flex items-center justify-center transition-opacity duration-200 hover:opacity-100',
          )}
          style={{ height: buttonHeight }}
        >
          <img src="/images/icons/arrow-right.svg" alt="Scroll Right" className="size-4" />
        </button>
      )}
    </div>
  )
}

export default HorizontalScrollWrapper
