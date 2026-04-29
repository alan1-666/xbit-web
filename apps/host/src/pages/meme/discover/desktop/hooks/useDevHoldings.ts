import { useQuery } from '@tanstack/react-query'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { getDevHoldings } from '@services/tokens.service.ts'
import { ChainIds } from '@/types/enums.ts'
import { ChainType } from '@/@generated/gql/graphql-future.ts'
import { convertToChainTypeFromChainId } from '@/utils/chain'

export const useDevHoldings = (options: { creator: string; chainId: number }) => {
  const { creator, chainId } = options
  return useQuery({
    queryKey: ['dev-holdings', creator],
    enabled: !!creator,
    queryFn: async () => {
      const res = await futureClient.query({
        query: getDevHoldings,
        variables: {
          input: {
            address: creator,
            chain: convertToChainTypeFromChainId(chainId),
          },
        },
      })
      return res.data.getDevHold
    },
  })
}
