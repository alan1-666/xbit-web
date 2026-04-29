import { useCLOBAllowanceAndSync } from '../../hooks/useCLOBAllowanceAndSync'

export interface AutoSyncClobAllowanceProps {
  tokenId: string
}

export const AutoSyncClobAllowance = ({ tokenId }: AutoSyncClobAllowanceProps) => {
  useCLOBAllowanceAndSync({
    tokenId,
    forceRefresh: false,
  })
  return null
}