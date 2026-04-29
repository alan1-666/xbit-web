import {
  PriceAtFilter,
  PriceChartBase,
  PriceChartQuote,
  PriceChartSource,
  PriceTimeframe,
} from '@/@generated/gql/graphql-prediction.ts'

export interface EventsListQueryParams {
  filter?: any
  sort?: any
}

export const QUERY_KEYS_CONFIGS = {
  eventsList: (tag: string, params: EventsListQueryParams) => ['prediction', 'events', tag, params.filter, params.sort],
  trending: (params: EventsListQueryParams) => ['prediction', 'events', 'trending', params.filter, params.sort],
  new: (params: EventsListQueryParams) => ['prediction', 'events', 'new', params.filter, params.sort],
  favorites: () => ['prediction', 'events', 'favorites'],
  eventDetails: (eventSlug: string) => ['prediction', 'event', eventSlug, 'details'],
  eventComments: (eventId: string) => ['prediction', 'event', eventId, 'comments'],
  marketOrderBook: (marketId: string, tokenId: string) => ['prediction', 'marketOrderBook', marketId, tokenId],
  userPositions: (userAddress: string, eventId: string | undefined, filter: any) => [
    'prediction',
    'users',
    userAddress,
    'positions',
    eventId,
    filter,
  ],
  predicateUserPositions: (queryKey: string[], userAddress: string) => {
    return (
      queryKey[0] === 'prediction' &&
      queryKey[1] === 'users' &&
      queryKey[2] === userAddress &&
      queryKey[3] === 'positions'
    )
  },
  predicateEventPositions: (queryKey: string[], userAddress: string, eventId: string) => {
    return (
      queryKey[0] === 'prediction' &&
      queryKey[1] === 'users' &&
      queryKey[2] === userAddress &&
      queryKey[3] === 'positions' &&
      queryKey[4] === eventId
    )
  },
  cryptoPrice: (source: PriceChartSource, base: PriceChartBase, quote: PriceChartQuote) => [
    'priceChart',
    source,
    base,
    quote,
  ],
  priceSnapshot: (source: PriceChartSource, base: PriceChartBase, endTime: number) => [
    'priceSnapshot',
    source,
    base,
    endTime,
  ],
  seriesByID: (id: string) => ['prediction', 'series', id],
  priceAt: (source: PriceChartSource, base: PriceChartBase, timestamp: number, filter?: PriceAtFilter) => [
    'priceAt',
    source,
    base,
    timestamp,
    filter,
  ],
  polymarketProxyWallet: () => ['prediction', 'polymarketProxyWallet'],
  pendingDeductions: () => ['prediction', 'pendingDeductions'],
  supportedRelayAssets: () => ['prediction', 'supportedRelayAssets'],
  supportedRelayChains: () => ['prediction', 'supportedRelayChains'],
  myPositions: (...spreads: any) => ['prediction', 'myPositions', ...spreads],
  myPositionsByEvent: (eventId: string) => ['prediction', 'myPositions', eventId],
  priceResult: (
    source: PriceChartSource,
    base: PriceChartBase,
    timeframe: PriceTimeframe,
    timestamp?: number,
    seriesID?: string,
  ) => ['priceResult', source, base, timeframe, timestamp, seriesID],
  polymarketTwitterPosts: (category: string) => ['prediction', 'polymarketTwitterPosts', category],
}
