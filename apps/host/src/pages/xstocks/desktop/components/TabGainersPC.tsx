import { XStocksTokenListPC } from '@/pages/xstocks/desktop/components/XStocksTokenListPC'
import { SortBy, xstocksActions } from '@/redux/modules/xstocks.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { useRealtimeCategoryTokens } from '@pages/meme/discover/desktop/hooks/useCategoryTokens.ts'
import { useCallback, useMemo } from 'react'

export const TabGainersPC = ({ timeframe }: { timeframe: '1m' | '5m' | '1h' | '6h' | '24h' }) => {
  const activeChainId = useActiveChainId()
  const { tokens, loadMore, isLoading } = useRealtimeCategoryTokens({ categoryId: 'XStock', chainId: activeChainId })
  const dispatch = useAppDispatch()
  const sortBy = useAppSelector((state) => state.xstocks.sorts.gainers)

  const handleSortChange = useCallback(
    (newSortBy: SortBy) => {
      dispatch(xstocksActions.setSortBy({ tab: 'gainers', sortBy: newSortBy }))
    },
    [dispatch],
  )
  // Filter tokens to get only gainers
  const gainers = useMemo(() => {
    return tokens.filter((token) => token.price24hChange && +token.price24hChange >= 0.01)
  }, [tokens])

  return (
    <XStocksTokenListPC
      tokens={gainers}
      loadMore={loadMore}
      isLoading={isLoading}
      timeframe={timeframe}
      defaultSortBy={sortBy}
      onSortChange={handleSortChange}
    />
  )
}
