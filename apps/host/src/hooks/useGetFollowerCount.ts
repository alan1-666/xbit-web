import { useQuery } from '@apollo/client'
import { hypertraderClient } from '@/lib/gql/apollo-client'
import { GET_FOLLOWER_COUNT } from '@/services/hypertrader.service'

type Resp = {
  getFollowerCount: {
    userAddress: string
    count: number
  }
}

export const useGetFollowerCount = ({
  userAddress,
  skipCondition = false,
}: {
  userAddress?: string
  skipCondition?: boolean
}) => {
  const { data, loading, error, ...queryProps } = useQuery<Resp>(GET_FOLLOWER_COUNT, {
    client: hypertraderClient,
    skip: skipCondition || !userAddress,
    variables: { userAddress: userAddress ?? '' },
    fetchPolicy: 'cache-first',
  })

  return {
    data: data?.getFollowerCount,
    loading,
    error,
    ...queryProps,
  }
}
