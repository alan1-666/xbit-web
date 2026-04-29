import { useCallback, useMemo, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useInfiniteQuery } from '@tanstack/react-query'

export interface UseInfiniteScrollVirtualizerOptions<O, T> {
  queryKey: any[]
  queryFn: (context: { pageParam: number }) => Promise<O>
  getNextPageParam: (lastPage: O) => number | undefined
  aggregateData: (data: O) => T[]
  refetchInterval?: number
  estimateSize: () => number
  enabled?: boolean
  getItemKey?: (index: number) => string
  sortFn?: (a: T, b: T) => number
  staleTime?: number
}

export const useInfiniteScrollVirtualizer = <O, T>(options: UseInfiniteScrollVirtualizerOptions<O, T>) => {
  const {
    queryFn,
    queryKey,
    getNextPageParam,
    aggregateData,
    refetchInterval,
    estimateSize,
    enabled = true,
    getItemKey,
    sortFn,
    staleTime,
  } = options
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, ...rest } = useInfiniteQuery({
    queryKey: queryKey,
    getNextPageParam,
    initialPageParam: 1,
    queryFn: queryFn,
    refetchInterval,
    enabled,
    staleTime,
  })
  const tokens: T[] = useMemo(() => {
    if (!data) return []
    const allTokens = data.pages.flatMap((page) => aggregateData(page))
    if (sortFn) {
      return allTokens.sort(sortFn)
    }
    return allTokens
  }, [data])

  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? tokens.length + 1 : tokens.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 8,
    getItemKey,
  })

  const handleOnLoadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return
    fetchNextPage().then()
  }, [hasNextPage, isFetchingNextPage])

  return {
    parentRef,
    rowVirtualizer,
    handleOnLoadMore,
    tokens,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    ...rest,
  }
}
