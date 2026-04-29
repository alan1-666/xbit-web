import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

export interface UseUpdateQueryCacheOptions<T, R> {
  queryKey: unknown[]
  updater: (oldData: T | undefined, modified: R) => T | undefined
}

export interface UseUpdateQueriesCacheOptions<T, R> {
  predicate: (query: { queryKey: readonly unknown[] }) => boolean
  updater: (oldData: T | undefined, modified: R) => T | undefined
}

export const useUpdateQueryCache = <T, R>(options: UseUpdateQueryCacheOptions<T, R>) => {
  const queryClient = useQueryClient()
  const { queryKey, updater } = options
  return useCallback(
    (modified: R) => {
      queryClient.setQueryData<T>(queryKey, (oldData) => {
        return updater(oldData, modified)
      })
    },
    [queryKey, updater],
  )
}

export const useUpdateQueriesCache = <T, R>(options: UseUpdateQueriesCacheOptions<T, R>) => {
  const queryClient = useQueryClient()
  const { predicate, updater } = options
  return useCallback(
    (modified: R) => {
      queryClient.setQueriesData<T>(
        {
          predicate: (query) => {
            return predicate(query)
          },
        },
        (oldData) => {
          return updater(oldData, modified)
        },
      )
    },
    [predicate, updater],
  )
}
