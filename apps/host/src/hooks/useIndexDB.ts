import { useEffect, useMemo, useState } from 'react'
import { type InfiniteData, type QueryKey, useInfiniteQuery, useQuery, keepPreviousData } from '@tanstack/react-query'
import { getFromIDB, setToIDB } from '@/utils/indexedDB'

const idbMemoryCache = new Map<string, { data: unknown | undefined; loaded: boolean }>()

/* =========================================================
 *  useIndexedDBQuery (existing)
 * ======================================================= */

type UseIndexedDBQueryOptions<T> = {
  queryKey: QueryKey
  queryFn: () => Promise<T>
  dbName: string
  storeName: string
  idbKey: string

  enabled?: boolean
  staleTime?: number
  refetchOnWindowFocus?: boolean
  refetchOnReconnect?: boolean
  refetchInterval?: number | false
}

export function useIndexedDBQuery<T>(options: UseIndexedDBQueryOptions<T>) {
  const {
    queryKey,
    queryFn,
    dbName,
    storeName,
    idbKey,
    enabled = true,
    staleTime,
    refetchOnWindowFocus,
    refetchOnReconnect,
    refetchInterval,
  } = options

  const cacheKey = `${dbName}:${storeName}:${idbKey}`

  const cachedEntry = idbMemoryCache.get(cacheKey)
  const [idbData, setIdbData] = useState<T | undefined>(() => (cachedEntry?.data as T | undefined) ?? undefined)
  const [idbLoaded, setIdbLoaded] = useState<boolean>(() => cachedEntry?.loaded ?? false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (!enabled || idbLoaded) return

      const cached = await getFromIDB<T>(dbName, storeName, idbKey)
      if (cancelled) return

      if (cached !== undefined) {
        setIdbData(cached)
        idbMemoryCache.set(cacheKey, { data: cached, loaded: true })
      } else {
        idbMemoryCache.set(cacheKey, { data: undefined, loaded: true })
      }

      setIdbLoaded(true)
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [enabled, dbName, storeName, idbKey, cacheKey, idbLoaded])

  const query = useQuery<T>({
    queryKey,
    queryFn: async () => {
      const data = await queryFn()
      void setToIDB<T>(dbName, storeName, idbKey, data)
      idbMemoryCache.set(cacheKey, { data, loaded: true })
      return data
    },
    enabled: enabled && idbLoaded,
    staleTime,
    refetchOnWindowFocus,
    refetchOnReconnect,
    refetchInterval,
  })

  const combinedData: T | undefined = query.data ?? idbData

  const isLoading = useMemo(
    () => !combinedData && (query.isLoading || (enabled && !idbLoaded)),
    [combinedData, query.isLoading, enabled, idbLoaded],
  )

  return {
    ...query,
    data: combinedData,
    dataFromApi: query.data as T | undefined,
    dataFromIDB: idbData,
    isLoading,
  }
}

/* =========================================================
 *  useIndexedDBInfiniteQuery (new)
 * ======================================================= */

export type UseIndexedDBInfiniteQueryOptions<TPage, TPageParam> = {
  queryKey: QueryKey
  queryFn: (ctx: { pageParam: TPageParam }) => Promise<TPage>
  getNextPageParam: (lastPage: TPage, allPages: TPage[]) => TPageParam | undefined
  initialPageParam: TPageParam

  dbName: string
  storeName: string
  idbKey: string

  enabled?: boolean
  staleTime?: number
  refetchOnWindowFocus?: boolean
  refetchOnReconnect?: boolean
  refetchInterval?: number | false
}

export function useIndexedDBInfiniteQuery<TPage, TPageParam>(
  options: UseIndexedDBInfiniteQueryOptions<TPage, TPageParam>,
) {
  const {
    queryKey,
    queryFn,
    getNextPageParam,
    initialPageParam,
    dbName,
    storeName,
    idbKey,
    enabled = true,
    staleTime,
    refetchOnWindowFocus,
    refetchOnReconnect,
    refetchInterval,
  } = options

  const cacheKey = `${dbName}:${storeName}:${idbKey}`

  const cachedEntry = idbMemoryCache.get(cacheKey)
  const [idbData, setIdbData] = useState<InfiniteData<TPage> | undefined>(
    () => (cachedEntry?.data as InfiniteData<TPage> | undefined) ?? undefined,
  )
  const [idbLoaded, setIdbLoaded] = useState<boolean>(() => cachedEntry?.loaded ?? false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (!enabled || idbLoaded) return

      const cached = await getFromIDB<InfiniteData<TPage>>(dbName, storeName, idbKey)
      if (cancelled) return

      if (cached !== undefined) {
        setIdbData(cached)
        idbMemoryCache.set(cacheKey, { data: cached, loaded: true })
      } else {
        idbMemoryCache.set(cacheKey, { data: undefined, loaded: true })
      }

      setIdbLoaded(true)
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [enabled, dbName, storeName, idbKey, cacheKey, idbLoaded])

  const query = useInfiniteQuery<TPage, unknown, InfiniteData<TPage>, QueryKey, TPageParam>({
    queryKey,
    initialPageParam,
    queryFn: async ({ pageParam = 1 }) => {
      return await queryFn({ pageParam: pageParam as TPageParam })
    },
    getNextPageParam,
    enabled: enabled && idbLoaded,
    staleTime,
    refetchOnWindowFocus,
    refetchOnReconnect,
    refetchInterval,
    placeholderData: keepPreviousData,
  })

  // Persist full InfiniteData whenever it changes
  useEffect(() => {
    if (!query.data) return
    void setToIDB<InfiniteData<TPage>>(dbName, storeName, idbKey, query.data)
    idbMemoryCache.set(cacheKey, { data: query.data, loaded: true })
  }, [query.data, dbName, storeName, idbKey, cacheKey])

  const combinedData: InfiniteData<TPage> | undefined = query.data ?? idbData

  const isLoading = useMemo(
    () => !combinedData && (query.isLoading || (enabled && !idbLoaded)),
    [combinedData, query.isLoading, enabled, idbLoaded],
  )

  return {
    ...query,
    data: combinedData,
    dataFromApi: query.data,
    dataFromIDB: idbData,
    isLoading,
  }
}
