import { useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FollowingWalletInfo } from '@/@generated/gql/graphql-meme2.ts'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { getFollowingWallets } from '@services/smartMoney.service.ts'
import { useActiveChainType } from './useActiveChain'

const EMPTY_FOLLOWINGS: ReadonlyArray<FollowingWalletInfo> = Object.freeze([])

type Followings = FollowingWalletInfo[]

export const useGetTotalFollowings = () => {
  const activeWallet = useActiveWallet()
  const isConnected = !!activeWallet?.isConnected
  const addr = activeWallet?.walletAddress ?? 'anonymous'
  const activeChainType = useActiveChainType()
  const {
    data = EMPTY_FOLLOWINGS,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['totalFollowings', activeChainType, addr],
    enabled: isConnected, // never fire when not connected
    // Show cached LS data immediately, but still fetch fresh data
    // initialData: getFromLocalStorageWithTTL<Followings>(FOLLOWED_SMART_MONEY),
    staleTime: 90_000, // 1 minute seen as fresh (tweak as you like)
    gcTime: 10 * 60_000, // 10 minutes in cache
    refetchOnWindowFocus: false,
    // refetchOnMount: "always", // ensures a refresh after navigation
    retry: 2,
    queryFn: async () => {
      const { data } = await futureClient.query({
        query: getFollowingWallets,
        variables: { filter: { chain: activeChainType } },
        fetchPolicy: 'no-cache',
      })

      // Normalize & type-guard
      const raw = (data?.getFollowingWallets ?? []) as unknown[]
      return Array.isArray(raw) ? (raw.filter(Boolean) as Followings) : []
    },
    select: (rows): ReadonlyArray<FollowingWalletInfo> => {
      if (!rows) return []
      // Optional: de-dupe by walletAddress (or any unique key)
      const seen = new Set<string>()
      const deduped: FollowingWalletInfo[] = []
      for (const r of rows) {
        const k = r?.address ?? ''
        if (k && !seen.has(k)) {
          seen.add(k)
          deduped.push(r)
        }
      }
      return deduped
    },
  })

  // Persist **only** when we actually have fresh data
  // (React Query v5: use the `onSuccess` option, or a side effect)
  // If you prefer inside the options:
  // onSuccess: (rows) => rows.length && saveToLocalStorageWithTTL(FOLLOWED_SMART_MONEY, rows, TTL_STORAGE)
  // Doing it here with a tiny effect keeps the hook self-contained:

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => {
    if (isConnected && Array.isArray(data) && data.length > 0) {
      // saveToLocalStorageWithTTL<Followings>(FOLLOWED_SMART_MONEY, data as Followings, TTL_STORAGE)
    }
    return null
  }, [isConnected, data])

  // When disconnected, return a *stable* empty array and no loading state
  if (!isConnected) {
    return {
      data: EMPTY_FOLLOWINGS,
      isLoading: false,
      isFetching: false,
      error: undefined as unknown as Error | undefined,
      refetch: () => Promise.resolve({ data: EMPTY_FOLLOWINGS }),
    }
  }

  return { data, isLoading, isFetching, error, refetch }
}

export const useRemoveFollowingWalletFromCache = () => {
  const queryClient = useQueryClient()
  const activeChainType = useActiveChainType()
  return useCallback((address: string) => {
    queryClient.setQueriesData(
      {
        predicate: (query) => query.queryKey[0] === 'totalFollowings' && query.queryKey[1] === activeChainType,
      },
      (oldData: FollowingWalletInfo[]) => {
        if (!oldData) return oldData
        return oldData.filter((wallet) => wallet.address !== address)
      },
    )
  }, [])
}

export const useCleanFollowingsCache = () => {
  const queryClient = useQueryClient()
  const activeChainType = useActiveChainType()
  return useCallback(() => {
    queryClient.setQueriesData(
      {
        predicate: (query) => query.queryKey[0] === 'totalFollowings' && query.queryKey[1] === activeChainType,
      },
      () => {
        return EMPTY_FOLLOWINGS
      },
    )
  }, [])
}
