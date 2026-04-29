import { ReactNode, useEffect } from 'react'
import { ListTokenSkeleton } from '@components/discover/ListTokenSkeleton.tsx'
import { EmptyList } from '@components/discover/EmptyList.tsx'
import { Virtualizer } from '@tanstack/react-virtual'
import { Loading } from '@components/common/Loading.tsx'

export interface TokenListProps<T> {
  virtualizer: Virtualizer<HTMLDivElement, Element>
  isLoading: boolean
  data: T[]
  renderItem: (item: T, index: number) => ReactNode
  onEndReached?: () => void
}

const RenderList = <T,>(props: TokenListProps<T>) => {
  const { renderItem, virtualizer, onEndReached, data } = props
  const items = virtualizer.getVirtualItems()

  useEffect(() => {
    const lastItem = items[items.length - 1]
    if (!lastItem) return
    const lastIndex = lastItem.index
    if (lastIndex >= data.length - 3) {
      onEndReached?.()
    }
  }, [items])

  return (
    <div className="relative w-full" style={{ height: `${virtualizer.getTotalSize()}px` }}>
      {items.map((item, index) => (
        <div
          key={index}
          className="absolute top-0 left-0 w-full h-[84px] pb-[5px] will-change-transform"
          style={{ transform: `translateY(${item.start}px)` }}
        >
          {item.index < data.length ? (
            renderItem(data[item.index], index)
          ) : (
            <div className="h-full w-full flex justify-center items-center">
              <Loading />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export const TokenList = <T,>(props: TokenListProps<T>) => {
  const { isLoading, data } = props
  if (isLoading) return <ListTokenSkeleton />
  if (data.length === 0) return <EmptyList />
  return <RenderList {...props} />
}
