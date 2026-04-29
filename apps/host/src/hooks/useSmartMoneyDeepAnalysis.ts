import { useQuery } from '@tanstack/react-query'

export type SmartMoneyDeepAnalysisResp = {
  success: boolean
  message?: string
  data?: {
    user_address: string
    entry_strategy?: string[]
    exit_strategy?: string[]
    stop_loss_strategy?: string[]
    take_profit_strategy?: string[]
    analyzed_at?: string
  }
}

type Args = {
  address?: string
  analysisDays?: number
  language?: 'cn' | 'en'
  enabled?: boolean
}

const API_BASE = import.meta.env.VITE_SMART_MONEY_API_BASE_URL || 'https://unstable-smart-money.the-x.link'

async function fetchDeepAnalysis(address: string, analysisDays: number, language: 'cn' | 'en') {
  const url = new URL(`/api/v1/smart-money/deep-analysis/${address}`, API_BASE)
  url.searchParams.set('analysis_days', String(analysisDays))
  url.searchParams.set('language', language)

  const res = await fetch(url.toString(), { method: 'GET' })
  if (!res.ok) throw new Error(`DeepAnalysis request failed: ${res.status}`)
  return (await res.json()) as SmartMoneyDeepAnalysisResp
}

export function useSmartMoneyDeepAnalysis({ address, analysisDays = 7, language = 'cn', enabled }: Args) {
  return useQuery({
    queryKey: ['smartMoney', 'deepAnalysis', address, analysisDays, language],
    queryFn: () => fetchDeepAnalysis(address!, analysisDays, language),
    enabled: !!address && !!enabled,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })
}
