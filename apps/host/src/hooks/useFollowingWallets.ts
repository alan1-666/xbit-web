import { futureClient } from '@/lib/gql/apollo-client.ts'
import { getFollowingWallets } from '@services/smartMoney.service.ts'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useActiveWallet } from './useActiveWallet'
import { useActiveChainType } from './useActiveChain'
import { useCallback } from 'react'

export const useFollowingWallets = (): string[] => {
  const activeWallet = useActiveWallet()
  const activeChainType = useActiveChainType()
  const { data } = useQuery({
    queryKey: ['getFollowingWallets', activeWallet?.walletAddress, activeChainType],
    enabled: activeWallet.isConnected,
    queryFn: async () => {
      const { data } = await futureClient.query({
        query: getFollowingWallets,
        variables: {
          filter: {
            chain: activeChainType,
          },
        },
      })

      return data?.getFollowingWallets ? data.getFollowingWallets.map((e) => e?.address ?? '') : []
    },
  })
  return data ?? []
}

export const useOnAddedFollowingWallet = () => {
  const activeWallet = useActiveWallet()
  const activeChainType = useActiveChainType()
  const queryClient = useQueryClient()
  return useCallback((address: string) => {
    queryClient.setQueryData(
      ['getFollowingWallets', activeWallet?.walletAddress, activeChainType],
      (oldData: string[] | undefined) => {
        if (oldData && !oldData.includes(address)) {
          return [address, ...oldData]
        }
        return oldData ?? [address]
      },
      {
        updatedAt: Date.now() + 60000, // optional: bump the updatedAt timestamp to avoid immediate refetch
      }
    )
  }, [])
}

export const useOnRemovedFollowingWallet = () => {
  const activeWallet = useActiveWallet()
  const activeChainType = useActiveChainType()
  const queryClient = useQueryClient()
  return useCallback((address: string) => {
    queryClient.setQueryData(
      ['getFollowingWallets', activeWallet?.walletAddress, activeChainType],
      (oldData: string[] | undefined) => {
        if (oldData) {
          return oldData.filter((addr) => addr !== address)
        }
        return oldData
      },
      {
        updatedAt: Date.now() + 60000, // optional: bump the updatedAt timestamp to avoid immediate refetch
      }
    )
  }, [])
}
