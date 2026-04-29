import { gqlMeme2 } from '@/lib/gql/apollo-client'
import { getTokenDetailMCAndPrice } from '@/services/tokens.service'
import { ChainIds } from '@/types/enums'
import { useQuery } from '@apollo/client'

export const useMemeTokenDetailMCAndPrice = (tokenAddress: string, chainId: ChainIds) => {
  return useQuery(getTokenDetailMCAndPrice, {
    variables: { input: { address: tokenAddress, chainId } },
    client: gqlMeme2,
    skip: !tokenAddress || !chainId,
  })
}
