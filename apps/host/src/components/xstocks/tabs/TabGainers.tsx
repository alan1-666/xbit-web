import React, { useCallback, useContext, useMemo } from 'react'
import { BaseXStocksList } from '@components/xstocks/tabs/BaseXStocksList.tsx'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { SortBy } from '@components/xstocks/XStockHeader.tsx'
import { xstocksActions } from '@/redux/modules/xstocks.slice.ts'
import { StockTokensContext } from '@/contexts/xstocks/StockTokensContext.ts'

const TabGainers: React.FC = () => {
  const { tokens, isLoading } = useContext(StockTokensContext)
  const sortBy = useAppSelector((state) => state.xstocks.sorts.gainers)
  const dispatch = useAppDispatch()
  const setSortBy = useCallback(
    (newSortBy: SortBy) => {
      dispatch(xstocksActions.setSortBy({ tab: 'gainers', sortBy: newSortBy }))
    },
    [dispatch],
  )
  // Filter tokens to get only gainers
  const gainers = useMemo(() => {
    return tokens.filter((token) => token.price24hChange && +token.price24hChange > 0)
  }, [tokens])

  return <BaseXStocksList items={gainers} isLoading={isLoading} sortBy={sortBy} setSortBy={setSortBy} />
}

export default TabGainers
