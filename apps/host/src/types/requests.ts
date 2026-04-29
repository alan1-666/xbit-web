import { AssetHistoryInput } from '@/@generated/gql/graphql-core.ts'

export type GeneralInput<T> = {
  input: T
}

export type GetCategoryStatisticsInput = {
  input: {
    categoryId: string
    chainId: number
  }
}

export type GetTokensByCategoryInput = {
  input: {
    categoryId: string
    chainId: number
    limit?: number
    page?: number
    sortBy: 'MarketCap' | 'Price' | 'Price24hChange' | 'Volume24h'
    sortType: 'desc' | 'asc'
  }
}

export type GetAllAssetHistoryInput = {
  collapseInput: AssetHistoryInput
  expandInput: AssetHistoryInput
}
