import { useCallback, useMemo } from 'react'
import { useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { useIndexedDBInfiniteQuery } from '@/hooks/useIndexDB'
import { useAppDispatch } from '@/redux/store'
import { updateTotalPendingOrders } from '@/redux/modules/pendingOrders.slice.ts'
import { getChainType } from '@/utils/list-coin-helper'
import { ServiceConfig } from '@/lib/gql/service-config'
import { getPendingOrdersQuery } from '@/services/order.service'
import type { Order } from '@/@generated/gql/graphql-trading'
import { tradingClient } from '@/lib/gql/apollo-client'
import { LIMIT_PER_PAGE } from '@const/smartMoney.ts'

type UsePendingOrdersParams = {
  address?: string
  activeChain: any
  isXStockPath?: boolean
  filter?: Record<string, any>
}

type PendingOrdersPage = {
  orders: Order[]
  total: number
  offset: number
  limit: number
  hasMore: boolean
}

export const usePendingOrders = ({
  address,
  activeChain,
  isXStockPath = false,
  filter = {},
}: UsePendingOrdersParams) => {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()

  const enabled = Boolean(address && ServiceConfig.token)

  const chainType = getChainType(activeChain)

  const limit = Number((filter as any)?.limit ?? LIMIT_PER_PAGE)

  const stableFilter = useMemo(() => {
    const { offset, ...rest } = (filter ?? {}) as any
    return rest
  }, [filter])

  const stableFilterKey = useMemo(() => JSON.stringify(stableFilter ?? {}), [stableFilter])

  const idbKey = `${chainType}:${address || 'guest'}:${isXStockPath ? 1 : 0}:limit=${limit}:${stableFilterKey}`

  const queryKey = useMemo(
    () => ['pendingOrders', chainType, address, isXStockPath, limit, stableFilterKey],
    [chainType, address, isXStockPath, limit, stableFilterKey],
  )

  const query = useIndexedDBInfiniteQuery<PendingOrdersPage, number>({
    queryKey,
    dbName: 'xbit-trading-pending-orders',
    storeName: 'pending-orders',
    idbKey,
    enabled,
    staleTime: 1000 * 5,
    refetchOnWindowFocus: false,

    initialPageParam: Number((filter as any)?.offset ?? 0),

    queryFn: async ({ pageParam }) => {
      if (!address || !ServiceConfig.token) {
        return { orders: [], total: 0, offset: pageParam, limit, hasMore: false }
      }

      try {
        const response = await tradingClient.query({
          query: getPendingOrdersQuery,
          variables: {
            input: {
              chain: chainType,
              userAddress: address,
              isXStock: isXStockPath,
              ...stableFilter,
              limit,
              offset: pageParam,
            },
          },
        })

        const totalPendingOrders = response.data?.getPendingOrders?.total ?? 0
        const orders = (response?.data?.getPendingOrders?.orders ?? []) as Order[]

        dispatch(updateTotalPendingOrders(totalPendingOrders))

        const hasMore = pageParam + limit < totalPendingOrders

        return {
          orders,
          total: totalPendingOrders,
          offset: pageParam,
          limit,
          hasMore,
        }
      } catch (error) {
        console.log(error)
        return { orders: [], total: 0, offset: pageParam, limit, hasMore: false }
      }
    },

    getNextPageParam: (lastPage) => {
      if (!lastPage?.hasMore) return undefined
      return lastPage.offset + lastPage.limit
    },
  })

  // Flatten all pages to a single list for UI
  const orders = useMemo(() => {
    const pages = query.data?.pages ?? []
    const merged: Order[] = []
    for (const p of pages) {
      if (p?.orders?.length) merged.push(...p.orders)
    }
    return merged
  }, [query.data])

  const refetchPendingOrders = useCallback(async () => {
    const res = await query.refetch()
    const pages = res.data?.pages ?? []
    const merged: Order[] = []
    for (const p of pages) {
      if (p?.orders?.length) merged.push(...p.orders)
    }
    return merged
  }, [query])

  const fetchNext = useCallback(async () => {
    if (!query.hasNextPage || query.isFetchingNextPage) return
    await query.fetchNextPage()
  }, [query])

  const removePendingOrderLocal = useCallback(
    (orderId: string) => {
      queryClient.setQueryData(queryKey, (old: InfiniteData<PendingOrdersPage> | undefined) => {
        if (!old) return old

        const nextPages = old.pages.map((p) => ({
          ...p,
          orders: (p.orders ?? []).filter((o) => (o as any).id !== orderId),
          total: Math.max(0, (p.total ?? 0) - 1),
        }))

        // Keep pageParams as-is
        return { ...old, pages: nextPages }
      })
    },
    [queryClient, queryKey],
  )

  return {
    ...query,
    orders,
    total: query.data?.pages?.[0]?.total ?? 0,
    fetchNext,
    refetchPendingOrders,
    removePendingOrderLocal,
  }
}
