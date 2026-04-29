import { useAppSelector } from '@/redux/store'
import { NEW_TYPE_ACCOUNT } from '@/lib/blockchain.ts'

export const useActiveAccount = () => {
  return useAppSelector((state) => state.newWallet.activeAccount as NEW_TYPE_ACCOUNT)
}
