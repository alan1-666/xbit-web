import { useMutation } from '@tanstack/react-query'
import { SupportedExternalWalletProvider } from '@/@generated/gql/graphql-user.ts'
import { userGqlClient } from '@/lib/gql/apollo-client.ts'
import { createServiceExternalWallet } from '@/modules/prediction/gql/prediction.gql.ts'
import { useDispatch } from 'react-redux'
import { predictionActions } from '@/modules/prediction/slices/prediction.slice.ts'

export const useCreateExternalWalletMutation = () => {
  const dispatch = useDispatch()
  return useMutation({
    mutationKey: ['enable-trading'],
    mutationFn: async () => {
      const res = await userGqlClient.mutate({
        mutation: createServiceExternalWallet,
        variables: {
          input: {
            chain: 'polygon',
            provider: SupportedExternalWalletProvider.Polymarket,
            // signature,
          },
        },
      })
      return res.data?.createServiceExternalWallet
    },
    onSuccess: (data) => {
      console.log('External wallet created successfully:', data)
      const proxyWalletAddress = data?.walletAddress
      if (proxyWalletAddress) {
        dispatch(predictionActions.setCurrentProxyWallet(proxyWalletAddress))
      }
    },
  })
}
