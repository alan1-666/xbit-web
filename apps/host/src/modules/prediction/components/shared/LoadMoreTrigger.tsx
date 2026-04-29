import { useEffect, useRef } from 'react'
import { Loading } from '@components/common/Loading.tsx'

export interface LoadMoreTriggerProps {
  onLoadMore?: () => void
  hasMore?: boolean
}

export const LoadMoreTrigger = (props: LoadMoreTriggerProps) => {
  const { onLoadMore, hasMore } = props
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const node = ref.current
    if (!node || !onLoadMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onLoadMore()
          }
        })
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 1.0,
      },
    )

    observer.observe(node)

    return () => {
      observer.unobserve(node)
    }
  }, [onLoadMore])

  return (
    <>
      <div ref={ref} className="h-px w-full" />
      {hasMore ? (
        <div className="w-full flex items-center justify-center">
          <Loading />
        </div>
      ) : null}
    </>
  )
}
