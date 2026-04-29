import { XStockToken } from '@/types/xstocks.ts'
import { ListTokenSkeleton } from '@components/discover/ListTokenSkeleton.tsx'
import { EmptyList } from '@components/discover/EmptyList.tsx'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import XStockCard from '@components/xstocks/XStockCard.tsx'

export interface XStocksTokenListProps {
  tokens: XStockToken[]
  isLoading: boolean
}

export const XStocksTokenList = ({ tokens, isLoading }: XStocksTokenListProps) => {
  const virtualizer = useWindowVirtualizer({
    count: tokens.length,
    estimateSize: () => 56, // Adjust based on your item height
    overscan: 5, // Number of items to render outside the visible area
  })

  if (isLoading) return <ListTokenSkeleton />
  if (tokens.length === 0)
    return (
      <div className="m-auto">
        <EmptyList />
      </div>
    )
  return (
    <div className="w-full relative">
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((item) => (
          <div
            className="absolute top-0 left-0 w-full"
            style={{ transform: `translateY(${item.start}px)` }}
            key={item.key}
          >
            <XStockCard token={tokens[item.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
