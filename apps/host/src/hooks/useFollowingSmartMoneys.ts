import { InfiniteData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { getFollowingSmartMoney } from '@services/smartMoney.service.ts'
import { LIMIT_PER_PAGE } from '@const/smartMoney.ts'
import { useCallback, useEffect } from 'react'
import { removeXWalletFavourite } from './useGetTotalFollowingAddress'
import { useActiveChainType } from '@hooks/useActiveChain.ts'
import { SmartMoneyDto } from '@/@generated/gql/graphql-meme2.ts'

const loadFirstPageFromLocalStorage = () => {
  const storedData = localStorage.getItem('smartMoneyList')
  if (storedData) {
    try {
      return JSON.parse(storedData)
    } catch (error) {
      console.error('Error parsing smartMoneyList from localStorage:', error)
    }
  }
  return []
}

export function useFollowingSmartMoneys(sortType: string) {
  const activeWallet = useActiveWallet()
  const queryClient = useQueryClient()
  const activeChainType = useActiveChainType()

  const query = useInfiniteQuery({
    queryKey: ['getFollowingSmartMoneys', sortType, activeWallet?.walletAddress],
    initialPageParam: 1,
    refetchOnWindowFocus: false,
    initialData: {
      pages: [
        {
          getFollowingSmartMoneys: loadFirstPageFromLocalStorage(),
        },
      ],
      pageParams: [1],
    },
    queryFn: async ({ pageParam = 1 }) => {
      if (!activeWallet?.isConnected) {
        return { getFollowingSmartMoneys: [] }
      }

      const { data } = await futureClient.query({
        query: getFollowingSmartMoney,
        variables: {
          filter: {
            page: pageParam,
            chain: activeChainType,
            sortType,
            limit: LIMIT_PER_PAGE,
          },
        },
        fetchPolicy: 'no-cache',
      })

      return data ?? { getFollowingSmartMoneys: [] }
    },
    getNextPageParam: (lastPage, allPages) =>
      (lastPage?.getFollowingSmartMoneys?.length ?? 0) === LIMIT_PER_PAGE ? allPages.length + 1 : undefined,
  })

  // Flattened list of items across all pages
  const items = query.data?.pages.flatMap((p) => p.getFollowingSmartMoneys ?? []) ?? ([] as SmartMoneyDto[])
  const updateNameCache = useCallback(
    (address: string, newName: string) => {
      queryClient.setQueryData(['getFollowingSmartMoneys', sortType, activeWallet?.walletAddress], (oldData: any) => {
        if (!oldData) return oldData
        const newPages = oldData.pages.map((page: any) => {
          return {
            getFollowingSmartMoneys: page.getFollowingSmartMoneys.map((wallet: any) => {
              if (wallet.address === address) {
                return { ...wallet, name: newName }
              }
              return wallet
            }),
          }
        })
        return { ...oldData, pages: newPages }
      })
    },
    [queryClient, sortType, activeWallet],
  )

  const removeWallet = useCallback((address: string) => {
    queryClient.setQueryData(['getFollowingSmartMoneys', sortType, activeWallet?.walletAddress], (oldData: any) => {
      if (!oldData) return oldData
      console.log('Removing wallet with address:', address)
      const newPages = oldData.pages.map((page: any) => {
        return {
          getFollowingSmartMoneys: page.getFollowingSmartMoneys.filter((wallet: any) => wallet.address !== address),
        }
      })
      const newData = { ...oldData, pages: newPages }
      // Update localStorage
      const allItems = newPages.flatMap((p: any) => p.getFollowingSmartMoneys)
      localStorage.setItem('smartMoneyList', JSON.stringify(allItems))
      removeXWalletFavourite(address, activeChainType)
      return newData
    })
  }, [])

  const cleanAll = useCallback(() => {
    queryClient.setQueryData(
      ['getFollowingSmartMoneys', sortType, activeWallet?.walletAddress],
      (oldData: InfiniteData<any>) => {
        if (!oldData) return oldData
        console.log('Cleaning all wallets')
        const newData = {
          ...oldData,
          pageParams: [1],
          pages: [{ getFollowingSmartMoneys: [] }],
        }
        // Update localStorage
        localStorage.setItem('smartMoneyList', JSON.stringify([]))
        return newData
      },
      {
        updatedAt: Date.now() + 1000, // Ensure it's treated as a fresh update
      },
    )
  }, [])

  useEffect(() => {
    if (!activeWallet?.isConnected) {
      // Clear localStorage when wallet is disconnected
      localStorage.removeItem('smartMoneyList')
    }
  }, [activeWallet])

  return {
    ...query,
    items,
    isLoading: query.isPending,
    removeWallet,
    cleanAll,
    updateNameCache,
  }
}

export const useCleanFollowingSmartMoneys = () => {
  const queryClient = useQueryClient()
  return useCallback(() => {
    queryClient.setQueriesData(
      {
        predicate: (query) => query.queryKey[0] === 'getFollowingSmartMoneys',
      },
      (oldData: InfiniteData<any>) => {
        if (!oldData) return oldData
        console.log('Cleaning all wallets from all queries')
        const newData = {
          ...oldData,
          pageParams: [1],
          pages: [{ getFollowingSmartMoneys: [] }],
        }
        // Update localStorage
        localStorage.setItem('smartMoneyList', JSON.stringify([]))
        return newData
      },
      {
        updatedAt: Date.now() + 1000, // Ensure it's treated as a fresh update
      },
    )
  }, [])
}
