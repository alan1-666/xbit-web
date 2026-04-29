import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'

export const useActiveWallet = () => {
  // const { activeChain, activeAccount, wallets } = useAppSelector((state) => state.wallet)
  //
  // return useMemo(() => {
  //   if (activeAccount === TYPE_ACCOUNT.TELEGRAM) {
  //     return wallets?.[activeChain]?.telegram
  //   }
  //   return wallets?.[activeChain]?.chain
  // }, [activeChain, activeAccount, wallets])
  return useSelector(_activeWallet)
}
