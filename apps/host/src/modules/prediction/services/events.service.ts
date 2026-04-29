import { EventModel } from '@/modules/prediction/models/EventModel.ts'
import { PriceModel } from '@/modules/prediction/models/PriceModel.ts'
import {
  GetBreakingMarketsInput,
  GetCommentsInput,
  GetCryptoEventsInput,
  GetEventsQueryInput,
  GetMarketsInput,
  GetOrderBookInput,
  GetPriceHistoryInput,
  GetTrendingEventsInput,
  PaginationInput,
  GetFinanceEventsInput,
} from '@/modules/prediction/types'
import { predictionClient } from '@/lib/gql/apollo-client.ts'
import {
  getComments,
  getEvent,
  getEventsWithMarketsQuery,
  getMarkets,
  getOrderBook,
  getPriceHistory,
  getTopMarketHolder,
  search,
  getPriceChart,
  getSeriesByID,
  getPriceAt,
  addEventToFavorite,
  removeEventFromFavorite,
  getPriceResult,
  createComment,
  getResolution,
  toggleCommentReaction,
  getPolymarketTwitterPosts,
  getCryptoEvents,
  getTrendingEvents,
  getBreakingMarkets,
  subscribeMarket,
  unsubscribeMarket,
  renewMarketSubscription,
  buildGetPriceHistoryQuery,
  getFinanceEvents,
  getPriceSnapshot,
} from '@/modules/prediction/gql/prediction.gql.ts'
import { OrderBookModel } from '@/modules/prediction/models/OrderBookModel.ts'
import {
  EventSortField,
  SearchResult,
  SortDirection,
  TokenHolders,
  PriceChartSource,
  PriceChartBase,
  PriceChartQuote,
  ChartPricePoint,
  Series,
  PriceTimeframe,
  PriceCandle,
  MutationCreateCommentArgs,
  MutationToggleCommentReactionArgs,
  CommentReaction,
  TwitterCategory,
  Post,
  MarketSubscriptionResult,
  Market,
  PriceHistoryFilter,
  PriceAtFilter,
} from '@/@generated/gql/graphql-prediction.ts'
import { CommentModel } from '@/modules/prediction/models/CommentModel.ts'
import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import dayjs from 'dayjs'

interface IEventService {
  getTrendingEvents(input: GetTrendingEventsInput): Promise<EventModel[]>
  getNewEvents(input: PaginationInput): Promise<EventModel[]>
  getFavoriteEvents(input: PaginationInput): Promise<EventModel[]>
  getEvent(eventId: string): Promise<EventModel | null>
  search(query: string): Promise<SearchResult>
  getPricesHistory(input: GetPriceHistoryInput): Promise<PriceModel[]>
  getMultipleMarketsPriceHistory(inputs: GetPriceHistoryInput[]): Promise<Record<string, PriceModel[]>>
  getEventsByCategory(
    input: GetEventsQueryInput,
    options?: { preserveMarketOrder?: boolean },
  ): Promise<EventModel[]>
  getCryptoEvents(input: GetCryptoEventsInput): Promise<EventModel[]>
  getOrderBook(input: GetOrderBookInput): Promise<OrderBookModel[]>
  getComments(input: GetCommentsInput): Promise<CommentModel[]>
  getMarkets(input: GetMarketsInput): Promise<MarketModel[]>
  getBreakingMarkets(input: GetBreakingMarketsInput): Promise<Market[]>
  getFinanceEvents(input: GetFinanceEventsInput): Promise<EventModel[]>
  getTopMarketHolder(clobTokenIds: string[], options?: { limit?: number; minBalance?: number }): Promise<TokenHolders[]>
  getPriceChart(source: PriceChartSource, base: PriceChartBase, quote: PriceChartQuote): Promise<ChartPricePoint[]>
  getSeriesByID(id: string): Promise<Series | null | undefined>
  getPriceAt(
    source: PriceChartSource,
    base: PriceChartBase,
    timestamp: number,
    filter?: PriceAtFilter,
  ): Promise<ChartPricePoint | null>
  addEventToFavorite(eventId: string): Promise<boolean>
  removeEventFromFavorite(eventId: string): Promise<boolean>
  getPriceResult(
    source: PriceChartSource,
    base: PriceChartBase,
    timeframe: PriceTimeframe,
    timestamp?: number,
    seriesID?: string,
  ): Promise<Array<PriceCandle> | null>
  createComment(input: MutationCreateCommentArgs): Promise<CommentModel>
  getResolution(questionID: string): Promise<any> // TODO: Add proper type when QueryGetResolutionArgs is available
  toggleCommentReaction(input: MutationToggleCommentReactionArgs): Promise<CommentReaction>
  getPolymarketTwitterPosts(category: TwitterCategory): Promise<Post[]>
  subscribeMarket(slug: string): Promise<MarketSubscriptionResult>
  unsubscribeMarket(slug: string): Promise<MarketSubscriptionResult>
  renewMarketSubscription(slug: string): Promise<MarketSubscriptionResult>
  getPriceSnapshot(
    source: PriceChartSource,
    base: PriceChartBase,
    endTime: number,
  ): Promise<Array<ChartPricePoint> | null>
}

const sortFns: Record<string, (a: MarketModel, b: MarketModel) => number> = {
  price: (a: MarketModel, b: MarketModel) => {
    const aOutcomePrice = a.outcomePrices ? +a.outcomePrices[0] : 0
    const bOutcomePrice = b.outcomePrices ? +b.outcomePrices[0] : 0
    return +bOutcomePrice - +aOutcomePrice
  },
  default: (a: MarketModel, b: MarketModel) => {
    const aIndex = a.groupItemThreshold ? +a.groupItemThreshold : 0
    const bIndex = b.groupItemThreshold ? +b.groupItemThreshold : 0
    return aIndex - bIndex
  },
}

export const DEFAULT_NEW_EVENTS_FILTER = {
  active: true,
  closed: false,
  archived: false,
  excludeTagId: ['100639', '102169'],
}

export const DEFAULT_NEW_EVENTS_SORT = { field: EventSortField.StartDate, direction: SortDirection.Desc }

class EventsService implements IEventService {
  async getTrendingEvents(input: GetTrendingEventsInput): Promise<EventModel[]> {
    const { offset, filter, sort, limit } = input
    const res = await predictionClient.query({
      query: getTrendingEvents,
      variables: {
        filter: {
          active: filter?.active ?? true,
          closed: filter?.closed ?? false,
          archived: filter?.archived ?? false,
          ...filter,
        },
        sort: sort,
        limit: limit,
        offset,
      },
    })
    return res.data.getTrendingEvents.items.map((event) => ({
      ...event,
      markets: this.sortMarkets(event, event.sortBy),
    }))
  }

  async getNewEvents(input: PaginationInput): Promise<EventModel[]> {
    const { limit, offset } = input
    const res = await predictionClient.query({
      query: getEventsWithMarketsQuery,
      variables: {
        filter: DEFAULT_NEW_EVENTS_FILTER,
        sort: DEFAULT_NEW_EVENTS_SORT,
        limit,
        offset,
      },
    })
    return res.data.getEvents.items.map((event) => ({
      ...event,
      markets: this.sortMarkets(event, event.sortBy),
    }))
  }

  async getFavoriteEvents(input: PaginationInput): Promise<EventModel[]> {
    const { limit, offset } = input
    const res = await predictionClient.query({
      query: getEventsWithMarketsQuery,
      variables: {
        filter: {
          favorite: true,
        },
        sort: DEFAULT_NEW_EVENTS_SORT,
        limit,
        offset,
      },
    })
    return res.data.getEvents.items
      .map((event) => ({
        ...event,
        markets: this.sortMarkets(event, event.sortBy),
      }))
      .filter((event) => event.isFavorite)
  }

  async getEvent(eventSlug: string): Promise<EventModel | null> {
    const res = await predictionClient.query({
      query: getEvent,
      variables: {
        slug: eventSlug,
      },
    })
    const event = res.data.getEvent
    if (!event) return null
    return {
      ...event,
      markets: this.sortMarkets(event, event.sortBy),
      startTime: this.handleStartTime(event),
    }
  }

  async search(query: string): Promise<SearchResult> {
    const res = await predictionClient.query({
      query: search,
      variables: {
        q: query,
      },
    })
    return res.data.search
  }

  async getPricesHistory(input: GetPriceHistoryInput): Promise<PriceModel[]> {
    const res = await predictionClient.query({
      query: getPriceHistory,
      variables: {
        filter: input,
      },
    })
    return res.data.getPriceHistory.history
  }

  async getMultipleMarketsPriceHistory(inputs: GetPriceHistoryInput[]): Promise<Record<string, PriceModel[]>> {
    const tokenLength = inputs.length
    const query = buildGetPriceHistoryQuery(tokenLength)
    const variables: Record<string, PriceHistoryFilter> = inputs.reduce(
      (acc, input, index) => {
        acc[`filter${index + 1}`] = input
        return acc
      },
      {} as Record<string, PriceHistoryFilter>,
    )
    const res = await predictionClient.query({
      query,
      variables,
    })
    const result: Record<string, PriceModel[]> = {}
    inputs.forEach((input, index) => {
      result[input.tokenId] = res.data[`token${index + 1}`]?.history || []
    })
    return result
  }

  async getEventsByCategory(
    input: GetEventsQueryInput,
    options?: { preserveMarketOrder?: boolean },
  ): Promise<EventModel[]> {
    const res = await predictionClient.query({
      query: getEventsWithMarketsQuery,
      variables: input,
    })
    return res.data.getEvents.items.map((event) => {
      const markets = options?.preserveMarketOrder
        ? (event.markets?.slice() ?? [])
        : this.sortMarkets(event, event.sortBy)
      return {
        ...event,
        markets,
        startTime: this.handleStartTime(event),
      }
    })
  }

  async getCryptoEvents(input: GetCryptoEventsInput): Promise<EventModel[]> {
    const res = await predictionClient.query({
      query: getCryptoEvents,
      variables: input,
    })
    return res.data.getCryptoEvents.items.map((event) => {
      return {
        ...event,
        markets: this.sortMarkets(event, event.sortBy),
        startTime: this.handleStartTime(event),
      }
    })
  }

  async getOrderBook(input: GetOrderBookInput): Promise<OrderBookModel[]> {
    const res = await predictionClient.query({
      query: getOrderBook,
      variables: {
        filter: input,
      },
    })
    return res.data.getOrderBook
  }

  async getComments(input: GetCommentsInput): Promise<CommentModel[]> {
    const res = await predictionClient.query({
      query: getComments,
      variables: input,
    })
    return res.data.getComments.items
  }

  async getMarkets(input: GetMarketsInput): Promise<MarketModel[]> {
    const res = await predictionClient.query({
      query: getMarkets,
      variables: input,
    })
    return res.data.getMarkets.items
  }

  async getBreakingMarkets(input: GetBreakingMarketsInput): Promise<Market[]> {
    const res = await predictionClient.query({
      query: getBreakingMarkets,
      variables: input,
    })
    return res.data.getBreakingMarkets.items
  }
  async getFinanceEvents(input: GetFinanceEventsInput): Promise<EventModel[]> {
    const res = await predictionClient.query({
      query: getFinanceEvents,
      variables: input,
    })
    return res.data.getFinanceEvents.items.map((event) => {
      return {
        ...event,
        markets: this.sortMarkets(event, event.sortBy),
        startTime: this.handleStartTime(event),
      }
    })
  }

  async getTopMarketHolder(
    conditionIds: string[],
    options?: { limit?: number; minBalance?: number },
  ): Promise<TokenHolders[]> {
    const res = await predictionClient.query({
      query: getTopMarketHolder,
      variables: {
        conditionIDs: conditionIds,
        limit: options?.limit,
        minBalance: options?.minBalance,
      },
    })
    return res.data.getTopMarketHolder
  }

  async getPriceChart(
    source: PriceChartSource,
    base: PriceChartBase,
    quote: PriceChartQuote,
  ): Promise<ChartPricePoint[]> {
    const res = await predictionClient.query({
      query: getPriceChart,
      variables: {
        source,
        base,
        quote,
      },
    })
    return res.data.getPriceChart.prices
  }

  async getPriceSnapshot(
    source: PriceChartSource,
    base: PriceChartBase,
    endTime: number,
  ): Promise<Array<ChartPricePoint> | null> {
    const res = await predictionClient.query({
      query: getPriceSnapshot,
      variables: {
        source,
        base,
        endTime,
      },
    })
    return res.data.getPriceSnapshot || null
  }

  async getSeriesByID(id: string): Promise<Series | null | undefined> {
    const res = await predictionClient.query({
      query: getSeriesByID,
      variables: {
        id,
      },
    })
    return res.data.getSeriesByID
  }

  async getPriceAt(
    source: PriceChartSource,
    base: PriceChartBase,
    timestamp: number,
    filter: PriceAtFilter,
  ): Promise<ChartPricePoint | null> {
    const res = await predictionClient.query({
      query: getPriceAt,
      variables: {
        source,
        base,
        timestamp,
        filter,
      },
    })
    return res.data.getPriceAt || null
  }

  async addEventToFavorite(eventId: string): Promise<boolean> {
    const res = await predictionClient.mutate({
      mutation: addEventToFavorite,
      variables: {
        eventId,
      },
    })
    return res.data?.addEventToFavorite ?? false
  }

  async removeEventFromFavorite(eventId: string): Promise<boolean> {
    const res = await predictionClient.mutate({
      mutation: removeEventFromFavorite,
      variables: {
        eventId,
      },
    })
    return res.data?.removeEventFromFavorite ?? false
  }

  private sortMarkets = (event: EventModel, sortBy: string | null | undefined) => {
    const markets = event.markets?.slice()
    if (!markets) return []
    const softFn = sortBy ? sortFns[sortBy] || sortFns['default'] : sortFns['default']
    if (softFn) {
      return markets.sort(softFn)
    }
    return markets
  }

  private handleStartTime(event: EventModel): string | undefined {
    const recurrence = event?.series?.[0]?.recurrence
    if (recurrence === 'hourly' && !event?.startTime && event.endDate) {
      const endDate = dayjs(event.endDate)
      return endDate.subtract(1, 'hour').toISOString()
    }
    return event?.startTime
  }
  async getPriceResult(
    source: PriceChartSource,
    base: PriceChartBase,
    timeframe: PriceTimeframe,
    timestamp?: number,
    seriesID?: string,
  ): Promise<Array<PriceCandle> | null> {
    const res = await predictionClient.query({
      query: getPriceResult,
      variables: {
        source,
        base,
        timeframe,
        timestamp,
        seriesID,
      },
    })
    return res.data.getPriceResult || null
  }

  async createComment(input: MutationCreateCommentArgs): Promise<CommentModel> {
    const res = await predictionClient.mutate({
      mutation: createComment,
      variables: input,
    })
    return res.data?.createComment as CommentModel
  }

  async getResolution(questionID: string): Promise<any> {
    const res = await predictionClient.query({
      query: getResolution,
      variables: {
        questionID,
      },
    })
    return res.data?.getResolution
  }

  async toggleCommentReaction(input: MutationToggleCommentReactionArgs): Promise<CommentReaction> {
    const res = await predictionClient.mutate({
      mutation: toggleCommentReaction,
      variables: input,
    })
    return res.data?.toggleCommentReaction as CommentReaction
  }

  async getPolymarketTwitterPosts(category: TwitterCategory): Promise<Post[]> {
    const res = await predictionClient.query({
      query: getPolymarketTwitterPosts,
      variables: {
        category,
      },
    })
    return res.data?.getPolymarketTwitterPosts?.items || []
  }

  async subscribeMarket(slug: string): Promise<MarketSubscriptionResult> {
    const res = await predictionClient.mutate({
      mutation: subscribeMarket,
      variables: {
        slug,
      },
    })
    return res.data?.subscribeMarket as MarketSubscriptionResult
  }

  async unsubscribeMarket(slug: string): Promise<MarketSubscriptionResult> {
    const res = await predictionClient.mutate({
      mutation: unsubscribeMarket,
      variables: {
        slug,
      },
    })
    return res.data?.unsubscribeMarket as MarketSubscriptionResult
  }

  async renewMarketSubscription(slug: string): Promise<MarketSubscriptionResult> {
    const res = await predictionClient.mutate({
      mutation: renewMarketSubscription,
      variables: {
        slug,
      },
    })
    return res.data?.renewMarketSubscription as MarketSubscriptionResult
  }
}

export const eventsService: IEventService = new EventsService()
