import { cn } from '@/lib/utils'
import { useCallback, useEffect, useRef, useState } from 'react'

interface SwipeableRowProps {
  children: React.ReactNode
  onSwipeDelete?: () => void
  deleteText?: string
  onClick?: () => void // Add onClick prop
}

const SwipeableRow = ({ children, onSwipeDelete, deleteText = '删除', onClick }: SwipeableRowProps) => {
  const [translateX, setTranslateX] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)

  // Touch/drag state
  const startX = useRef(0)
  const startY = useRef(0)
  const currentX = useRef(0)
  const currentY = useRef(0)
  const isDragging = useRef(false)
  const isScrolling = useRef(false)
  const velocityX = useRef(0)
  const lastMoveTime = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const hasMoved = useRef(false) // Track if user actually moved during gesture
  const isTouch = useRef(false) // Track if current interaction is touch

  // Constants for better UX
  const DELETE_THRESHOLD = 60
  const DELETE_WIDTH = 60
  const VELOCITY_THRESHOLD = 0.3
  const SCROLL_THRESHOLD = 15
  const MOVE_THRESHOLD = 5 // Minimum movement to consider as drag

  // Reset drag state
  const resetDragState = () => {
    isDragging.current = false
    isScrolling.current = false
    hasMoved.current = false
    velocityX.current = 0
  }

  // Handle touch start for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    isTouch.current = true
    const touch = e.touches[0]
    startX.current = touch.clientX
    startY.current = touch.clientY
    currentX.current = startX.current
    currentY.current = startY.current
    resetDragState()
    lastMoveTime.current = Date.now()

    // Prevent default only if delete button is revealed to avoid interfering with scrolling
    if (isRevealed) {
      e.preventDefault()
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTouch.current) return

    const touch = e.touches[0]
    const now = Date.now()
    const timeDelta = now - lastMoveTime.current

    currentX.current = touch.clientX
    currentY.current = touch.clientY

    const diffX = currentX.current - startX.current
    const diffY = currentY.current - startY.current
    const absX = Math.abs(diffX)
    const absY = Math.abs(diffY)

    // Check if user has moved enough to be considered a gesture
    if (!hasMoved.current && (absX > MOVE_THRESHOLD || absY > MOVE_THRESHOLD)) {
      hasMoved.current = true
    }

    // Determine gesture type
    if (!isDragging.current && !isScrolling.current && hasMoved.current) {
      if (absY > SCROLL_THRESHOLD && absY > absX) {
        isScrolling.current = true
        return
      } else if (absX > SCROLL_THRESHOLD) {
        isDragging.current = true
        e.preventDefault() // Prevent scrolling only when we're sure it's a horizontal swipe
      }
    }

    // Handle horizontal swiping
    if (isDragging.current && !isScrolling.current) {
      if (timeDelta > 0) {
        velocityX.current = Math.abs(diffX) / timeDelta
      }
      lastMoveTime.current = now

      if (diffX < 0) {
        const newTranslateX = Math.min(DELETE_WIDTH, absX)
        setTranslateX(newTranslateX)
      } else if (diffX > 0 && translateX > 0) {
        const newTranslateX = Math.max(0, translateX - diffX)
        setTranslateX(newTranslateX)
      }
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isTouch.current) return

    if (isScrolling.current) {
      resetDragState()
      isTouch.current = false
      return
    }

    // If no movement detected and not dragging, treat as click
    if (!hasMoved.current && !isDragging.current && onClick) {
      onClick()
      resetDragState()
      isTouch.current = false
      return
    }

    if (!isDragging.current) {
      resetDragState()
      isTouch.current = false
      return
    }

    const diffX = currentX.current - startX.current
    const shouldReveal = translateX > DELETE_THRESHOLD || (velocityX.current > VELOCITY_THRESHOLD && diffX < -20)

    if (shouldReveal) {
      setTranslateX(DELETE_WIDTH)
      setIsRevealed(true)
    } else {
      setTranslateX(0)
      setIsRevealed(false)
    }

    resetDragState()
    isTouch.current = false
  }

  // Handle mouse events for desktop - simplified and separate from touch
  const handleMouseDown = (e: React.MouseEvent) => {
    // Skip if touch device or if this is a touch event disguised as mouse
    if ('ontouchstart' in window || isTouch.current) return

    isTouch.current = false
    startX.current = e.clientX
    currentX.current = startX.current
    resetDragState()
    lastMoveTime.current = Date.now()

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current && !hasMoved.current) {
        const diffX = e.clientX - startX.current
        const absX = Math.abs(diffX)

        if (absX > MOVE_THRESHOLD) {
          hasMoved.current = true
          isDragging.current = true
        }
      }

      if (!isDragging.current) return

      const now = Date.now()
      const timeDelta = now - lastMoveTime.current

      currentX.current = e.clientX
      const diffX = currentX.current - startX.current

      if (timeDelta > 0) {
        velocityX.current = Math.abs(diffX) / timeDelta
      }
      lastMoveTime.current = now

      if (diffX < 0) {
        setTranslateX(Math.min(DELETE_WIDTH, Math.abs(diffX)))
      } else if (diffX > 0 && translateX > 0) {
        setTranslateX(Math.max(0, translateX - diffX))
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)

      // If no significant movement, treat as click
      if (!hasMoved.current && onClick) {
        onClick()
        resetDragState()
        return
      }

      if (!isDragging.current) {
        resetDragState()
        return
      }

      const shouldReveal = translateX > DELETE_THRESHOLD || velocityX.current > VELOCITY_THRESHOLD

      if (shouldReveal) {
        setTranslateX(DELETE_WIDTH)
        setIsRevealed(true)
      } else {
        setTranslateX(0)
        setIsRevealed(false)
      }

      resetDragState()
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    e.preventDefault()
  }

  // Handle delete action
  const handleDelete = async () => {
    if (!onSwipeDelete || isDeleting) return

    setIsDeleting(true)
    try {
      await onSwipeDelete()
    } catch (error) {
      console.error('Delete failed:', error)
    } finally {
      setIsDeleting(false)
      setTranslateX(0)
      setIsRevealed(false)
    }
  }

  // Handle row click - only if not dragging and not revealed
  const handleRowClick = (e: React.MouseEvent | React.TouchEvent) => {
    /**
  Prevent click if:
    - Currently or recently dragging
    - Delete button is visible
    - User has moved (gesture)
    - Currently deleting
     */

    if (isDragging.current || isRevealed || hasMoved.current || isDeleting) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
  }

  // Close delete button when clicking outside
  const handleClickOutside = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (isRevealed && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setTranslateX(0)
        setIsRevealed(false)
      }
    },
    [isRevealed],
  )

  useEffect(() => {
    if (isRevealed) {
      document.addEventListener('touchstart', handleClickOutside)
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('touchstart', handleClickOutside)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isRevealed, handleClickOutside])

  return (
    <div className="relative overflow-hidden w-full" ref={containerRef}>
      {/* Delete button background */}
      <div
        className={`absolute right-0 top-[18px] h-full bg-red-500  hover:bg-red-600 flex items-center justify-center text-white font-medium z-10 transition-all duration-200 rounded-2xl ${
          isRevealed ? 'shadow-lg' : ''
        }`}
        style={{
          width: `${DELETE_WIDTH}px`,
          // height: `${DELETE_WIDTH * 0.8}px`,
          height: '28px',
          transform: `translateX(${translateX === DELETE_WIDTH ? 0 : '100%'})`,
          transition: isDragging.current ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={`w-full h-full flex items-center justify-center text-sm font-medium transition-opacity ${
            isDeleting ? 'opacity-50' : 'opacity-100'
          }`}
          style={{ minHeight: '44px' }}
        >
          {isDeleting ? (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{deleteText}</span>
            </div>
          ) : (
            deleteText
          )}
        </button>
      </div>

      {/* Main content */}
      <div
        className={cn('relative z-1 bg-inherit w-full', translateX && 'pr-2')}
        style={{
          transform: `translateX(-${translateX}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          touchAction: isDragging.current ? 'none' : 'manipulation',
          userSelect: isDragging.current ? 'none' : 'auto',
          WebkitUserSelect: isDragging.current ? 'none' : 'auto',
          WebkitTouchCallout: 'none',
          minWidth: '100%',
          cursor: isDragging.current ? 'grabbing' : 'default',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onClick={handleRowClick}
      >
        {children}
      </div>

      {/* Overlay to prevent interaction when delete is revealed */}
      {isRevealed && (
        <div
          className="absolute inset-0 z-5 bg-transparent"
          onClick={() => {
            setTranslateX(0)
            setIsRevealed(false)
          }}
        />
      )}
    </div>
  )
}

export default SwipeableRow
