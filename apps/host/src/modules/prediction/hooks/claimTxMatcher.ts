import type { PendingClaim } from '@/redux/modules/predictionClaimedBalance.slice'

const normalizeTxIdentifier = (value: string) => value.trim().toLowerCase()

export const findPendingClaimByTxIdentifiers = (
  pendingClaims: PendingClaim[],
  identifiers: Array<string | undefined | null>,
) => {
  const normalizedIdentifiers = identifiers
    .filter((identifier): identifier is string => Boolean(identifier))
    .map(normalizeTxIdentifier)

  if (normalizedIdentifiers.length === 0) return undefined

  return pendingClaims.find((claim) => normalizedIdentifiers.includes(normalizeTxIdentifier(claim.transactionHash)))
}
