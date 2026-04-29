import { RefObject, useEffect, useRef } from 'react'

export const useStickyScroll = (refs: {
  innerRef: RefObject<HTMLElement | null>
  outerRef: RefObject<HTMLElement | null>
  stickyRef: RefObject<HTMLElement | null>
}) => {
  const { innerRef, outerRef, stickyRef } = refs
  const touchStartY = useRef(0)
  const velocity = useRef(0)
  const lastMoveTime = useRef(Date.now())
  const ticking = useRef(false)

  useEffect(() => {
    const outer = outerRef.current!
    const inner = innerRef.current!
    const stickyElement = stickyRef.current!

    const onInnerWheel = (e: WheelEvent) => {
      const goingDown = e.deltaY > 0
      const innerAtTop = inner.scrollTop === 0
      const isStickyElementAtTop = stickyElement.getBoundingClientRect().top <= 0

      if (goingDown) {
        if (!isStickyElementAtTop) {
          e.preventDefault()
          outer.scrollBy({ top: e.deltaY, behavior: 'auto' })
        }
      } else {
        if (!innerAtTop) {
          return
        } else {
          e.preventDefault()
          outer.scrollBy({ top: e.deltaY, behavior: 'auto' })
        }
      }
    }

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].pageY
      velocity.current = 0
      lastMoveTime.current = Date.now()
    }

    const onTouchMove = (e: TouchEvent) => {
      const outerAtBottom = outer.scrollTop + outer.clientHeight >= outer.scrollHeight
      if (!outerAtBottom) {
        const currentY = e.touches[0].pageY
        const deltaY = touchStartY.current - currentY
        if (deltaY > 0) {
          e.preventDefault()
          const now = Date.now()
          const dt = now - lastMoveTime.current
          velocity.current = deltaY / dt
          touchStartY.current = currentY
          lastMoveTime.current = now

          if (!ticking.current) {
            ticking.current = true
            requestAnimationFrame(() => {
              outer.scrollBy({
                top: deltaY * 0.5,
                behavior: 'auto',
              })
              ticking.current = false
            })
          }
        }
      }
    }

    const onTouchEnd = () => {
      let v = velocity.current
      const decay = 0.95
      const minV = 0.001

      const momentumScroll = () => {
        if (Math.abs(v) > minV) {
          outer.scrollBy(0, v * 12)
          v *= decay
          requestAnimationFrame(momentumScroll)
        }
      }

      momentumScroll()
    }

    inner.addEventListener('wheel', onInnerWheel, { passive: false })
    inner.addEventListener('touchstart', onTouchStart)
    inner.addEventListener('touchmove', onTouchMove, { passive: false })
    inner.addEventListener('touchend', onTouchEnd)

    return () => {
      inner.removeEventListener('wheel', onInnerWheel)
      inner.removeEventListener('touchstart', onTouchStart)
      inner.removeEventListener('touchmove', onTouchMove)
      inner.removeEventListener('touchend', onTouchEnd)
    }
  }, [])
}
