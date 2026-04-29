import { xPositions } from '@/components/futuresDetails/trade/types'
import { useMemo } from 'react'
import { useTradingDashboardContext } from '../context/TradingDashboardContext'

const useFilterMyPosition = ({ positions, baseCoin }: { positions: xPositions[]; baseCoin: string }) => {
  const { showOnlyBaseCoin, side } = useTradingDashboardContext()

  const filterPostions = useMemo(() => {
    let filtered = positions

    if (!(side === 'All' && !showOnlyBaseCoin)) {
      filtered = positions.filter((item) => {
        return (item.side === side || side === 'All') && (!showOnlyBaseCoin || baseCoin === item.coin)
      })
    }

    return filtered.sort((a, b) => {
      if (a.coin === baseCoin && b.coin !== baseCoin) return -1
      if (a.coin !== baseCoin && b.coin === baseCoin) return 1
      return 0
    })
  }, [showOnlyBaseCoin, side, positions, baseCoin])

  return {
    filterPostions,
  }
}

export default useFilterMyPosition
