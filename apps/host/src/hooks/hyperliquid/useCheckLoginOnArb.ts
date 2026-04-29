import { _userInfo } from '@/redux/modules/newAuth.slice'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useSelector } from 'react-redux'

export function useCheckLoginOnArb(): boolean {
  
  const userInfo = useSelector(_userInfo)
  const activeWallet = useSelector(_activeWallet)
  const hasValidUserId = userInfo?.userId && typeof userInfo.userId === 'string' && userInfo.userId.trim() !== ''
  const isWalletConnected = activeWallet?.isConnected === true

  return !!(hasValidUserId && isWalletConnected)
}