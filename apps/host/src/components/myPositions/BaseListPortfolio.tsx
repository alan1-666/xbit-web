import { Skeleton } from '@components/ui/skeleton'
import { IconEmpty } from '@components/icon'
import { HTMLAttributes, ReactNode, useEffect, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { throttle } from 'lodash-es'
import { PortfolioDTO } from '@/types/holding'
import { useTranslation } from 'react-i18next'
import { Loading } from '@components/common/Loading.tsx'

interface BaseListPortfolioCardProps {
  loading: boolean
  hasMore: boolean
  portfolios: PortfolioDTO[]
  renderItem: (portfolio: PortfolioDTO, index: number) => ReactNode
  loadMoreFn?: () => Promise<boolean>
  getItemKey?: (index: number) => string
}

const LoadMore = (props: HTMLAttributes<HTMLDivElement>) => (
  <div className="h-full w-full flex justify-center items-center" {...props}>
    <Loading />
  </div>
)

const ListCardSkeleton = () => (
  <div className="mt-2.5 space-y-1.5">
    {Array.from({ length: 2 }).map((_, i) => (
      <Skeleton key={i} className="h-40" />
    ))}
  </div>
)

const EmptyList = () => {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center h-80">
      <IconEmpty />
      <span className="text-[#FFFFFF80] text-[0.75rem]">{t('detail.myPositions.noData')}</span>
    </div>
  )
}

export default function BaseListPortfolioCard({
  loading,
  hasMore,
  portfolios,
  renderItem,
  loadMoreFn,
  getItemKey,
}: BaseListPortfolioCardProps) {
  const [isFetching, setIsFetching] = useState(false)
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: isFetching ? portfolios.length + 1 : portfolios.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 220, // Height of portfolio card
    overscan: 10,
    getItemKey,
  })

  const items = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()

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
  if (portfolios.length === 0) return <EmptyList />

  return (
    <div ref={parentRef} className="h-full max-h-[70vh] overflow-y-auto no-scrollbar mt-2.5 pb-4 will-change-transform">
      <div style={{ height: totalSize }} className="w-full relative">
        {items.map((item) => {
          const portfolio = portfolios[item.index]
          return (
            <div
              key={item?.key}
              className="w-full absolute top-0 left-0"
              style={{
                height: `${item.size}px`,
                transform: `translateY(${item.start}px)`,
              }}
            >
              {portfolio ? renderItem(portfolio, item.index) : <LoadMore />}
            </div>
          )
        })}
      </div>
      {
        (loading || isFetching) && <ListCardSkeleton />
      }
    </div>
  )
}
