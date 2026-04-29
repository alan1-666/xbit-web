import { MemeDto, TokenStatisticDto } from '@/@generated/gql/graphql-core.ts'
import { formatPriceChange } from '@/lib/number.ts'

export interface TokenPriceChangeProps {
  token: TokenStatisticDto | MemeDto
  timeframe: string
}

export const TokenPriceChange = (props: TokenPriceChangeProps) => {
  const { token, timeframe } = props
  type PriceChange = 'price1mChange' | 'price5mChange' | 'price1hChange' | 'price6hChange' | 'price24hChange'
  const key = `price${timeframe}Change` as PriceChange
  const priceChange = +token[key]
  const formatted = formatPriceChange(priceChange)
  const isPositive = priceChange >= 0.01
  let color
  if (priceChange > 0.01) {
    color = 'text-rise'
  } else if (priceChange < -0.01) {
    color = 'text-fall'
  } else {
    color = 'text-neutral'
  }
  return (
    <span className={color}>
      {isPositive ? '+' : ''}
      {formatted}
    </span>
  )
}
