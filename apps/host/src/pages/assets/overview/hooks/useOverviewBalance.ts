import { WalletDuration } from '@/@generated/gql/graphql-core.ts'
import { getUserAssetPortfolio } from '@/api/hyperliquid'
import { useMyBalance } from '@/modules/prediction/hooks/useMyBalance'
import { _walletDex } from '@/redux/modules/newWallet.slice.ts'
import { AccountHistoryList } from '@hooks/hyperliquid/usePortfolioData.ts'
import { useWebData2 } from '@hooks/hyperliquid/useWebData2.ts'
import { usePreference } from '@hooks/usePreference.ts'
import { useWalletBalances } from '@pages/assets/overview/hooks/useWalletBalances.ts'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'

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
    staleTime: 5000,
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
    return apiBalance
  }, [wsBalance, apiBalance])
}

export const useOverviewBalance = ({ duration: durationOverride, skip }: { duration?: WalletDuration; skip?: boolean } = {}) => {
  const { preference } = usePreference()
  const { totalBalance: predictionBalance } = useMyBalance(skip)

  const duration = useMemo(() => {
    if (durationOverride) return durationOverride
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
  }, [durationOverride, preference.assetTimeRange])

  const wallets = useWalletBalances({ duration: duration })
  const fundingBalance = wallets?.funding
    ? wallets?.funding?.reduce((acc, wallet) => acc + parseFloat(wallet.usdBalance || '0'), 0) || 0
    : undefined
  const futuresBalance = useFuturesBalance()
  const totalBalance = useMemo(() => {
    const funding = fundingBalance !== undefined ? fundingBalance : 0
    const futures = futuresBalance !== undefined ? futuresBalance : 0
    const prediction = predictionBalance !== undefined ? predictionBalance : 0
    return funding + futures + prediction
  }, [fundingBalance, futuresBalance, predictionBalance])

  const loadingBalance = useMemo(() => {
    return wallets.funding === undefined || futuresBalance === undefined || predictionBalance === undefined
  }, [wallets.funding, futuresBalance, predictionBalance])

  return {
    totalBalance,
    fundingBalance: fundingBalance ?? 0,
    futuresBalance: futuresBalance ?? 0,
    wallets,
    loadingBalance,
    loadingFundingBalance: wallets.funding === undefined,
    loadingFuturesBalance: futuresBalance === undefined,
    predictionBalance,
  }
}
