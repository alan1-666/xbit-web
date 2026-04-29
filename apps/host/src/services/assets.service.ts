import { gql, TypedDocumentNode } from '@apollo/client'
import { GeneralResponse, GetAllAssetHistoryResponse, GetAssetChartResponse } from '@/types/responses.ts'
import { GetAllAssetHistoryInput } from '@/types/requests.ts'
import { QueryGetAssetChartArgs } from '@/@generated/gql/graphql-core.ts'
import { WithdrawRecord } from '@/@generated/gql/graphql-wallet.ts'

export const getAssetHistory = gql`
  query GetAssetHistory($input: AssetHistoryInput!) {
    getAssetHistory(input: $input) {
      timestamp
      balance
    }
  }
`
export const getWalletBalance = gql`
  query GetWalletBalance($input: WalletBalanceInput!) {
    getWalletBalance(input: $input) {
      balanceChangeUsd
      usdBalance
      walletAddress
      walletType
      userId
      nativeTokenSymbol
      nativeTokenBalance
      chainId
      unrealizedPnl
      realizedPnl
    }
  }
`

export const getWalletPnl = gql`
  query GetWalletPnl($input: GetWalletPnlInput!) {
    getWalletPnl(input: $input) {
      wallets {
        pnlPerDay {
          t
          v
        }
      }
    }
  }
`

export const refreshWalletBalance = gql`
  mutation RefreshWalletBalance($input: RefreshWalletBalanceInput!) {
    refreshWalletBalance(input: $input)
  }
`

export const getAllAssetHistory: TypedDocumentNode<GetAllAssetHistoryResponse, GetAllAssetHistoryInput> = gql`
  query GetAllAssetHistory($collapseInput: AssetHistoryInput!, $expandInput: AssetHistoryInput!) {
    collapse: getAssetHistory(input: $collapseInput) {
      timestamp
      balance
    }
    expand: getAssetHistory(input: $expandInput) {
      timestamp
      balance
    }
  }
`

export const getAssetChart: TypedDocumentNode<GetAssetChartResponse, QueryGetAssetChartArgs> = gql`
  query GetAssetChartPreview($input: WalletAssetChartInput!) {
    getAssetChartPreview(input: $input) {
      t
      v
    }
    getAssetChart(input: $input) {
      t
      v
    }
  }
`

export const getWithdrawalHistory: TypedDocumentNode<GeneralResponse<'getWithdrawHistory', WithdrawRecord[]>> = gql`
  query GetWithdrawHistory($input: SearchWithdrawHistoryInput!) {
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

// ======== dex ========
export const getDexWalletBalance = gql`
  query GetUserBalance($input: UserBalanceRequest!) {
    getUserBalance(input: $input) {
      balance
      oneDayChange
      oneDayPercentChange
    }
  }
`

export const GetUserPrevDayBalance = gql`
  query GetUserPrevDayBalance($input: UserPrevDayBalanceRequest!) {
    getUserPrevDayBalance(input: $input) {
      Balance
    }
  }
`

export const getUserPosition = gql`
  query GetUserPosition($input: UserPositionRequest!) {
    getUserPosition(input: $input) {
      rawUSD
      positions {
        symbol
        size
        side
        entryPx
        fundingFee
        leverage {
          type
          value
        }
      }
    }
  }
`

export const getUserTradeHistory = gql`
  query GetUserTradeHistory {
    getUserTradeHistory {
      histories {
        symbol
        time
        pnl
        pnlPercent
        dir
        hash
        oid
        px
        startPosition
        sz
        fee
        feeToken
        tid
      }
    }
  }
`
export const getFirstDepositUSDC = gql`
  query GetFirstDepositUSDC {
    getFirstDepositUSDC {
      isFirst
    }
  }
`

export const checkUserDeprecatedAsset = gql`
  query CheckUserDeprecatedAsset {
    checkUserDeprecatedAsset {
      deprecated
      confirmedBackup
      assets {
        token
        chainId
        balance
        balanceUsd
      }
    }
  }
`

export const confirmAssetBackup = gql`
  mutation ConfirmAssetBackup {
    confirmAssetBackup
  }
`
