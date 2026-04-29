import { useQuery } from '@apollo/client'
import { hypertraderClient } from '@/lib/gql/apollo-client'
import { getUserPositionHoldingTime } from '@/services/hypertrader.service'

export type UserPositionHoldingTimeRow = {
  id: number
  userAddress: string
  coin: string
  timeSum: number
  totalHoldingTime: number
  status: 'open' | 'closed'
  updatedAt: string
  createdAt: string
}

type Resp = {
  getUserPositionHoldingTime: UserPositionHoldingTimeRow[]
}

export const useGetUserPositionHoldingTime = ({
  userAddress,
  skipCondition = false,
}: {
  userAddress?: string
  skipCondition?: boolean
}) => {
  const { data, loading, error } = useQuery<Resp>(getUserPositionHoldingTime, {
    client: hypertraderClient,
    skip: skipCondition || !userAddress,
    variables: { userAddress: userAddress ?? '' },
    fetchPolicy: 'cache-first',
  })

  return {
    data: data?.getUserPositionHoldingTime ?? [],
    loading,
    error,
  }
}
