export type ClaimBatchSummary = {
  total: number
  succeeded: number
}

type ClaimBatch = {
  total: number
  resolved: number
  succeeded: number
  processedTxHashes: Set<string>
}

type RegisterClaimBatchParams = {
  batchId: string
  total: number
  preResolved: number
  txHashes: string[]
}

type TrackClaimTxResultParams = {
  txHash: string
  isSuccess: boolean
}

const claimBatches = new Map<string, ClaimBatch>()
const txHashToBatchId = new Map<string, string>()

const cleanupBatchTxHashes = (batchId: string) => {
  for (const [txHash, mappedBatchId] of txHashToBatchId.entries()) {
    if (mappedBatchId === batchId) {
      txHashToBatchId.delete(txHash)
    }
  }
}

const completeBatchIfDone = (batchId: string): ClaimBatchSummary | null => {
  const batch = claimBatches.get(batchId)
  if (!batch || batch.resolved < batch.total) return null

  const summary: ClaimBatchSummary = {
    total: batch.total,
    succeeded: Math.min(batch.succeeded, batch.total),
  }

  claimBatches.delete(batchId)
  cleanupBatchTxHashes(batchId)
  return summary
}

export const createClaimBatchId = () => `claim-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

export const registerClaimBatch = ({
  batchId,
  total,
  preResolved,
  txHashes,
}: RegisterClaimBatchParams): ClaimBatchSummary | null => {
  if (total <= 0) return null

  if (claimBatches.has(batchId)) {
    claimBatches.delete(batchId)
    cleanupBatchTxHashes(batchId)
  }

  claimBatches.set(batchId, {
    total,
    resolved: Math.min(Math.max(preResolved, 0), total),
    succeeded: 0,
    processedTxHashes: new Set<string>(),
  })

  for (const txHash of txHashes) {
    if (txHash) {
      txHashToBatchId.set(txHash, batchId)
    }
  }

  return completeBatchIfDone(batchId)
}

export const trackClaimTxResult = ({ txHash, isSuccess }: TrackClaimTxResultParams): ClaimBatchSummary | null => {
  if (!txHash) return null

  const batchId = txHashToBatchId.get(txHash)
  if (!batchId) return null

  const batch = claimBatches.get(batchId)
  if (!batch) {
    txHashToBatchId.delete(txHash)
    return null
  }

  if (batch.processedTxHashes.has(txHash)) return null

  batch.processedTxHashes.add(txHash)
  batch.resolved += 1
  if (isSuccess) {
    batch.succeeded += 1
  }

  txHashToBatchId.delete(txHash)
  return completeBatchIfDone(batchId)
}
