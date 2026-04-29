import { useQuery } from '@apollo/client'
import { hypertraderClient } from '@/lib/gql/apollo-client'
import { GET_FOLLOWED_ADDRESSES_LATEST_POSITIONS } from '@/services/hypertrader.service'

export type FollowedLatestPosition = {
  address: string
  coin: string
  createdAt: string
  updatedAt: string

  px?: string | number | null
  side?: string | null
  time: number
  startPosition?: string | number | null
  dir?: string | null
  closedPnl?: string | number | null

  hash?: string | null
  oid?: string | number | null
  tid?: string | number | null
  crossed?: boolean | null
  fee?: string | number | null
  twapId?: string | number | null

  positionType: string
  szi: string | number
  leverageType: 'cross' | 'isolated' | string
  leverageValue: number
  entryPx?: string | number | null
  positionValue?: string | number | null
  unrealizedPnl?: string | number | null
  returnOnEquity?: string | number | null
  liquidationPx?: string | number | null
  marginUsed?: string | number | null
  maxLeverage?: number | null
  openTime?: string | null
  cumFundingAllTime?: string | number | null
  cumFundingSinceOpen?: string | number | null
  cumFundingSinceChange?: string | number | null
  accountValue?: string | number | null
  crossMaintenanceMarginUsed?: string | number | null
  crossMarginRatio?: number | null
}

type Resp = {
  getFollowedAddressesLatestPositions: {
    totalCount: number
    positions: FollowedLatestPosition[]
  }
}

type Vars = {
  groupId: string
}

export function useGetFollowedAddressesLatestPositions(args: { groupId?: string; enabled?: boolean }) {
  const { groupId, enabled = true } = args
  const shouldRun = enabled && !!groupId

  const query = useQuery<Resp, Vars>(GET_FOLLOWED_ADDRESSES_LATEST_POSITIONS, {
    client: hypertraderClient,
    variables: shouldRun ? { groupId: groupId as string } : (undefined as any),
    skip: !shouldRun,
    fetchPolicy: 'no-cache',
    nextFetchPolicy: 'no-cache',
    pollInterval: shouldRun ? 30_000 : 0,
    notifyOnNetworkStatusChange: true,
  })

  return {
    ...query,
    refetch: query.refetch,
  }
}