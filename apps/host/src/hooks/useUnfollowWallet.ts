import { useMutation } from '@tanstack/react-query'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { unFollowWallet } from '@services/wallet.service.ts'
import { MutationUnFollowWalletArgs } from '@/@generated/gql/graphql-future.ts'

export const useUnfollowWalletMutation = () => {
  return useMutation({
    mutationKey: ['unfollowWallet'],
    mutationFn: (req: MutationUnFollowWalletArgs['req']) => {
      console.log('Unfollowing wallet with request:', req)
      return futureClient.mutate({
        mutation: unFollowWallet,
        variables: {
          input: req,
        },
      })
    },
  })
}
