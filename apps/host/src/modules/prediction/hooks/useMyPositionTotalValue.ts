import { useProxyWallet } from '@/modules/prediction/hooks/useProxyWallet.ts'
import { useUserPositionTotalValue } from '@/modules/prediction/hooks/useUserPositionTotalValue.ts'

export const useMyPositionTotalValue = (skip = false) => {
  const wallet = useProxyWallet()
  return useUserPositionTotalValue(wallet, skip)
}
