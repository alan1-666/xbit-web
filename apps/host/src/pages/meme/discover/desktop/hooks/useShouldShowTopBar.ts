import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import { useAppSelector } from '@/redux/store'
import { useLocation } from 'react-router-dom'

export const useShouldShowTopBar = () => {
  const activeWallet = useActiveWallet()
  const isShown = useAppSelector((state) => state.home.showTopBar)
  const location = useLocation()
  const isMemeOrXStock = location.pathname.startsWith('/meme') || location.pathname.startsWith('/xstock')
  return activeWallet.isConnected && isShown && isMemeOrXStock
}
