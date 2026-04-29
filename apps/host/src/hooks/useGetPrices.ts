import { ChainIds } from '@/types/enums.ts'
import { useQuery } from '@apollo/client'
import { GetPricesResponse } from '@/types/responses.ts'
import { getPrices } from '@services/tokens.service.ts'
import { gqlMeme2 } from '@/lib/gql/apollo-client.ts'

type useGetPricesProps = {
  tokens: string[]
  chainId: ChainIds
  skipCondition?: boolean
}

const useGetPrices = ({ tokens, chainId, skipCondition }: useGetPricesProps) => {
  const {data, error, loading} = useQuery<GetPricesResponse>(getPrices, {
    client: gqlMeme2,
    fetchPolicy: 'cache-first',
    variables: {
      tokens,
      chainId
    },
    skip: skipCondition
      || !tokens?.length
      || tokens?.length <= 0
      || (tokens?.length === 1 && tokens[0] === '')
      || !chainId,
  })

  return {data, error, loading}
}

export default useGetPrices