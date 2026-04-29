import { PortfolioDTO } from '@/types/holding.ts'
import { BaseTokenPriceCell } from '@pages/assets/overview/components/BaseTokenPriceCell.tsx'
import { useNativeTokenPrice } from '@pages/assets/overview/hooks/useNativeTokenPrice.ts'

export interface NativeTokenPriceCellProps {
  token: PortfolioDTO
}

export const NativeTokenPriceCell = (props: NativeTokenPriceCellProps) => {
  const { token } = props
  const price = useNativeTokenPrice(token.token, token.chainId, token.price || 0)
  return <BaseTokenPriceCell price={price} price24hChange={token.price24hChange} showPriceChange={false} />
}
