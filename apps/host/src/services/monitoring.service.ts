import { gql, TypedDocumentNode } from '@apollo/client'
import { Query, SmartMoneyTokenStatisticReq, SmartMoneyTxHistoryReq } from '@/@generated/gql/graphql-future.ts'

export const getSmartMoneyMonitoring: TypedDocumentNode<
  Pick<Query, 'getSmartMoneyTxHistories' | 'getSmartMoneyTokenStatistics'>,
  { req: SmartMoneyTxHistoryReq; req2: SmartMoneyTokenStatisticReq }
> = gql`
  query GetSmartMoneyMonitoring($req: SmartMoneyTxHistoryReq!, $req2: SmartMoneyTokenStatisticReq!) {
    getSmartMoneyTxHistories(req: $req) {
      token {
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
    getSmartMoneyTokenStatistics(req: $req2) {
      token {
        address
        name
        logo
        totalSupply
      }
      lastTxTime
      realizedPnlUsd
      avgPriceUsd
      balance
      holdingDuration
      totalBuyAmountUsd
      totalBuyQuantity
      totalSellAmountUsd
      totalSellQuantity
      buys
      sells
    }
  }
`
