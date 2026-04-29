import { Query, QueryGetSmartMoneyTxHistoriesV2Args } from '@/@generated/gql/graphql-meme2'
import { gql, TypedDocumentNode } from '@apollo/client'

export const listCopyTradeConfig = gql`
  query listCopyTradeConfig($input: ListCopyTradeConfigInput!) {
    listCopyTradeConfig(input: $input) {
      items {
        id
        userId
        status
        userAddress
        leaderAddress
        leaderNickname
        chainId
        buyType
        configAmount
        sellType
        tp
        sl
        minMarketCap
        maxMarketCap
        minLiquidity
        maxLiquidity
        maxBurnLiquidity
        minAmount
        maxAmount
        minCreationTime
        maxCreationTime
        minCreationTimeInt
        maxCreationTimeInt
        maxPurchasePerToken
        platform
        mevProtect
        slippage
        priorityFeePrice
        createdAt
        updatedAt
        deletedAt
        chainId
        leaderTags
        statistic {
          lastTradeTime
          copyTradeTokenHoldingStatistics {
            totalProfitInUsd
            totalBuyInUsd
            buyCostInUsd
            totalSellInUsd
            totalBuy
            totalSell
          }
        }
        tpslConfig {
          id
          configId
          sellRate
        }
      }
    }
  }
`

export const updateCopyTradeConfigStatus = gql`
  mutation updateCopyTradeConfigStatus($input: UpdateCopyTradeConfigStatusInput!) {
    updateCopyTradeConfigStatus(input: $input) {
      id
      status
    }
  }
`

export const updateCopyTradeConfig = gql`
  mutation UpdateCopyTradeConfigInput($input: UpdateCopyTradeConfigInput!) {
    updateCopyTradeConfig(input: $input) {
      id
      leaderNickname
    }
  }
`

export const rankTraders = gql`
  query rankTraders($filter: SmartMoneyFilterInput!) {
    rank(filter: $filter) {
      address
      name
      avatar
      tags
      lastActivityAt
      pnl7d
      pnl30d
      pnl1d
      winRate7d
      avgCost7d
      totalBuy1d
      totalBuy7d
      totalBuy30d
      solBalance
      totalBuyCount7d
      totalSellCount7d
      info {
        twitterName
        walletName
      }
      dailyProfits {
        pnl
      }
    }
  }
`

export const getCopyTradeConfigById = gql`
  query getCopyTradeConfigById($input: GetCopyTradeConfigInput!) {
    getCopyTradeConfig(input: $input) {
      id
      userAddress
      leaderAddress
      leaderNickname
      leaderTags
      chainId
      createdAt
      status
      statistic {
        id
        copyTradeConfigID
        updateStatus
        lastTradeTime
        copyTradeTokenHoldingStatistics {
          totalProfitInUsd
          baseAddress
          totalSellWithProfit
          totalBuy
          totalSell
          remainingAmount
          avgCostPriceInUsd
          totalSell
          totalBuy
          buyAmount1d
        }
      }
      buyType
      configAmount
      sellType
      tpslConfig {
        id
        configId
        value
        sellRate
      }
      tp
      sl
      minMarketCap
      maxMarketCap
      minLiquidity
      maxLiquidity
      minBurnLiquidity
      maxBurnLiquidity
      minAmount
      maxAmount
      minCreationTime
      minCreationTimeInt
      maxCreationTime
      maxCreationTimeInt
      maxPurchasePerToken
      platform
      trailingSl
    }
  }
`

export const getCopyTradeOrders = gql`
  query getCopyTradeOrders($input: SearchCopyTradeOrderInput!) {
    copyTradeOrders(input: $input) {
      status
      createdAt
      transactionType
      baseSymbol
      baseAddress
      pnl
      submitCode
      baseAmount
      closePriceUsd
      closePriceQuote
      isXStock
      copyTradeAvgBuyPriceUsd
      copyConfig {
        buyType
        sellType
        tp
        sl
        tpslConfig {
          value
          sellRate
        }
      }
      copyConfigSnapshot
      txid
    }
  }
`

export const createCopyTradeConfig = gql`
  mutation createCopyTradeConfig($input: CreateCopyTradeConfigInput!) {
    createCopyTradeConfig(input: $input) {
      id
    }
  }
`

export const getSmartMoneyInfo = gql`
  query getSmartMoneyInfo($req: SmartMoneyInfoReq!) {
    getSmartMoneyInfo(req: $req) {
      address
      name
      avatar
      tags
      lastActivityAt
      info {
        twitterName
        walletName
        }
    }
  }
`

export const getSmartMoneyInfoV2 = gql`
  query getSmartMoneyInfo($req: SmartMoneyInfoReq!) {
    getSmartMoneyInfo(req: $req) {
      name
      avatar
    }
  }
`

export const getSmartMoneyTokenStatistics = gql`
  query getSmartMoneyTokenStatistics($input: SmartMoneyTokenStatisticReq!) {
    getSmartMoneyTokenStatistics(req: $input) {
      token {
        address
        name
        logo
        totalSupply
        symbol
        isLowLiquidity
      }
      lastTxTime
      realizedPnlUsd
      balance
      holdingDuration
      totalBuyAmountUsd
      totalBuyQuantity
      totalSellAmountUsd
      totalSellQuantity
      avgPriceUsd
      buys
      sells
    }
  }
`

export const getSmartMoneyStatistic = gql`
  query getSmartMoneyStatistic($input: SmartMoneyDetailReq!) {
    getSmartMoneyStatistic(req: $input) {
      realizedPnlUsd
      totalRealizedPnlUsd
      totalBuyUsd
      avgRealizedPnlUsd
      avgHoldDuration
      buyAmountUsd
      avgBuyAmountUsd
      buys
      sells
      realizedPnlUsd30D
      pnlGt5xNum
      pnl2xTo5xNum
      pnlLt2xNum
      pnlLtMinusDot5Num
      pnlMinusDot5To0xNum
    }
  }
`

export const getWalletTokenHoldingStatistic = gql`
  query getWalletTokenHoldingStatistic($input: SmartMoneyDetailReq!) {
    getWalletTokenHoldingStatistic(req: $input) {
      tokenHoldings {
        address
        balance
        avgPriceUsd
        isLowLiquidity
      }
    }
  }
`

export const getSmartMoneyTxHistories = gql`
  query getSmartMoneyTxHistories($input: SmartMoneyTxHistoryReq!) {
    getSmartMoneyTxHistories(req: $input) {
      token {
        symbol
        address
        name
        logo
        totalSupply
      }
      transactionHash
      timestamp
      type
      price
      nativePrice
      usdPrice
      quantity
      usdAmount
      nativeAmount
      avgPriceUsd
    }
  }
`

export const getSmartMoneyTxHistoriesV2: TypedDocumentNode<
  Pick<Query, 'getSmartMoneyTxHistoriesV2'>,
  QueryGetSmartMoneyTxHistoriesV2Args
> = gql`
  query GetSmartMoneyTxHistoriesV2($req: SmartMoneyTxHistoryReqV2!) {
    getSmartMoneyTxHistoriesV2(req: $req) {
      transactions {
        token {
          address
          name
          logo
          symbol
          totalSupply
        }
        transactionHash
        timestamp
        type
        price
        nativePrice
        usdPrice
        quantity
        usdAmount
        nativeAmount
        avgPriceUsd
      }
      hasMore
      nextCursor
    }
  }
`

export const getListTokenBlacklistQuery = gql`
  query listTokenBlacklist($input: ListTokenBlacklistInput!) {
    listTokenBlacklist(input: $input) {
      items {
        id
        userId
        token
      }
    }
  }
`

export const modifyTokenBlacklistMutate = gql`
  mutation modifyTokenBlacklist($input: ModifyTokenBlacklistInput!) {
    modifyTokenBlacklist(input: $input) {
      id
      userId
      token
    }
  }
`

export const getUniqueBaseSymbolCopyTrade = gql`
  query getUniqueBaseSymbolCopyTrade($input: GetUniqueBaseSymbolInput!) {
    getUniqueBaseSymbolCopyTrade(input: $input) {
      baseSymbol
      baseAddress
    }
  }
`

export const getCopyTradeOrdersFilters = gql`
  query getCopyTradeOrdersFilters($input: GetCopyTradeOrdersFiltersInput!) {
    getCopyTradeOrdersFilters(input: $input) {
      uniqueBaseSymbols {
        baseSymbol
        baseAddress
      }
    }
  }
`

export const getWalletBalanceWallet = gql`
  query getWalletBalance($input: WalletBalanceInput!) {
    getWalletBalance(req: $input)
  }
`
