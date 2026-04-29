import { PortfolioDTO } from '@/types/holding.ts'
import { BaseTokenPriceCell } from '@pages/assets/overview/components/BaseTokenPriceCell.tsx'
import { useMemo } from 'react'
import {useMemeTokenPrice} from "@hooks/useTokenPrice.ts";

export interface MemeTokenPriceCellProps {
  token: PortfolioDTO
}

export const MemeTokenPriceCell = (props: MemeTokenPriceCellProps) => {
  const { token } = props

  const realtimePrice = useMemeTokenPrice(token.token, token.price)

  const price = useMemo(() => {
    if (realtimePrice) return realtimePrice
    return token.price
  }, [token, realtimePrice])

  return <BaseTokenPriceCell price={price} price24hChange={token.price24hChange} showPriceChange={true} />
}
