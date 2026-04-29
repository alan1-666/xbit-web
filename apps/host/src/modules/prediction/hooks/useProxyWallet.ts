import { useAppSelector } from '@/redux/store'
import { predictionSelectors } from '@/modules/prediction/slices/prediction.slice'
import { useMemo } from 'react'
import { getAddress } from 'ethers'
import ls from '@/lib/local-storage'

const PROXY_WALLET_STORAGE_KEY = 'polymarketProxyWallet'

export const clearProxyWalletCache = () => ls.remove(PROXY_WALLET_STORAGE_KEY)

export const useProxyWallet = () => {
  const wallet = useAppSelector(predictionSelectors.selectCurrentProxyWallet)
  return useMemo(() => {
    if (!wallet) return ''
    return getAddress(wallet)
  }, [wallet])
}
