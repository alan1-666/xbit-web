import { useQuery, useQueryClient } from '@tanstack/react-query'
import { rpcService } from '@/modules/prediction/services/rpc.service.ts'
import { useProxyWallet } from '@/modules/prediction/hooks/useProxyWallet.ts'
import { useCallback } from 'react'
import Decimal from 'decimal.js'

type QueryKeyOptions = {
  wallet: string
  tokenId: string
}

const getQueryKey = (options: QueryKeyOptions) => {
  const { wallet, tokenId } = options
  return ['prediction', 'conditional-token-balance', wallet, tokenId]
}

export const useConditionalTokenBalance = (wallet: string, tokenId: string) => {
  return useQuery({
    queryKey: ['prediction', 'conditional-token-balance', wallet, tokenId],
    queryFn: async () => {
      return rpcService.getConditionTokenBalance(wallet, tokenId)
    },
    enabled: !!wallet && !!tokenId,
  })
}

export const useMyConditionalTokenBalance = (tokenId: string) => {
  const wallet = useProxyWallet()
  return useConditionalTokenBalance(wallet, tokenId)
}

export const useOptimisticUpdateConditionalTokenBalance = () => {
  const queryClient = useQueryClient()
  return useCallback((wallet: string, tokenId: string, amount: number, mode: 'add' | 'reduce') => {
    const queryKey = getQueryKey({ wallet, tokenId })
    const currentBalance = queryClient.getQueryData<number>(queryKey) || 0
    const amountDecimal = new Decimal(amount)
    const adjustAmount = mode === 'add' ? amountDecimal.toDecimalPlaces(2, Decimal.ROUND_DOWN).toNumber() : amountDecimal.toDecimalPlaces(2, Decimal.ROUND_UP).toNumber()
    const newBalance = mode === 'add' ? currentBalance + adjustAmount : Math.max(0, currentBalance - adjustAmount)
    queryClient.setQueryData(queryKey, newBalance)
  }, [])
}

export const useOptimisticUpdateMyConditionalTokenBalance = () => {
  const wallet = useProxyWallet()
  const update = useOptimisticUpdateConditionalTokenBalance()
  return useCallback(
    (tokenId: string, amount: number, mode: 'add' | 'reduce') => {
      if (!wallet) return
      update(wallet, tokenId, amount, mode)
    },
    [wallet, update],
  )
}
