// Define query and mutation for meme2 service
import { gql, TypedDocumentNode } from '@apollo/client'
import { Query as FutureQuery, QueryGetTokenPoolInfoArgs } from '@/@generated/gql/graphql-future.ts'
import { Query as Meme2Query, QueryGetTokenCreatedByDevArgs } from '@/@generated/gql/graphql-meme2.ts'

export const getTokenPools: TypedDocumentNode<Pick<FutureQuery, 'getTokenPoolInfo'>, QueryGetTokenPoolInfoArgs> = gql`
  query GetTokenPoolInfo($input: GetTokenPoolInfoInput!) {
    getTokenPoolInfo(input: $input) {
      data {
        address
        chainId
        baseToken
        createdAt
        createdTime
        quoteToken
        quoteTokenPrice
        quoteSymbol
        baseSymbol
        baseTokenLiquidity
        quoteLiquidity
        usdLiquidity
        dex
        creator
      }
    }
  }
`

export const getClassificationStatistic: TypedDocumentNode<Pick<Meme2Query, 'getClassificationStatistic'>> = gql`
  query getClassificationStatistic($input: ClassificationStatisticInput!) {
    getClassificationStatistic(input: $input) {
      kol
      insider
      smartMoney
      whale
      fresh
      sniper
      followed
      dev
      bot
      top10
      bundler
      phishing
    }
  }
`

export const getTokenCreatedByDev: TypedDocumentNode<
  Pick<Meme2Query, 'getTokenCreatedByDev'>,
  QueryGetTokenCreatedByDevArgs
> = gql`
  query GetTokenCreatedByDev($input: TokenCreatedByDevInput!) {
    getTokenCreatedByDev(input: $input) {
      avatar
      total
      totalRug
      totalActive
      totalMigrated
      lastCreatedToken
      lastCreatedAt
      athMarketCap
      athMarketCapToken
      tokens {
        address
        symbol
        createdAt
        marketCap
        rug
        rugTime
        rugReason
        migratedAt
        liquidity
        holder
        volume1h
        volume6h
        volume24h
        logoUrl
        dexes
      }
    }
  }
`

export const getSystemMaintenanceSchedule = gql`
  query GetSystemMaintenanceSchedule {
    getSystemMaintenanceSchedule {
      isMaintainSchedule
      warningAt
      from
      to
    }
  }
`
