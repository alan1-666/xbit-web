import { useMutation } from '@tanstack/react-query'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { removeFromBlacklist } from '@services/blacklist.service.ts'
import { BlacklistAddressReq, UserBlacklistType } from '@/@generated/gql/graphql-future.ts'
import { useActiveChainType } from '@hooks/useActiveChain.ts'

export const useRemoveBlacklistTokensMutation = () => {
  const chain = useActiveChainType()
  return useMutation({
    mutationFn: async (tokens: string[]) => {
      await futureClient.mutate({
        mutation: removeFromBlacklist,
        variables: {
          req: {
            addresses: tokens,
            type: UserBlacklistType.Token,
            chain: chain,
          },
        },
      })
    },
  })
}

export const useRemoveBlacklistDevsMutation = () => {
  const chain = useActiveChainType()
  return useMutation({
    mutationFn: async (devs: string[]) => {
      await futureClient.mutate({
        mutation: removeFromBlacklist,
        variables: {
          req: {
            addresses: devs,
            type: UserBlacklistType.Dev,
            chain: chain,
          },
        },
      })
    },
  })
}

export const useRemoveBlacklistAddressesMutation = () => {
  const chain = useActiveChainType()
  return useMutation({
    mutationFn: async (options: { tokens?: BlacklistAddressReq[]; devs?: BlacklistAddressReq[] }) => {
      const { devs, tokens } = options

      await Promise.all([
        devs?.length
          ? futureClient.mutate({
              mutation: removeFromBlacklist,
              variables: {
                req: {
                  addresses: devs.map((item) => item.address),
                  type: UserBlacklistType.Dev,
                  chain: chain,
                },
              },
            })
          : Promise.resolve(),
        tokens?.length
          ? futureClient.mutate({
              mutation: removeFromBlacklist,
              variables: {
                req: {
                  addresses: tokens.map((item) => item.address),
                  type: UserBlacklistType.Token,
                  chain: chain,
                },
              },
            })
          : Promise.resolve(),
      ])
    },
  })
}
