import { useWatchlistTopBarTokens } from '@pages/meme/discover/desktop/hooks/useTopBarTokens.ts'
import { TopBarTokensList } from '@components/v2/desktop/TopBarTokensList.tsx'
import { useCallback, useEffect } from 'react'
import eventBus from '@/lib/eventBus.ts'
import { EVENT_MESSAGE_FAVORITE, EVENT_MESSAGE_REMOVE_FAVORITE } from '@components/detailListIcon'
import { TopBarToken } from '@components/v2/desktop/TokenTopBarCard.tsx'

export const WatchlistTopBarList = () => {
  const { tokens, removeFavoriteToken, refetch } = useWatchlistTopBarTokens()
  useEffect(() => {
    const listener = () => {
      setTimeout(() => {
        refetch().then()
      }, 200)
    }
    eventBus.on(EVENT_MESSAGE_FAVORITE, listener)
    return () => {
      eventBus.remove(EVENT_MESSAGE_FAVORITE, listener)
    }
  }, [])

  const handleRemove = useCallback((token: TopBarToken) => {
    removeFavoriteToken(token).then(() => {})
    eventBus.dispatch(EVENT_MESSAGE_REMOVE_FAVORITE, { data: { token: token.address } })
  }, [removeFavoriteToken])

  return (
    <TopBarTokensList key="top-bar-favorite" tokens={tokens ?? []} onRemove={handleRemove} showRemove={true} />
  )
}
