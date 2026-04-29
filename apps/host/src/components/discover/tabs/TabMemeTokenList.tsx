import { ListTokenSkeleton } from '@components/discover/ListTokenSkeleton.tsx'
import { EmptyList } from '@components/discover/EmptyList.tsx'
import { memo, useEffect, useMemo, useRef } from 'react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { MemeTokenCard } from '@components/discover/cards/MemeTokenCard.tsx'
import { TimeframeOption } from '@components/discover/TimeframeSelector.tsx'
import { cn } from '@/lib/utils.ts'
import { MemeTokenWithFormatted } from '@/types/token.ts'
import { Loading } from '@components/common/Loading.tsx'

export interface TabMemeTokenListProps {
  tokens: MemeTokenWithFormatted[]
  isLoading: boolean
  hasNextPage: boolean
  onLoadMore?: () => void
  timeframe: TimeframeOption
  showProgress: boolean
  useFallbackLogo: boolean
  onAiClick?: (tokenAddress: string) => void
  refreshFn?: (pages: number[]) => void
  dataUpdatedAt?: number
  ageType?: 'created' | 'migrated'
  type: 'new' | 'completing' | 'completed'
}

const OVERSCAN_PADDING = 95 * 5

const MemeTokenCardMemo = memo(MemeTokenCard, (prevProps, nextProps) => {
  return (
    prevProps.token.token === nextProps.token.token &&
    prevProps.token.devHold === nextProps.token.devHold &&
    prevProps.timeframe === nextProps.timeframe &&
    prevProps.type === nextProps.type
  )
})

const VirtualizedList = (props: TabMemeTokenListProps) => {
  const {
    tokens,
    hasNextPage,
    onLoadMore,
    timeframe,
    showProgress,
    useFallbackLogo,
    onAiClick,
    dataUpdatedAt,
    ageType,
    type,
  } = props
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useWindowVirtualizer({
    count: tokens.length,
    estimateSize: () => 105,
    gap: 8,
    overscan: 50,
    isScrollingResetDelay: 50,
    scrollMargin: parentRef.current?.offsetTop ?? 0,
    useAnimationFrameWithResizeObserver: true,
    getItemKey: (index) => `${tokens[index]?.token ?? 'loading'}-${dataUpdatedAt}`,
  })

  const items = rowVirtualizer.getVirtualItems()

  useEffect(() => {
    return () => {
      if (parentRef.current) {
        parentRef.current.innerHTML = ''
      }
    }
  }, [])

  const renderItems = useMemo(() => {
    const scrollOffset = rowVirtualizer.scrollOffset ?? 0
    const viewportHeight = window.innerHeight
    const viewportStart = scrollOffset - OVERSCAN_PADDING
    const viewportEnd = scrollOffset + viewportHeight + OVERSCAN_PADDING

    return items.map((item) => {
      const itemStart = item.start
      const itemEnd = item.start + item.size
      if (itemEnd > viewportStart && itemStart < viewportEnd) {
        return {
          type: 'card',
          key: item.key,
          token: tokens[item.index],
          start: item.start,
          index: item.index,
        }
      } else {
        return {
          type: 'skeleton',
          key: item.key,
          start: item.start,
          index: item.index,
        }
      }
    })
  }, [items])

  const lastItem = useMemo(() => {
    return items[items.length - 1]
  }, [items])

  useEffect(() => {
    const visibleItems = renderItems.filter((item) => item.type === 'card')
    const lastVisibleItem = visibleItems[visibleItems.length - 1]
    if (!lastVisibleItem) return
    const lastIndex = lastVisibleItem.index
    if (lastIndex >= tokens.length - 3) {
      onLoadMore?.()
    }
  }, [renderItems])

  return (
    <div ref={parentRef} className="h-full pb-5" style={{ contentVisibility: 'auto' }}>
      <div
        className="relative w-full"
        style={{ height: `${rowVirtualizer.getTotalSize() + (hasNextPage ? 108 : 75)}px` }}
      >
        {renderItems.map((item) => (
          <div
            key={item.key}
            className="absolute top-0 left-0 w-full h-[95px]"
            style={{ transform: `translateY(${item.start - rowVirtualizer.options.scrollMargin}px)` }}
          >
            {item.key === 'loading' && (
              <div className="h-full w-full flex justify-center items-center">
                <Loading />
              </div>
            )}
            {item.type === 'skeleton' && (
              <div className="size-full flex items-end border-[0.6px] border-[#ECECED14] rounded-[6px] bg-[#0F0F0F] box-border">
                <div className="mt-auto bg-[#ECECED0F] w-full h-[30px] rounded-b-[6px]"></div>
              </div>
            )}
            {item.type === 'card' && (
              <MemeTokenCardMemo
                key={item.token!.token}
                token={item.token!}
                timeframe={timeframe}
                showProgress={showProgress}
                onAiClick={onAiClick}
                useFallbackLogo={useFallbackLogo}
                ageType={ageType}
                type={type}
              />
            )}
          </div>
        ))}
        {hasNextPage && (
          <div
            className={cn('absolute top-0 left-0 w-full h-[108px] flex justify-center pt-4 pb-[5px]')}
            style={{
              transform: lastItem ? `translateY(${lastItem.start + 84 - rowVirtualizer.options.scrollMargin}px)` : '',
            }}
          >
            <Loading />
          </div>
        )}
      </div>
    </div>
  )
}

export const TabMemeTokenList = (props: TabMemeTokenListProps) => {
  const { tokens, isLoading } = props

  if (isLoading) return <ListTokenSkeleton />
  if (tokens.length === 0) return <EmptyList />
  return <VirtualizedList {...props} />
}
