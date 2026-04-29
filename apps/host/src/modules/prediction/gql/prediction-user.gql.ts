// Define GraphQL queries and mutations for XP user service
import { gql, TypedDocumentNode } from '@apollo/client'
import {
  Mutation,
  MutationClaimPolymarketPositionArgs,
  MutationClaimPolymarketPositionsArgs,
  MutationCreatePolymarketLimitOrderArgs,
  MutationCreatePolymarketMarketOrderArgs,
  MutationBuyPolymarketMarketArgs,
  MutationSellPolymarketMarketArgs,
  MutationWithdrawPolymarketUsdcArgs,
  MutationWithdrawPolymarketCrossChainArgs,
  Query as XpUserQuery,
  QueryGetPolymarketSupportedAssetsArgs,
  QueryGetPolymarketOpenOrdersArgs,
  QueryGetPolymarketRelayerStatusArgs,
  QueryGetWithdrawQuoteArgs,
  QueryCalculatePolymarketPriceArgs,
  MutationEnablePolymarketTradingArgs,
  QueryGetClobAllowanceAndSyncArgs,
} from '@/@generated/gql/graphql-xpUser.ts'
import {
  Query as PredictionQuery,
  QueryGetCurrentUserPositionsArgs,
  QueryGetUserActivityArgs,
} from '@/@generated/gql/graphql-prediction.ts'

export const getPolymarketClaimablePositions: TypedDocumentNode<Pick<XpUserQuery, 'getPolymarketClaimablePositions'>> =
  gql`
    query GetPolymarketClaimablePositions {
      getPolymarketClaimablePositions {
        totalClaimable
        totalValue
        positions {
          conditionId
          asset
          tokenId
          size
          outcome
          outcomeIndex
          marketTitle
          marketSlug
          currentValue
          endDate
        }
      }
    }
  `

export const claimPolymarketPosition: TypedDocumentNode<
  Pick<Mutation, 'claimPolymarketPosition'>,
  MutationClaimPolymarketPositionArgs
> = gql`
  mutation ClaimPolymarketPosition($input: ClaimPositionInput!) {
    claimPolymarketPosition(input: $input) {
      success
      transactionHash
      message
      redeemedPositions
    }
  }
`

export const claimPolymarketPositionsBatch: TypedDocumentNode<
  Pick<Mutation, 'claimPolymarketPositions'>,
  MutationClaimPolymarketPositionsArgs
> = gql`
  mutation ClaimPolymarketPositions($input: ClaimPositionsInput!) {
    claimPolymarketPositions(input: $input) {
      success
      transactionHash
      message
      redeemedPositions
    }
  }
`

export const getPolymarketSupportedAssets: TypedDocumentNode<
  Pick<XpUserQuery, 'getPolymarketSupportedAssets'>,
  QueryGetPolymarketSupportedAssetsArgs
> = gql`
  query GetPolymarketSupportedAssets {
    getPolymarketSupportedAssets {
      chainId
      chainName
      minCheckoutUsd
      token {
        name
        symbol
        address
        decimals
      }
    }
  }
`

export const getPolymarketUserDepositAddresses: TypedDocumentNode<
  Pick<XpUserQuery, 'getPolymarketUserDepositAddresses'>
> = gql`
  query GetPolymarketUserDepositAddresses {
    getPolymarketUserDepositAddresses {
      userId
      chainId
      chainName
      depositAddress
      memo
      expiresAt
      createdAt
      updatedAt
    }
  }
`

export const getPolymarketProxyWallet = gql`
  query GetPolymarketProxyWallet {
    getPolymarketProxyWallet {
      proxyWallet
    }
  }
`

export const getPolymarketUSDCAllowance: TypedDocumentNode<Pick<XpUserQuery, 'getPolymarketUSDCAllowance'>> = gql`
  query GetPolymarketUSDCAllowance {
    getPolymarketUSDCAllowance {
      allowanceWei
      allowanceUSDC
      proxyWallet
    }
  }
`

export const approvePolymarketUSDC: TypedDocumentNode<Pick<Mutation, 'approvePolymarketUSDC'>> = gql`
  mutation ApprovePolymarketUSDC {
    approvePolymarketUSDC {
      success
      transactionId
      message
    }
  }
`

export const createPolymarketLimitOrder: TypedDocumentNode<
  Pick<Mutation, 'createPolymarketLimitOrder'>,
  MutationCreatePolymarketLimitOrderArgs
> = gql`
  mutation CreatePolymarketLimitOrder($input: CreateLimitOrderInput!) {
    createPolymarketLimitOrder(input: $input) {
      orderId
      marketId
      marketTitle
      outcome
      orderType
      side
      size
      price
      status
      transactionHash
      errorMessage
      createdAt
    }
  }
`

export const createPolymarketMarketOrder: TypedDocumentNode<
  Pick<Mutation, 'createPolymarketMarketOrder'>,
  MutationCreatePolymarketMarketOrderArgs
> = gql`
  mutation CreatePolymarketMarketOrder($input: CreateMarketOrderInput!) {
    createPolymarketMarketOrder(input: $input) {
      orderId
      marketId
      marketTitle
      outcome
      orderType
      side
      size
      price
      status
      transactionHash
      errorMessage
      createdAt
    }
  }
`

export const buyPolymarketMarket: TypedDocumentNode<
  Pick<Mutation, 'buyPolymarketMarket'>,
  MutationBuyPolymarketMarketArgs
> = gql`
  mutation BuyPolymarketMarket($input: BuyMarketInput!) {
    buyPolymarketMarket(input: $input) {
      orderId
      marketId
      marketTitle
      outcome
      orderType
      side
      size
      price
      status
      transactionHash
      errorMessage
      createdAt
      polymarketOrder {
        orderID
        takingAmount
        makingAmount
        status
        transactionsHashes
      }
    }
  }
`

export const sellPolymarketMarket: TypedDocumentNode<
  Pick<Mutation, 'sellPolymarketMarket'>,
  MutationSellPolymarketMarketArgs
> = gql`
  mutation SellPolymarketMarket($input: SellMarketInput!) {
    sellPolymarketMarket(input: $input) {
      orderId
      marketId
      marketTitle
      outcome
      orderType
      side
      size
      price
      status
      transactionHash
      errorMessage
      createdAt
    }
  }
`

export const withdrawPolymarketUSDC: TypedDocumentNode<
  Pick<Mutation, 'withdrawPolymarketUSDC'>,
  MutationWithdrawPolymarketUsdcArgs
> = gql`
  mutation WithdrawPolymarketUSDC($input: WithdrawInput!) {
    withdrawPolymarketUSDC(input: $input) {
      success
      transactionId
      amount
      destination
      message
    }
  }
`

export const getUserOpenOrders: TypedDocumentNode<
  Pick<XpUserQuery, 'getPolymarketOpenOrders'>,
  QueryGetPolymarketOpenOrdersArgs
> = gql`
  query GetPolymarketOpenOrders($marketId: String) {
    getPolymarketOpenOrders(marketId: $marketId) {
      orderID
      market
      asset_id
      side
      price
      sizeFilled
      status
      expiration
      createdAt
      size
      marketInfo {
        question
        image
        icon
        slug
        conditionId
        eventSlug
        clobTokenIds
        outcomes
        groupItemTitle
      }
    }
  }
`

export const getCurrentUserPositions: TypedDocumentNode<
  Pick<PredictionQuery, 'getCurrentUserPositions'>,
  QueryGetCurrentUserPositionsArgs
> = gql`
  query GetCurrentUserPositions(
    $walletAddress: String!
    $filter: UserPositionFilter
    $sortBy: PositionSortField
    $sortDirection: SortDirection
    $limit: Int
    $offset: Int
  ) {
    getCurrentUserPositions(
      walletAddress: $walletAddress
      filter: $filter
      sortBy: $sortBy
      sortDirection: $sortDirection
      limit: $limit
      offset: $offset
    ) {
      limit
      offset
      items {
        tokenId
        conditionId
        size
        avgPrice
        initialValue
        currentValue
        cashPnl
        percentPnl
        totalBought
        realizedPnl
        percentRealizedPnl
        curPrice
        redeemable
        mergeable
        title
        slug
        icon
        eventSlug
        outcome
        outcomeIndex
        oppositeOutcome
        oppositeAsset
        endDate
        negativeRisk
        proxyWallet
        marketId
        tickSize
        winningToken
      }
    }
  }
`

export const getUserActivity: TypedDocumentNode<
  Pick<PredictionQuery, 'getUserActivity'>,
  QueryGetUserActivityArgs
> = gql`
  query GetUserActivity(
    $walletAddress: String!
    $includePositions: Boolean
    $limit: Int
    $offset: Int
    $sortBy: ActivitySortField
    $sortDirection: SortDirection
  ) {
    getUserActivity(
      walletAddress: $walletAddress
      includePositions: $includePositions
      limit: $limit
      offset: $offset
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      limit
      offset
      items {
        proxyWallet
        timestamp
        conditionId
        type
        size
        usdcSize
        transactionHash
        price
        tokenID
        side
        outcomeIndex
        title
        slug
        icon
        eventSlug
        outcome
        name
        pseudonym
        bio
        profileImage
        profileImageOptimized
        isLost
        isCloseable
        tokenYesTickSize
      }
    }
  }
`

export const getPolymarketRelayerStatus: TypedDocumentNode<
  Pick<XpUserQuery, 'getPolymarketRelayerStatus'>,
  QueryGetPolymarketRelayerStatusArgs
> = gql`
  query GetPolymarketRelayerStatus($transactionIds: [String!]!) {
    getPolymarketRelayerStatus(transactionIds: $transactionIds) {
      transactions {
        transactionId
        state
        transactionHash
        from
        to
        proxyAddress
        data
        nonce
        value
        signature
        type
        owner
        metadata
        createdAt
        updatedAt
        message
      }
    }
  }
`

export const getWithdrawQuote: TypedDocumentNode<
  Pick<XpUserQuery, 'getWithdrawQuote'>,
  QueryGetWithdrawQuoteArgs
> = gql`
  query GetWithdrawQuote(
    $amount: String!
    $fromChainId: Int!
    $toChainId: Int!
    $toAddress: String!
    $toTokenAddress: String
  ) {
    getWithdrawQuote(
      amount: $amount
      fromChainId: $fromChainId
      toChainId: $toChainId
      toAddress: $toAddress
      toTokenAddress: $toTokenAddress
    ) {
      quoteId
      estCheckoutTimeMs
      estTotalFromAmount
      estTotalUsd
      finalToAmountBaseUnit
      exchangeRate
      fromChainId
      toChainId
      fromTokenSymbol
      toTokenSymbol
    }
  }
`

export const withdrawPolymarketCrossChain: TypedDocumentNode<
  Pick<Mutation, 'withdrawPolymarketCrossChain'>,
  MutationWithdrawPolymarketCrossChainArgs
> = gql`
  mutation WithdrawPolymarketCrossChain($input: CrossChainWithdrawInput!) {
    withdrawPolymarketCrossChain(input: $input) {
      success
      transactionId
      amount
      destination
      message
    }
  }
`

export const cancelPolymarketOrder = gql`
  mutation CancelPolymarketOrder($orderId: String!) {
    cancelPolymarketOrder(orderId: $orderId) {
      success
      transactionId
      message
    }
  }
`

export const getWithdrawStats: TypedDocumentNode<Pick<XpUserQuery, 'getWithdrawStats'>> = gql`
  query GetWithdrawStats {
    getWithdrawStats {
      _id
      count
      totalAmountUsd
    }
  }
`

export const getUserData: TypedDocumentNode<Pick<PredictionQuery, 'getUserData'>> = gql`
  query GetUserData($walletAddress: String!) {
    getUserData(walletAddress: $walletAddress) {
      id
      createdAt
      proxyWallet
      profileImage
      displayUsernamePublic
      pseudonym
      name
      verifiedBadge
      users {
        id
        creator
        mod
      }
    }
  }
`

export const getUserStats: TypedDocumentNode<Pick<PredictionQuery, 'getUserStats'>> = gql`
  query GetUserStats($proxyAddress: String!) {
    getUserStats(proxyAddress: $proxyAddress) {
      trades
      largestWin
      views
      joinDate
    }
  }
`

export const getSupportedRelayAssets: TypedDocumentNode<Pick<XpUserQuery, 'supportedRelayAssets'>> = gql`
  query SupportedRelayAssets {
    supportedRelayAssets {
      chainId
      address
      symbol
      name
      decimals
      iconUrl
    }
  }
`

export const getSupportedRelayChains: TypedDocumentNode<Pick<XpUserQuery, 'supportedRelayChains'>> = gql`
  query SupportedRelayChains {
    supportedRelayChains {
      chainId
      name
      displayName
      currencySymbol
      explorerUrl
      rpcUrl
      iconUrl
    }
  }
`

export const enablePolymarketTrading: TypedDocumentNode<
  Pick<Mutation, 'enablePolymarketTrading'>,
  MutationEnablePolymarketTradingArgs
> = gql`
  mutation EnablePolymarketTrading($input: EnableTradingInput!) {
    enablePolymarketTrading(input: $input) {
      proxyWalletAddress
      ownerAddress
      chain
      isNewDeployment
      transactionHash
    }
  }
`

export const calculatePolymarketPrice: TypedDocumentNode<
  Pick<XpUserQuery, 'calculatePolymarketPrice'>,
  QueryCalculatePolymarketPriceArgs
> = gql`
  query CalculatePolymarketPrice($input: CalculateMarketPriceInput!) {
    calculatePolymarketPrice(input: $input) {
      marketId
      tokenId
      side
      amount
      price
      totalCost
    }
  }
`

export const getCLOBAllowanceAndSync: TypedDocumentNode<
  Pick<XpUserQuery, 'getCLOBAllowanceAndSync'>,
  QueryGetClobAllowanceAndSyncArgs
> = gql`
  query GetCLOBAllowanceAndSync($tokenId: String, $forceRefresh: Boolean) {
    getCLOBAllowanceAndSync(tokenId: $tokenId, forceRefresh: $forceRefresh) {
      clobBalance
      onChainBalance
      wasSynced
      syncReason
      assetType
      tokenId
    }
  }
`

export const getUserCredentials: TypedDocumentNode<Pick<XpUserQuery, 'getUserCredentials'>> = gql`
  query GetUserCredentials {
    getUserCredentials {
      apiKey
      apiSecret
      apiPassphrase
      proxyWalletAddress
      chainId
    }
  }
`
