import { ChainIds } from '@/types/enums.ts'
import { ChainType } from '@/@generated/gql/graphql-trading.ts'
import { useQuery } from '@tanstack/react-query'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { getBundle } from '@services/tokens.service.ts'
import { Query } from '@/@generated/gql/graphql-future.ts'

export interface UseBundlerHoldingsOptions {
  token: string
  chainId: number
}

const getChainType = (chainId: number) => {
  switch (chainId) {
    case ChainIds.Ethereum:
      return ChainType.Evm
    case ChainIds.Bsc:
      return ChainType.Bsc
    default:
      return ChainType.Solana
  }
}

export const useBundlerHoldings = (props: UseBundlerHoldingsOptions) => {
  const { token, chainId } = props
  const chainType = getChainType(chainId)
  return useQuery({
    queryKey: ['bundler-holdings', token, chainId],
    queryFn: async () => {
      const res = await futureClient.query({
        query: getBundle,
        variables: {
          input: {
            token,
            chain: chainType,
          }
        },
      })
      const data = res.data as Pick<Query, 'getBundle'>
      return data.getBundle
    },
    enabled: !!token && !!chainId,
  })
}
