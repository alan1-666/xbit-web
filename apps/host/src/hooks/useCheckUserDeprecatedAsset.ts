import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { gqlClient } from '@/lib/gql/apollo-client.ts'
import { checkUserDeprecatedAsset, confirmAssetBackup } from '@services/assets.service.ts'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'

export const useConfirmAssetBackup = () => {
  const activeWallet = useActiveWallet()
  const qc = useQueryClient()
  const walletAddress = activeWallet?.walletAddress ?? null

  return useMutation({
    mutationKey: ['confirmAssetBackup', activeWallet?.walletAddress ?? 'no-wallet'],
    mutationFn: async () => {
      if (!activeWallet?.isConnected) {
        throw new Error('Wallet is not connected')
      }

      return await gqlClient.mutate({
        mutation: confirmAssetBackup,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['checkUserDeprecatedAsset', walletAddress] })
    },
  })
}

const useCheckUserDeprecatedAsset = () => {
  const activeWallet = useActiveWallet()
  const walletAddress = activeWallet?.walletAddress ?? null

  return useQuery({
    queryKey: ['checkUserDeprecatedAsset', walletAddress],
    enabled: activeWallet.isConnected,
    queryFn: async () => {
      const response = await gqlClient.query({
        query: checkUserDeprecatedAsset,
        fetchPolicy: 'network-only',
      })
      return response?.data
    },
  })
}
export default useCheckUserDeprecatedAsset
