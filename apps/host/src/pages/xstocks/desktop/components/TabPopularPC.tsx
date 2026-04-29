import { XStocksTokenListPC } from '@/pages/xstocks/desktop/components/XStocksTokenListPC'
import { SortBy, xstocksActions } from '@/redux/modules/xstocks.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { useRealtimeCategoryTokens } from '@pages/meme/discover/desktop/hooks/useCategoryTokens.ts'
import { useCallback } from 'react'

export const TabPopularPC = ({ timeframe }: { timeframe: '1m' | '5m' | '1h' | '6h' | '24h' }) => {
  const activeChainId = useActiveChainId()
  const { tokens, loadMore, isLoading } = useRealtimeCategoryTokens({ categoryId: 'XStock', chainId: activeChainId })
  const dispatch = useAppDispatch()
  const sortBy = useAppSelector((state) => state.xstocks.sorts.popular)
  
  const handleSortChange = useCallback(
    (newSortBy: SortBy) => {
      dispatch(xstocksActions.setSortBy({ tab: 'popular', sortBy: newSortBy }))
    },
    [dispatch],
  )

  return (
    <XStocksTokenListPC
      tokens={tokens}
      loadMore={loadMore}
      isLoading={isLoading}
      timeframe={timeframe}
      defaultSortBy={sortBy}
      onSortChange={handleSortChange}
    />
  )
}
