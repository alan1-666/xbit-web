import { useCallback, useEffect, RefObject } from 'react'

interface UseWeekNavigationProps {
  activeWeekIndex: number
  scrollToWeek: (index: number) => void
  totalWeeks: number
  headerScrollRef: RefObject<HTMLDivElement | null>
  bodyScrollRef: RefObject<HTMLDivElement | null>
}

export const useWeekNavigation = ({
  activeWeekIndex,
  scrollToWeek,
  totalWeeks,
  headerScrollRef,
  bodyScrollRef,
}: UseWeekNavigationProps) => {
  const handlePrevWeek = useCallback(() => {
    if (activeWeekIndex > 0) {
      scrollToWeek(activeWeekIndex - 1)
    }
  }, [activeWeekIndex, scrollToWeek])

  const handleNextWeek = useCallback(() => {
    if (activeWeekIndex < totalWeeks - 1) {
      scrollToWeek(activeWeekIndex + 1)
    }
  }, [activeWeekIndex, scrollToWeek, totalWeeks])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)
      if (isTyping) return

      if (e.key === 'ArrowLeft' && (e.shiftKey || !isTyping)) {
        e.preventDefault()
        handlePrevWeek()
      } else if (e.key === 'ArrowRight' && (e.shiftKey || !isTyping)) {
        e.preventDefault()
        handleNextWeek()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlePrevWeek, handleNextWeek])

  useEffect(() => {
    const headerContainer = headerScrollRef.current
    const bodyContainer = bodyScrollRef.current
    if (!headerContainer || !bodyContainer) return

    const handleWheel = (e: WheelEvent) => {
      if (!e.shiftKey) return

      e.preventDefault()
      const delta = e.deltaY || e.deltaX

      if (delta > 0) {
        handleNextWeek()
      } else if (delta < 0) {
        handlePrevWeek()
      }
    }

    headerContainer.addEventListener('wheel', handleWheel, { passive: false })
    bodyContainer.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      headerContainer.removeEventListener('wheel', handleWheel)
      bodyContainer.removeEventListener('wheel', handleWheel)
    }
  }, [handlePrevWeek, handleNextWeek, headerScrollRef, bodyScrollRef])

  const canGoPrev = activeWeekIndex > 0
  const canGoNext = activeWeekIndex < totalWeeks - 1

  return { handlePrevWeek, handleNextWeek, canGoPrev, canGoNext }
}
