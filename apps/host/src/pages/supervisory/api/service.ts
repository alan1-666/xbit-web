import useSWR from 'swr'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_SMART_MONEY_API_BASE_URL?.replace(/\/+$/, '') || 'https://unstable-smart-money.the-x.link';


type AIAnalyzeResponse = {
    success: boolean
    message?: string
    data: Record<string, unknown>
}

/**
 * GET /api/v1/smart-money/analyze/{user_address}
 */


const fetcher = (url: string) => axios.get(url).then(res => res.data)

export const useSmartMoneyAnalysis = (userAddress?: string) => {
  const shouldFetch = !!userAddress
  const { data, error, isLoading } = useSWR(
    shouldFetch ? `${API_BASE}/api/v1/smart-money/analyze/${userAddress}` : null,
    fetcher
  )

  return {
    data,
    error,
    isLoading,
  }
}

