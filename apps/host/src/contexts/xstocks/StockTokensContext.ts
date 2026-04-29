import { createContext } from 'react'
import { TokensStatisticByCategoryDto } from '@/@generated/gql/graphql-meme2.ts'

export interface StockTokensContextProps {
  tokens: TokensStatisticByCategoryDto[]
  isLoading: boolean
}

export const StockTokensContext = createContext<StockTokensContextProps>({
  tokens: [],
  isLoading: false,
})
