import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useMarketsByIds } from '@/modules/prediction/hooks/useMarketsByIds'
import { userService } from '@/modules/prediction/services/user.service'
import type { FilteredClaimableData } from './claimablePositions.types'

export const useClaimablePositionsQuery = (proxyWallet: string | undefined, pauseRefetch: boolean) => {
  const query = useQuery({
    queryKey: ['prediction', 'claimablePositions', proxyWallet] as const,
    queryFn: async () => userService.getClaimablePositions(),
    enabled: !!proxyWallet,
    initialData: {
      totalClaimable: 0,
      totalValue: 0,
      positions: [],
    },
    refetchInterval: pauseRefetch ? false : 10000, // Refetch every 10 seconds, paused after claiming
  })

  const filteredData: FilteredClaimableData = useMemo(() => {
    const positions = query.data?.positions || []

    const res = {
      totalClaimable: positions.length,
      totalValue: positions.reduce((acc, curr) => acc + (curr.currentValue || 0), 0),
      positions,
    }

    return res
  }, [query.data?.positions])

  const conditionIds = useMemo(() => {
    const positions = filteredData.positions || []
    const ids = positions.map((p) => p.conditionId).filter(Boolean)
    return Array.from(new Set(ids))
  }, [filteredData.positions])

  const { data: markets = [] } = useMarketsByIds(conditionIds)

  const images = useMemo(() => {
    if (!filteredData.positions || markets.length === 0) return []

    const marketMap = new Map(markets.map((m) => [m.conditionId, m]))
    const result: string[] = []

    filteredData.positions.forEach((p) => {
      const market = marketMap.get(p.conditionId)
      if (market?.icon) {
        result.push(market.icon)
      }
    })

    return result
  }, [filteredData.positions, markets])

  return { query, filteredData, images }
}
