import React, {useCallback, useRef} from "react";

export function useHorizontalDragScroll() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const startXRef = useRef(0)
  const scrollLeftRef = useRef(0)
  const draggingRef = useRef(false)

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = containerRef.current
    if (!el) return
    draggingRef.current = true
    el.setPointerCapture?.(e.pointerId)
    startXRef.current = e.clientX
    scrollLeftRef.current = el.scrollLeft
    // visual cue
    el.style.cursor = 'grabbing'
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = containerRef.current
    if (!el || !draggingRef.current) return
    const dx = e.clientX - startXRef.current
    el.scrollLeft = scrollLeftRef.current - dx
  }, [])

  const endDrag = useCallback((e?: React.PointerEvent<HTMLDivElement>) => {
    const el = containerRef.current
    if (!el) return
    draggingRef.current = false
    if (e) el.releasePointerCapture?.(e.pointerId)
    el.style.cursor = 'grab'
  }, [])

  // Allow vertical wheels to scroll horizontally (nice on trackpads/mice)
  const onWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const el = containerRef.current
    if (!el) return
    // If shift is not pressed but we have horizontal intent, translate vertical scroll to horizontal
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
      el.scrollLeft += e.deltaY
      e?.preventDefault() // prevent page scroll
    }
  }, [])

  // Basic keyboard support for accessibility
  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const el = containerRef.current
    if (!el) return
    const step = 80
    if (e.key === 'ArrowRight') {
      el.scrollLeft += step
      e.preventDefault()
    } else if (e.key === 'ArrowLeft') {
      el.scrollLeft -= step
      e.preventDefault()
    }
  }, [])

  return {
    containerRef,
    eventHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerLeave: endDrag,
      onWheel,
      onKeyDown,
      role: 'region' as const,
      tabIndex: 0, // focusable for keyboard scroll
      'aria-label': 'Holder stats horizontal scroller',
    },
  }
}
