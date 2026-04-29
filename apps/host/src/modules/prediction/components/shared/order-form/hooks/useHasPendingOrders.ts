import { useAppSelector } from '@/redux/store.ts'
import { selectPendingOrdersByTokenId } from '@/redux/modules/pendingOrders.slice.ts'

export const useHasPendingOrders = (tokenId: string) => {
  const pendingOrders = useAppSelector(selectPendingOrdersByTokenId(tokenId))
  return pendingOrders.length > 0
}