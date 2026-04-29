import { Ohlc } from '@/types/ohlc.ts'
import { OrderDTO, PortfolioDTO } from '@/types/holding.ts'
import { TokenTrending } from '@/types/token.ts'
import { PopularToken } from '@/types/popularToken.ts'
import { Category, CategoryStatistics, CategoryToken } from '@/types/category.ts'
import { SmartMoneyAction } from './tokenDetail'
import { AssetChartItemDto,  LiquidityChartDto, PortfolioAddressMetadata, TokenSniperDto } from '@/@generated/gql/graphql-core.ts'
import { AssetHistoryDto } from '@/@generated/gql/graphql-core.ts'
import { AiAnalyticDto, SmartMoneyDto, TokenOfficialInformation } from '@/@generated/gql/graphql-core.ts'
import { Order } from '@/@generated/gql/graphql-trading.ts'
import { FollowingWalletInfo, MemePagination } from '@/@generated/gql/graphql-future'
import { HolderDto,PoolTransactionPagination, TransactionDto, LastTransaction } from '@/@generated/gql/graphql-meme2.ts'

export interface GraphQLErrorItem {
  message: string
  path: string[]
  extensions: {
    code: string
    meta: any | null
  }
}

export type GeneralResponse<K extends string, V> = {
  [key in K]: V
} & {
  errors: GraphQLErrorItem[]
}

export type GetOHLCResponse = {
  getOHLC: Ohlc[]
}

export interface PortfolioResponse {
  getPortfolio: {
    limit: number
    page: number
    data: PortfolioDTO[]
    addressMetadata: PortfolioAddressMetadata
  }
  errors: GraphQLErrorItem[]
}

export interface OrderResponse {
  createOrder: OrderDTO
  errors: GraphQLErrorItem[]
}

export interface SearchTokenResponse {
  searchToken: TokenTrending[]
}

export interface GetTokenTrendingResponse {
  getTokenTrending: {
    page: number
    limit: number
    data: TokenTrending[]
  }
  errors: GraphQLErrorItem[]
}

export interface GetPopularTokenResponse {
  getPopularTokens: PopularToken[]
}

export interface GetAllCategoriesInput {
  input: {
    chainId: number
  }
}

export interface GetAllCategoriesResponse {
  getAllCategories: {
    data: Category[]
  }
  errors: GraphQLErrorItem[]
}

export interface GetCategoryStatisticsResponse {
  getCategoryStatistic: CategoryStatistics
  errors: GraphQLErrorItem[]
}

export interface GetTokensByCategoryResponse {
  tokensByCategory: {
    page: number
    limit: number
    data: CategoryToken[]
  }
}

export interface GetSmartMoneyResponse {
  getSmartMoneyActions: {
    actions: SmartMoneyAction[]
  }
}

export interface GetTokenSnipersResponse {
  getTokenSniper: TokenSniperDto
}

export interface GetAllAssetHistoryResponse {
  collapse: AssetHistoryDto[]
  expand: AssetHistoryDto[]
}

export interface AiAnalyticResponse {
  getAiAnalyzedInfo: AiAnalyticDto
}

export interface TokenOfficialInformationResponse {
  getTokenOfficialInformation: TokenOfficialInformation
}

export interface GetTokenSnipersResponse {
  getTokenSniper: TokenSniperDto
}

export interface GetFollowingSmartMoneysResponse {
  getFollowingSmartMoneys: SmartMoneyDto[]
}

export interface GetTotalFollowingAddressResponse {
  getFollowingWallets: FollowingWalletInfo[]
}

export interface GetLastTransactionsResponse {
  lastTransactions: {
    data: LastTransaction[]
    fromTimestamp: number
  }
}

export type GetMemeOutput = {
  getMemeToken: MemePagination
}

export interface GetFollowedTransactionsResponse {
  getFollowedTransactions: {
    data: TransactionDto[]
    fromTimestamp: number
  }
}

export interface GetAiAnalyzedInfoResponse {
  getAiAnalyzedInfo: AiAnalyticDto
}

export interface GetFollowedHolderResponse {
  getFollowedHolder: {
    page: number
    limit: number
    data: HolderDto[]
  }
}

export interface GetHoldersResponse {
  getHolder: {
    page: number
    limit: number
    data: HolderDto[]
  }
}

export interface GetHolderChartsResponse {
  getHolderChart: {
    numberOfHolderHistory: number[]
    top10HolderHistory: number[]
    averageHoldingPerWalletHistory: number[]
    insiderHoldingHistory: number[]
    phishingWalletHistory: number[]
    bundleHistory: number[]
    botHistory: number[]
    newWalletHistory: number[]
    inactiveWalletHistory: number[]
    steps: number[]
  }
}

export interface GetHolderStatisticsResponse {
  getTop100HolderStatistic: {
    totalHoldingPct: number
    averageBuyPrice: number
    averageBuyPrice24hChangePct: number
    averageSellPrice: number
    averageSellPrice24hChangePct: number
  }
}

export interface GetAssetChartResponse {
  getAssetChartPreview: AssetChartItemDto[]
  getAssetChart: AssetChartItemDto[]
}

export type TokenPrices = {
  token: string
  price: number
  chainId: number
}

export interface GetPricesResponse {
  getPrices: TokenPrices[]
}

export interface GetUncompletedOrdersResponse {
  getUncompletedOrders: {
    total: number
    orders: Order[]
  }
}

export interface GetPoolTransactionsResponse {
  getPoolTransactions: PoolTransactionPagination
}

export interface GetLiquidityChartResponse {
  getLiquidityChart: LiquidityChartDto[]
}

export interface GetPortfolioManyWalletResponse {
  getPortfolioManyWallet: {
    data: {
      data: PortfolioDTO[]
      totalHoldingTokens: number
    }[]
  }
}
