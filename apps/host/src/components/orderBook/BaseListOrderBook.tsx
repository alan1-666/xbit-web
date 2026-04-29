import { HTMLAttributes, ReactNode, useEffect, useRef, useState } from 'react'
import { Skeleton } from '@components/ui/skeleton.tsx'
import { useTranslation } from 'react-i18next'
import { IconEmpty } from '@components/icon'
import { useVirtualizer } from '@tanstack/react-virtual'
import { throttle } from 'lodash-es'
import { cn } from '@/lib/utils.ts'
import { RealtimeTransaction } from '@/redux/modules/transactionsHistory.slice.ts'
import { Loading } from '@components/common/Loading.tsx'

type OrderBookTableHeaderProps = {
  loading: boolean
  hasMore: boolean
  data: RealtimeTransaction[]
  renderItem: (transaction: RealtimeTransaction, index: number) => ReactNode
  loadMoreFn?: () => Promise<boolean>
  getItemKey?: (index: number) => string
}

const LoadMore = (props: HTMLAttributes<HTMLDivElement>) => (
  <div className="h-full w-full flex justify-center items-center" {...props}>
    <Loading />
  </div>
)

const ListCardSkeleton = () => (
  <div className="mt-2.5 space-y-1.5 min-h-[calc(100%-110px)] xmax-h-[210px] overflow-y-auto">
    {Array.from({ length: 10 }).map((_, i) => (
      <Skeleton key={i} className="h-[18px]" />
    ))}
  </div>
)

const EmptyList = () => {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <IconEmpty />
      <span className="text-[#FFFFFF80] text-[0.75rem] text-center">{t('orderBook.noData')}</span>
    </div>
  )
}

const BaseListOrderBook = ({
  loading,
  hasMore,
  data,
  renderItem,
  loadMoreFn,
  getItemKey
}:OrderBookTableHeaderProps) => {
  const [isFetching, setIsFetching] = useState(false)
  // const [isShowOverlay, setIsShowOverlay] = useState(false);

  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: isFetching ? data.length + 1 : data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 20,
    overscan: 10,
    getItemKey,
  })

  const items = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()

  // const updateOverlayState = () => {
  //   const div = parentRef.current;
  //   if (!div) return;
  //
  //   const isOverflowing = div.scrollHeight > div.clientHeight;
  //   const isAtBottom = div.scrollTop + div.clientHeight >= div.scrollHeight - 1; // slight buffer for rounding
  //
  //   setIsShowOverlay(isOverflowing && !isAtBottom);
  // };

  // useEffect(() => {
  //   updateOverlayState(); // Initial check
  //
  //   const div = parentRef.current
  //   if (!div) return
  //
  //   div.addEventListener('scroll', updateOverlayState)
  //
  //   const resizeObserver = new ResizeObserver(updateOverlayState)
  //   resizeObserver.observe(div)
  //
  //   return () => {
  //     div.removeEventListener('scroll', updateOverlayState)
  //     resizeObserver.disconnect()
  //   };
  // }, []);

  useEffect(() => {
    const scrollElement = parentRef.current
    if (!scrollElement) return

    const throttledScrollHandler = throttle(() => {
      const scrollOffset = scrollElement.scrollTop
      const viewportHeight = scrollElement.clientHeight
      const scrollBottom = scrollOffset + viewportHeight

      const scrolledRatio = scrollBottom / totalSize
      if (scrolledRatio >= 0.75 && !isFetching && hasMore && loadMoreFn) {
        setIsFetching(true)
        loadMoreFn()
          .catch(console.error)
          .finally(() => setIsFetching(false))
      }
    }, 200)

    scrollElement.addEventListener('scroll', throttledScrollHandler)
    return () => scrollElement.removeEventListener('scroll', throttledScrollHandler)
  }, [items, totalSize, isFetching, hasMore, loadMoreFn])

  if (loading && items.length <= 0) return <ListCardSkeleton />
  if (data.length === 0) return <EmptyList />

  return (
    <div ref={parentRef} className={
      cn(
        "relative h-full min-h-[calc(100%-210px)] overflow-y-auto no-scrollbar mt-1 py-1 will-change-transform",
        loading ? "hidden" : "",
        // isShowOverlay && !loading ? 'after:absolute after:left-0 after:bottom-0 after:right-0 after:h-12' : '',
        // isShowOverlay && !loading ? 'after:content-[\'\'] after:bg-[linear-gradient(360deg,#000000E5,transparent)]' : '',
      )
    }>
      <div style={{ height: totalSize }} className="w-full relative">
        {items.map((item) => {
          const transaction = data[item.index]
          return (
            <div
              key={item?.key}
              className="w-full absolute top-0 left-0"
              style={{
                height: `${item.size}px`,
                transform: `translateY(${item.start}px)`,
              }}
            >
              {transaction ? renderItem(transaction, item.index) : <LoadMore />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BaseListOrderBook
