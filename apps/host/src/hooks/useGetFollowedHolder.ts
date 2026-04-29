import { useQuery } from '@apollo/client'
import { GetFollowedHolderResponse } from '@/types/responses.ts'
import { getFollowedHolder } from '@services/tokens.service.ts'
import { HolderInput } from '@/@generated/gql/graphql-core.ts'
import { gqlClient } from '@/lib/gql/apollo-client.ts'

type useGetHoldersProps = {
  input: HolderInput
  skip?: boolean
}

const useGetFollowedHolders = (props: useGetHoldersProps) => {
  const { input, skip } = props

  const {data, loading, error} = useQuery<GetFollowedHolderResponse>(getFollowedHolder, {
    client: gqlClient,
    skip,
    variables: {
      input
    }
  })

  return {data, error, loading}
}

export default  useGetFollowedHolders
