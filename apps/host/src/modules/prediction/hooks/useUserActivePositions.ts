import { useInfiniteQueryWithLoadMore } from '@hooks/useInfiniteQueryWithLoadMore.ts'
import { userService } from '@/modules/prediction/services/user.service.ts'
import { useProxyWallet } from '@/modules/prediction/hooks/useProxyWallet.ts'
import { UserPositionFilter, PositionSortField, SortDirection } from '@/@generated/gql/graphql-prediction.ts'
import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import { InfiniteData, useQueryClient } from '@tanstack/react-query'
import { IPortfolioPosition } from '../models/PortfolioModel'
import { useMemo } from 'react'
import { QUERY_KEYS_CONFIGS } from '../configs/queryKeys.configs'
import { usePendingOrders, mergePendingOrdersIntoPositions } from './usePendingPositions'

export interface UseUserActivePositionsOptions {
  filter?: UserPositionFilter
  enabled?: boolean
  refetchInterval?: number | false
  sortBy?: PositionSortField
  sortDirection?: SortDirection
  checkInterval?: number
}

export const useUserActivePositions = (userAddress: string, options: UseUserActivePositionsOptions = {}) => {
  const {
    filter,
    enabled = true,
    refetchInterval = false,
    sortBy = PositionSortField.Current,
    sortDirection = SortDirection.Desc,
  } = options

  const pendingOrders = usePendingOrders()
  const query = useInfiniteQueryWithLoadMore({
    queryKey: [
      ...QUERY_KEYS_CONFIGS.userPositions(userAddress, filter?.eventId?.[0] || '', filter),
      sortBy,
      sortDirection,
    ],
    queryFn: async ({ pageParam }) => {
      const offset = (pageParam - 1) * 20
      return userService.getCurrentPositions({
        userAddress,
        limit: 20,
        offset,
        filter,
        sortBy,
        sortDirection,
      })
    },
    enabled: !!userAddress && enabled,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length === 20) {
        return allPages.length + 1
      }
      return undefined
    },
    select: (data) => data.pages.flat(),
    refetchInterval,
  })

  const mergedData = useMemo(() => {
    return mergePendingOrdersIntoPositions(query.data || [], pendingOrders)
  }, [pendingOrders, query.data])

  return { ...query, data: mergedData }
}

export const useMyActivePositions = (options: UseUserActivePositionsOptions = {}) => {
  const proxyWallet = useProxyWallet()
  return useUserActivePositions(proxyWallet, options)
}

export const useRemoveUserActivePositionOptimistic = () => {
  const queryClient = useQueryClient()
  const userAddress = useProxyWallet()

  return (conditionId: string) => {
    queryClient.setQueriesData(
      {
        predicate: (query) => {
          return (
            query.queryKey[0] === 'prediction' &&
            query.queryKey[1] === 'users' &&
            query.queryKey[2] === userAddress &&
            query.queryKey[3] === 'positions'
          )
        },
      },
      (oldData: InfiniteData<IPortfolioPosition[]> | undefined) => {
        if (!oldData || !oldData.pages) return oldData
        return {
          ...oldData,
          pages: oldData.pages.map((page) => page.filter((p) => p.conditionId !== conditionId)),
        }
      },
    )
  }
}

export const useMarketPositions = (market: MarketModel) => {
  const marketConditionId = market.conditionId || ''
  const userAddress = useProxyWallet()
  const pendingOrders = usePendingOrders()

  const query = useInfiniteQueryWithLoadMore({
    queryKey: QUERY_KEYS_CONFIGS.userPositions(userAddress, marketConditionId, {}),
    queryFn: async ({ pageParam }) => {
      const offset = (pageParam - 1) * 20
      return userService.getCurrentPositions({
        userAddress,
        limit: 20,
        offset: offset,
        filter: {
          conditionID: [marketConditionId],
        },
      })
    },
    enabled: !!userAddress && !!marketConditionId,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length >= 20) return allPages.length + 1
      return undefined
    },
    select: (data) => data.pages.flat(),
  })

  const mergedData = useMemo(() => {
    return mergePendingOrdersIntoPositions(query.data || [], pendingOrders)
  }, [pendingOrders, query.data])

  return { ...query, data: mergedData }
}
