import { OhlcInput } from '@/@generated/gql/graphql-meme2'
import { gqlMeme2 } from '@/lib/gql/apollo-client'
import { getOHLCWithUsdVolumeQuery } from '@/services/pairs.service'
import { useQuery } from '@apollo/client'

interface UseOHLCWithUsdVolumeArgs {
  variables: {
    input: OhlcInput
  }
  skip: boolean
}

export const useOHLCWithUsdVolume = ({ variables, skip }: UseOHLCWithUsdVolumeArgs) => {
  return useQuery(getOHLCWithUsdVolumeQuery, {
    client: gqlMeme2,
    variables,
    skip,
    fetchPolicy: 'no-cache',
  })
}
