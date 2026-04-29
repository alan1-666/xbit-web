import React, { useCallback, useContext, useMemo } from 'react'
import { BaseXStocksList } from '@components/xstocks/tabs/BaseXStocksList.tsx'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { SortBy } from '@components/xstocks/XStockHeader.tsx'
import { xstocksActions } from '@/redux/modules/xstocks.slice.ts'
import { StockTokensContext } from '@/contexts/xstocks/StockTokensContext.ts'
import { XStockListContextProps, XStockListContextProvider } from '@components/xstocks/XStockListContext.ts'

const TabVolume: React.FC = () => {
  const { tokens, isLoading } = useContext(StockTokensContext)
  const sortBy = useAppSelector((state) => state.xstocks.sorts.volume)
  const dispatch = useAppDispatch()
  const setSortBy = useCallback(
    (newSortBy: SortBy) => {
      dispatch(xstocksActions.setSortBy({ tab: 'volume', sortBy: newSortBy }))
    },
    [dispatch],
  )

  const filteredTokens = useMemo(() => {
    return tokens.filter((token) => token.volume24h && +token.volume24h > 0)
  }, [tokens])

  const contextValue = useMemo(() => {
    return {
      primaryMetric: 'volume24h',
    } as XStockListContextProps
  }, [])

  return (
    <XStockListContextProvider value={contextValue}>
      <BaseXStocksList items={filteredTokens} isLoading={isLoading} sortBy={sortBy} setSortBy={setSortBy} />
    </XStockListContextProvider>
  )
}

export default TabVolume
