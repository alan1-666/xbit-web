import { useQuery, useQueryClient } from '@tanstack/react-query'
import { rpcService } from '@/modules/prediction/services/rpc.service.ts'
import { useCallback } from 'react'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { FeatureFlags } from '@const/featureFlags.ts'
import Decimal from 'decimal.js'

const USDC_POLYGON = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'

type QueryKeyOptions = {
  wallet: string
}

const getQueryKey = (options: QueryKeyOptions) => {
  const { wallet } = options
  return ['prediction', 'usdc-balance', wallet]
}

export interface UseUSDCBalanceOptions {
  refetchInterval?: number | false
}

export const useUSDCBalance = (wallet: string, options?: UseUSDCBalanceOptions) => {
  const { refetchInterval } = options || {}
  const moduleEnabled = useFeatureIsOn(FeatureFlags.ENABLE_PREDICTION_MODULE)
  return useQuery({
    queryKey: getQueryKey({ wallet }),
    queryFn: async () => {
      const balance = await rpcService.getBalanceOf(wallet, USDC_POLYGON)
      return new Decimal(balance).toDecimalPlaces(2, Decimal.ROUND_DOWN).toNumber()
    },
    enabled: !!wallet && moduleEnabled,
    staleTime: 15000,
    refetchInterval,
    retry: 1,
  })
}

export const useOptimisticUpdateUSDCBalance = () => {
  const queryClient = useQueryClient()
  return useCallback((wallet: string, amount: number, mode: 'add' | 'reduce') => {
    const queryKey = getQueryKey({ wallet })
    const currentBalance = queryClient.getQueryData<number>(queryKey) || 0
    const newBalance = mode === 'add' ? currentBalance + amount : Math.max(0, currentBalance - amount)
    queryClient.setQueryData(queryKey, newBalance)
  }, [])
}
