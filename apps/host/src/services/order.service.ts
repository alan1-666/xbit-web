import { gql } from '@apollo/client'

export const createOrderMutation = gql`
  mutation createOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      createdAt
      updatedAt
      deletedAt
      transactionType
      type
      baseAddress
      quoteAddress
      userAddress
      limitPrice
      baseAmount
      quoteAmount
      exit
      tp
      sl
      exitAt
      status
      txid
      chainId
      baseDecimal
      baseSymbol
      quoteSymbol
      slippage
      marketCap
      openPrice
    }
  }
`

export const getNetworkFeeQuery = gql`
  query getNetworkFee($input: NetworkFeeInput!) {
    getNetworkFee(input: $input) {
      solana {
        priorityFeePrice {
          medium
          high
          veryHigh
        }
        feeAccount
        platformFee
        xstockPlatformFee
        maxComputeUnits
        autoTipFee
        minTipFee
      }
      ethereum {
        low {
          suggestedMaxPriorityFeePerGas
          suggestedMaxFeePerGas
          minWaitTimeEstimate
          maxWaitTimeEstimate
        }
        medium {
          suggestedMaxPriorityFeePerGas
          suggestedMaxFeePerGas
          minWaitTimeEstimate
          maxWaitTimeEstimate
        }
        high {
          suggestedMaxPriorityFeePerGas
          suggestedMaxFeePerGas
          minWaitTimeEstimate
          maxWaitTimeEstimate
        }
        estimatedBaseFee
      }
      bsc {
        low {
          suggestedMaxPriorityFeePerGas
          suggestedMaxFeePerGas
          minWaitTimeEstimate
          maxWaitTimeEstimate
        }
        medium {
          suggestedMaxPriorityFeePerGas
          suggestedMaxFeePerGas
          minWaitTimeEstimate
          maxWaitTimeEstimate
        }
        high {
          suggestedMaxPriorityFeePerGas
          suggestedMaxFeePerGas
          minWaitTimeEstimate
          maxWaitTimeEstimate
        }
        estimatedBaseFee
      }
      mon {
        low {
          suggestedMaxPriorityFeePerGas
          suggestedMaxFeePerGas
          minWaitTimeEstimate
          maxWaitTimeEstimate
        }
        medium {
          suggestedMaxPriorityFeePerGas
          suggestedMaxFeePerGas
          minWaitTimeEstimate
          maxWaitTimeEstimate
        }
        high {
          suggestedMaxPriorityFeePerGas
          suggestedMaxFeePerGas
          minWaitTimeEstimate
          maxWaitTimeEstimate
        }
        estimatedBaseFee
      }
    }
  }
`

export const countPendingOrders = gql`
  query getPendingOrders($input: SearchOrderInput!) {
    getPendingOrders(input: $input) {
      total
    }
  }
`

export const getPendingOrdersQuery = gql`
  query getPendingOrders($input: SearchOrderInput!) {
    getPendingOrders(input: $input) {
      total
      orders {
        id
        chainId
        baseAddress
        quoteAddress
        createdAt
        openPrice
        baseAmount
        quoteAmount
        userAddress
        baseDecimal
        marketCap
        doublePrincipalAfterPurchase
        transactionType
        baseSymbol
        tp
        tp2
        sl
        limitPrice
        limitMarketCap
        type
        quoteSymbol
        slippage
        triggerPrice
        callbackRate
        trailingOrderTriggered
        triggerAt
        txid
        mevProtect
        priorityFeePrice
        status
        openQuoteUsdRate
        userAddress
      }
    }
  }
`

export const getCurrentOrdersQuery = gql`
  query orders($input: SearchOrderInput!) {
    orders(input: $input) {
      id
      chainId
      baseAddress
      quoteAddress
      createdAt
      openPrice
      baseAmount
      quoteAmount
      marketCap
      doublePrincipalAfterPurchase
      transactionType
      baseSymbol
      tp
      sl
      limitPrice
      type
      quoteSymbol
      slippage
      triggerPrice
      callbackRate
      trailingOrderTriggered
      triggerAt
      txid
      mevProtect
      priorityFeePrice
      status
      triggerPrice
      openQuoteUsdRate
      callbackRate
    }
  }
`
export const getOrdersHistoryQuery = gql`
  query orderHistory($input: SearchOrderInput!) {
    orderHistory(input: $input) {
      id
      createdAt
      updatedAt
      deletedAt
      transactionType
      type
      baseAddress
      quoteAddress
      userAddress
      limitPrice
      openPrice
      baseAmount
      quoteAmount
      exit
      tp
      sl
      openSubmitMeta
      closeSubmitMeta
      filledAt
      exitReason
      exitAt
      status
      txId
      openTxId
      closeTxId
      chainId
      baseDecimal
      baseSymbol
      quoteSymbol
      slippage
      triggerPrice
      callbackRate
      trailingOrderTriggered
      triggerAt
      mevProtect
      priorityFeePrice
      doublePrincipalAfterPurchase
    }
  }
`

export const getTransactions = gql`
  query getTransactions($input: SearchOrderInput!) {
    getTransactions(input: $input) {
      id
      createdAt
      transactionType
      baseAddress
      baseAmount
      quoteAmount
      txid
      chainId
      baseDecimal
      baseSymbol
      slippage
      pnl
      closePriceQuote
      closePriceUsd
      slippageLoss
      slippageLossAmount
      platformFee
      platformFeeAmount
      antiMevFee
      antiMevFeeAmount
      gasFee
      gasFeeAmount
      pumpFee
      pumpFeeAmount
      priorityFee
      priorityFeeAmount
      closeBaseUsdRate
      marketCap
      openPrice
      status
      submitCode
      isXStock
      userAddress
    }
  }
`

export const getAllTransactions = gql`
  query getAllTransactions($input: SearchAllOrderInput!) {
    getAllTransactions(input: $input) {
      id
      createdAt
      transactionType
      baseAddress
      baseAmount
      quoteAmount
      txid
      chainId
      baseDecimal
      baseSymbol
      slippage
      pnl
      closePriceQuote
      closePriceUsd
      slippageLoss
      slippageLossAmount
      platformFee
      platformFeeAmount
      feeRate
      antiMevFee
      antiMevFeeAmount
      gasFee
      gasFeeAmount
      pumpFee
      pumpFeeAmount
      priorityFee
      priorityFeeAmount
      closeBaseUsdRate
      marketCap
      openPrice
      status
      submitCode
      isXStock
    }
  }
`

export const getTransactionTokens = gql`
  query transactionTokens($input: TransactionTokenInput!) {
    transactionTokens(input: $input) {
      address
      symbol
      chainId
    }
  }
`

export const modifyOrderMutation = gql`
  mutation modifyOrder($input: ModifyOrderInput!) {
    modifyOrder(input: $input) {
      id
    }
  }
`

export const getHistoryStatistic = gql`
  query historyStatistic($input: SearchOrderInput!) {
    historyStatistic(input: $input) {
      totalOrder
      totalBuyQuote
      totalBuyUsd
      totalSellQuote
      totalSellUsd
    }
  }
`
export const cancelOrderMutation = gql`
  mutation cancelOrder($id: ID!) {
    cancelOrder(id: $id) {
      id
    }
  }
`

export const getHoldingQuantityQuery = gql`
  query getPortfolio($input: SearchPortfolioInput!) {
    getPortfolio(input: $input) {
      data {
        totalBaseAmount
      }
    }
  }
`

export const createOrderByWeb3Mutation = gql`
  mutation saveWeb3Order($input: SaveWeb3OrderInput!) {
    saveWeb3Order(input: $input) {
      id
    }
  }
`

export const getLastTransactions = gql`
  query lastTransactions($input: SearchLastTransactionInput!) {
    lastTransactions(input: $input) {
      data {
        maker
        token
        symbol
        chainId
        transactionType
        priceUsd
        baseAmount
        usdAmount
        quoteAmount
        nativeAmount
        txid
        marketCap
        timestamp
        liquidity
        topLiquidity
        factory
        isKlineTx
        nativeAmount
        eventIndex
        logIndex
        reasonFiltering
      }
      fromTimestamp
    }
  }
`

export const getUncompletedOrders = gql`
  query GetUncompletedOrders($input: SearchOrderInput!) {
    getUncompletedOrders(input: $input) {
      total
      orders {
        id
        createdAt
        transactionType
        baseAddress
        baseAmount
        quoteAmount
        txid
        chainId
        baseDecimal
        baseSymbol
        slippage
        pnl
        closePriceQuote
        closePriceUsd
        slippageLossAmount
        platformFeeAmount
        antiMevFeeAmount
        gasFeeAmount
        pumpFeeAmount
        antiMevFeeAmount
        platformFeeAmount
        priorityFeeAmount
        closeBaseUsdRate
        marketCap
        openPrice
        status
        submitCode
      }
    }
  }
`

export const getTradingConfig = gql`
  query config {
    config {
      platformFee
      xstockPlatformFee
    }
  }
`
