import { PortfolioDTO } from '@/types/holding.ts'
import { BaseTokenBalanceCell } from '@pages/assets/overview/components/BaseTokenBalanceCell.tsx'
import { useNativeTokenPrice } from '@pages/assets/overview/hooks/useNativeTokenPrice.ts'
import { useMemo } from 'react'

export interface NativeTokenBalanceCellProps {
  token: PortfolioDTO
}
export const NativeTokenBalanceCell = (props: NativeTokenBalanceCellProps) => {
  const { token } = props
  const price = useNativeTokenPrice(token.token, token.chainId, token.price || 0)
  const balance = useMemo(() => {
    return token.totalBaseAmount * price
  }, [token, price])
  return <BaseTokenBalanceCell totalBaseAmount={token.totalBaseAmount} totalUsdValue={balance} />
}
