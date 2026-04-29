import { PortfolioDTO } from '@/types/holding.ts'
import { BaseTokenBalanceCell } from '@pages/assets/overview/components/BaseTokenBalanceCell.tsx'
import { useMemeTokenPrice } from '@hooks/useTokenPrice.ts'
import { useMemo } from 'react'

export interface MemeTokenBalanceCellProps {
  token: PortfolioDTO
}

export const MemeTokenBalanceCell = (props: MemeTokenBalanceCellProps) => {
  const { token } = props
  const realtimePrice = useMemeTokenPrice(token.token, token.price)

  const price = useMemo(() => {
    if (realtimePrice) return realtimePrice
    return token.price
  }, [token, realtimePrice])

  const balance = useMemo(() => {
    return token.totalBaseAmount * price
  }, [token, price])

  return <BaseTokenBalanceCell totalBaseAmount={token.totalBaseAmount} totalUsdValue={balance} excluded={token.lowLiquidity} />
}
