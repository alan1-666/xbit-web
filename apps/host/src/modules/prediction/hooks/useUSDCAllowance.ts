import { useQuery, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/modules/prediction/services/user.service.ts'
import { AllowanceResponse } from '@/modules/prediction/types'
import { useCallback } from 'react'
import ls from '@/lib/local-storage'
import { useProxyWallet } from './useProxyWallet'

const USDC_ALLOWANCE_STORAGE_KEY = 'usdcAllowance'

const getCachedAllowance = (): AllowanceResponse | undefined => {
  const cached = ls.get(USDC_ALLOWANCE_STORAGE_KEY)
  if (cached && typeof cached === 'object' && cached !== null && 'allowanceUSDC' in cached) {
    return cached as AllowanceResponse
  }
  return undefined
}

export const clearUSDCAllowanceCache = () => ls.remove(USDC_ALLOWANCE_STORAGE_KEY)

export const useUSDCAllowance = () => {
  const proxyWallet = useProxyWallet()
  const cached = getCachedAllowance()

  return useQuery({
    queryKey: ['prediction', 'usdc-allowance'],
    queryFn: async () => {
      const result = await userService.getUSDCAllowance()
      if (result) ls.set(USDC_ALLOWANCE_STORAGE_KEY, result)
      return result
    },
    initialData: cached,
    enabled: !cached && !!proxyWallet,
  })
}

export const useIsUSDCApproved = () => {
  const { data } = useUSDCAllowance()
  return !!data?.allowanceUSDC && data.allowanceUSDC > 0
}

export const useOptimisticUpdateUSDCAllowance = () => {
  const queryClient = useQueryClient()

  return useCallback((newAllowance: number) => {
    queryClient.setQueryData(['prediction', 'usdc-allowance'], (oldData: AllowanceResponse) => {
      const updated: AllowanceResponse = oldData
        ? { ...oldData, allowanceUSDC: newAllowance }
        : { allowanceUSDC: newAllowance, allowanceWei: '0', proxyWallet: '' }
      ls.set(USDC_ALLOWANCE_STORAGE_KEY, updated)
      return updated
    })
  }, [])
}
