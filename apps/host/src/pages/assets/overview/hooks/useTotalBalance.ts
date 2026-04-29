import { useWebData2 } from '@hooks/hyperliquid/useWebData2.ts'
import { WalletBalanceUnit, WalletDuration } from '@/@generated/gql/graphql-core.ts'
import { useAssetChart } from '@hooks/useAssetChart.ts'
import { AccountHistoryList } from '@hooks/hyperliquid/usePortfolioData.ts'
import { useMemo } from 'react'
import { usePreference } from '@hooks/usePreference.ts'
import { useQuery } from '@tanstack/react-query'
import { getClearinghouseState, getUserAssetPortfolio } from '@/api/hyperliquid'
import { useSelector } from 'react-redux'
import { _walletDex } from '@/redux/modules/newWallet.slice.ts'
import { fixNumber, MathFun } from '@/lib/utils.ts'
import { useOverviewBalance } from '@pages/assets/overview/hooks/useOverviewBalance.ts'
import dayjs from 'dayjs'

export type ClearinghouseState = {
  assetPositions: Array<{
    position: {
      coin: string
      unrealizedPnl: string
    }
  }>
  crossMarginSummary: {
    accountValue: string
    totalMarginUsed: string
  }
  marginSummary: {
    accountValue: string
    totalMarginUsed: string
  }
}

export const useClearinghouseState = () => {
  const walletDex = useSelector(_walletDex)
  return useQuery({
    queryKey: ['futuresAccountValue', walletDex.walletAddress],
    enabled: !!walletDex.walletAddress,
    queryFn: async (): Promise<ClearinghouseState> => {
      return getClearinghouseState(walletDex.walletAddress)
    },
  })
}

export const useFuturesPortfolio = () => {
  const walletDex = useSelector(_walletDex)
  const { data, isLoading } = useQuery({
    queryKey: ['futuresPortfolio', walletDex.walletAddress],
    enabled: !!walletDex.walletAddress,
    queryFn: async () => {
      const historyList: AccountHistoryList = await getUserAssetPortfolio(walletDex?.walletAddress)
      const dayData = historyList.find(([period]) => period === 'day')?.[1] ?? null
      const weekData = historyList.find(([period]) => period === 'week')?.[1] ?? null
      const monthData = historyList.find(([period]) => period === 'month')?.[1] ?? null
      const allTimeData = historyList.find(([period]) => period === 'allTime')?.[1] ?? null
      return { dayData, weekData, monthData, allTimeData }
    },
  })
  const portfolio = useMemo(() => {
    if (data) {
      return data
    }
    return {
      dayData: null,
      weekData: null,
      monthData: null,
      allTimeData: null,
    }
  }, [data])
  return {
    ...portfolio,
    loading: isLoading,
  }
}

export const useFuturesBalance = () => {
  const { webData2 } = useWebData2()
  const { dayData } = useFuturesPortfolio()

  const wsBalance = useMemo(() => {
    const accountValue = webData2?.clearinghouseState?.marginSummary.accountValue
    return accountValue ? +accountValue : undefined
  }, [webData2])

  const apiBalance = useMemo(() => {
    const latestPoint = dayData?.accountValueHistory?.slice(-1)[0]
    return latestPoint ? Number(latestPoint[1]) : undefined
  }, [dayData])

  return useMemo(() => {
    if (wsBalance) return wsBalance
    if (apiBalance) return apiBalance
    return 0
  }, [wsBalance, apiBalance])
}

export const useAvailableFuturesBalance = () => {
  const { availableFund, webData2 } = useWebData2()
  const { data } = useClearinghouseState()

  const wsAssetPositions = useMemo(() => {
    return webData2?.clearinghouseState?.assetPositions
  }, [webData2])

  const assetPositions: ClearinghouseState['assetPositions'][number][] = useMemo(() => {
    if (wsAssetPositions) return wsAssetPositions
    return data?.assetPositions || []
  }, [wsAssetPositions, data])

  const availableBalance = useMemo(() => {
    if (availableFund) return availableFund
    const crossMarginSummary = data?.marginSummary
    if (!crossMarginSummary) return 0
    const available = MathFun.sub(crossMarginSummary?.accountValue || 0, crossMarginSummary?.totalMarginUsed || 0)
    const availableFundRaw = available ? fixNumber(available, 2) : 0
    return Number(availableFundRaw) > 0 ? availableFundRaw : 0
  }, [availableFund, data])
  return {
    availableBalance,
    assetPositions,
  }
}

export const useTotalBalance = () => {
  const { preference } = usePreference()

  const duration = useMemo(() => {
    switch (preference.assetTimeRange) {
      case '1day':
        return WalletDuration.D1
      case '1week':
        return WalletDuration.W1
      case '1month':
        return WalletDuration.M1
      case '1year':
        return WalletDuration.Y1
      default:
        return WalletDuration.D1
    }
  }, [preference.assetTimeRange])

  const { dayData, weekData, monthData, allTimeData } = useFuturesPortfolio()

  const { totalBalance, fundingBalance, futuresBalance, wallets, loadingFundingBalance, loadingFuturesBalance } =
    useOverviewBalance({
      duration,
    })

  const futuresChartData = useMemo(() => {
    switch (duration) {
      case WalletDuration.D1:
        return dayData
      case WalletDuration.W1:
        return weekData
      case WalletDuration.M1:
        return monthData
      case WalletDuration.Y1:
        return dayData
      default:
        return dayData
    }
  }, [dayData, weekData, monthData, allTimeData, duration])

  const fundingBalanceChange = useMemo(() => {
    const fundingWallets = wallets.funding || []
    return fundingWallets.reduce((acc, wallet) => acc + parseFloat(wallet.balanceChangeUsd || '0'), 0)
  }, [wallets])

  const futuresBalanceChange = useMemo(() => {
    if (!futuresChartData) return 0
    const firstPoint =
      futuresChartData.accountValueHistory.find((item) => Number(item[1]) != 0) ||
      futuresChartData.accountValueHistory[0]
    const firstBalanceValue = firstPoint ? Number(firstPoint[1]) : 0
    const lastPoint = futuresChartData.accountValueHistory[futuresChartData.accountValueHistory.length - 1]
    const lastBalanceValue = lastPoint ? Number(lastPoint[1]) : 0
    return lastBalanceValue - firstBalanceValue
  }, [futuresChartData])

  const changeAmount = fundingBalanceChange + Number(futuresBalanceChange || 0)
  const changePercentage = useMemo(() => {
    const firstBalance = totalBalance - changeAmount
    if (firstBalance <= 0) return 0
    return (changeAmount / firstBalance) * 100
  }, [changeAmount, totalBalance])

  const unrealizedPnlFunding = useMemo(() => {
    if (!wallets || !wallets.funding) return 0
    const firstWallet = wallets.funding[0]
    if (!firstWallet) return 0
    return firstWallet.unrealizedPnl || 0
  }, [wallets])

  let { expandedData } = useAssetChart({
    duration: duration,
    unit: WalletBalanceUnit.Usd,
  })

  // Mock data if empty
  if (!expandedData || expandedData.length === 0) {
    const end = dayjs().startOf('hour')
    let start = end
    let step = 0
    let unit: 'hour' | 'day' = 'hour'

    if (duration === WalletDuration.D1) {
      start = end.subtract(1, 'day')
      step = 1
      unit = 'hour'
    } else if (duration === WalletDuration.W1) {
      start = end.subtract(1, 'week')
      step = 4
      unit = 'hour'
    } else if (duration === WalletDuration.M1) {
      start = dayjs().subtract(1, 'month').startOf('day')
      step = 1
      unit = 'day'
    } else {
      start = dayjs().subtract(1, 'year').startOf('day')
      step = 10
      unit = 'day'
    }

    const mockRawData = []
    let current = start

    while (current.isBefore(end) || current.isSame(end)) {
      mockRawData.push({
        t: current.toISOString(),
        v: '0',
        __typename: 'AssetChartItemDTO',
      })
      current = current.add(step, unit)
    }

    expandedData = mockRawData.map((item) => ({
      timestamp: new Date(item.t).getTime(),
      balance: Number(item.v),
      changeAmount: 0,
      changePercentage: 0,
    }))
  }

  const overviewExpandData = useMemo(() => {
    let data: typeof expandedData = []
    if (!expandedData || expandedData.length === 0) return data
    const futureData = futuresChartData
    const firstBalance = futureData?.accountValueHistory[0] || undefined
    for (const point of expandedData) {
      let futureBalance = undefined
      let futureChangeAmount = 0
      if (futureData?.accountValueHistory) {
        for (let i = futureData.accountValueHistory.length - 1; i >= 0; i--) {
          const item = futureData.accountValueHistory[i]
          if (item[0] <= point.timestamp) {
            futureBalance = item
            if (firstBalance) {
              futureChangeAmount = Number(item[1]) - Number(firstBalance[1])
            }
            break
          }
        }
      }

      const changeAmount = futureBalance ? futureChangeAmount + Number(point.changeAmount) : Number(point.changeAmount)
      const changePercentage =
        firstBalance && futureBalance
          ? (changeAmount / (Number(firstBalance[1]) + Number(expandedData[0].balance))) * 100
          : point.changePercentage

      data.push({
        ...point,
        balance: futureBalance ? Number(futureBalance[1]) + Number(point.balance) : point.balance,
        changeAmount: futureBalance ? futureChangeAmount + Number(point.changeAmount) : Number(point.changeAmount),
        changePercentage: changePercentage,
      })
    }
    data = data.slice(0, data.length - 1)
    data.push({
      timestamp: Date.now(),
      balance: totalBalance,
      changeAmount: changeAmount,
      changePercentage: changePercentage,
    })
    return data
  }, [expandedData, futuresChartData, changeAmount, changePercentage])

  const firstItem = useMemo(() => {
    return overviewExpandData.find((item) => item.balance > 0) || overviewExpandData[0]
  }, [overviewExpandData])

  const fundingChange = useMemo(() => {
    const firstFundingBalanceItem = expandedData?.find((item) => Number(item.balance) > 0) || expandedData?.[0]
    const firstFundingBalance = firstFundingBalanceItem ? Number(firstFundingBalanceItem.balance) : 0
    const changeAmount = fundingBalance - firstFundingBalance
    const changePercentage = firstFundingBalance > 0 ? (changeAmount / firstFundingBalance) * 100 : 0
    return { changeAmount, changePercentage }
  }, [expandedData, fundingBalance])

  const futuresChange = useMemo(() => {
    const firstFuturesBalanceItem =
      futuresChartData?.accountValueHistory?.find((item) => Number(item[1]) > 0) ||
      futuresChartData?.accountValueHistory?.[0]
    const firstFuturesBalance = firstFuturesBalanceItem ? Number(firstFuturesBalanceItem[1]) : 0
    const changeAmount = futuresBalance - firstFuturesBalance
    const changePercentage = firstFuturesBalance > 0 ? (changeAmount / firstFuturesBalance) * 100 : 0
    return { changeAmount, changePercentage }
  }, [futuresChartData, futuresBalance])

  return {
    totalBalance,
    changeAmount,
    changePercentage,
    overviewExpandData,
    firstItem,
    fundingChange,
    futuresChange,
    fundingBalance,
    futuresBalance,
    unrealizedPnlFunding,
    fundingBalanceChange,
    loadingFundingBalance,
    loadingFuturesBalance,
  }
}
