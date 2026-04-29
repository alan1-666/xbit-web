import { CategoryDto } from '@/@generated/gql/graphql-meme2.ts'

export type TopGainer = {
  logoUrl: string | null
  name: string | null
  price24hChange: number | null
  symbol: string | null
}

export type Category = CategoryDto

export type CategoryStatistics = {
  marketCap: number | null
  volume24h: number | null
  price24hChange: number | null
  priceUpCount: number
  priceDownCount: number
  tokensCount?: number
}

export type CategoryToken = {
  address: string | null
  marketCap: string | null
  volume24h: string | null
  price24hChange: string | null
  chainId: string | null
  name: string | null
  logoUrl: string | null
  price: string | null
  symbol: string
  liquidity: string | null | undefined
  isFavorite: boolean | null
}
