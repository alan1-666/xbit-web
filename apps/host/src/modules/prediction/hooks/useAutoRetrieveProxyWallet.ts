// Auto-enable trading disabled — user must manually enable via EnableTradingButton
// import { useProxyWallet } from '@/modules/prediction/hooks/useProxyWallet.ts'
// import { useEffect } from 'react'
// import { useCreateExternalWalletMutation } from '@/modules/prediction/hooks/useCreateExternalWalletMutation.ts'
//
// export const useAutoRetrieveProxyWallet = () => {
//   const proxyWallet = useProxyWallet()
//   const mutation = useCreateExternalWalletMutation()
//   useEffect(() => {
//     if (proxyWallet) return
//     mutation.mutate()
//   }, [proxyWallet])
// }
