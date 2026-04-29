import { useEffect, useState } from 'react'
import { getUserAssetPortfolio } from '@/api/hyperliquid'
import { useSelector } from 'react-redux'
import { useCheckLoginOnArb } from './useCheckLoginOnArb'
import { _walletDex } from '@/redux/modules/newWallet.slice'

export type HistoryPoint = [timestamp: number, value: string]

export interface AccountHistoryData {
  accountValueHistory: HistoryPoint[]
  pnlHistory: HistoryPoint[]
  vlm: string
}

export type AccountHistoryItem = [period: string, data: AccountHistoryData]

export type AccountHistoryList = AccountHistoryItem[]

interface UsePortfolioDataResult {
  weekData: AccountHistoryData | null
  dayData: AccountHistoryData | null
  monthData: AccountHistoryData | null
  allTimeData: AccountHistoryData | null
  loading: boolean
  error: Error | null
}

export function usePortfolioData(): UsePortfolioDataResult {
  const walletDex = useSelector(_walletDex)
  const isLogin = useCheckLoginOnArb()

  const [dayData, setDayData] = useState<AccountHistoryData | null>(null)
  const [weekData, setWeekData] = useState<AccountHistoryData | null>(null)
  const [monthData, setMonthData] = useState<AccountHistoryData | null>(null)
  const [allTimeData, setAllTime] = useState<AccountHistoryData | null>(null)

  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const historyList: AccountHistoryList = await getUserAssetPortfolio(walletDex?.walletAddress)
      const day = historyList.find(([period]) => period === 'day')?.[1] ?? null
      const week = historyList.find(([period]) => period === 'week')?.[1] ?? null
      const month = historyList.find(([period]) => period === 'month')?.[1] ?? null
      const allTime = historyList.find(([period]) => period === 'allTime')?.[1] ?? null

      setDayData(day)
      setWeekData(week)
      setMonthData(month)
      setAllTime(allTime)
    } catch (err) {
      setError(err as Error)
      setWeekData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLogin && walletDex?.walletAddress) {
      fetchData()
    } else {
      setDayData(null)
      setWeekData(null)
      setMonthData(null)
      setAllTime(null)
    }
  }, [isLogin, walletDex])

  return { dayData, weekData, monthData, allTimeData, loading, error }
}
