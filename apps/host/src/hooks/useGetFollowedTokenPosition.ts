import { useQuery } from '@apollo/client'
import { hypertraderClient } from '@/lib/gql/apollo-client'
import { GET_FOLLOWED_ADDRESSES_POSITIONS_QUERY } from '@/services/hypertrader.service'

export type FollowedPosition = {
  address: string
  coin: string
  positionType: 'long' | 'short' | string
  leverageType?: string | null
  leverageValue?: number | null
  entryPx?: string | number | null
  liquidationPx?: string | number | null
  positionValue?: string | number | null
  unrealizedPnl?: string | number | null
  marginUsed?: string | number | null
  returnOnEquity?: string | number | null
  crossMarginRatio?: string | number | null
  szi?: number | string | undefined
}

export type PositionGroup = {
  coin: string
  addressCount: number
  positionCount: number
  totalSzi?: string | null
  totalPositionValue?: string | null
  totalUnrealizedPnl?: string | null
  totalMarginUsed?: string | null
  avgLeverage?: number | null
  longPositionValue?: string | null
  shortPositionValue?: string | null
  longAvgLeverage?: number | null
  shortAvgLeverage?: number | null
  totalDiffPositionValue?: string | null
  positions: FollowedPosition[]
}

export type GetFollowedAddressesPositionsResp = {
  getFollowedAddressesPositions: {
    totalAddresses: number
    totalPositions: number
    lastUpdated: string
    positionGroups: PositionGroup[]
  }
}

export function useGetFollowedTokenPosition(args?: {
  enabled?: boolean
  groupId?: string
}) {
  const enabled = args?.enabled ?? true
  const groupId = args?.groupId
  const shouldRun = enabled && !!groupId


  const query = useQuery<GetFollowedAddressesPositionsResp>(GET_FOLLOWED_ADDRESSES_POSITIONS_QUERY, {
    client: hypertraderClient,
    skip: !shouldRun,
    variables: { groupId: groupId as string },
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'network-only',
    pollInterval: enabled ? 30_000 : 0,
    notifyOnNetworkStatusChange: true,
  })

  return {
    ...query,
    refetch: query.refetch,
  }
}
