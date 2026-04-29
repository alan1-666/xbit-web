import useSWR from 'swr'
import axios from 'axios'
import type { SmartMoneyAnalyzeResp } from '@/pages/smart-money-pc/types'

const API_BASE =
  import.meta.env.VITE_SMART_MONEY_API_BASE_URL?.replace(/\/+$/, '') ||
  'https://unstable-smart-money.the-x.link'

const fetcher = async (url: string) => {
  const res = await axios.get<SmartMoneyAnalyzeResp>(url, {
    withCredentials: false, // 先不带 cookie，避免 CORS 更严格
  })
  return res.data
}

export const useSmartMoneyAIConclusion = ({
  address,
  analysisDays = 7,
  enabled = true,
}: {
  address?: string
  analysisDays?: number
  enabled?: boolean
}) => {
  const key =
    enabled && address
      ? `${API_BASE}/api/v1/smart-money/analyze/${address}?analysis_days=${analysisDays}`
      : null

  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: true,
    errorRetryCount: 2,
  })

  return {
    data,
    loading: isLoading,
    error,
    refetch: mutate,
  }
}
