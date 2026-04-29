import { useQuery } from '@apollo/client'
import { getTokenOfficialInformation } from '@services/tokens.service.ts'
import { TokenOfficialInformationResponse } from '@/types/responses.ts'
import { gqlClient } from '@/lib/gql/apollo-client.ts'
import { ChainIds } from '@/types/enums.ts'

type useGetTokenOfficialInformationProps = {
  address: string
  chainId?: number
}

export const useGetTokenOfficialInformation = ({
  address,
  chainId = ChainIds.Solana,
}: useGetTokenOfficialInformationProps) => {
  const { data, loading, error } = useQuery<TokenOfficialInformationResponse>(getTokenOfficialInformation, {
    client: gqlClient,
    skip: !address || !chainId,
    variables: {
      address,
      chainId,
    },
  })

  return { data: data?.getTokenOfficialInformation, loading, error }
}
