import { DefaultContext, useQuery } from '@apollo/client'
import { useQuery as useReactQuery } from '@tanstack/react-query'
import { getAllAssetHistory, getAssetHistory } from '@services/assets.service.ts'
import { useMemo } from 'react'
import { webviewClient } from '@/lib/gql/apollo-client.ts'
import { DataItem } from '@components/common/walletBalance/WalletChangeBox.tsx'
import { AssetHistoryInput, AssetHistoryType } from '@/@generated/gql/graphql-core.ts'

export type GetAssetHistoryInput = {
  timeframe: string
  tokenAddress?: string
  type: 'Expand' | 'Collapse'
  userAddress: string
}

export type AssetHistory = {
  timestamp: number
  balance: string
}

export type GetAssetHistoryOutput = {
  getAssetHistory: AssetHistory[]
}

export type UseAssetHistoryOptions = {
  overrideContext?: DefaultContext
  skip?: boolean
}

const normalizeData = (rawData: AssetHistory[]) => {
  const firstItem = rawData.length >= 0 ? rawData[0] : null
  const history = rawData.map((item) => {
    const balance = Number(item.balance)
    const firstBalance = firstItem ? Number(firstItem.balance) : 0
    const changeAmount = firstItem ? balance - firstBalance : 0
    const changePercentage = firstItem ? ((balance - firstBalance) * 100) / firstBalance : 0
    return {
      timestamp: item.timestamp * 1000,
      balance: Number(item.balance),
      changeAmount,
      changePercentage,
    }
  })
  return [...history].reverse()
}

const handleResult = (data: GetAssetHistoryOutput | undefined): DataItem[] => {
  if (!data?.getAssetHistory) return []
  return normalizeData(data.getAssetHistory)
}

export const useAssetHistory = (input: GetAssetHistoryInput, options: UseAssetHistoryOptions = {}) => {
  const { overrideContext, skip } = options
  const { data, ...rest } = useQuery<GetAssetHistoryOutput>(getAssetHistory, {
    variables: { input },
    context: overrideContext,
    skip,
  })
  const assetHistory = useMemo(() => {
    return handleResult(data)
  }, [data?.getAssetHistory])
  return {
    data: assetHistory,
    ...rest,
  }
}

export const useGetAllAssetHistory = (input: Omit<AssetHistoryInput, 'type'>, skip: boolean) => {
  const { data, ...rest } = useQuery(getAllAssetHistory, {
    variables: {
      collapseInput: {
        ...input,
        type: AssetHistoryType.Collapse,
      },
      expandInput: {
        ...input,
        type: AssetHistoryType.Expand,
      },
    },
    skip,
  })
  const { expand, collapse } = useMemo(() => {
    if (!data) return { expand: [], collapse: [] }
    const { collapse, expand } = data
    const collapseHistory = normalizeData(collapse)
    const expandHistory = normalizeData(expand)
    return {
      collapse: collapseHistory,
      expand: expandHistory,
    }
  }, [data])
  return {
    expand,
    collapse,
    ...rest,
  }
}

export const useAssetHistoryByToken = (input: GetAssetHistoryInput, token: string) => {
  const { data = [] } = useReactQuery({
    queryKey: ['webview', input, token],
    queryFn: async () => {
      const res = await webviewClient.query<GetAssetHistoryOutput>({
        query: getAssetHistory,
        variables: { input },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      })
      const { data } = res
      return handleResult(data)
    },
  })
  return {
    data,
  }
}
