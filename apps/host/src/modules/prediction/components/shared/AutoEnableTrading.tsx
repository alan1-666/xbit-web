import { useDispatch } from 'react-redux'
import { useProxyWallet } from '@/modules/prediction/hooks/useProxyWallet.ts'
import { useEffect } from 'react'
import { fetchProxyWallet } from '@/modules/prediction/slices/prediction.slice.ts'
import { AppDispatch } from '@/redux/store'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { FeatureFlags } from '@const/featureFlags.ts'

export const AutoEnableTrading = () => {
  const dispatch = useDispatch<AppDispatch>()
  const proxyWallet = useProxyWallet()
  const activeWallet = useActiveWallet()
  const moduleEnabled = useFeatureIsOn(FeatureFlags.ENABLE_PREDICTION_MODULE)
  useEffect(() => {
    if (!proxyWallet && activeWallet.isConnected && moduleEnabled) {
      dispatch(fetchProxyWallet())
    }
  }, [dispatch, proxyWallet, activeWallet.isConnected, moduleEnabled])
  return null
}
