// import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
// import { TagModel } from '@/modules/prediction/models/TagModel.ts'
import { Event } from '@/@generated/gql/graphql-prediction.ts'

/**
 * Temporary model for Event data. It should be replaced to GraphQL model later.
 *
 * Example data:
 * "id": "42365",
 *         "ticker": "will-the-us-invade-venezuela-in-2025",
 *         "slug": "will-the-us-invade-venezuela-in-2025",
 *         "title": "Will the U.S. invade Venezuela by...?",
 *         "description": "This market will resolve to \"Yes\" if the United States commences a military offensive intended to establish control over any portion of Venezuela between September 6 and December 31, 2025, 11:59 PM ET. Otherwise, this market will resolve to \"No\".\n\nFor the purposes of this market, land de facto controlled by Venezuela or the United States as of September 6, 2025, 12:00 PM ET, will be considered the sovereign territory of that country.\n\nThe resolution source for this market will be a consensus of credible sources.",
 *         "resolutionSource": "",
 *         "startDate": "2025-09-06T21:07:27.582053Z",
 *         "creationDate": "2025-09-06T21:07:27.58205Z",
 *         "endDate": "2026-03-31T00:00:00Z",
 *         "image": "https://polymarket-upload.s3.us-east-2.amazonaws.com/will-the-us-invade-venezuela-in-2025-1rL-noxxRItP.jpg",
 *         "icon": "https://polymarket-upload.s3.us-east-2.amazonaws.com/will-the-us-invade-venezuela-in-2025-1rL-noxxRItP.jpg",
 *         "active": true,
 *         "closed": false,
 *         "archived": false,
 *         "new": false,
 *         "featured": true,
 *         "restricted": true,
 *         "liquidity": 334666.98631,
 *         "volume": 9569019.111425,
 *         "openInterest": 0,
 *         "createdAt": "2025-09-06T20:15:38.169778Z",
 *         "updatedAt": "2026-01-05T06:47:06.626492Z",
 *         "competitive": 0.9296920395119117,
 *         "volume24hr": 1250629.0169300013,
 *         "volume1wk": 6725398.745171004,
 *         "volume1mo": 7884913.993350004,
 *         "volume1yr": 9444602.076395001,
 *         "enableOrderBook": true,
 *         "liquidityClob": 334666.98631,
 *         "negRisk": false,
 *         "commentCount": 976,
 */
// export interface EventModel {
//   id: string
//   ticker: string
//   slug: string
//   title: string
//   description: string
//   resolutionSource: string
//   startDate: string
//   creationDate: string
//   endDate: string
//   image: string
//   icon: string
//   active: boolean
//   closed: boolean
//   archived: boolean
//   new: boolean
//   featured: boolean
//   restricted: boolean
//   liquidity: number
//   volume: number
//   openInterest: number
//   createdAt: string
//   updatedAt: string
//   competitive: number
//   volume24hr: number
//   volume1wk: number
//   volume1mo: number
//   volume1yr: number
//   enableOrderBook: boolean
//   liquidityClob: number
//   negRisk: boolean
//   commentCount: number
//   markets: MarketModel[]
//   tags: TagModel[]
// }

export type EventModel = Event
