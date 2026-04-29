// Define GraphQL queries and mutations for predictions
import { gql, TypedDocumentNode } from '@apollo/client'
import {
  Query,
  QueryGetClosedUserPositionArgs,
  QueryGetCommentsArgs,
  QueryGetEventArgs,
  QueryGetEventsArgs,
  QueryGetCryptoEventsArgs,
  QueryGetMarketsArgs,
  QueryGetOrderBookArgs,
  QueryGetPriceHistoryArgs,
  QueryGetTopMarketHolderArgs,
  QueryGetTotalUserPositionArgs,
  QuerySearchArgs,
  QueryGetUserPnlArgs,
  QueryGetUserTradeMarketArgs,
  QueryGetPriceChartArgs,
  QueryGetSeriesByIdArgs,
  QueryGetPriceAtArgs,
  Mutation,
  MutationAddEventToFavoriteArgs,
  MutationRemoveEventFromFavoriteArgs,
  QueryGetPriceResultArgs,
  MutationCreateCommentArgs,
  QueryGetResolutionArgs,
  MutationToggleCommentReactionArgs,
  QueryGetPolymarketTwitterPostsArgs,
  MutationSubscribeMarketArgs,
  MutationUnsubscribeMarketArgs,
  MutationRenewMarketSubscriptionArgs,
  QueryGetBreakingMarketsArgs,
  QueryGetFinanceEventsArgs,
  QueryGetPriceSnapshotArgs,
} from '@/@generated/gql/graphql-prediction.ts'
import { Mutation as UserMutation, MutationCreateServiceExternalWalletArgs } from '@/@generated/gql/graphql-user.ts'

export const getEventsWithMarketsQuery: TypedDocumentNode<Pick<Query, 'getEvents'>, QueryGetEventsArgs> = gql`
  query GetEvents($limit: Int, $offset: Int, $filter: EventFilter, $sort: SortConfig) {
    getEvents(limit: $limit, offset: $offset, filter: $filter, sort: $sort) {
      items {
        id
        countryName
        electionType
        live
        provider
        providerId
        ticker
        slug
        title
        description
        startDate
        creationDate
        endDate
        image
        icon
        active
        closed
        archived
        isNew
        featured
        liquidity
        volume
        createdAt
        updatedAt
        competitive
        volume24hr
        volume1wk
        volume1mo
        volume1yr
        startTime
        sortBy
        isFavorite
        markets {
          id
          provider
          providerId
          question
          conditionId
          slug
          resolutionSource
          endDate
          startDate
          image
          icon
          description
          outcomes
          outcomePrices
          volume
          liquidity
          active
          closed
          createdAt
          updatedAt
          closedTime
          new
          featured
          submitted_by
          archived
          questionID
          volumeNum
          liquidityNum
          volume24hr
          volume1wk
          volume1mo
          volume1yr
          clobTokenIds
          volume24hrClob
          volume1wkClob
          volume1moClob
          volume1yrClob
          volumeClob
          liquidityClob
          approved
          oneDayPriceChange
          allTimePriceChangePct
          oneHourPriceChange
          lastTradePrice
          tokenYesBestBid
          tokenYesBestAsk
          tokenNoBestBid
          tokenNoBestAsk
          groupItemTitle
          groupItemThreshold
          sportsMarketType
          feeEnable
          makerBaseFee
          takerBaseFee
          orderPriceMinTickSize
        }
        tags {
          id
          label
          slug
        }
        series {
          recurrence
        }
      }
    }
  }
`

export const getEvent: TypedDocumentNode<Pick<Query, 'getEvent'>, QueryGetEventArgs> = gql`
  query GetEvent($id: String, $slug: String) {
    getEvent(id: $id, slug: $slug) {
      id
      live
      score
      provider
      providerId
      ticker
      slug
      title
      description
      startDate
      creationDate
      endDate
      image
      icon
      active
      closed
      archived
      isNew
      featured
      liquidity
      volume
      createdAt
      updatedAt
      competitive
      volume24hr
      volume1wk
      volume1mo
      volume1yr
      startTime
      sortBy
      isFavorite
      showMarketImages
      markets {
        id
        provider
        providerId
        question
        conditionId
        slug
        resolutionSource
        endDate
        startDate
        image
        icon
        description
        outcomes
        outcomePrices
        volume
        liquidity
        active
        closed
        createdAt
        updatedAt
        closedTime
        new
        featured
        submitted_by
        archived
        questionID
        volumeNum
        liquidityNum
        volume24hr
        volume1wk
        volume1mo
        volume1yr
        clobTokenIds
        volume24hrClob
        volume1wkClob
        volume1moClob
        volume1yrClob
        volumeClob
        liquidityClob
        approved
        oneDayPriceChange
        allTimePriceChangePct
        oneHourPriceChange
        lastTradePrice
        tokenYesBestBid
        tokenYesBestAsk
        tokenNoBestBid
        tokenNoBestAsk
        groupItemTitle
        groupItemThreshold
        sportsMarketType
        line
        feeEnable
        makerBaseFee
        takerBaseFee
        orderPriceMinTickSize
        groupItemThreshold
        umaEndDate
      }
      series {
        id
        provider
        providerId
        ticker
        slug
        title
        seriesType
        description
        image
        icon
        active
        closed
        startDate
        createdAt
        recurrence
      }
      tags {
        id
        label
        slug
      }
    }
  }
`

export const getPriceHistory: TypedDocumentNode<Pick<Query, 'getPriceHistory'>, QueryGetPriceHistoryArgs> = gql`
  query GetPriceHistory($filter: PriceHistoryFilter!) {
    getPriceHistory(filter: $filter) {
      history {
        t
        p
      }
    }
  }
`

export const buildGetPriceHistoryQuery = (tokensLength: number) => {
  const input = Array.from({ length: tokensLength }, (_, i) => `$filter${i + 1}: PriceHistoryFilter!`).join(', ')
  const queries = Array.from({ length: tokensLength }, (_, i) => {
    return `token${i + 1}: getPriceHistory(filter: $filter${i + 1}) {
      history {
        t
        p
      }
    }`
  }).join('\n')
  return gql`query GetPriceHistory(${input}) {
      ${queries}
    }
  ` as TypedDocumentNode<Record<string, Pick<Query, 'getPriceHistory'>['getPriceHistory']>>
}

export const getOrderBook: TypedDocumentNode<Pick<Query, 'getOrderBook'>, QueryGetOrderBookArgs> = gql`
  query GetOrderBook($filter: OrderBookInput!) {
    getOrderBook(filter: $filter) {
      marketId
      tokenId
      timestamp
      hash
      bids {
        price
        size
      }
      asks {
        price
        size
      }
    }
  }
`

export const search: TypedDocumentNode<Pick<Query, 'search'>, QuerySearchArgs> = gql`
  query Search($q: String!) {
    search(q: $q) {
      hasMore
      events {
        id
        closed
        title
        slug
        image
        endDate
        markets {
          slug
          question
          outcomes
          outcomePrices
          endDate
          groupItemTitle
        }
      }
    }
  }
`

export const getComments: TypedDocumentNode<Pick<Query, 'getComments'>, QueryGetCommentsArgs> = gql`
  query GetComments($filter: CommentFilter!, $limit: Int, $offset: Int, $order: String, $ascending: Boolean) {
    getComments(filter: $filter, limit: $limit, offset: $offset, order: $order, ascending: $ascending) {
      limit
      offset
      items {
        id
        provider
        providerId
        body
        type
        parentId
        parentCommentId
        userAddress
        replyAddress
        replyProxyWallet
        replyUsername
        createdAt
        updatedAt
        reportCount
        reactionCount
        profile {
          name
          pseudonym
          displayUsernamePublic
          bio
          isMod
          isCreator
          proxyWallet
          baseAddress
          profileImage
        }
        reactions {
          provider
          providerId
          reactionType
          icon
          userAddress
          createdAt
          userId
        }
      }
    }
  }
`

export const getMarkets: TypedDocumentNode<Pick<Query, 'getMarkets'>, QueryGetMarketsArgs> = gql`
  query GetMarkets($limit: Int, $offset: Int, $sort: MarketSortField, $ascending: Boolean, $filter: MarketFilter) {
    getMarkets(limit: $limit, offset: $offset, sort: $sort, ascending: $ascending, filter: $filter) {
      limit
      offset
      items {
        id
        provider
        providerId
        question
        conditionId
        slug
        resolutionSource
        endDate
        startDate
        image
        icon
        description
        outcomes
        outcomePrices
        volume
        liquidity
        active
        closed
        createdAt
        updatedAt
        closedTime
        new
        featured
        submitted_by
        archived
        questionID
        volumeNum
        liquidityNum
        volume24hr
        volume1wk
        volume1mo
        volume1yr
        clobTokenIds
        volume24hrClob
        volume1wkClob
        volume1moClob
        volume1yrClob
        volumeClob
        liquidityClob
        approved
        oneDayPriceChange
        oneHourPriceChange
        lastTradePrice
        tokenYesBestBid
        tokenYesBestAsk
        tokenNoBestBid
        tokenNoBestAsk
        groupItemTitle
        groupItemThreshold
        feeEnable
        makerBaseFee
        takerBaseFee
        orderPriceMinTickSize
        events {
          slug
          image
        }
      }
    }
  }
`

export const getRelatedTags: TypedDocumentNode<Pick<Query, 'getRelatedTag'>> = gql`
  query GetRelatedTag($id: String, $slug: String) {
    getRelatedTag(id: $id, slug: $slug) {
      provider
      id
      label
      slug
      forceShow
      publishedAt
      updatedBy
      createdAt
      updatedAt
      forceHide
      requiresTranslation
    }
  }
`

export const createServiceExternalWallet: TypedDocumentNode<
  Pick<UserMutation, 'createServiceExternalWallet'>,
  MutationCreateServiceExternalWalletArgs
> = gql`
  mutation CreateServiceExternalWallet($input: CreateServiceExternalWalletInput!) {
    createServiceExternalWallet(input: $input) {
      id
      userId
      walletAddress
      provider
      chain
      createdAt
      updatedAt
    }
  }
`

export const getUserClosedPositions: TypedDocumentNode<
  Pick<Query, 'getClosedUserPosition'>,
  QueryGetClosedUserPositionArgs
> = gql`
  query GetClosedUserPosition(
    $walletAddress: String!
    $limit: Int
    $offset: Int
    $filter: ClosedPositionFilter
    $sortBy: ClosedPositionSortField
    $sortDirection: SortDirection
  ) {
    getClosedUserPosition(
      walletAddress: $walletAddress
      limit: $limit
      offset: $offset
      filter: $filter
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      limit
      offset
      items {
        proxyWallet
        tokenID
        conditionId
        avgPrice
        totalBought
        realizedPnl
        curPrice
        timestamp
        title
        slug
        icon
        eventSlug
        outcome
        outcomeIndex
        oppositeOutcome
        oppositeAsset
        endDate
      }
    }
  }
`

export const getTotalUserPositionValue: TypedDocumentNode<
  Pick<Query, 'getTotalUserPosition'>,
  QueryGetTotalUserPositionArgs
> = gql`
  query GetTotalUserPosition($walletAddress: String!) {
    getTotalUserPosition(walletAddress: $walletAddress) {
      user
      value
    }
  }
`

export const getTopMarketHolder: TypedDocumentNode<
  Pick<Query, 'getTopMarketHolder'>,
  QueryGetTopMarketHolderArgs
> = gql`
  query GetTopMarketHolder($conditionIDs: [String!]!, $limit: Int, $minBalance: Int) {
    getTopMarketHolder(conditionIDs: $conditionIDs, limit: $limit, minBalance: $minBalance) {
      token
      holders {
        proxyWallet
        bio
        tokenID
        pseudonym
        amount
        displayUsernamePublic
        outcomeIndex
        name
        profileImage
        profileImageOptimized
      }
    }
  }
`

export const getUserPnlQuery: TypedDocumentNode<Pick<Query, 'getUserPnl'>, QueryGetUserPnlArgs> = gql`
  query GetUserPnl($userAddress: String!, $interval: UserPnlInterval, $fidelity: UserPnlFidelity) {
    getUserPnl(userAddress: $userAddress, interval: $interval, fidelity: $fidelity) {
      history {
        t
        p
      }
    }
  }
`

export const getUserTradeMarket: TypedDocumentNode<
  Pick<Query, 'getUserTradeMarket'>,
  QueryGetUserTradeMarketArgs
> = gql`
  query GetUserTradeMarket(
    $limit: Int
    $offset: Int
    $takerOnly: Boolean
    $filterType: TradeFilterType
    $filterAmount: Float
    $conditionIDs: [String!]
    $eventId: [Int!]
    $user: String
    $side: TradeSide
  ) {
    getUserTradeMarket(
      limit: $limit
      offset: $offset
      takerOnly: $takerOnly
      filterType: $filterType
      filterAmount: $filterAmount
      conditionIDs: $conditionIDs
      eventId: $eventId
      user: $user
      side: $side
    ) {
      items {
        proxyWallet
        side
        tokenId
        conditionId
        size
        price
        timestamp
        title
        slug
        icon
        eventSlug
        outcome
        outcomeIndex
        name
        pseudonym
        bio
        profileImage
        profileImageOptimized
        transactionHash
        tokenYesTickSize
        tokenNoTickSize
      }
    }
  }
`

export const getPriceChart: TypedDocumentNode<Pick<Query, 'getPriceChart'>, QueryGetPriceChartArgs> = gql`
  query GetPriceChart($source: PriceChartSource!, $base: PriceChartBase!, $quote: PriceChartQuote!) {
    getPriceChart(source: $source, base: $base, quote: $quote) {
      symbol
      source
      prices {
        timestamp
        price
      }
    }
  }
`

export const getPriceSnapshot: TypedDocumentNode<Pick<Query, 'getPriceSnapshot'>, QueryGetPriceSnapshotArgs> = gql`
  query GetPriceSnapshot($source: PriceChartSource!, $base: PriceChartBase!, $endTime: Int64!) {
    getPriceSnapshot(source: $source, base: $base, endTime: $endTime) {
      timestamp
      price
    }
  }
`

export const getSeriesByID: TypedDocumentNode<Pick<Query, 'getSeriesByID'>, QueryGetSeriesByIdArgs> = gql`
  query GetSeriesByID($id: String!) {
    getSeriesByID(id: $id) {
      id
      provider
      providerId
      ticker
      slug
      title
      seriesType
      recurrence
      events {
        id
        slug
        title
        endDate
        startTime
        closed
        image
        archived
        active
      }
    }
  }
`

export const getPriceAt: TypedDocumentNode<Pick<Query, 'getPriceAt'>, QueryGetPriceAtArgs> = gql`
  query GetPriceAt($source: PriceChartSource!, $base: PriceChartBase!, $timestamp: Int64!, $filter: PriceAtFilter) {
    getPriceAt(source: $source, base: $base, timestamp: $timestamp, filter: $filter) {
      timestamp
      price
    }
  }
`

export const addEventToFavorite: TypedDocumentNode<
  Pick<Mutation, 'addEventToFavorite'>,
  MutationAddEventToFavoriteArgs
> = gql`
  mutation AddEventToFavorite($eventId: String!) {
    addEventToFavorite(eventId: $eventId)
  }
`

export const removeEventFromFavorite: TypedDocumentNode<
  Pick<Mutation, 'removeEventFromFavorite'>,
  MutationRemoveEventFromFavoriteArgs
> = gql`
  mutation RemoveEventFromFavorite($eventId: String!) {
    removeEventFromFavorite(eventId: $eventId)
  }
`

export const getPriceResult: TypedDocumentNode<Pick<Query, 'getPriceResult'>, QueryGetPriceResultArgs> = gql`
  query GetPriceResult(
    $source: PriceChartSource!
    $base: PriceChartBase!
    $timeframe: PriceTimeframe!
    $timestamp: Int64
    $seriesID: String
  ) {
    getPriceResult(source: $source, base: $base, timeframe: $timeframe, timestamp: $timestamp, seriesID: $seriesID) {
      startTime
      endTime
      openPrice
      closePrice
      outcome
      percentChange
      eventSlug
    }
  }
`

export const createComment: TypedDocumentNode<Pick<Mutation, 'createComment'>, MutationCreateCommentArgs> = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      id
      provider
      providerId
      body
      type
      parentId
      parentCommentId
      userAddress
      replyAddress
      createdAt
      updatedAt
      reportCount
      reactionCount
      replyProxyWallet
      replyUsername
      profile {
        name
        pseudonym
        displayUsernamePublic
        bio
        isMod
        isCreator
        proxyWallet
        baseAddress
        profileImage
      }
      reactions {
        provider
        providerId
        reactionType
        icon
        userAddress
        createdAt
      }
    }
  }
`

export const getResolution: TypedDocumentNode<Pick<Query, 'getResolution'>, QueryGetResolutionArgs> = gql`
  query GetResolution($questionID: String!) {
    getResolution(questionID: $questionID) {
      questionID
      data {
        id
        author
        lastUpdateTimestamp
        status
        wasDisputed
        price
        proposedPrice
        reproposedPrice
        updates
        newVersionQ
        transactionHash
        logIndex
      }
    }
  }
`
export const toggleCommentReaction: TypedDocumentNode<
  Pick<Mutation, 'toggleCommentReaction'>,
  MutationToggleCommentReactionArgs
> = gql`
  mutation ToggleCommentReaction($input: ToggleCommentReactionInput!) {
    toggleCommentReaction(input: $input) {
      provider
      providerId
      reactionType
      icon
      userAddress
      createdAt
      commentId
      reactionCount
    }
  }
`

export const getPolymarketTwitterPosts: TypedDocumentNode<
  Pick<Query, 'getPolymarketTwitterPosts'>,
  QueryGetPolymarketTwitterPostsArgs
> = gql`
  query GetPolymarketTwitterPosts($category: TwitterCategory!) {
    getPolymarketTwitterPosts(category: $category) {
      limit
      offset
      items {
        tweetId
        category
        text
        imageUrl
        postedAt
        tweetUrl
      }
    }
  }
`

export const getCryptoEvents: TypedDocumentNode<Pick<Query, 'getCryptoEvents'>, QueryGetCryptoEventsArgs> = gql`
  query GetCryptoEvents($timeframe: CryptoTimeframe!, $limit: Int, $offset: Int) {
    getCryptoEvents(timeframe: $timeframe, limit: $limit, offset: $offset) {
      limit
      offset
      items {
        id
        provider
        providerId
        ticker
        slug
        title
        description
        startDate
        creationDate
        endDate
        image
        icon
        active
        closed
        archived
        isNew
        featured
        liquidity
        volume
        createdAt
        updatedAt
        providerCreatedAt
        competitive
        score
        period
        ended
        live
        volume24hr
        volume1wk
        volume1mo
        volume1yr
        featuredOrder
        startTime
        electionType
        countryName
        sortBy
        showMarketImages
        isFavorite
        markets {
          id
          provider
          providerId
          question
          conditionId
          slug
          resolutionSource
          endDate
          startDate
          image
          icon
          description
          outcomes
          outcomePrices
          volume
          liquidity
          active
          closed
          marketMakerAddress
          createdAt
          updatedAt
          closedTime
          new
          featured
          submitted_by
          archived
          questionID
          volumeNum
          liquidityNum
          volume24hr
          volume1wk
          volume1mo
          volume1yr
          clobTokenIds
          volume24hrClob
          volume1wkClob
          volume1moClob
          volume1yrClob
          volumeClob
          liquidityClob
          approved
          oneDayPriceChange
          oneHourPriceChange
          lastTradePrice
          tokenYesBestBid
          tokenYesBestAsk
          tokenNoBestBid
          tokenNoBestAsk
          groupItemTitle
          groupItemThreshold
          sportsMarketType
          line
          fee
          feeEnable
          makerBaseFee
          takerBaseFee
          orderMinSize
          orderPriceMinTickSize
          tokenYesTickSize
          tokenNoTickSize
          umaEndDate
          umaResolutionStatus
          resolvedBy
        }
        tags {
          id
          label
          slug
        }
        series {
          recurrence
        }
      }
    }
  }
`

export const getTrendingEvents: TypedDocumentNode<Pick<Query, 'getTrendingEvents'>> = gql`
  query GetTrendingEvents($limit: Int, $offset: Int, $filter: EventFilter, $sort: SortConfig) {
    getTrendingEvents(limit: $limit, offset: $offset, filter: $filter, sort: $sort) {
      limit
      offset
      items {
        id
        provider
        providerId
        ticker
        slug
        title
        description
        startDate
        creationDate
        endDate
        image
        icon
        active
        closed
        archived
        isNew
        featured
        liquidity
        volume
        createdAt
        updatedAt
        providerCreatedAt
        competitive
        score
        period
        ended
        live
        volume24hr
        volume1wk
        volume1mo
        volume1yr
        featuredOrder
        startTime
        electionType
        countryName
        sortBy
        showMarketImages
        isFavorite
        markets {
          id
          provider
          providerId
          question
          conditionId
          slug
          resolutionSource
          endDate
          startDate
          image
          icon
          description
          outcomes
          outcomePrices
          volume
          liquidity
          active
          closed
          marketMakerAddress
          createdAt
          updatedAt
          closedTime
          new
          featured
          submitted_by
          archived
          questionID
          volumeNum
          liquidityNum
          volume24hr
          volume1wk
          volume1mo
          volume1yr
          clobTokenIds
          volume24hrClob
          volume1wkClob
          volume1moClob
          volume1yrClob
          volumeClob
          liquidityClob
          approved
          oneDayPriceChange
          oneHourPriceChange
          lastTradePrice
          tokenYesBestBid
          tokenYesBestAsk
          tokenNoBestBid
          tokenNoBestAsk
          groupItemTitle
          groupItemThreshold
          sportsMarketType
          line
          fee
          feeEnable
          makerBaseFee
          takerBaseFee
          orderMinSize
          orderPriceMinTickSize
          tokenYesTickSize
          tokenNoTickSize
          umaEndDate
          umaResolutionStatus
          resolvedBy
        }
        tags {
          id
          label
          slug
        }
        series {
          recurrence
        }
      }
    }
  }
`

export const subscribeMarket: TypedDocumentNode<Pick<Mutation, 'subscribeMarket'>, MutationSubscribeMarketArgs> = gql`
  mutation SubscribeMarket($slug: String!) {
    subscribeMarket(slug: $slug) {
      success
      slug
      mqttTopic
      expiresAt
      message
    }
  }
`

export const unsubscribeMarket: TypedDocumentNode<
  Pick<Mutation, 'unsubscribeMarket'>,
  MutationUnsubscribeMarketArgs
> = gql`
  mutation UnsubscribeMarket($slug: String!) {
    unsubscribeMarket(slug: $slug) {
      success
      slug
      mqttTopic
      expiresAt
      message
    }
  }
`

export const renewMarketSubscription: TypedDocumentNode<
  Pick<Mutation, 'renewMarketSubscription'>,
  MutationRenewMarketSubscriptionArgs
> = gql`
  mutation RenewMarketSubscription($slug: String!) {
    renewMarketSubscription(slug: $slug) {
      success
      slug
      mqttTopic
      expiresAt
      message
    }
  }
`

export const getBreakingMarkets: TypedDocumentNode<
  Pick<Query, 'getBreakingMarkets'>,
  QueryGetBreakingMarketsArgs
> = gql`
  query GetBreakingMarkets($limit: Int, $offset: Int) {
    getBreakingMarkets(limit: $limit, offset: $offset) {
      limit
      offset
      items {
        id
        question
        image
        outcomePrices
        oneDayPriceChange
        volume
        priceHistory {
          history {
            t
            p
          }
        }
        events {
          slug
        }
      }
    }
  }
`

export const getFinanceEvents: TypedDocumentNode<Pick<Query, 'getFinanceEvents'>, QueryGetFinanceEventsArgs> = gql`
  query GetFinanceEvents($financeType: FinanceType!, $limit: Int, $offset: Int) {
    getFinanceEvents(financeType: $financeType, limit: $limit, offset: $offset) {
      limit
      offset
      items {
        id
        provider
        providerId
        ticker
        slug
        title
        description
        startDate
        creationDate
        endDate
        image
        icon
        active
        closed
        archived
        isNew
        featured
        liquidity
        volume
        createdAt
        updatedAt
        providerCreatedAt
        competitive
        score
        period
        ended
        live
        volume24hr
        volume1wk
        volume1mo
        volume1yr
        featuredOrder
        startTime
        electionType
        countryName
        sortBy
        showMarketImages
        isFavorite
        markets {
          id
          provider
          providerId
          question
          conditionId
          slug
          resolutionSource
          endDate
          startDate
          image
          icon
          description
          outcomes
          outcomePrices
          volume
          liquidity
          active
          closed
          marketMakerAddress
          createdAt
          updatedAt
          closedTime
          new
          featured
          submitted_by
          archived
          questionID
          volumeNum
          liquidityNum
          volume24hr
          volume1wk
          volume1mo
          volume1yr
          clobTokenIds
          volume24hrClob
          volume1wkClob
          volume1moClob
          volume1yrClob
          volumeClob
          liquidityClob
          approved
          oneDayPriceChange
          oneHourPriceChange
          lastTradePrice
          tokenYesBestBid
          tokenYesBestAsk
          tokenNoBestBid
          tokenNoBestAsk
          groupItemTitle
          groupItemThreshold
          sportsMarketType
          line
          fee
          feeEnable
          makerBaseFee
          takerBaseFee
          orderMinSize
          orderPriceMinTickSize
          tokenYesTickSize
          tokenNoTickSize
          umaEndDate
          umaResolutionStatus
          resolvedBy
          winningTokenId
        }
        tags {
          id
          provider
          providerId
          label
          slug
          forceShow
          publishedAt
          updatedBy
          createdAt
          updatedAt
          forceHide
          requiresTranslation
        }
        series {
          slug
        }
      }
    }
  }
`
