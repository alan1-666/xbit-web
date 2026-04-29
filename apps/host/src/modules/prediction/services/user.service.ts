import { PositionModel } from '@/modules/prediction/models/PositionModel.ts'
import { UserActivityModel } from '@/modules/prediction/models/UserActivityModel.ts'
import { IPolymarketOpenOrder } from '@/modules/prediction/models/PortfolioModel.ts'
import {
  GetClosedUserPositionsInput,
  GetCurrentUserPositionsInput,
  GetUserActivitiesInput,
  GetUserPnlInput,
  WithdrawUSDCInput,
  WithdrawResponse,
  AllowanceResponse,
  ApproveUSDCResponse,
  GetRelayerStatusInput,
  RelayerStatusResponse,
  GetWithdrawQuoteInput,
  WithdrawQuoteResponse,
  WithdrawCrossChainInput,
  WithdrawCrossChainResponse,
  GetWithdrawChainResponse,
  WithdrawStatsResponse,
  GetUserTradeMarketInput,
  EnableTradingInput,
  EnableTradingResponse,
  GetClobAllowanceAndSyncInput,
  ClobAllowanceResponse,
  UserCredentialsResponse,
} from '@/modules/prediction/types'
import { UserStatsModel } from '@/modules/prediction/models/UserStatsModel.ts'
import { UserPnlModel } from '@/modules/prediction/models/UserPnlModel.ts'
import { TradeActivityModel } from '@/modules/prediction/models/TradeModel.ts'
import { predictionClient, xpUserClient } from '@/lib/gql/apollo-client'
import {
  approvePolymarketUSDC,
  getPolymarketProxyWallet,
  getPolymarketSupportedAssets,
  getPolymarketUSDCAllowance,
  getPolymarketUserDepositAddresses,
  withdrawPolymarketUSDC,
  getUserOpenOrders,
  getCurrentUserPositions,
  getUserActivity,
  getPolymarketClaimablePositions,
  claimPolymarketPosition,
  claimPolymarketPositionsBatch,
  getPolymarketRelayerStatus,
  cancelPolymarketOrder,
  getWithdrawQuote,
  withdrawPolymarketCrossChain,
  getWithdrawStats,
  getUserData,
  getUserStats,
  getSupportedRelayAssets,
  getSupportedRelayChains,
  enablePolymarketTrading,
  calculatePolymarketPrice,
  getCLOBAllowanceAndSync,
  getUserCredentials,
} from '@/modules/prediction/gql/prediction-user.gql'
import {
  SupportedAsset,
  PolymarketDepositAddress,
  ClaimablePositionsResponseDto,
  RedeemResponseDto,
  ClaimPositionInput,
  ClaimPositionsInput,
  ApproveResponseDto,
  //  PendingDeductionItemDto,
  RelayAsset,
  RelayChain,
  CalculateMarketPriceInput,
  CalculateMarketPriceResponseDto,
} from '@/@generated/gql/graphql-xpUser'
import {
  getTotalUserPositionValue,
  getUserClosedPositions,
  getUserTradeMarket,
} from '@/modules/prediction/gql/prediction.gql.ts'
import { ClosedPositionModel } from '@/modules/prediction/models/ClosedPositionModel.ts'
import { WithdrawChainModel } from '@/modules/prediction/models/WithdrawChainModel.ts'
import { getUserPnlQuery } from '@/modules/prediction/gql/prediction.gql.ts'
import {
  UserPnlPoint,
  UserPnlFidelity,
  UserPnlInterval,
  Query as PredictionQuery,
} from '@/@generated/gql/graphql-prediction.ts'

interface IUserService {
  getCurrentPositions: (input: GetCurrentUserPositionsInput) => Promise<PositionModel[]>
  getClosedPositions: (input: GetClosedUserPositionsInput) => Promise<ClosedPositionModel[]>
  getUserActivities: (input: GetUserActivitiesInput) => Promise<UserActivityModel[]>
  getUserProfileStats: (userAddress: string) => Promise<UserStatsModel>
  getUserBalance: (userAddress: string) => Promise<number>
  getUserPnl: (input: GetUserPnlInput) => Promise<UserPnlModel[]>
  getTrades: (input: GetUserTradeMarketInput) => Promise<TradeActivityModel[]>
  getPolymarketSupportedAssets: () => Promise<SupportedAsset[]>
  getPolymarketUserDepositAddresses: () => Promise<PolymarketDepositAddress[]>
  withdrawPolymarketUSDC: (input: WithdrawUSDCInput) => Promise<WithdrawResponse | undefined>
  getUSDCAllowance: () => Promise<AllowanceResponse>
  getPolymarketProxyWallet: () => Promise<string>
  approveUSDCAllowance: () => Promise<ApproveUSDCResponse | undefined>
  getUserOpenOrders: (marketId?: string) => Promise<IPolymarketOpenOrder[]>
  getClaimablePositions: () => Promise<ClaimablePositionsResponseDto>
  claimPosition: (input: ClaimPositionInput) => Promise<RedeemResponseDto | undefined>
  claimPositions: (input: ClaimPositionsInput) => Promise<RedeemResponseDto | undefined>
  cancelOrder: (orderId: string) => Promise<ApproveResponseDto | undefined>
  getRelayerStatus: (input: GetRelayerStatusInput) => Promise<RelayerStatusResponse[] | undefined>
  getWithdrawQuote: (input: GetWithdrawQuoteInput) => Promise<WithdrawQuoteResponse | undefined>
  withdrawCrossChain: (input: WithdrawCrossChainInput) => Promise<WithdrawCrossChainResponse | undefined>
  getWithdrawChains: () => Promise<WithdrawChainModel[]>
  getWithdrawStats: () => Promise<WithdrawStatsResponse>
  getUserData: (walletAddress: string) => Promise<PredictionQuery['getUserData']>
  //  getPendingDeductions: () => Promise<PendingDeductionItemDto[]>
  getSupportedRelayAssets: () => Promise<RelayAsset[]>
  getSupportedRelayChains: () => Promise<RelayChain[]>
  enablePolymarketTrading: (input: EnableTradingInput) => Promise<EnableTradingResponse | undefined>
  calculatePolymarketPrice: (input: CalculateMarketPriceInput) => Promise<CalculateMarketPriceResponseDto | undefined>
  getCLOBAllowanceAndSync: (input: GetClobAllowanceAndSyncInput) => Promise<ClobAllowanceResponse | undefined>
  getUserCredentials: () => Promise<UserCredentialsResponse | undefined>
}

class UserService implements IUserService {
  // OK: getCurrentUserPositions
  async getCurrentPositions(input: GetCurrentUserPositionsInput): Promise<PositionModel[]> {
    const { userAddress, filter, sortBy, sortDirection, limit = 20, offset = 0 } = input
    const res = await predictionClient.query({
      query: getCurrentUserPositions,
      variables: {
        walletAddress: userAddress,
        filter: {
          ...filter,
          sizeThreshold: '0.1',
        },
        sortBy,
        sortDirection,
        limit,
        offset,
      },
    })
    return (res.data.getCurrentUserPositions.items || []) as PositionModel[]
  }

  // OK: getClosedUserPosition
  async getClosedPositions(input: GetClosedUserPositionsInput): Promise<ClosedPositionModel[]> {
    const { userAddress, limit = 20, offset = 0, sortBy, sortDirection } = input
    const res = await predictionClient.query({
      query: getUserClosedPositions,
      variables: {
        walletAddress: userAddress,
        limit,
        offset,
        sortBy,
        sortDirection,
      },
    })
    return res.data.getClosedUserPosition.items || []
  }

  async getUserActivities(input: GetUserActivitiesInput): Promise<UserActivityModel[]> {
    const { userAddress, includePositions, limit, offset, sortBy, sortDirection } = input
    const res = await predictionClient.query({
      query: getUserActivity,
      variables: {
        walletAddress: userAddress,
        includePositions,
        limit,
        offset,
        sortBy,
        sortDirection,
      },
    })
    return res.data.getUserActivity.items || []
  }

  async getUserProfileStats(userAddress: string): Promise<UserStatsModel> {
    const res = await predictionClient.query({
      query: getUserStats,
      variables: {
        proxyAddress: userAddress,
      },
    })
    return (res.data.getUserStats || {
      trades: 0,
      largestWin: 0,
      views: 0,
      joinDate: '',
    }) as UserStatsModel
  }

  // OK: getTotalUserPosition
  async getUserBalance(userAddress: string): Promise<number> {
    const res = await predictionClient.query({
      query: getTotalUserPositionValue,
      variables: {
        walletAddress: userAddress,
      },
    })
    return +res.data.getTotalUserPosition.value
  }

  async getUserPnl(input: GetUserPnlInput): Promise<UserPnlPoint[]> {
    const { userAddress, interval = UserPnlInterval.OneMonth, fidelity = UserPnlFidelity.OneDay } = input
    const res = await predictionClient.query({
      query: getUserPnlQuery,
      variables: {
        userAddress,
        interval,
        fidelity,
      },
    })
    return res.data?.getUserPnl?.history || []
  }

  async getTrades(input: GetUserTradeMarketInput): Promise<TradeActivityModel[]> {
    const { limit = 10, offset = 0, filterType, filterAmount, conditionIDs, eventId, user, side, takerOnly } = input

    const res = await predictionClient.query({
      query: getUserTradeMarket,
      variables: {
        limit,
        offset,
        takerOnly,
        filterType,
        filterAmount,
        conditionIDs,
        eventId,
        user,
        side,
      },
    })

    return (res.data?.getUserTradeMarket?.items || []) as TradeActivityModel[]
  }

  async getPolymarketSupportedAssets(): Promise<SupportedAsset[]> {
    const result = await xpUserClient.query({
      query: getPolymarketSupportedAssets,
    })
    return result.data.getPolymarketSupportedAssets || []
  }

  async getPolymarketUserDepositAddresses(): Promise<PolymarketDepositAddress[]> {
    try {
      const result = await xpUserClient.query({
        query: getPolymarketUserDepositAddresses,
      })
      return result.data.getPolymarketUserDepositAddresses || []
    } catch {
      return []
    }
  }
  async withdrawPolymarketUSDC(input: WithdrawUSDCInput): Promise<WithdrawResponse | undefined> {
    const res = await xpUserClient.mutate({
      mutation: withdrawPolymarketUSDC,
      variables: {
        input: input,
      },
    })
    return res.data?.withdrawPolymarketUSDC
  }
  async getUSDCAllowance(): Promise<AllowanceResponse> {
    const res = await xpUserClient.query({
      query: getPolymarketUSDCAllowance,
    })
    return res.data.getPolymarketUSDCAllowance
  }

  async getPolymarketProxyWallet(): Promise<string> {
    const res = await xpUserClient.query({
      query: getPolymarketProxyWallet,
    })
    const data = res.data as { getPolymarketProxyWallet?: { proxyWallet?: string } }
    return data?.getPolymarketProxyWallet?.proxyWallet ?? ''
  }

  async approveUSDCAllowance(): Promise<ApproveUSDCResponse | undefined> {
    const res = await xpUserClient.mutate({
      mutation: approvePolymarketUSDC,
    })
    return res.data?.approvePolymarketUSDC
  }

  async getUserOpenOrders(marketId?: string): Promise<IPolymarketOpenOrder[]> {
    const result = await xpUserClient.query({
      query: getUserOpenOrders,
      variables: {
        marketId,
      },
      fetchPolicy: 'network-only',
    })
    return result.data.getPolymarketOpenOrders || []
  }

  async getClaimablePositions(): Promise<ClaimablePositionsResponseDto> {
    const res = await xpUserClient.query({
      query: getPolymarketClaimablePositions,
      fetchPolicy: 'network-only',
    })
    return res.data.getPolymarketClaimablePositions
  }

  async claimPosition(input: ClaimPositionInput): Promise<RedeemResponseDto | undefined> {
    const res = await xpUserClient.mutate({
      mutation: claimPolymarketPosition,
      variables: {
        input,
      },
    })
    return res.data?.claimPolymarketPosition
  }

  async claimPositions(input: ClaimPositionsInput): Promise<RedeemResponseDto | undefined> {
    const res = await xpUserClient.mutate({
      mutation: claimPolymarketPositionsBatch,
      variables: {
        input,
      },
    })
    return res.data?.claimPolymarketPositions
  }

  async getRelayerStatus(input: GetRelayerStatusInput): Promise<RelayerStatusResponse[] | undefined> {
    const { transactionIds } = input
    const res = await xpUserClient.query({
      query: getPolymarketRelayerStatus,
      variables: {
        transactionIds,
      },
    })
    return res.data?.getPolymarketRelayerStatus.transactions
  }

  async cancelOrder(orderId: string): Promise<ApproveResponseDto | undefined> {
    const res = await xpUserClient.mutate({
      mutation: cancelPolymarketOrder,
      variables: {
        orderId,
      },
    })
    return res.data?.cancelPolymarketOrder
  }

  async getWithdrawQuote(input: GetWithdrawQuoteInput): Promise<WithdrawQuoteResponse | undefined> {
    const { amount, fromChainId, toChainId, toAddress, toTokenAddress } = input
    const res = await xpUserClient.query({
      query: getWithdrawQuote,
      variables: {
        amount,
        fromChainId,
        toChainId,
        toAddress,
        toTokenAddress,
      },
    })
    return res.data?.getWithdrawQuote
  }

  async withdrawCrossChain(input: WithdrawCrossChainInput): Promise<WithdrawCrossChainResponse | undefined> {
    const res = await xpUserClient.mutate({
      mutation: withdrawPolymarketCrossChain,
      variables: {
        input,
      },
    })
    return res.data?.withdrawPolymarketCrossChain
  }

  async getWithdrawChains(): Promise<WithdrawChainModel[]> {
    const res = await fetch('https://api.relay.link/chains')
    const data: GetWithdrawChainResponse = await res.json()
    return data.chains
  }

  async getWithdrawStats(): Promise<WithdrawStatsResponse> {
    const res = await xpUserClient.query({
      query: getWithdrawStats,
    })
    return res.data?.getWithdrawStats || []
  }

  async getUserData(walletAddress: string): Promise<PredictionQuery['getUserData']> {
    const res = await predictionClient.query({
      query: getUserData,
      variables: {
        walletAddress,
      },
    })
    return res.data.getUserData
  }

  /*
    async getPendingDeductions(): Promise<PendingDeductionItemDto[]> {
      const res = await xpUserClient.query({
        query: getPendingDeductions,
      })
      return res.data?.getPendingDeductions || []
    }
  */

  async getSupportedRelayAssets(): Promise<RelayAsset[]> {
    const res = await xpUserClient.query({
      query: getSupportedRelayAssets,
    })
    return res.data?.supportedRelayAssets || []
  }

  async getSupportedRelayChains(): Promise<RelayChain[]> {
    const res = await xpUserClient.query({
      query: getSupportedRelayChains,
    })
    return res.data?.supportedRelayChains
  }

  async enablePolymarketTrading(input: EnableTradingInput): Promise<EnableTradingResponse | undefined> {
    const res = await xpUserClient.mutate({
      mutation: enablePolymarketTrading,
      variables: {
        input,
      },
    })
    return res.data?.enablePolymarketTrading as EnableTradingResponse | undefined
  }

  async calculatePolymarketPrice(
    input: CalculateMarketPriceInput,
  ): Promise<CalculateMarketPriceResponseDto | undefined> {
    const res = await xpUserClient.query({
      query: calculatePolymarketPrice,
      variables: {
        input,
      },
    })
    return res.data?.calculatePolymarketPrice
  }

  async getCLOBAllowanceAndSync(input: GetClobAllowanceAndSyncInput): Promise<ClobAllowanceResponse | undefined> {
    const res = await xpUserClient.query({
      query: getCLOBAllowanceAndSync,
      variables: input,
      fetchPolicy: 'network-only',
    })
    return res.data?.getCLOBAllowanceAndSync
  }

  async getUserCredentials(): Promise<UserCredentialsResponse | undefined> {
    const res = await xpUserClient.query({
      query: getUserCredentials,
    })
    return res.data?.getUserCredentials
  }
}

export const userService: IUserService = new UserService()
