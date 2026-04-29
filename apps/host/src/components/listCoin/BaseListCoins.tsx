import { Skeleton } from '@components/ui/skeleton.tsx'
import { IconEmpty, IconSpinner } from '@components/icon'
import { HTMLAttributes, ReactNode, useEffect, useRef, useState } from 'react'
import useCustomTranslation from '@hooks/useCustomTranslation.ts'
import { AnimatePresence } from 'framer-motion'
import { useVirtualizer } from '@tanstack/react-virtual'
import { throttle } from 'lodash-es'
import { useStickyScroll } from '@hooks/useStickyScroll.ts'

export interface BaseListCoinsProps<T> {
  loading: boolean
  tokens: T[]
  renderItem: (token: T, index: number) => ReactNode
  emptyText?: string
  skeletonSize?: number
  animatePresence?: boolean
  useVirtualizedList?: boolean
  loadMoreFn?: () => Promise<boolean> // Function to load more data, returns true if more data is available
  getItemKey?: (index: number) => string // Function to get a unique key for each item
}

const LoadMore = (props: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className="h-full w-full flex justify-center items-center" {...props}>
      <IconSpinner className="size-4 animate-spin" />
    </div>
  )
}

function VirtualizedListCoins<T>(props: BaseListCoinsProps<T>) {
  const { tokens, renderItem, loadMoreFn, getItemKey } = props
  const [isFetching, setIsFetching] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const parentRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const outerRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: isFetching ? tokens.length + 1 : tokens.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 89,
    overscan: 10,
    getItemKey,
  })

  const items = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize() || 1000

  useEffect(() => {
    const stickyElement = document.getElementById('sticky-line') as HTMLDivElement
    const outerElement = document.getElementById('main-content') as HTMLDivElement
    if (stickyElement) {
      stickyRef.current = stickyElement
    }
    if (outerElement) {
      outerRef.current = outerElement
    }
  }, [])

  // useEffect(() => {
  //   const scrollElement = parentRef.current
  //   if (!scrollElement) return
  //
  //   const throttledScrollHandler = () => {
  //     const scrollOffset = scrollElement.scrollTop
  //     const viewportHeight = scrollElement.clientHeight
  //     const scrollBottom = scrollOffset + viewportHeight
  //
  //     const scrolledRatio = scrollBottom / scrollElement.scrollHeight
  //     console.log('scroll', scrolledRatio)
  //     if (scrolledRatio >= 0.75 && !isFetching && hasMore && loadMoreFn) {
  //       setIsFetching(true)
  //       loadMoreFn?.()
  //         .then(setHasMore)
  //         .finally(() => setIsFetching(false))
  //     }
  //   }
  //   scrollElement.addEventListener('scroll', throttledScrollHandler)
  //   return () => {
  //     scrollElement.removeEventListener('scroll', throttledScrollHandler)
  //   }
  // }, [items, totalSize, parentRef.current, loadMoreFn, isFetching, hasMore])

  useEffect(() => {
    const lastItem = items[items.length - 1]
    if (!lastItem) return
    const ratio = lastItem.index / tokens.length
    const throttleHandler = throttle(() => {
      setIsFetching(true)
      loadMoreFn?.()
        .then(setHasMore)
        .finally(() => setIsFetching(false))
    }, 200)
    if (ratio >= 0.75 && !isFetching && hasMore && loadMoreFn) {
      throttleHandler()
    }
  }, [items, isFetching, hasMore, loadMoreFn])

  useStickyScroll({
    innerRef: parentRef,
    outerRef: outerRef,
    stickyRef: stickyRef,
  })

  return (
    <div ref={parentRef} className="h-full overflow-y-auto no-scrollbar pb-4 overscroll-y-auto">
      <div style={{ height: totalSize }} className="w-full relative">
        {items.map((item) => {
          const token = tokens[item.index]
          return (
            <div
              key={item.key}
              className="w-full pb-[5px] absolute top-0 left-0"
              style={{
                height: `${item.size}px`,
                transform: `translateY(${item.start}px)`,
              }}
            >
              {token ? renderItem(token, item.index) : <LoadMore />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const ListCoinSkeleton = (props: { skeletonSize?: number }) => {
  const { skeletonSize = 10 } = props
  return (
    <div className="space-y-[5px]">
      {Array.from({ length: skeletonSize }).map((_, index) => (
        <Skeleton key={index} className="h-[87px]" />
      ))}
    </div>
  )
}

const EmptyList = (props: { emptyText?: string }) => {
  const { emptyText } = props
  const { t } = useCustomTranslation()
  return (
    <div className="flex flex-col items-center justify-center h-80">
      <IconEmpty />
      <span className="text-[#FFFFFF80] text-[0.75rem]">{emptyText ?? t('listCoin.noData')}</span>
    </div>
  )
}

const AnimatePresenceList = <T,>(props: BaseListCoinsProps<T>) => {
  const { tokens, renderItem } = props
  return <AnimatePresence>{tokens.map((token, index) => renderItem(token, index))}</AnimatePresence>
}

export default function BaseListCoins<T>(props: BaseListCoinsProps<T>) {
  const { loading, tokens, renderItem, emptyText, skeletonSize, animatePresence, useVirtualizedList } = props
  if (loading) {
    return <ListCoinSkeleton skeletonSize={skeletonSize} />
  }

  if (tokens.length === 0) {
    return <EmptyList emptyText={emptyText} />
  }

  if (useVirtualizedList) {
    return <VirtualizedListCoins {...props} />
  }

  if (animatePresence) {
    return <AnimatePresenceList {...props} />
  }

  return (
    <div className="flex flex-col gap-[5px]">
      {tokens.map((token, index) => (
        <div key={index} className="mb-[5px]">
          {renderItem(token, index)}
        </div>
      ))}
    </div>
  )
}
