import { useCallback, useRef } from 'react'
import { SWIPE_THRESHOLD_PX } from '@/modules/prediction/constants/earnings.constants'

interface UseGestureHandlersProps {
  activeWeekIndex: number
  scrollToWeek: (index: number) => void
  totalWeeks: number
}

export const useGestureHandlers = ({
  activeWeekIndex,
  scrollToWeek,
  totalWeeks,
}: UseGestureHandlersProps) => {
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current

    if (Math.abs(diff) > SWIPE_THRESHOLD_PX) {
      if (diff > 0 && activeWeekIndex < totalWeeks - 1) {
        scrollToWeek(activeWeekIndex + 1)
      } else if (diff < 0 && activeWeekIndex > 0) {
        scrollToWeek(activeWeekIndex - 1)
      }
    }

    touchStartX.current = 0
    touchEndX.current = 0
  }, [activeWeekIndex, scrollToWeek, totalWeeks])

  return { handleTouchStart, handleTouchMove, handleTouchEnd }
}
