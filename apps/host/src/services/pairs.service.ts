import { gql, TypedDocumentNode } from '@apollo/client'
import { Query as Meme2Query, QueryGetOhlcArgs } from '@/@generated/gql/graphql-meme2.ts'

export const getPairsQuery = gql`
  query getPairs($input: PairInput!) {
    getPairs(input: $input) {
      page
      limit
      data {
        address
        chainId
        token0
        token1
        factory
        decimal0
        decimal1
        baseToken
        label
        createdTime
        reserve0
        reserve1
        tags
        lpAddress
        isShowAlert
        token0Info {
          address
          chainId
          symbol
          name
          decimals
          totalSupply
          tags
        }
        token1Info {
          address
          chainId
          symbol
          name
          decimals
          totalSupply
          tags
        }
        tokenInfo {
          address
          chainId
          symbol
          name
          decimals
          totalSupply
          tags
          mintDisable
          isHoneypot
          isBlacklisted
          initLiquidity
          holders
          liquidity
          burnRatio
          burnStatus
          top10HolderRate
          ratTraderAmountRate
          price
          price1mChange
          price5mChange
          price1hChange
          buyTxs1m
          buyTxs5m
          buyTxs1h
          buyTxs6h
          buyTxs24h
          sellTxs1m
          sellTxs5m
          sellTxs1h
          sellTxs6h
          sellTxs24h
          volume1m
          volume5m
          volume1h
          volume6h
          volume24h
          marketcap
        }
      }
    }
  }
`

export const getOHLCQuery = gql`
  query GetOHLC($input: OHLCInput!) {
    getOHLC(input: $input) {
      ts
      token
      open
      high
      low
      close
      price
      tokenVolume
      usdVolume
    }
  }
`

export const getCryptoCurrencyPriceQuery = gql`
  query getCryptoCurrencyPrice {
    getCryptoCurrencyPrice {
      symbol
      usdPrice
    }
  }
`

export const getOHLCShareQuery = gql`
  query GetOHLC($input: OHLCInput!) {
    getOHLC(input: $input) {
      ts
      token
      close
    }
  }
`

export const getOHLCWithUsdVolumeQuery: TypedDocumentNode<Pick<Meme2Query, 'getOHLC'>, QueryGetOhlcArgs> = gql`
  query getOHLC($input: OHLCInput!) {
    getOHLC(input: $input) {
      ts
      usdVolume
      tokenVolume
      price
      open
      close
      high
      low
    }
  }
`
