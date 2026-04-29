import { useTrendingTokens } from '@pages/meme/discover/desktop/hooks/useTrendingTokens.ts'
import { TokenTrendingTable } from '@pages/meme/discover/desktop/components/TokenTrendingTable.tsx'
import { useAllBacklistAddresses } from '@pages/meme/discover/desktop/hooks/useBlacklistAddress.ts'
import { useMemo } from 'react'

export const TabTrending = () => {
  const { data, loadMore, isLoading, currentTimeframe, markTokenFavorite } = useTrendingTokens()
  const { blacklistDevs, blacklistTokens } = useAllBacklistAddresses()

  const tokens = useMemo(() => {
    if (!data) return []
    return data.filter((item) => {
      if (!item.token) return false
      const isDevBlacklisted = blacklistDevs.some((dev) => dev.address === item.creator)
      const isTokenBlacklisted = blacklistTokens.some((token) => token.address === item.token)
      return !isDevBlacklisted && !isTokenBlacklisted
    })
  }, [data, blacklistTokens, blacklistDevs])

  return (
    <div className="px-4">
      <TokenTrendingTable
        tokens={tokens}
        onLoadMore={loadMore}
        isLoading={isLoading}
        timeframe={currentTimeframe}
        onFavoriteToken={markTokenFavorite}
      />
    </div>
  )
}
