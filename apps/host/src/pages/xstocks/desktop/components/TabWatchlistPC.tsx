import { useActiveChainId } from '@/hooks/useActiveChain'
import { useActiveWallet } from '@/hooks/useActiveWallet'
import { XStocksTokenListPC } from '@/pages/xstocks/desktop/components/XStocksTokenListPC'
import { SortBy, xstocksActions } from '@/redux/modules/xstocks.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { useRealtimeCategoryTokens } from '@pages/meme/discover/desktop/hooks/useCategoryTokens.ts'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

export const TabWatchlistPC = ({ timeframe }: { timeframe: '1m' | '5m' | '1h' | '6h' | '24h' }) => {
  const { t } = useTranslation()
  const activeWallet = useActiveWallet()
  const activeChainId = useActiveChainId()
  const { tokens, loadMore, isLoading } = useRealtimeCategoryTokens({
    categoryId: 'XStock',
    chainId: activeChainId,
    enabled: activeWallet.isConnected,
  })
  const dispatch = useAppDispatch()
  const sortBy = useAppSelector((state) => state.xstocks.sorts.watchlist)

  const handleSortChange = useCallback(
    (newSortBy: SortBy) => {
      dispatch(xstocksActions.setSortBy({ tab: 'watchlist', sortBy: newSortBy }))
    },
    [dispatch],
  )

  const watchlistTokens = tokens.filter((token) => token.isFavorite)

  return (
    <XStocksTokenListPC
      tokens={watchlistTokens}
      loadMore={loadMore}
      isLoading={isLoading}
      timeframe={timeframe}
      defaultSortBy={sortBy}
      onSortChange={handleSortChange}
    />
  )
}
