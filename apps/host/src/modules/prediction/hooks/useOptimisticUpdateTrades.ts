import { useQueryClient, InfiniteData } from '@tanstack/react-query'
import { useCallback } from 'react'
import { TradeActivityModel } from '@/modules/prediction/models/TradeModel.ts'
import { useProxyWallet } from '@/modules/prediction/hooks/useProxyWallet.ts'
import { useGetUserData } from '@/modules/prediction/hooks/useGetUserData.ts'

export const useOptimisticUpdateTrades = () => {
  const queryClient = useQueryClient()
  const walletAddress = useProxyWallet()
  const { data: userData } = useGetUserData(walletAddress)

  return useCallback(
    (trade: Partial<TradeActivityModel>) => {
      if (!walletAddress) return

      const newTrade: TradeActivityModel = {
        transactionHash: '',
        timestamp: Math.floor(Date.now() / 1000),
        proxyWallet: walletAddress,
        pseudonym: userData?.pseudonym || '',
        name: userData?.name || '',
        profileImage: userData?.profileImage || '',
        profileImageOptimized: userData?.profileImage || '',
        ...trade,
      } as TradeActivityModel

      // Match all queries that start with ['prediction', 'trades', walletAddress]
      queryClient.setQueriesData<InfiniteData<TradeActivityModel[]>>(
        { queryKey: ['prediction', 'trades', walletAddress] },
        (oldData) => {
          if (!oldData || !oldData.pages || oldData.pages.length === 0) {
            // If no data yet, we might want to initialize it or just skip
            // For infinite query, it's better to return what we have if we can't update it properly
            return oldData
          }

          return {
            ...oldData,
            pages: oldData.pages.map((page, index) => {
              if (index === 0) {
                return [newTrade, ...page]
              }
              return page
            }),
          }
        }
      )
    },
    [queryClient, walletAddress, userData]
  )
}
