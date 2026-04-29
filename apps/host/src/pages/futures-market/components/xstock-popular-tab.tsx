import { useCallback, useContext } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { SortBy } from '@components/xstocks/XStockHeader.tsx'
import { xstocksActions } from '@/redux/modules/xstocks.slice.ts'
import { StockTokensContext } from '@/contexts/xstocks/StockTokensContext.ts'
import XStockHeader from '@components/xstocks/XStockHeader.tsx'
import { useSortedList } from '@components/xstocks/hooks/useSortedList.ts'
import { XStockContainerList } from './xstock-container-list'

const XStockPopularTab = () => {
  const { tokens, isLoading } = useContext(StockTokensContext)
  const sortBy = useAppSelector((state) => {
    return state.xstocks.sorts.popular
  })
  const dispatch = useAppDispatch()

  const setSortBy = useCallback(
    (newSortBy: SortBy) => {
      dispatch(xstocksActions.setSortBy({ tab: 'popular', sortBy: newSortBy }))
    },
    [dispatch],
  )

  const sortedList = useSortedList(tokens, sortBy, '24h')

  return (
    <div className="flex flex-col h-full px-[14px]">
      <XStockHeader defaultSortBy={sortBy} onSortChange={setSortBy} className="!sticky bg-[#0A0A0A] z-10 top-[36px]" />
      <div className="flex-1 overflow-hidden">
        <XStockContainerList tokens={sortedList} isLoading={isLoading} />
      </div>
    </div>
  )
}

export default XStockPopularTab
