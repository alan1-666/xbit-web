import { Language, Query } from '@/@generated/gql/graphql-loyalty'
import { gql, TypedDocumentNode } from '@apollo/client'

export const GET_ALL_SEASON: TypedDocumentNode<Pick<Query, 'getAllSeason'>, { lang?: Language }> = gql`
  query GetAllSeason($lang: Language) {
    getAllSeason(lang: $lang) {
      seasons {
        name
        season
        year
        description
        startTime
        endTime
      }
    }
  }
`

export const GET_LOYALTY_STATUS: TypedDocumentNode<
  Pick<Query, 'getLoyaltyStatus'>,
  { req: { season?: number | null; year?: number | null; debug?: boolean | null } }
> = gql`
  query GetLoyaltyStatus($req: LoyaltyReq!) {
    getLoyaltyStatus(req: $req) {
      name
      tradingPoint
      fundPoint
      positionPoint
      referralPoint
      totalPoint
      currentRank
      boost
      seasonBoost
      pointPercent
      debug {
        activityPoint
        consecutiveActiveDay
        referralLevel1Point
        referralLevel2Point
        totalSeasonPoint
      }
    }
  }
`

export const GET_LOYALTY_LEADERBOARD: TypedDocumentNode<
  Pick<Query, 'getLoyaltyLeaderboard'>,
  { req: { season?: number | null; year?: number | null; debug?: boolean | null } }
> = gql`
  query GetLoyaltyLeaderboard($req: LoyaltyReq!) {
    getLoyaltyLeaderboard(req: $req) {
      leaderboard {
        name
        tradingPoint
        fundPoint
        positionPoint
        referralPoint
        totalPoint
        currentRank
        boost
        seasonBoost
        pointPercent
      }
    }
  }
`