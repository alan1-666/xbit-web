import { useCollection } from '@/modules/prediction/collections/base.ts'
import { marketPositionsFactory } from '@/modules/prediction/collections/factories/market-positions.factory.ts'
import { useProxyWallet } from '@/modules/prediction/hooks/useProxyWallet.ts'

export const useMarketPositionsCollection = (conditionId: string) => {
  const wallet = useProxyWallet()
  return useCollection(() => marketPositionsFactory(wallet, conditionId))
}
