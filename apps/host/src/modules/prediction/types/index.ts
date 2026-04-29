import {
  PriceHistoryFilter,
  QueryGetEventsArgs,
  OrderBookInput,
  QueryGetCommentsArgs,
  QueryGetMarketsArgs,
  UserPositionFilter,
  QueryGetUserPnlArgs,
  QueryGetUserTradeMarketArgs,
  PositionSortField,
  ActivitySortField,
  SortDirection,
  ClosedPositionSortField,
  QueryGetCryptoEventsArgs,
  QueryGetBreakingMarketsArgs,
  QueryGetFinanceEventsArgs,
  QueryGetTeamsArgs,
} from '@/@generated/gql/graphql-prediction.ts'
import {
  AllowanceResponseDto,
  ApproveResponseDto,
  CreateLimitOrderInput,
  CreateMarketOrderInput,
  WithdrawInput,
  WithdrawResponseDto,
  RelayerStatusResponseDto,
  QueryGetPolymarketRelayerStatusArgs,
  QueryGetWithdrawQuoteArgs,
  WithdrawQuoteDto,
  CrossChainWithdrawInput,
  WithdrawStatsDto,
  EnableTradingResponseDto,
  QueryGetClobAllowanceAndSyncArgs,
  ClobAllowanceResponseDto,
  UserCredentialsResponseDto,
} from '@/@generated/gql/graphql-xpUser.ts'
import { WithdrawChainModel } from '@/modules/prediction/models/WithdrawChainModel.ts'
export type { EnableTradingInput } from '@/@generated/gql/graphql-xpUser.ts'

export type PaginationInput = {
  limit: number
  offset: number
}

export type GetEventsQueryInput = QueryGetEventsArgs
export type CategoryWithLabel = {
  label: string
  value: string
}
export type GetPriceHistoryInput = PriceHistoryFilter
export type GetOrderBookInput = OrderBookInput
export type GetTrendingEventsInput = QueryGetEventsArgs
export type GetCommentsInput = QueryGetCommentsArgs
export type GetMarketsInput = QueryGetMarketsArgs
export type GetCurrentUserPositionsInput = {
  userAddress: string
  limit?: number
  offset?: number
  filter?: UserPositionFilter
  sortBy?: PositionSortField
  sortDirection?: SortDirection
}
export type GetClosedUserPositionsInput = {
  userAddress: string
  limit?: number
  offset?: number
  sortBy?: ClosedPositionSortField
  sortDirection?: SortDirection
}
export type GetUserActivitiesInput = {
  userAddress: string
  limit?: number
  offset?: number
  includePositions?: boolean
  sortBy?: ActivitySortField
  sortDirection?: SortDirection
}
export type GetUserPnlInput = Omit<QueryGetUserPnlArgs, '__typename'>
export type GetTradesInput = {
  eventId: string
  market?: string[]
  limit?: number
  offset?: number
  filterType?: 'CASH' | 'PERCENTAGE'
  filterAmount?: number
}
export type PlaceLimitOrderInput = CreateLimitOrderInput
export type PlaceMarketOrderInput = CreateMarketOrderInput
export type WithdrawUSDCInput = WithdrawInput
export type WithdrawResponse = WithdrawResponseDto
export type AllowanceResponse = AllowanceResponseDto
export type ApproveUSDCResponse = ApproveResponseDto
export type GetRelayerStatusInput = QueryGetPolymarketRelayerStatusArgs
export type RelayerStatusResponse = RelayerStatusResponseDto
export type GetWithdrawQuoteInput = QueryGetWithdrawQuoteArgs
export type WithdrawQuoteResponse = WithdrawQuoteDto
export type WithdrawCrossChainInput = CrossChainWithdrawInput
export type WithdrawCrossChainResponse = WithdrawResponseDto
export type WithdrawStatsResponse = WithdrawStatsDto[]
export type GetWithdrawChainResponse = {
  chains: WithdrawChainModel[]
}
export type GetUserTradeMarketInput = QueryGetUserTradeMarketArgs
export type GetPendingDeductionsResponse = {
  totalDeductions: number
  deductions: Array<{
    marketId: string
    tokenId: string
    side: string
    conditionId: string
    outcome: string
    pendingUsdcAmount: string
    pendingShareAmount: string
  }>
}

export type EnableTradingResponse = EnableTradingResponseDto
export type GetCryptoEventsInput = QueryGetCryptoEventsArgs
export type GetBreakingMarketsInput = QueryGetBreakingMarketsArgs
export type GetClobAllowanceAndSyncInput = QueryGetClobAllowanceAndSyncArgs
export type ClobAllowanceResponse = ClobAllowanceResponseDto
export type GetFinanceEventsInput = QueryGetFinanceEventsArgs
export type UserCredentialsResponse = UserCredentialsResponseDto
export type GetTeamInput = QueryGetTeamsArgs
