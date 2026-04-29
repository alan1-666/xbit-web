// /**
//  * Temporary Market Model. It should be replaced to GraphQL model later.
//  */
// export interface MarketModel {
//   id: string
//   question: string
//   conditionId: string
//   slug: string
//   resolutionSource: string
//   endDate: string
//   startDate: string
//   image: string
//   icon: string
//   description: string
//   outcomes: string
//   outcomePrices: string
//   volume: string
//   active: boolean
//   closed: boolean
//   marketMakerAddress: string
//   createdAt: string
//   updatedAt: string
//   closedTime: string
//   new: boolean
//   featured: boolean
//   submitted_by: string
//   archived: boolean
//   resolvedBy: string
//   restricted: boolean
//   groupItemTitle: string
//   groupItemThreshold: string
//   questionID: string
//   umaEndDate: string
//   enableOrderBook: boolean
//   orderPriceMinTickSize: number
//   orderMinSize: number
//   umaResolutionStatus: string
//   lastTradePrice: number
//   clobTokenIds: string
// }

import { Market, MarketBase } from '@/@generated/gql/graphql-prediction.ts'

export type MarketModel = (Market | MarketBase) & {
  events?: Market['events']
}
