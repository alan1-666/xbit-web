import { useQuery } from '@tanstack/react-query'
import { hypertraderClient } from '@/lib/gql/apollo-client'
import {
  getTradingSessionGql,
  GetTradingSessionResp,
  TradingSessionRow,
  TradingSessionTab,
} from '@/services/hypertrader.service'

const ZERO: TradingSessionRow = {
  slot0004Count: 0,
  slot0408Count: 0,
  slot0812Count: 0,
  slot1216Count: 0,
  slot1620Count: 0,
  slot2024Count: 0,
  statDate: null,
}

async function fetchTradingSession(userAddress: string, timeRange: TradingSessionTab) {
  const { data } = await hypertraderClient.query<GetTradingSessionResp>({
    query: getTradingSessionGql,
    variables: { userAddress, timeRange },
    fetchPolicy: 'no-cache',
  })
  return data?.getTradingSession ?? ZERO
}

export function useGetTradingSession(opts: { userAddress?: string; tab: TradingSessionTab; enabled?: boolean }) {
  const { userAddress, tab, enabled = true } = opts

  const q = useQuery({
    queryKey: ['hypertrader', 'getTradingSession', userAddress, tab],
    queryFn: () => fetchTradingSession(userAddress!, tab),
    enabled: enabled && !!userAddress,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })

  return {
    data: q.data,
    loading: q.isLoading,
    error: q.error,
  }
}
