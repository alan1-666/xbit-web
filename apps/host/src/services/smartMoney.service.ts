import { Query, QueryGetSmartMoneyActionsArgs, QueryGetSmartMoneyActionsV2Args } from '@/@generated/gql/graphql-future.ts'
import { ListCopiedAddressesInput } from '@/@generated/gql/graphql-trading'
import { gql, TypedDocumentNode } from '@apollo/client'

export const getFollowingSmartMoney = gql`
  query GetFollowingSmartMoneys($filter: SmartMoneyFollowFilterInput!) {
    getFollowingSmartMoneys(filter: $filter) {
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
      info {
        twitterName
        walletName
      }
      dailyProfits {
        timestamp
        pnl
      }
    }
  }
`

export const getSmartMoneyActionsV2: TypedDocumentNode<
  Pick<Query, 'getSmartMoneyActionsV2'>,
  QueryGetSmartMoneyActionsV2Args
> = gql`
  query GetSmartMoneyActionsV2($req: SmartMoneyActionFilterInputV2!) {
    getSmartMoneyActionsV2(req: $req) {
      nextCursor
      hasMore
      actions {
        avatar
        txHash
        txType
        timestamp
        address
        alias
        baseAmount
        usdAmount
        nativeAmount
        usdPrice
        totalSMTx
        token {
          address
          name
          logo
          symbol
          isLowLiquidity
          totalSupply
          createdAt
        }
      }
    }
  }
`

export const getSmartMoneyActions: TypedDocumentNode<
  Pick<Query, 'getSmartMoneyActions'>,
  QueryGetSmartMoneyActionsArgs
> = gql`
  query GetSmartMoneyActions($req: SmartMoneyActionFilterInput!) {
    getSmartMoneyActions(req: $req) {
      actions {
        avatar
        alias
        timestamp
        address
        avatar
        alias
        txType
        baseAmount
        usdAmount
        nativeAmount
        usdPrice
        totalSMTx
        token {
          address
          name
          totalSupply
          logo
          symbol
          createdAt
        }
        txHash
      }
    }
  }
`

export const getSmartMoneyTradeHistories: TypedDocumentNode<Pick<Query, 'getSmartMoneyTradeHistories'>> = gql`
  query getSmartMoneyTradeHistories($req: SmartMoneyTradeHistoryReq!) {
    getSmartMoneyTradeHistories(req: $req) {
      address
      avatar
      name
      timestamp
      type
      amount
      usdAmount
      usdPrice
      token {
        logo
        address
        totalSupply
      }
      transactionHash
      nativeAmount
    }
  }
`

export const getFollowingWallets: TypedDocumentNode<Pick<Query, 'getFollowingWallets'>> = gql`
  query getFollowingWallets($filter: GetFollowingWalletReq!) {
    getFollowingWallets(req: $filter) {
      address
      alias
      avatar
      name
    }
  }
`

export const listCopiedAddresses: TypedDocumentNode<ListCopiedAddressesInput> = gql`
  query ListCopiedAddresses($input: ListCopiedAddressesInput!) {
    listCopiedAddresses(input: $input)
  }
`
