import { useMutation } from '@tanstack/react-query'
import { userGqlClient } from '@/lib/gql/apollo-client.ts'
import { createServiceExternalWallet } from '@/modules/prediction/gql/prediction.gql.ts'
import { SupportedExternalWalletProvider } from '@/@generated/gql/graphql-user.ts'

export const useCreateProxyWallet = () => {
  return useMutation({
    mutationKey: ['create-proxy-wallet'],
    mutationFn: async () => {
      const res = await userGqlClient.mutate({
        mutation: createServiceExternalWallet,
        variables: {
          input: {
            chain: 'polygon',
            provider: SupportedExternalWalletProvider.Polymarket,
          },
        },
      })
      return res.data?.createServiceExternalWallet?.walletAddress as string | undefined
    },
  })
}
