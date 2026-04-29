import { AssetChartItemDto, WalletAssetChartInput } from '@/@generated/gql/graphql-core.ts'
import { useQuery } from '@tanstack/react-query'
import { getAssetChart } from '@services/assets.service.ts'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { gqlClient } from '@/lib/gql/apollo-client.ts'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'

export type ChartItem = {
  timestamp: number
  balance: number
  changeAmount: number
  changePercentage: number
}

const normalize = (data: AssetChartItemDto[]): ChartItem[] => {
  const firstItemHasBalanceIndex = data.findIndex((item) => Number(item.v) > 0)

  // If no item has a balance
  if (firstItemHasBalanceIndex === -1) {
    return data.map((item) => ({
      timestamp: dayjs(item.t).unix() * 1000,
      balance: Number(item.v),
      changeAmount: 0,
      changePercentage: 0,
    }))
  } else {
    const firstItemHasBalance = data[firstItemHasBalanceIndex]
    const firstBalance: number = Number(firstItemHasBalance.v)
    return data.map((item, index) => {
      const timestamp = dayjs(item.t).unix() * 1000
      const balance: number = Number(item.v)

      const changeAmount: number = index > firstItemHasBalanceIndex ? balance - firstBalance : 0
      const changePercentage: number =
        index > firstItemHasBalanceIndex ? (firstBalance > 0 ? changeAmount / firstBalance : 0) : 0
      return {
        timestamp,
        balance,
        changeAmount,
        changePercentage: changePercentage * 100,
      }
    })
  }
}

export const useAssetChart = (input: WalletAssetChartInput) => {
  const activeWallet = useSelector(_activeWallet)
  const { data, isLoading } = useQuery({
    queryKey: ['assetChart', input, activeWallet?.walletAddress, activeWallet?.isConnected],
    queryFn: async () => {
      const response = await gqlClient.query({
        query: getAssetChart,
        variables: { input },
        fetchPolicy: 'network-only',
      })
      return response.data
    },
    enabled: activeWallet?.isConnected,
  })
  const { collapsedData, expandedData } = useMemo(() => {
    if (!data) return { collapsedData: [], expandedData: [] }
    const { getAssetChart, getAssetChartPreview } = data

    const collapsedData: ChartItem[] = [...getAssetChartPreview].reverse().map((item) => ({
      timestamp: dayjs(item.t).unix() * 1000,
      balance: Number(item.v),
      changeAmount: 0,
      changePercentage: 0,
    }))
    const expandedData: ChartItem[] = normalize([...getAssetChart].reverse())
    return {
      collapsedData,
      expandedData,
    }
  }, [data])

  return { collapsedData, expandedData, loading: isLoading }
}
