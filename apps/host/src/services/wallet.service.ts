import { gql, TypedDocumentNode } from '@apollo/client'
import { Mutation, MutationAliasWalletArgs } from '@/@generated/gql/graphql-future.ts'
import { Query as WalletQuery } from '@/@generated/gql/graphql-wallet.ts'
import { Query } from '@/@generated/gql/graphql-core.ts'

export const getWithdrawFee: TypedDocumentNode<Pick<WalletQuery, 'getWithdrawFee'>> = gql`
  query getWithdrawFee($input: WithdrawInput!) {
    getWithdrawFee(input: $input) {
      network
      fee
      unit
      gasLimit
      gasPrice
    }
  }
`

export const getWithdrawHistory = gql`
  query getWithdrawHistory($input: SearchWithdrawHistoryInput!) {
    getWithdrawHistory(input: $input) {
      createdAt
      updatedAt
      id
      userId
      fromAddress
      toAddress
      token
      chainId
      decimals
      amount
      status
      network
      txid
      errorCode
      errorMessage
      meta
    }
  }
`

export const getWithdrawStatistics = gql`
  query getWithdrawStatistics($input: WithdrawStatisticsInput!) {
    getWithdrawStatistics(input: $input) {
      totalProcessing
      processingItems {
        id
        createdAt
        fromAddress
        toAddress
        token
        chainId
        amount
        status
        txid
        errorCode
        errorMessage
        fee
        blockNumber
      }
    }
  }
`

export const getFundingWalletHistory: TypedDocumentNode<Pick<Query, 'getFundingWalletHistory'>> = gql`
  query getFundingWalletHistory($input: SearchFundingWalletTransferHistory!) {
    getFundingWalletHistory(input: $input) {
      id
      createdAt
      timestamp
      address
      type
      status
      token
      chainId
      rawBalance
      nativeBalance
      balance
      amount
      amountUsd
      fee
      rawFee
      blockNumber
      toBlockNumber
      tokenAccount
      from
      to
      txHash
      errorCode
      errorMessage
      toChainId
      toToken
      toAmount
      route
      crossChainFee
      crossChainFeeUnit
      depositAddress
      depositChainId
      depositToken
      depositAmount
      depositFee
      depositTxHash
      depositStatus
      depositErrorCode
      depositErrorMessage
      toAmountUsd
      toTxHash
      memo
    }
  }
`

export const getWalletWhitelist = gql`
  query getWalletWhitelist {
    getWalletWhitelist {
      id
      userId
      whitelist {
        chainId
        walletAddress
      }
      createdAt
      updatedAt
    }
  }
`

export const withdrawTurnkey = gql`
  mutation withdrawTurnkey($input: WithdrawTurnkeyInput!) {
    withdrawTurnkey(input: $input) {
      createdAt
      updatedAt
      id
      userId
      fromAddress
      toAddress
      token
      chainId
      decimals
      amount
      status
      network
      txid
      errorCode
      errorMessage
      meta
      isOkxWallet
      activityId
    }
  }
`

export const followWallet = gql`
  mutation followWallet($input: SmartMoneyFollowInput!) {
    followWallet(req: $input)
  }
`

export const unFollowWallet = gql`
  mutation unFollowWallet($input: SmartMoneyFollowInput!) {
    unFollowWallet(req: $input)
  }
`

export const addFollowingWallet = gql`
  mutation AddFollowingWallet($input: AddFollowingWalletReq!) {
    addFollowingWallet(req: $input)
  }
`

export const importFollowingWallet = gql`
  mutation ImportFollowingWallet($input: ImportFollowingWalletReq!) {
    importFollowingWallet(req: $input)
  }
`

export const aliasWallet: TypedDocumentNode<Pick<Mutation, 'aliasWallet'>, MutationAliasWalletArgs> = gql`
  mutation AliasWallet($req: WalletAliasReq!) {
    aliasWallet(req: $req)
  }
`

export const getPortfolioStatistic = gql`
  query GetPortfolioStatistic($req: GetPortfolioStatistic!) {
    getPortfolioStatistic(req: $req) {
      realizedPnlUsd
      totalRealizedPnlUsd
      totalBuyUsd
      avgRealizedPnlUsd
      buyAmountUsd
      avgHoldDuration
      avgBuyAmountUsd
      buys
      sells
      pnlLtMinusDot5Num
      pnlMinusDot5To0xNum
      pnlLt2xNum
      pnl2xTo5xNum
      pnlGt5xNum
      buys30D
      sells30D
      realizedPnlUsd30D
      buyAmountUsd30D
      trackingCount
      aliasCount
    }
  }
`

export const submitPermitDeposit = gql`
  mutation SubmitPermitDeposit($input: PermitDepositInput!) {
    submitPermitDeposit(input: $input) {
      id
      status
    }
  }
`
