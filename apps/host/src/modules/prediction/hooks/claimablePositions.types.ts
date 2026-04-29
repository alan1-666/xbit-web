import { ClaimablePositionDto, ClaimablePositionsResponseDto } from '@/@generated/gql/graphql-xpUser'

export interface ClaimablePositionsData {
  marketsWon: number
  totalReturn: number
  proceeds: number
  images: string[]
  raw: ClaimablePositionsResponseDto | undefined
  claim: (targetPositionKeys?: string[]) => Promise<ClaimResults>
  isClaiming: boolean
  claimingStatuses: Record<string, ClaimStatus>
  claimingErrors: Record<string, string>
  resetClaimingStatuses: () => void
}

export interface ClaimResults {
  batchId?: string
  total: number
  succeeded: Array<{ position: ClaimablePositionDto; txHash?: string }>
  failed: Array<{ position: ClaimablePositionDto; error: string }>
}

export type ClaimStatus = 'idle' | 'claiming' | 'succeeded' | 'failed'

export type FilteredClaimableData = {
  totalClaimable: number
  totalValue: number
  positions: ClaimablePositionDto[]
}
