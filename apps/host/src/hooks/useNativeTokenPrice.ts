import { useAppSelector } from '@/redux/store'
import { useActiveChain } from './useActiveChain'
import { priceChain } from '@/redux/modules/price.slice'

export const useNativeTokenPrice = () => {
  const activeChain = useActiveChain()
  return useAppSelector(priceChain(activeChain))
}
