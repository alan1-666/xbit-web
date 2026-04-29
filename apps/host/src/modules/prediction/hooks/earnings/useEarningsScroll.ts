import { useCallback, useEffect, useRef, RefObject } from 'react'
import { SCROLL_DEBOUNCE_MS, SCROLL_LOCK_TIMEOUT_MS } from '@/modules/prediction/constants/earnings.constants'

interface UseEarningsScrollProps {
  headerScrollRef: RefObject<HTMLDivElement | null>
  bodyScrollRef: RefObject<HTMLDivElement | null>
  activeWeekIndex: number
  setActiveWeekIndex: (index: number) => void
}

export const useEarningsScroll = ({
  headerScrollRef,
  bodyScrollRef,
  activeWeekIndex,
  setActiveWeekIndex,
}: UseEarningsScrollProps) => {
  const isScrollingRef = useRef(false)
  const isSyncingRef = useRef(false)

  const scrollToWeek = useCallback(
    (index: number) => {
      if (!headerScrollRef.current || !bodyScrollRef.current || isScrollingRef.current) return

      const headerContainer = headerScrollRef.current
      const bodyContainer = bodyScrollRef.current

      isScrollingRef.current = true
      isSyncingRef.current = true

      const containerWidth = headerContainer.offsetWidth
      const targetScroll = index * Math.floor(containerWidth)

      headerContainer.scrollLeft = targetScroll
      bodyContainer.scrollLeft = targetScroll

      void headerContainer.offsetHeight
      void bodyContainer.offsetHeight

      setActiveWeekIndex(index)

      requestAnimationFrame(() => {
        setTimeout(() => {
          isScrollingRef.current = false
          isSyncingRef.current = false
        }, SCROLL_LOCK_TIMEOUT_MS)
      })
    },
    [headerScrollRef, bodyScrollRef, setActiveWeekIndex],
  )

  useEffect(() => {
    const headerContainer = headerScrollRef.current
    const bodyContainer = bodyScrollRef.current
    if (!headerContainer || !bodyContainer) return

    let scrollTimeout: NodeJS.Timeout
    let rafId: number

    const syncScroll = (source: HTMLDivElement, target: HTMLDivElement) => {
      if (isSyncingRef.current) return

      target.scrollLeft = source.scrollLeft

      if (rafId) cancelAnimationFrame(rafId)
      clearTimeout(scrollTimeout)

      rafId = requestAnimationFrame(() => {
        scrollTimeout = setTimeout(() => {
          const scrollLeft = source.scrollLeft
          const containerWidth = source.offsetWidth
          const newIndex = Math.round(scrollLeft / containerWidth)

          if (newIndex !== activeWeekIndex && newIndex >= 0 && newIndex <= 6) {
            setActiveWeekIndex(newIndex)
          }
        }, SCROLL_DEBOUNCE_MS)
      })
    }

    const handleHeaderScroll = () => syncScroll(headerContainer, bodyContainer)
    const handleBodyScroll = () => syncScroll(bodyContainer, headerContainer)

    headerContainer.addEventListener('scroll', handleHeaderScroll, { passive: true })
    bodyContainer.addEventListener('scroll', handleBodyScroll, { passive: true })

    return () => {
      headerContainer.removeEventListener('scroll', handleHeaderScroll)
      bodyContainer.removeEventListener('scroll', handleBodyScroll)
      clearTimeout(scrollTimeout)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [activeWeekIndex, headerScrollRef, bodyScrollRef, setActiveWeekIndex])

  useEffect(() => {
    const headerContainer = headerScrollRef.current
    const bodyContainer = bodyScrollRef.current

    if (!headerContainer || !bodyContainer) return

    let hasSetInitialScroll = false

    const setInitialScroll = () => {
      if (!hasSetInitialScroll && headerContainer.offsetWidth > 0) {
        hasSetInitialScroll = true
        const initialScroll = activeWeekIndex * headerContainer.offsetWidth

        headerContainer.style.scrollBehavior = 'auto'
        bodyContainer.style.scrollBehavior = 'auto'

        headerContainer.scrollLeft = initialScroll
        bodyContainer.scrollLeft = initialScroll

        requestAnimationFrame(() => {
          setTimeout(() => {
            headerContainer.style.scrollBehavior = 'auto'
            bodyContainer.style.scrollBehavior = 'auto'
          }, SCROLL_DEBOUNCE_MS)
        })
      } else if (!hasSetInitialScroll) {
        requestAnimationFrame(setInitialScroll)
      }
    }

    requestAnimationFrame(setInitialScroll)
  }, [activeWeekIndex, headerScrollRef, bodyScrollRef])

  return { scrollToWeek }
}
