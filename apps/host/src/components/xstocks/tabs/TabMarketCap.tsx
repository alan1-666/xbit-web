import React, { useCallback, useContext } from 'react'
import { BaseXStocksList } from '@components/xstocks/tabs/BaseXStocksList.tsx'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { SortBy } from '@components/xstocks/XStockHeader.tsx'
import { xstocksActions } from '@/redux/modules/xstocks.slice.ts'
import { StockTokensContext } from '@/contexts/xstocks/StockTokensContext.ts'

const TabMarketCap: React.FC = () => {
  const { tokens, isLoading } = useContext(StockTokensContext)
  const sortBy = useAppSelector((state) => state.xstocks.sorts.marketCap)
  const dispatch = useAppDispatch()
  const setSortBy = useCallback(
    (newSortBy: SortBy) => {
      dispatch(xstocksActions.setSortBy({ tab: 'marketCap', sortBy: newSortBy }))
    },
    [dispatch],
  )
  return <BaseXStocksList items={tokens} isLoading={isLoading} sortBy={sortBy} setSortBy={setSortBy} />
}

export default TabMarketCap
