import { BaseXStocksList } from '@components/xstocks/tabs/BaseXStocksList.tsx'
import { useCallback, useContext, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { SortBy } from '@components/xstocks/XStockHeader.tsx'
import { xstocksActions } from '@/redux/modules/xstocks.slice.ts'
import { StockTokensContext } from '@/contexts/xstocks/StockTokensContext.ts'

export const TabLosers = () => {
  const { tokens, isLoading } = useContext(StockTokensContext)
  const sortBy = useAppSelector((state) => state.xstocks.sorts.losers)
  const dispatch = useAppDispatch()
  const setSortBy = useCallback(
    (newSortBy: SortBy) => {
      dispatch(xstocksActions.setSortBy({ tab: 'losers', sortBy: newSortBy }))
    },
    [dispatch],
  )
  const losers = useMemo(() => {
    return tokens.filter((token) => token.price24hChange && +token.price24hChange <= -0.01)
  }, [tokens])
  return <BaseXStocksList items={losers} isLoading={isLoading} sortBy={sortBy} setSortBy={setSortBy} />
}
