// hooks/useFavoriteBroadcast.ts
import { browsingHistoryActions } from '@/redux/modules/browsingHistory.slice'
import { useAppDispatch } from '@/redux/store'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

const CHANNEL_NAME = 'token-favorite-channel'
const HISTORY_CHANNEL_NAME = 'browsing-history-channel'

export const useFavoriteBroadcast = () => {
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Listen for favorite changes
    const favoriteChannel = new BroadcastChannel(CHANNEL_NAME)
    const historyChannel = new BroadcastChannel(HISTORY_CHANNEL_NAME)

    // Handle favorite changes
    favoriteChannel.onmessage = (event) => {
      const { token, isFavorite } = event.data

      // Update browsing history cache
      queryClient.setQueriesData({ queryKey: ['browsingHistory'] }, (oldData: any) => {
        if (!oldData) return oldData

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.map((item: any) => {
              if (item?.token === token) {
                return {
                  ...item,
                  isFavorite,
                }
              }
              return item
            }),
          })),
        }
      })
    }

    // Handle browsing history changes
    historyChannel.onmessage = (event) => {
      const { tokenAddress } = event.data
      dispatch(browsingHistoryActions.addTokenToHistory(tokenAddress))

      // Invalidate browsing history to refetch
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['browsingHistory'] })
      }, 100)
    }

    // Cleanup
    return () => {
      favoriteChannel.close()
      historyChannel.close()
    }
  }, [queryClient, dispatch])

  const broadcastFavorite = (token: string, isFavorite: boolean) => {
    const channel = new BroadcastChannel(CHANNEL_NAME)
    channel.postMessage({ token, isFavorite })
    channel.close()
  }

  const broadcastHistoryAdded = (tokenAddress: string) => {
    const channel = new BroadcastChannel(HISTORY_CHANNEL_NAME)
    channel.postMessage({ tokenAddress })
    channel.close()
  }

  return { broadcastFavorite, broadcastHistoryAdded }
}
