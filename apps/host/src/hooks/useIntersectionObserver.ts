import { Ref, useEffect } from 'react'

export type UseIntersectionObserverOptions = {
  threshold?: number
  ref: Ref<Element>
  rootMargin?: string
  callback?: () => void
}

export const useIntersectionObserver = (options: UseIntersectionObserverOptions) => {
  const { ref, threshold = 0.1, rootMargin = '0px', callback } = options
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Trigger the callback or any action when the element is in view
          if (callback) {
            callback()
          }
        }
      },
      { threshold, rootMargin },
    )

    if (ref && 'current' in ref && ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref && 'current' in ref && ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [ref, threshold, rootMargin])
}
