import { useMutation } from '@tanstack/react-query'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { addToBlacklist } from '@services/blacklist.service.ts'
import { UserBlacklistType } from '@/@generated/gql/graphql-future.ts'
import { useActiveChainType } from '@hooks/useActiveChain.ts'

export const useAddTokensBlacklistAddresses = () => {
  const chainType = useActiveChainType()
  return useMutation({
    mutationFn: async (tokens: string[]) => {
      await futureClient.mutate({
        mutation: addToBlacklist,
        variables: {
          req: {
            addresses: tokens,
            type: UserBlacklistType.Token,
            chain: chainType,
          },
        },
      })
    },
  })
}

export const useAddDevsBlacklistAddresses = () => {
  const chainType = useActiveChainType()
  return useMutation({
    mutationFn: async (devs: string[]) => {
      await futureClient.mutate({
        mutation: addToBlacklist,
        variables: {
          req: {
            addresses: devs,
            type: UserBlacklistType.Dev,
            chain: chainType,
          },
        },
      })
    },
  })
}
