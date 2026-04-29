import { useMemo } from 'react'
import { useMyConditionalTokenBalance } from '@/modules/prediction/hooks/useConditionalTokenBalance.ts'
import { useMyPolymarketOpenOrders } from '@/modules/prediction/hooks/usePolymarketOpenOrders.ts'

export const useConditionalTokenBalance = (tokenId: string, includeOpenOrders: boolean) => {
  const { data: openOrders } = useMyPolymarketOpenOrders()
  const { data: balance, ...rest } = useMyConditionalTokenBalance(tokenId)

  const data = useMemo(() => {
    if (!balance) return 0
    if (!includeOpenOrders || !openOrders || openOrders.length === 0) return +balance

    const openOrderSize = openOrders.reduce((acc, order) => {
      if (order.asset_id === tokenId && order.side.toLowerCase() === 'buy') {
        return acc + +order.size
      }
      return acc
    }, 0)

    return Math.max(0, balance - openOrderSize)
  }, [balance, openOrders, includeOpenOrders, tokenId])

  const lockedBalance = useMemo(() => {
    if (!openOrders || openOrders.length === 0) return 0

    return openOrders.reduce((acc, order) => {
      if (order.asset_id === tokenId) {
        return acc + +order.size
      }
      return acc
    }, 0)
  }, [openOrders, tokenId])

  const availableBalance = useMemo(() => {
    if (!balance) return 0
    return Math.max(0, balance - lockedBalance)
  }, [balance, lockedBalance])

  return {
    data,
    rawBalance: balance,
    lockedBalance,
    availableBalance,
    ...rest,
  }
}
