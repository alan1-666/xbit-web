import { useProxyWallet } from '@/modules/prediction/hooks/useProxyWallet.ts'
import { useOptimisticUpdateUSDCBalance, useUSDCBalance } from '@/modules/prediction/hooks/useUSDCBalance.ts'
import { useMyPolymarketOpenOrders } from '@/modules/prediction/hooks/usePolymarketOpenOrders.ts'
import { useCallback, useMemo } from 'react'

export const useMyUSDCBalance = () => {
  const wallet = useProxyWallet()
  return useUSDCBalance(wallet, { refetchInterval: 15000 })
}

export const useOptimisticUpdateMyUSDCBalance = () => {
  const wallet = useProxyWallet()
  const update = useOptimisticUpdateUSDCBalance()
  return useCallback(
    (amount: number, mode: 'add' | 'reduce') => {
      if (!wallet) return
      update(wallet, amount, mode)
    },
    [wallet, update],
  )
}

/**
 * Hook to get available USDC balance (total balance - locked balance from open orders)
 * @returns Query result with available USDC balance
 */
export const useMyAvailableUSDCBalance = () => {
  const { data: totalBalance, ...balanceQuery } = useMyUSDCBalance()
  const { data: openOrders = [] } = useMyPolymarketOpenOrders()

  const lockedBalance = useMemo(() => {
    return openOrders.reduce((total, order) => {
      const price = parseFloat(order.price || '0')
      const size = parseFloat(order.size || '0')
      const orderValue = price * size
      return total + orderValue
    }, 0)
  }, [openOrders])

  const availableBalance = useMemo(() => {
    if (totalBalance === undefined) return undefined
    return Math.max(0, totalBalance - lockedBalance)
  }, [totalBalance, lockedBalance])

  return {
    ...balanceQuery,
    data: availableBalance,
    totalBalance,
    lockedBalance,
  }
}
