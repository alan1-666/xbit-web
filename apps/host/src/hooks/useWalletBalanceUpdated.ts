import { useSubscription } from '@/lib/mqtt'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { _userInfo } from '@/redux/modules/newAuth.slice.ts'

export interface UseWalletBalanceUpdatedSubscriptionOptions {
  onWalletBalanceUpdated: () => void
}

export const useWalletBalanceUpdated = (options: UseWalletBalanceUpdatedSubscriptionOptions) => {
  const { onWalletBalanceUpdated } = options
  const userId = useSelector(_userInfo)?.userId as string
  const { message: messageWalletBalanceUpdate } = useSubscription(`users/${userId}/wallet_balance_updated`)
  useEffect(() => {
    if (!messageWalletBalanceUpdate) return
    const message = messageWalletBalanceUpdate?.message
    if (message) {
      onWalletBalanceUpdated()
    }
  }, [messageWalletBalanceUpdate])
}
