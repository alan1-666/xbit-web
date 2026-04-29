import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  InfiniteData,
  QueryKey,
} from '@tanstack/react-query'
import { useCallback } from 'react'

export function useInfiniteQueryWithLoadMore<
  TQueryFnData,
  TError = unknown,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  options: UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>,
): UseInfiniteQueryResult<TData, TError> & {
  loadMore: () => void
  canLoadMore: boolean
} {
  const query = useInfiniteQuery(options)

  const canLoadMore = !!query.hasNextPage && !query.isFetchingNextPage

  const loadMore = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage()
    }
  }, [query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage])

  return {
    ...query,
    loadMore,
    canLoadMore,
  }
}
