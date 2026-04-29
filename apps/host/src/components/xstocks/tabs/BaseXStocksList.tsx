import XStockHeader, { SortBy } from '@components/xstocks/XStockHeader.tsx'
import { XStockToken } from '@/types/xstocks.ts'
import { XStocksTokenList } from '@components/xstocks/XStocksTokenList.tsx'
import { useSortedList } from '@components/xstocks/hooks/useSortedList.ts'

export interface BaseXStocksListProps {
  items: XStockToken[]
  isLoading: boolean
  sortBy: SortBy
  setSortBy: (sortBy: SortBy) => void
}

export const BaseXStocksList = (props: BaseXStocksListProps) => {
  const { items, isLoading, sortBy, setSortBy } = props

  const sortedList = useSortedList(items, sortBy, '24h')

  return (
    <div className="flex-1 flex flex-col px-3">
      <XStockHeader defaultSortBy={sortBy} onSortChange={setSortBy} className="pt-3" />
      <XStocksTokenList tokens={sortedList} isLoading={isLoading} />
    </div>
  )
}
