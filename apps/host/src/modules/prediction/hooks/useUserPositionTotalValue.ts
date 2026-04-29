import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { userService } from '@/modules/prediction/services/user.service.ts'
import { useProxyWallet } from '@/modules/prediction/hooks/useProxyWallet.ts'

export const useUserPositionTotalValue = (userAddress: string, skip = false, refetchInterval = 15000) => {
  return useQuery({
    queryKey: ['prediction', 'users', userAddress, 'position-total'],
    queryFn: async () => {
      return userService.getUserBalance(userAddress)
    },
    enabled: !!userAddress && !skip,
    staleTime: 30000,
    refetchInterval,
  })
}

export const useOptimisticUpdateUserPositionTotalValue = () => {
  const queryClient = useQueryClient()
  return useCallback(
    (userAddress: string, amount: number, mode: 'add' | 'reduce') => {
      queryClient.setQueryData(['prediction', 'users', userAddress, 'position-total'], (old: number | undefined) => {
        if (old === undefined) return old
        if (mode === 'add') return old + amount
        return Math.max(0, old - amount)
      })
    },
    [queryClient],
  )
}

export const useOptimisticUpdateMyPositionTotalValue = () => {
  const wallet = useProxyWallet()
  const update = useOptimisticUpdateUserPositionTotalValue()
  return useCallback(
    (amount: number, mode: 'add' | 'reduce') => {
      if (!wallet) return
      update(wallet, amount, mode)
    },
    [wallet, update],
  )
}
