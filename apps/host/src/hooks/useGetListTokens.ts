import { DocumentNode, useQuery } from '@apollo/client'
import { FilterTimeOption } from '@components/common/FilterTime'
import { FilterFormData, SortType } from '@components/listCoin/filter/FilterField.tsx'
import { useEffect, useMemo } from 'react'
import dayjs from 'dayjs'
import { useActiveChain } from '@hooks/useActiveChain.ts'

function getTimeRange(timeOption: FilterTimeOption) {
  const time = `${timeOption.value}${timeOption.unit}`
  switch (time) {
    case '1m':
      return 'm1'
    case '5m':
      return 'm5'
    case '1h':
      return 'h1'
    case '6h':
      return 'h6'
    case '24h':
      return 'h24'
  }
}

const buildFilterRequestParams = (filter?: FilterFormData): Record<string, any> => {
  if (!filter)
    return {
      dex: 'All',
    }
  const params: Record<string, any> = {}

  if (filter.marketCap) {
    params.marketValueFrom = filter.marketCap.data.min ? filter.marketCap.data.min.toString() : undefined
    params.marketValueTo = filter.marketCap.data.max ? filter.marketCap.data.max.toString() : undefined
  }

  if (filter.transactions) {
    params.transaction1hFrom = filter.transactions.data.min ? filter.transactions.data.min : undefined
    params.transaction1hTo = filter.transactions.data.max ? filter.transactions.data.max : undefined
  }

  if (filter.volumes) {
    params.tradingVolumeFrom = filter.volumes.data.min ? filter.volumes.data.min.toString() : undefined
    params.tradingVolumeTo = filter.volumes.data.max ? filter.volumes.data.max.toString() : undefined
  }

  if (filter.liquidityPool) {
    params.liquidityPoolFrom = filter.liquidityPool.data.min ? filter.liquidityPool.data.min.toString() : undefined
    params.liquidityPoolTo = filter.liquidityPool.data.max ? filter.liquidityPool.data.max.toString() : undefined
  }

  if (filter.holders) {
    params.numberOfHolderFrom = filter.holders.data.min ? filter.holders.data.min : undefined
    params.numberOfHolderTo = filter.holders.data.max ? filter.holders.data.max : undefined
  }

  if (filter.progress) {
    params.internalMarketProgressFrom = filter.progress.data.min
    params.internalMarketProgressTo = filter.progress.data.max
  }

  params.dex = filter?.dex?.data ?? 'All'

  return params
}

function buildSortBy(filter?: FilterFormData) {
  if (!filter) return null
  const sort = filter.sort as { field: keyof FilterFormData; type: SortType }
  const period = filter.period
  if (!sort) return null
  const { field, type } = sort
  switch (field) {
    case 'creationTime':
      return type === 'asc' ? '-createdTime' : 'createdTime'
    case 'marketCap':
      return type === 'asc' ? 'marketcap' : '-marketcap'
    case 'transactions':
      return type === 'asc' ? `txs${period.value}${period.unit}` : `-txs${period.value}${period.unit}`
    case 'volumes':
      return type === 'asc' ? `volume${period.value}${period.unit}` : `-volume${period.value}${period.unit}`
    case 'liquidityPool':
      return type === 'asc' ? 'liquidity' : '-liquidity'
    case 'holders':
      return type === 'asc' ? 'numberOfHolder' : '-numberOfHolder'
    case 'progress':
      return type === 'asc' ? 'internalMarketProgress' : '-internalMarketProgress'
  }
}

export function buildChainFilter(chain: string) {
  switch (chain) {
    case 'eth':
      return 'EVM'
    case 'sol':
      return 'SOLANA'
    case 'tron':
      return 'TRON'
    case 'bsc':
      return 'BSC'
    case 'mon':
      return 'MON'
    default:
      return 'ALL'
  }
}

export default function useGetListTokens<T, P = any>(options: {
  documentNode: DocumentNode
  timeRange: FilterTimeOption
  direction?: string
  filter: FilterFormData
  key: string
  additionalParams?: P
  refreshInterval?: number
  defaultSort?: string
  deduplicateFn?: (item: T, index: number, self: T[]) => boolean
}) {
  const {
    documentNode,
    timeRange,
    direction,
    filter,
    key,
    additionalParams,
    refreshInterval,
    defaultSort,
    deduplicateFn,
  } = options

  const selectedChain = useActiveChain()

  const creationTime = useMemo(() => {
    if (!filter || !filter.creationTime) return undefined
    return {
      openingTimeFrom: dayjs().subtract(filter.creationTime.data.max, 'minutes').unix(),
      openingTimeTo: dayjs().subtract(filter.creationTime.data.min, 'minutes').unix(),
    }
  }, [filter])

  const { data, loading, refetch, fetchMore, ...rest } = useQuery(documentNode, {
    variables: {
      input: {
        timeRange: getTimeRange(timeRange),
        ...(direction ? { direction } : {}),
        ...buildFilterRequestParams(filter),
        ...(additionalParams ?? {}),
        ...(creationTime ? creationTime : {}),
        sortBy: buildSortBy(filter) ?? defaultSort,
        chain: buildChainFilter(selectedChain),
        page: 1,
        limit: 20,
      },
    },
  })

  useEffect(() => {
    if (!refreshInterval) return
    const interval = setInterval(() => {
      refetch({
        input: {
          timeRange: getTimeRange(timeRange),
          ...(direction ? { direction } : {}),
          ...buildFilterRequestParams(filter),
          ...(additionalParams ?? {}),
          ...(creationTime ? creationTime : {}),
          sortBy: buildSortBy(filter) ?? defaultSort,
          chain: buildChainFilter(selectedChain),
          page: 1,
          limit: Math.max(data?.[key].data.length, 20),
        },
      }).then()
    }, refreshInterval)
    return () => {
      clearInterval(interval)
    }
  }, [filter, timeRange, direction, selectedChain, refreshInterval, data])

  const fetchMoreFn = (page?: number) => {
    return fetchMore({
      variables: {
        input: {
          timeRange: getTimeRange(timeRange),
          ...(direction ? { direction } : {}),
          ...buildFilterRequestParams(filter),
          ...(additionalParams ?? {}),
          ...(creationTime ? creationTime : {}),
          sortBy: buildSortBy(filter) ?? defaultSort,
          chain: buildChainFilter(selectedChain),
          limit: 20,
          page: page ?? Math.floor(tokens.length / 20) + 1,
        },
      },
      updateQuery: (previousQueryResult, options) => {
        const newData = options.fetchMoreResult?.[key]
        if (!newData) return previousQueryResult
        const newTokens = newData.data as T[]
        const existingTokens = previousQueryResult[key].data as T[]
        return {
          ...previousQueryResult,
          [key]: {
            ...previousQueryResult[key],
            data: [...existingTokens, ...newTokens],
          },
        }
      },
    })
  }

  const tokens = useMemo(() => {
    if (!data) return []
    const allData = data[key].data as T[]
    if (!deduplicateFn) return allData
    return allData.filter(deduplicateFn)
  }, [data])

  return { tokens, loading, fetchMore: fetchMoreFn, ...rest }
}
