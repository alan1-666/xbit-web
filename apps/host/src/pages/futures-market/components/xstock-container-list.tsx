import { XStockToken } from '@/types/xstocks.ts'
import { ListTokenSkeleton } from '@components/discover/ListTokenSkeleton.tsx'
import { EmptyList } from '@components/discover/EmptyList.tsx'
import { useVirtualizer } from '@tanstack/react-virtual'
import XStockCard from '@components/xstocks/XStockCard.tsx'
import { useRef } from 'react'

export interface XStockContainerListProps {
  tokens: XStockToken[]
  isLoading: boolean
}

export const XStockContainerList = ({ tokens, isLoading }: XStockContainerListProps) => {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: tokens.length,
    getScrollElement: () => {
      return parentRef.current
    },
    estimateSize: () => {
      return 56
    },
    overscan: 5,
  })

  if (isLoading) {
    return <ListTokenSkeleton />
  }

  if (tokens.length === 0) {
    return (
      <div className="m-auto">
        <EmptyList />
      </div>
    )
  }

  return (
    <div ref={parentRef} className="w-full h-full overflow-y-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <XStockCard token={tokens[virtualItem.index]} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
