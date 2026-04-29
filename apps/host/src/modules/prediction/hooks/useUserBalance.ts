import { useUSDCBalance } from '@/modules/prediction/hooks/useUSDCBalance.ts'

export const useUserBalance = (userAddress: string) => {
  return useUSDCBalance(userAddress)
}
