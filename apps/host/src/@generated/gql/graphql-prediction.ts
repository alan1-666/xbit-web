import { gql } from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Decimal: { input: any; output: any; }
  Int64: { input: any; output: any; }
  Time: { input: any; output: any; }
};

export enum ActivitySortField {
  Cash = 'CASH',
  Timestamp = 'TIMESTAMP',
  Tokens = 'TOKENS'
}

export type Category = {
  __typename?: 'Category';
  createdAt: Scalars['Time']['output'];
  id: Scalars['String']['output'];
  label: Scalars['String']['output'];
  parentCategoryId?: Maybe<Scalars['String']['output']>;
  provider: Provider;
  providerId: Scalars['String']['output'];
  slug?: Maybe<Scalars['String']['output']>;
};

export enum CategoryEnum {
  All = 'ALL',
  Breaking = 'BREAKING',
  Crypto = 'CRYPTO',
  Culture = 'CULTURE',
  Earnings = 'EARNINGS',
  Economy = 'ECONOMY',
  Elections = 'ELECTIONS',
  Finance = 'FINANCE',
  ForYou = 'FOR_YOU',
  Geopolitics = 'GEOPOLITICS',
  Mentions = 'MENTIONS',
  New = 'NEW',
  Politics = 'POLITICS',
  Sports = 'SPORTS',
  Tech = 'TECH',
  Trending = 'TRENDING',
  World = 'WORLD'
}

export type ChartPricePoint = {
  __typename?: 'ChartPricePoint';
  /** Price value */
  price: Scalars['Decimal']['output'];
  /** Unix timestamp in seconds */
  timestamp: Scalars['Int64']['output'];
};

export type ClosedPosition = {
  __typename?: 'ClosedPosition';
  avgPrice: Scalars['Decimal']['output'];
  conditionId: Scalars['String']['output'];
  curPrice: Scalars['Decimal']['output'];
  endDate: Scalars['String']['output'];
  eventSlug: Scalars['String']['output'];
  icon: Scalars['String']['output'];
  oppositeAsset: Scalars['String']['output'];
  oppositeOutcome: Scalars['String']['output'];
  outcome: Scalars['String']['output'];
  outcomeIndex: Scalars['Int']['output'];
  proxyWallet: Scalars['String']['output'];
  realizedPnl: Scalars['Decimal']['output'];
  slug: Scalars['String']['output'];
  timestamp: Scalars['Int64']['output'];
  title: Scalars['String']['output'];
  tokenID: Scalars['String']['output'];
  tokenNoTickSize: Scalars['Decimal']['output'];
  tokenYesTickSize: Scalars['Decimal']['output'];
  totalBought: Scalars['Decimal']['output'];
};

export type ClosedPositionFilter = {
  conditionID?: InputMaybe<Array<Scalars['String']['input']>>;
  eventId?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type ClosedPositionListResponse = {
  __typename?: 'ClosedPositionListResponse';
  items: Array<ClosedPosition>;
  limit: Scalars['Int']['output'];
  offset: Scalars['Int']['output'];
};

export enum ClosedPositionSortField {
  Avgprice = 'AVGPRICE',
  Price = 'PRICE',
  Realizedpnl = 'REALIZEDPNL',
  Timestamp = 'TIMESTAMP',
  Title = 'TITLE'
}

export type Comment = {
  __typename?: 'Comment';
  body?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  parentCommentId?: Maybe<Scalars['String']['output']>;
  parentId?: Maybe<Scalars['String']['output']>;
  profile?: Maybe<CommentProfile>;
  provider: Provider;
  providerId: Scalars['String']['output'];
  reactionCount?: Maybe<Scalars['Int']['output']>;
  reactions?: Maybe<Array<CommentReaction>>;
  replyAddress?: Maybe<Scalars['String']['output']>;
  replyProxyWallet?: Maybe<Scalars['String']['output']>;
  replyUsername?: Maybe<Scalars['String']['output']>;
  reportCount?: Maybe<Scalars['Int']['output']>;
  source?: Maybe<CommentSource>;
  status?: Maybe<Scalars['String']['output']>;
  type?: Maybe<CommentType>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  userAddress?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type CommentFilter = {
  getPositions?: InputMaybe<Scalars['Boolean']['input']>;
  holdersOnly?: InputMaybe<Scalars['Boolean']['input']>;
  parentId: Scalars['String']['input'];
  type: CommentType;
};

export type CommentListResponse = {
  __typename?: 'CommentListResponse';
  items: Array<Comment>;
  limit: Scalars['Int']['output'];
  offset: Scalars['Int']['output'];
};

export type CommentProfile = {
  __typename?: 'CommentProfile';
  baseAddress?: Maybe<Scalars['String']['output']>;
  bio?: Maybe<Scalars['String']['output']>;
  displayUsernamePublic?: Maybe<Scalars['Boolean']['output']>;
  isCreator?: Maybe<Scalars['Boolean']['output']>;
  isMod?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  profileImage?: Maybe<Scalars['String']['output']>;
  proxyWallet?: Maybe<Scalars['String']['output']>;
  pseudonym?: Maybe<Scalars['String']['output']>;
};

export type CommentReaction = {
  __typename?: 'CommentReaction';
  commentId: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  provider: Provider;
  providerId: Scalars['String']['output'];
  reactionCount?: Maybe<Scalars['Int']['output']>;
  reactionType?: Maybe<ReactionType>;
  userAddress?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

export enum CommentSource {
  Internal = 'internal',
  Polymarket = 'polymarket'
}

export enum CommentType {
  Event = 'Event',
  Market = 'Market',
  Series = 'Series'
}

export type CreateCommentInput = {
  body: Scalars['String']['input'];
  parentCommentId?: InputMaybe<Scalars['String']['input']>;
  parentCommentSource?: InputMaybe<CommentSource>;
  parentId: Scalars['String']['input'];
  profileImage?: InputMaybe<Scalars['String']['input']>;
  profileName?: InputMaybe<Scalars['String']['input']>;
  proxyWallet?: InputMaybe<Scalars['String']['input']>;
  replyAddress?: InputMaybe<Scalars['String']['input']>;
  replyProxyWallet?: InputMaybe<Scalars['String']['input']>;
  replyUserName?: InputMaybe<Scalars['String']['input']>;
  type: CommentType;
  userAddress?: InputMaybe<Scalars['String']['input']>;
};

export enum CryptoTimeframe {
  Bitcoin = 'BITCOIN',
  Crypto_1D = 'CRYPTO_1D',
  Crypto_1H = 'CRYPTO_1H',
  Crypto_1Mo = 'CRYPTO_1MO',
  Crypto_1W = 'CRYPTO_1W',
  Crypto_4H = 'CRYPTO_4H',
  Crypto_5M = 'CRYPTO_5M',
  Crypto_15M = 'CRYPTO_15M',
  Dogecoin = 'DOGECOIN',
  Etf = 'ETF',
  Ethereum = 'ETHEREUM',
  Microstrategy = 'MICROSTRATEGY',
  Premarket = 'PREMARKET',
  Solana = 'SOLANA',
  Xrp = 'XRP'
}

export type Event = {
  __typename?: 'Event';
  active?: Maybe<Scalars['Boolean']['output']>;
  archived?: Maybe<Scalars['Boolean']['output']>;
  closed?: Maybe<Scalars['Boolean']['output']>;
  competitive?: Maybe<Scalars['Decimal']['output']>;
  countryName?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  creationDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  electionType?: Maybe<Scalars['String']['output']>;
  endDate?: Maybe<Scalars['String']['output']>;
  ended?: Maybe<Scalars['Boolean']['output']>;
  featured?: Maybe<Scalars['Boolean']['output']>;
  featuredOrder?: Maybe<Scalars['Decimal']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  image?: Maybe<Scalars['String']['output']>;
  isFavorite?: Maybe<Scalars['Boolean']['output']>;
  isNew?: Maybe<Scalars['Boolean']['output']>;
  liquidity?: Maybe<Scalars['Decimal']['output']>;
  live?: Maybe<Scalars['Boolean']['output']>;
  markets?: Maybe<Array<MarketBase>>;
  period?: Maybe<Scalars['String']['output']>;
  provider: Provider;
  providerCreatedAt?: Maybe<Scalars['String']['output']>;
  providerId: Scalars['String']['output'];
  score?: Maybe<Scalars['String']['output']>;
  series?: Maybe<Array<SeriesBase>>;
  showMarketImages?: Maybe<Scalars['Boolean']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  sortBy?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['String']['output']>;
  startTime?: Maybe<Scalars['Time']['output']>;
  tags?: Maybe<Array<Tag>>;
  ticker?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  volume?: Maybe<Scalars['Decimal']['output']>;
  volume1mo?: Maybe<Scalars['Decimal']['output']>;
  volume1wk?: Maybe<Scalars['Decimal']['output']>;
  volume1yr?: Maybe<Scalars['Decimal']['output']>;
  volume24hr?: Maybe<Scalars['Decimal']['output']>;
};

export type EventBase = {
  __typename?: 'EventBase';
  active?: Maybe<Scalars['Boolean']['output']>;
  archived?: Maybe<Scalars['Boolean']['output']>;
  closed?: Maybe<Scalars['Boolean']['output']>;
  competitive?: Maybe<Scalars['Decimal']['output']>;
  countryName?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  creationDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  electionType?: Maybe<Scalars['String']['output']>;
  endDate?: Maybe<Scalars['String']['output']>;
  ended?: Maybe<Scalars['Boolean']['output']>;
  featured?: Maybe<Scalars['Boolean']['output']>;
  featuredOrder?: Maybe<Scalars['Decimal']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  image?: Maybe<Scalars['String']['output']>;
  isNew?: Maybe<Scalars['Boolean']['output']>;
  liquidity?: Maybe<Scalars['Decimal']['output']>;
  live?: Maybe<Scalars['Boolean']['output']>;
  period?: Maybe<Scalars['String']['output']>;
  provider: Provider;
  providerCreatedAt?: Maybe<Scalars['String']['output']>;
  providerId: Scalars['String']['output'];
  score?: Maybe<Scalars['String']['output']>;
  showMarketImages?: Maybe<Scalars['Boolean']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  sortBy?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['String']['output']>;
  startTime?: Maybe<Scalars['Time']['output']>;
  ticker?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  volume?: Maybe<Scalars['Decimal']['output']>;
  volume1mo?: Maybe<Scalars['Decimal']['output']>;
  volume1wk?: Maybe<Scalars['Decimal']['output']>;
  volume1yr?: Maybe<Scalars['Decimal']['output']>;
  volume24hr?: Maybe<Scalars['Decimal']['output']>;
};

export type EventFilter = {
  /** Deprecated: will be removed */
  active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Deprecated: will be removed */
  archived?: InputMaybe<Scalars['Boolean']['input']>;
  /** Deprecated: will be removed */
  closed?: InputMaybe<Scalars['Boolean']['input']>;
  endDate?: InputMaybe<Scalars['Int64']['input']>;
  endDateFrom?: InputMaybe<Scalars['Time']['input']>;
  endDateTo?: InputMaybe<Scalars['Time']['input']>;
  excludeTagId?: InputMaybe<Array<Scalars['String']['input']>>;
  favorite?: InputMaybe<Scalars['Boolean']['input']>;
  /** Deprecated: will be removed */
  featured?: InputMaybe<Scalars['Boolean']['input']>;
  frequency?: InputMaybe<EventFrequency>;
  hideCrypto?: InputMaybe<Scalars['Boolean']['input']>;
  hideEarning?: InputMaybe<Scalars['Boolean']['input']>;
  hideSport?: InputMaybe<Scalars['Boolean']['input']>;
  live?: InputMaybe<Scalars['Boolean']['input']>;
  startDateFrom?: InputMaybe<Scalars['Time']['input']>;
  startDateTo?: InputMaybe<Scalars['Time']['input']>;
  startTime?: InputMaybe<Scalars['Int64']['input']>;
  tagSlug?: InputMaybe<Scalars['String']['input']>;
};

export enum EventFrequency {
  All = 'All',
  Daily = 'Daily',
  Monthly = 'Monthly',
  Weekly = 'Weekly'
}

export type EventListResponse = {
  __typename?: 'EventListResponse';
  items: Array<Event>;
  limit: Scalars['Int']['output'];
  offset: Scalars['Int']['output'];
};

export enum EventSortField {
  Competitive = 'COMPETITIVE',
  CreatedAt = 'CREATED_AT',
  EndDate = 'END_DATE',
  FeatureOrder = 'FEATURE_ORDER',
  Liquidity = 'LIQUIDITY',
  StartDate = 'START_DATE',
  Volume = 'VOLUME',
  Volume_24H = 'VOLUME_24H'
}

export enum FinanceType {
  Acquisitions = 'ACQUISITIONS',
  All = 'ALL',
  Collectibles = 'COLLECTIBLES',
  Commodities = 'COMMODITIES',
  Daily = 'DAILY',
  Earnings = 'EARNINGS',
  EarningsCalls = 'EARNINGS_CALLS',
  FedRates = 'FED_RATES',
  Forex = 'FOREX',
  Indices = 'INDICES',
  Ipos = 'IPOS',
  Monthly = 'MONTHLY',
  PredictionMarkets = 'PREDICTION_MARKETS',
  Stocks = 'STOCKS',
  Treasuries = 'TREASURIES',
  Weekly = 'WEEKLY'
}

export type ImageOptimized = {
  __typename?: 'ImageOptimized';
  field?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  imageOptimizedComplete?: Maybe<Scalars['Boolean']['output']>;
  imageOptimizedLastUpdated?: Maybe<Scalars['String']['output']>;
  imageSizeKbOptimized?: Maybe<Scalars['Int']['output']>;
  imageSizeKbSource?: Maybe<Scalars['Int']['output']>;
  imageUrlOptimized?: Maybe<Scalars['String']['output']>;
  imageUrlSource?: Maybe<Scalars['String']['output']>;
  relID?: Maybe<Scalars['Int64']['output']>;
  relName?: Maybe<Scalars['String']['output']>;
};

export enum LeaderboardCategory {
  Crypto = 'CRYPTO',
  Culture = 'CULTURE',
  Economics = 'ECONOMICS',
  Finance = 'FINANCE',
  Mentions = 'MENTIONS',
  Overall = 'OVERALL',
  Politics = 'POLITICS',
  Sports = 'SPORTS',
  Tech = 'TECH',
  Weather = 'WEATHER'
}

export type LeaderboardEntry = {
  __typename?: 'LeaderboardEntry';
  pnl: Scalars['Decimal']['output'];
  profileImage: Scalars['String']['output'];
  proxyWallet: Scalars['String']['output'];
  rank: Scalars['String']['output'];
  userName: Scalars['String']['output'];
  verifiedBadge: Scalars['Boolean']['output'];
  vol: Scalars['Decimal']['output'];
  xUsername: Scalars['String']['output'];
};

export enum LeaderboardOrderBy {
  Pnl = 'PNL',
  Vol = 'VOL'
}

export enum LeaderboardTimePeriod {
  All = 'ALL',
  Day = 'DAY',
  Month = 'MONTH',
  Week = 'WEEK'
}

export type Market = {
  __typename?: 'Market';
  active?: Maybe<Scalars['Boolean']['output']>;
  allTimePriceChangePct?: Maybe<Scalars['Decimal']['output']>;
  approved?: Maybe<Scalars['Boolean']['output']>;
  archived?: Maybe<Scalars['Boolean']['output']>;
  clobTokenIds?: Maybe<Array<Scalars['String']['output']>>;
  closed?: Maybe<Scalars['Boolean']['output']>;
  closedTime?: Maybe<Scalars['String']['output']>;
  conditionId?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  endDate?: Maybe<Scalars['String']['output']>;
  endDateIso?: Maybe<Scalars['String']['output']>;
  events?: Maybe<Array<EventBase>>;
  featured?: Maybe<Scalars['Boolean']['output']>;
  fee?: Maybe<Scalars['Decimal']['output']>;
  feeEnable?: Maybe<Scalars['Boolean']['output']>;
  groupItemThreshold?: Maybe<Scalars['String']['output']>;
  groupItemTitle?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  image?: Maybe<Scalars['String']['output']>;
  lastTradePrice?: Maybe<Scalars['Decimal']['output']>;
  line?: Maybe<Scalars['Decimal']['output']>;
  liquidity?: Maybe<Scalars['String']['output']>;
  liquidityClob?: Maybe<Scalars['Decimal']['output']>;
  liquidityNum?: Maybe<Scalars['Decimal']['output']>;
  makerBaseFee?: Maybe<Scalars['Decimal']['output']>;
  new?: Maybe<Scalars['Boolean']['output']>;
  oneDayPriceChange?: Maybe<Scalars['Decimal']['output']>;
  oneHourPriceChange?: Maybe<Scalars['Decimal']['output']>;
  orderMinSize?: Maybe<Scalars['Decimal']['output']>;
  orderPriceMinTickSize?: Maybe<Scalars['Decimal']['output']>;
  outcomePrices?: Maybe<Array<Scalars['Decimal']['output']>>;
  outcomes: Array<Scalars['String']['output']>;
  priceHistory?: Maybe<PriceHistory>;
  provider: Provider;
  providerId: Scalars['String']['output'];
  question?: Maybe<Scalars['String']['output']>;
  questionID?: Maybe<Scalars['String']['output']>;
  resolutionSource?: Maybe<Scalars['String']['output']>;
  resolvedBy?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  sportsMarketType?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['String']['output']>;
  startDateIso?: Maybe<Scalars['String']['output']>;
  submitted_by?: Maybe<Scalars['String']['output']>;
  takerBaseFee?: Maybe<Scalars['Decimal']['output']>;
  tokenNoBestAsk?: Maybe<Scalars['Decimal']['output']>;
  tokenNoBestBid?: Maybe<Scalars['Decimal']['output']>;
  tokenNoTickSize?: Maybe<Scalars['Decimal']['output']>;
  tokenYesBestAsk?: Maybe<Scalars['Decimal']['output']>;
  tokenYesBestBid?: Maybe<Scalars['Decimal']['output']>;
  tokenYesTickSize?: Maybe<Scalars['Decimal']['output']>;
  umaEndDate?: Maybe<Scalars['String']['output']>;
  umaResolutionStatus?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  volume?: Maybe<Scalars['String']['output']>;
  volume1mo?: Maybe<Scalars['Decimal']['output']>;
  volume1moClob?: Maybe<Scalars['Decimal']['output']>;
  volume1wk?: Maybe<Scalars['Decimal']['output']>;
  volume1wkClob?: Maybe<Scalars['Decimal']['output']>;
  volume1yr?: Maybe<Scalars['Decimal']['output']>;
  volume1yrClob?: Maybe<Scalars['Decimal']['output']>;
  volume24hr?: Maybe<Scalars['Decimal']['output']>;
  volume24hrClob?: Maybe<Scalars['Decimal']['output']>;
  volumeClob?: Maybe<Scalars['Decimal']['output']>;
  volumeNum?: Maybe<Scalars['Decimal']['output']>;
  winningTokenId?: Maybe<Scalars['String']['output']>;
};

export type MarketBase = {
  __typename?: 'MarketBase';
  active?: Maybe<Scalars['Boolean']['output']>;
  allTimePriceChangePct?: Maybe<Scalars['Decimal']['output']>;
  approved?: Maybe<Scalars['Boolean']['output']>;
  archived?: Maybe<Scalars['Boolean']['output']>;
  clobTokenIds?: Maybe<Array<Scalars['String']['output']>>;
  closed?: Maybe<Scalars['Boolean']['output']>;
  closedTime?: Maybe<Scalars['String']['output']>;
  conditionId?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  endDate?: Maybe<Scalars['String']['output']>;
  featured?: Maybe<Scalars['Boolean']['output']>;
  fee?: Maybe<Scalars['Decimal']['output']>;
  feeEnable?: Maybe<Scalars['Boolean']['output']>;
  groupItemThreshold?: Maybe<Scalars['String']['output']>;
  groupItemTitle?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  image?: Maybe<Scalars['String']['output']>;
  lastTradePrice?: Maybe<Scalars['Decimal']['output']>;
  line?: Maybe<Scalars['Decimal']['output']>;
  liquidity?: Maybe<Scalars['String']['output']>;
  liquidityClob?: Maybe<Scalars['Decimal']['output']>;
  liquidityNum?: Maybe<Scalars['Decimal']['output']>;
  makerBaseFee?: Maybe<Scalars['Decimal']['output']>;
  marketMakerAddress?: Maybe<Scalars['String']['output']>;
  new?: Maybe<Scalars['Boolean']['output']>;
  oneDayPriceChange?: Maybe<Scalars['Decimal']['output']>;
  oneHourPriceChange?: Maybe<Scalars['Decimal']['output']>;
  orderMinSize?: Maybe<Scalars['Decimal']['output']>;
  orderPriceMinTickSize?: Maybe<Scalars['Decimal']['output']>;
  outcomePrices?: Maybe<Array<Scalars['Decimal']['output']>>;
  outcomes: Array<Scalars['String']['output']>;
  provider: Provider;
  providerId: Scalars['String']['output'];
  question?: Maybe<Scalars['String']['output']>;
  questionID?: Maybe<Scalars['String']['output']>;
  resolutionSource?: Maybe<Scalars['String']['output']>;
  resolvedBy?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  sportsMarketType?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['String']['output']>;
  submitted_by?: Maybe<Scalars['String']['output']>;
  takerBaseFee?: Maybe<Scalars['Decimal']['output']>;
  tokenNoBestAsk?: Maybe<Scalars['Decimal']['output']>;
  tokenNoBestBid?: Maybe<Scalars['Decimal']['output']>;
  tokenNoTickSize?: Maybe<Scalars['Decimal']['output']>;
  tokenYesBestAsk?: Maybe<Scalars['Decimal']['output']>;
  tokenYesBestBid?: Maybe<Scalars['Decimal']['output']>;
  tokenYesTickSize?: Maybe<Scalars['Decimal']['output']>;
  umaEndDate?: Maybe<Scalars['String']['output']>;
  umaResolutionStatus?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  volume?: Maybe<Scalars['String']['output']>;
  volume1mo?: Maybe<Scalars['Decimal']['output']>;
  volume1moClob?: Maybe<Scalars['Decimal']['output']>;
  volume1wk?: Maybe<Scalars['Decimal']['output']>;
  volume1wkClob?: Maybe<Scalars['Decimal']['output']>;
  volume1yr?: Maybe<Scalars['Decimal']['output']>;
  volume1yrClob?: Maybe<Scalars['Decimal']['output']>;
  volume24hr?: Maybe<Scalars['Decimal']['output']>;
  volume24hrClob?: Maybe<Scalars['Decimal']['output']>;
  volumeClob?: Maybe<Scalars['Decimal']['output']>;
  volumeNum?: Maybe<Scalars['Decimal']['output']>;
  winningTokenId?: Maybe<Scalars['String']['output']>;
};

export type MarketFilter = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  archived?: InputMaybe<Scalars['Boolean']['input']>;
  closed?: InputMaybe<Scalars['Boolean']['input']>;
  conditionIds?: InputMaybe<Array<Scalars['String']['input']>>;
  endDateFrom?: InputMaybe<Scalars['Time']['input']>;
  endDateTo?: InputMaybe<Scalars['Time']['input']>;
  featured?: InputMaybe<Scalars['Boolean']['input']>;
  startDateFrom?: InputMaybe<Scalars['Time']['input']>;
  startDateTo?: InputMaybe<Scalars['Time']['input']>;
  tagSlug?: InputMaybe<Scalars['String']['input']>;
};

export type MarketHolder = {
  __typename?: 'MarketHolder';
  amount: Scalars['Decimal']['output'];
  bio: Scalars['String']['output'];
  displayUsernamePublic: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  outcomeIndex: Scalars['Int']['output'];
  profileImage: Scalars['String']['output'];
  profileImageOptimized: Scalars['String']['output'];
  proxyWallet: Scalars['String']['output'];
  pseudonym: Scalars['String']['output'];
  tokenID: Scalars['String']['output'];
};

export type MarketListResponse = {
  __typename?: 'MarketListResponse';
  items: Array<Market>;
  limit: Scalars['Int']['output'];
  offset: Scalars['Int']['output'];
};

export type MarketPostResponse = {
  __typename?: 'MarketPostResponse';
  items: Array<Post>;
  limit: Scalars['Int']['output'];
  offset: Scalars['Int']['output'];
};

export enum MarketSortField {
  CreatedAt = 'CREATED_AT',
  EndDate = 'END_DATE',
  Liquidity = 'LIQUIDITY',
  PriceChange_24H = 'PRICE_CHANGE_24H',
  StartDate = 'START_DATE',
  Volume_24H = 'VOLUME_24H'
}

export type MarketSubscriptionResult = {
  __typename?: 'MarketSubscriptionResult';
  expiresAt?: Maybe<Scalars['Int64']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  mqttTopic?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addEventToFavorite: Scalars['Boolean']['output'];
  createComment: Comment;
  getServerTime: Scalars['Int64']['output'];
  removeEventFromFavorite: Scalars['Boolean']['output'];
  /**
   * Renew an existing market subscription to prevent TTL expiry.
   * Should be called every ~4 minutes (before 5min TTL expires).
   */
  renewMarketSubscription: MarketSubscriptionResult;
  /**
   * Subscribe to real-time market data for a slug.
   * Returns MQTT topic name for the client to subscribe to on the EMQX broker.
   * Subscription expires after TTL (default 5min), client must call renewMarketSubscription periodically.
   */
  subscribeMarket: MarketSubscriptionResult;
  toggleCommentReaction?: Maybe<CommentReaction>;
  /** Unsubscribe from real-time market data for a slug. */
  unsubscribeMarket: MarketSubscriptionResult;
  updateComment: Comment;
};


export type MutationAddEventToFavoriteArgs = {
  eventId: Scalars['String']['input'];
};


export type MutationCreateCommentArgs = {
  input: CreateCommentInput;
};


export type MutationRemoveEventFromFavoriteArgs = {
  eventId: Scalars['String']['input'];
};


export type MutationRenewMarketSubscriptionArgs = {
  slug: Scalars['String']['input'];
};


export type MutationSubscribeMarketArgs = {
  slug: Scalars['String']['input'];
};


export type MutationToggleCommentReactionArgs = {
  input: ToggleCommentReactionInput;
};


export type MutationUnsubscribeMarketArgs = {
  slug: Scalars['String']['input'];
};


export type MutationUpdateCommentArgs = {
  input: UpdateCommentInput;
};

export type Order = {
  __typename?: 'Order';
  price: Scalars['String']['output'];
  size: Scalars['String']['output'];
};

export type OrderBook = {
  __typename?: 'OrderBook';
  asks: Array<Order>;
  bids: Array<Order>;
  hash: Scalars['String']['output'];
  marketId: Scalars['String']['output'];
  timestamp: Scalars['String']['output'];
  tokenId: Scalars['String']['output'];
};

export type OrderBookInput = {
  marketID: Scalars['String']['input'];
  tokenId: Scalars['String']['input'];
};

export type Pagination = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type PositionMarketInfo = {
  __typename?: 'PositionMarketInfo';
  clobTokenIds?: Maybe<Array<Scalars['String']['output']>>;
  conditionId?: Maybe<Scalars['String']['output']>;
  endDate?: Maybe<Scalars['String']['output']>;
  eventSlug?: Maybe<Scalars['String']['output']>;
  groupItemTitle?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  outcomes?: Maybe<Array<Scalars['String']['output']>>;
  question?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
};

export enum PositionSortField {
  Avgprice = 'AVGPRICE',
  Cashpnl = 'CASHPNL',
  Current = 'CURRENT',
  Initial = 'INITIAL',
  Percentpnl = 'PERCENTPNL',
  Price = 'PRICE',
  Resolving = 'RESOLVING',
  Title = 'TITLE',
  Tokens = 'TOKENS'
}

export type Post = {
  __typename?: 'Post';
  category: Scalars['String']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  postedAt: Scalars['Time']['output'];
  text: Scalars['String']['output'];
  tweetId: Scalars['String']['output'];
  tweetUrl: Scalars['String']['output'];
};

export type PriceAtFilter = {
  timeframe: PriceTimeframe;
};

export type PriceCandle = {
  __typename?: 'PriceCandle';
  closePrice: Scalars['Float']['output'];
  endTime: Scalars['Int64']['output'];
  eventSlug?: Maybe<Scalars['String']['output']>;
  openPrice: Scalars['Float']['output'];
  outcome?: Maybe<PriceCandleOutcome>;
  percentChange?: Maybe<Scalars['Decimal']['output']>;
  startTime: Scalars['Int64']['output'];
};

export enum PriceCandleOutcome {
  Down = 'DOWN',
  Up = 'UP'
}

export enum PriceChartBase {
  Btc = 'BTC',
  Eth = 'ETH',
  Sol = 'SOL',
  Xrp = 'XRP'
}

export enum PriceChartQuote {
  Usdt = 'USDT'
}

export type PriceChartResponse = {
  __typename?: 'PriceChartResponse';
  /** Array of price data points sorted by timestamp descending (newest first) */
  prices: Array<ChartPricePoint>;
  /** Data source exchange */
  source: PriceChartSource;
  /** Trading pair symbol (e.g., BTCUSDT) */
  symbol: Scalars['String']['output'];
};

export enum PriceChartSource {
  Binance = 'BINANCE',
  Chainlink = 'CHAINLINK'
}

export type PriceHistory = {
  __typename?: 'PriceHistory';
  history: Array<PricePoint>;
};

export type PriceHistoryFilter = {
  /** unix timestamp in utc */
  endTime?: InputMaybe<Scalars['Int64']['input']>;
  interval?: InputMaybe<Timeframe>;
  /** The resolution of the data, in minutes */
  resolution?: InputMaybe<Scalars['Int']['input']>;
  /** unix timestamp in utc */
  startTime?: InputMaybe<Scalars['Int64']['input']>;
  tokenId: Scalars['String']['input'];
};

export type PricePoint = {
  __typename?: 'PricePoint';
  p: Scalars['Float']['output'];
  t: Scalars['Int64']['output'];
};

export enum PriceTimeframe {
  FifteenMinutes = 'FIFTEEN_MINUTES',
  FiveMinutes = 'FIVE_MINUTES',
  FourHours = 'FOUR_HOURS',
  OneDay = 'ONE_DAY',
  OneHour = 'ONE_HOUR'
}

export type ProfileStats = {
  __typename?: 'ProfileStats';
  joinDate?: Maybe<Scalars['String']['output']>;
  largestWin: Scalars['Decimal']['output'];
  trades: Scalars['Int']['output'];
  views: Scalars['Int']['output'];
};

export enum Provider {
  Internal = 'internal',
  Polymarket = 'polymarket'
}

export type Query = {
  __typename?: 'Query';
  getBreakingMarkets: MarketListResponse;
  getClosedUserPosition: ClosedPositionListResponse;
  getComments: CommentListResponse;
  getCryptoEvents: EventListResponse;
  getCurrentUserPositions: UserPositionListResponse;
  getEvent: Event;
  getEvents: EventListResponse;
  getFavoriteEvents: EventListResponse;
  getFinanceEvents: EventListResponse;
  getGameEvents: EventListResponse;
  /**
   * Get a single market by ID or slug. At least one parameter must be provided.
   * If both are provided, ID takes priority.
   */
  getMarketBySlug?: Maybe<Market>;
  getMarkets: MarketListResponse;
  getOrderBook: Array<OrderBook>;
  getPolymarketTwitterPosts: MarketPostResponse;
  /**
   * Get price at a specific timestamp.
   * Returns the closest price point at or before the given timestamp.
   */
  getPriceAt?: Maybe<ChartPricePoint>;
  /**
   * Get price chart data for trading pairs.
   * Returns the latest 60 price points from cache.
   */
  getPriceChart: PriceChartResponse;
  getPriceHistory: PriceHistory;
  /**
   * Get price result for a trading pair.
   * Returns candle data based on the specified timeframe.
   */
  getPriceResult: Array<PriceCandle>;
  getPriceSnapshot: Array<ChartPricePoint>;
  getProfileStats: ProfileStats;
  getRelatedTag: Array<Tag>;
  getResolution?: Maybe<Resolution>;
  getSeriesByID?: Maybe<Series>;
  getServerTime: Scalars['Int64']['output'];
  getSoccerEvent: Event;
  getSoccerEvents: Array<Event>;
  getSportFutureEvents: Array<SportFutureEventGroup>;
  getSportLiveEvents: EventListResponse;
  getSportPropsEvents: Array<Event>;
  getSports: Array<Sport>;
  getTeams: TeamListResponse;
  getTopMarketHolder: Array<TokenHolders>;
  getTotalUserPosition: UserTotalValue;
  getTraderLeaderBoard: Array<LeaderboardEntry>;
  getTrendingEvents: EventListResponse;
  getUserActivity: UserActivityListResponse;
  /** Get user profile data from Polymarket */
  getUserData?: Maybe<UserData>;
  /** Get user PnL history from Polymarket */
  getUserPnl: UserPnlResponse;
  /** Get user stats from Polymarket Data API */
  getUserStats?: Maybe<UserStats>;
  getUserTradeMarket: UserTradeListResponse;
  search: SearchResult;
};


export type QueryGetBreakingMarketsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetClosedUserPositionArgs = {
  filter?: InputMaybe<ClosedPositionFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<ClosedPositionSortField>;
  sortDirection?: InputMaybe<SortDirection>;
  walletAddress: Scalars['String']['input'];
};


export type QueryGetCommentsArgs = {
  ascending?: InputMaybe<Scalars['Boolean']['input']>;
  filter: CommentFilter;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetCryptoEventsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  timeframe: CryptoTimeframe;
};


export type QueryGetCurrentUserPositionsArgs = {
  filter?: InputMaybe<UserPositionFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<PositionSortField>;
  sortDirection?: InputMaybe<SortDirection>;
  walletAddress: Scalars['String']['input'];
};


export type QueryGetEventArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetEventsArgs = {
  filter?: InputMaybe<EventFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<SortConfig>;
};


export type QueryGetFavoriteEventsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<SortConfig>;
};


export type QueryGetFinanceEventsArgs = {
  financeType: FinanceType;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetGameEventsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sport: Scalars['String']['input'];
};


export type QueryGetMarketBySlugArgs = {
  id?: InputMaybe<Scalars['Int']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetMarketsArgs = {
  ascending?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<MarketFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<MarketSortField>;
};


export type QueryGetOrderBookArgs = {
  filter: OrderBookInput;
};


export type QueryGetPolymarketTwitterPostsArgs = {
  category: TwitterCategory;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  since?: InputMaybe<Scalars['Time']['input']>;
};


export type QueryGetPriceAtArgs = {
  base: PriceChartBase;
  filter?: InputMaybe<PriceAtFilter>;
  source: PriceChartSource;
  timestamp: Scalars['Int64']['input'];
};


export type QueryGetPriceChartArgs = {
  base: PriceChartBase;
  quote: PriceChartQuote;
  source: PriceChartSource;
};


export type QueryGetPriceHistoryArgs = {
  filter: PriceHistoryFilter;
};


export type QueryGetPriceResultArgs = {
  base: PriceChartBase;
  limit?: InputMaybe<Scalars['Int']['input']>;
  seriesID?: InputMaybe<Scalars['String']['input']>;
  source: PriceChartSource;
  timeframe: PriceTimeframe;
  timestamp?: InputMaybe<Scalars['Int64']['input']>;
};


export type QueryGetPriceSnapshotArgs = {
  base: PriceChartBase;
  endTime: Scalars['Int64']['input'];
  source: PriceChartSource;
};


export type QueryGetProfileStatsArgs = {
  proxyAddress: Scalars['String']['input'];
};


export type QueryGetRelatedTagArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetResolutionArgs = {
  questionID: Scalars['String']['input'];
};


export type QueryGetSeriesByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetSoccerEventArgs = {
  slug: Scalars['String']['input'];
};


export type QueryGetSoccerEventsArgs = {
  tagId?: InputMaybe<Scalars['String']['input']>;
  tagSlug?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetSportFutureEventsArgs = {
  tagSlug?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetSportLiveEventsArgs = {
  pagination?: InputMaybe<Pagination>;
};


export type QueryGetSportPropsEventsArgs = {
  sport?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetTeamsArgs = {
  filter?: InputMaybe<TeamFilter>;
  pagination?: InputMaybe<Pagination>;
};


export type QueryGetTopMarketHolderArgs = {
  conditionIDs: Array<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  minBalance?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetTotalUserPositionArgs = {
  walletAddress: Scalars['String']['input'];
};


export type QueryGetTraderLeaderBoardArgs = {
  category?: InputMaybe<LeaderboardCategory>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<LeaderboardOrderBy>;
  timePeriod?: InputMaybe<LeaderboardTimePeriod>;
  user?: InputMaybe<Scalars['String']['input']>;
  userName?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetTrendingEventsArgs = {
  filter?: InputMaybe<EventFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<SortConfig>;
};


export type QueryGetUserActivityArgs = {
  excludeDepositsWithdrawals?: InputMaybe<Scalars['Boolean']['input']>;
  includePositions?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<ActivitySortField>;
  sortDirection?: InputMaybe<SortDirection>;
  walletAddress: Scalars['String']['input'];
};


export type QueryGetUserDataArgs = {
  walletAddress: Scalars['String']['input'];
};


export type QueryGetUserPnlArgs = {
  fidelity?: InputMaybe<UserPnlFidelity>;
  interval?: InputMaybe<UserPnlInterval>;
  userAddress: Scalars['String']['input'];
};


export type QueryGetUserStatsArgs = {
  proxyAddress: Scalars['String']['input'];
};


export type QueryGetUserTradeMarketArgs = {
  conditionIDs?: InputMaybe<Array<Scalars['String']['input']>>;
  eventId?: InputMaybe<Array<Scalars['Int']['input']>>;
  filterAmount?: InputMaybe<Scalars['Float']['input']>;
  filterType?: InputMaybe<TradeFilterType>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  side?: InputMaybe<TradeSide>;
  takerOnly?: InputMaybe<Scalars['Boolean']['input']>;
  user?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySearchArgs = {
  q: Scalars['String']['input'];
};

export enum ReactionType {
  Heart = 'HEART'
}

export type Resolution = {
  __typename?: 'Resolution';
  data: ResolutionData;
  questionID: Scalars['String']['output'];
};

export type ResolutionData = {
  __typename?: 'ResolutionData';
  author: Scalars['String']['output'];
  id: Scalars['String']['output'];
  lastUpdateTimestamp: Scalars['String']['output'];
  logIndex: Scalars['String']['output'];
  newVersionQ: Scalars['Boolean']['output'];
  price: Scalars['String']['output'];
  proposedPrice: Scalars['String']['output'];
  reproposedPrice: Scalars['String']['output'];
  status: Scalars['String']['output'];
  transactionHash: Scalars['String']['output'];
  updates: Scalars['String']['output'];
  wasDisputed: Scalars['Boolean']['output'];
};

export type SearchEvent = {
  __typename?: 'SearchEvent';
  active?: Maybe<Scalars['Boolean']['output']>;
  archived?: Maybe<Scalars['Boolean']['output']>;
  closed?: Maybe<Scalars['Boolean']['output']>;
  endDate?: Maybe<Scalars['String']['output']>;
  ended?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['String']['output'];
  image?: Maybe<Scalars['String']['output']>;
  markets: Array<SearchMarket>;
  negRisk?: Maybe<Scalars['Boolean']['output']>;
  provider: Provider;
  providerCreatedAt?: Maybe<Scalars['String']['output']>;
  providerId: Scalars['String']['output'];
  slug?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export type SearchMarket = {
  __typename?: 'SearchMarket';
  active?: Maybe<Scalars['Boolean']['output']>;
  archived?: Maybe<Scalars['Boolean']['output']>;
  bestAsk?: Maybe<Scalars['Decimal']['output']>;
  bestBid?: Maybe<Scalars['Decimal']['output']>;
  closed?: Maybe<Scalars['Boolean']['output']>;
  endDate?: Maybe<Scalars['String']['output']>;
  groupItemTitle?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  lastTradePrice?: Maybe<Scalars['Decimal']['output']>;
  outcomePrices?: Maybe<Array<Scalars['String']['output']>>;
  outcomes?: Maybe<Array<Scalars['String']['output']>>;
  question?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  spread?: Maybe<Scalars['Decimal']['output']>;
  tokenNoBestAsk?: Maybe<Scalars['Decimal']['output']>;
  tokenNoBestBid?: Maybe<Scalars['Decimal']['output']>;
  tokenYesBestAsk?: Maybe<Scalars['Decimal']['output']>;
  tokenYesBestBid?: Maybe<Scalars['Decimal']['output']>;
};

export type SearchProfile = {
  __typename?: 'SearchProfile';
  displayUsernamePublic?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  proxyWallet?: Maybe<Scalars['String']['output']>;
  pseudonym?: Maybe<Scalars['String']['output']>;
};

export type SearchResult = {
  __typename?: 'SearchResult';
  events: Array<SearchEvent>;
  hasMore: Scalars['Boolean']['output'];
  tags: Array<SearchTag>;
};

export type SearchTag = {
  __typename?: 'SearchTag';
  eventCount?: Maybe<Scalars['Int']['output']>;
  id: Scalars['String']['output'];
  label?: Maybe<Scalars['String']['output']>;
  provider: Provider;
  providerId: Scalars['String']['output'];
  slug?: Maybe<Scalars['String']['output']>;
};

export type Series = {
  __typename?: 'Series';
  active?: Maybe<Scalars['Boolean']['output']>;
  closed?: Maybe<Scalars['Boolean']['output']>;
  createdAt?: Maybe<Scalars['Time']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  events?: Maybe<Array<EventBase>>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  image?: Maybe<Scalars['String']['output']>;
  liquidity?: Maybe<Scalars['Decimal']['output']>;
  provider: Provider;
  providerId: Scalars['String']['output'];
  recurrence?: Maybe<Scalars['String']['output']>;
  seriesType?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['Time']['output']>;
  ticker?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  volume?: Maybe<Scalars['Decimal']['output']>;
  volume24hr?: Maybe<Scalars['Decimal']['output']>;
};

export type SeriesBase = {
  __typename?: 'SeriesBase';
  active?: Maybe<Scalars['Boolean']['output']>;
  closed?: Maybe<Scalars['Boolean']['output']>;
  createdAt?: Maybe<Scalars['Time']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  image?: Maybe<Scalars['String']['output']>;
  liquidity?: Maybe<Scalars['Decimal']['output']>;
  provider: Provider;
  providerId: Scalars['String']['output'];
  recurrence?: Maybe<Scalars['String']['output']>;
  seriesType?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['Time']['output']>;
  ticker?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  volume?: Maybe<Scalars['Decimal']['output']>;
  volume24hr?: Maybe<Scalars['Decimal']['output']>;
};

export type SortConfig = {
  direction: SortDirection;
  field: EventSortField;
};

export enum SortDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type Sport = {
  __typename?: 'Sport';
  id: Scalars['String']['output'];
  image: Scalars['String']['output'];
  ordering: Scalars['String']['output'];
  provider?: Maybe<Provider>;
  resolution: Scalars['String']['output'];
  series: Scalars['String']['output'];
  sport: Scalars['String']['output'];
  tags: Scalars['String']['output'];
};

export type SportFilter = {
  sport?: InputMaybe<Scalars['String']['input']>;
};

export type SportFutureEventGroup = {
  __typename?: 'SportFutureEventGroup';
  events: Array<Event>;
  tagSlug: Scalars['String']['output'];
};

export type Tag = {
  __typename?: 'Tag';
  createdAt?: Maybe<Scalars['Time']['output']>;
  forceHide?: Maybe<Scalars['Boolean']['output']>;
  forceShow?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['String']['output'];
  label?: Maybe<Scalars['String']['output']>;
  provider: Provider;
  providerId: Scalars['String']['output'];
  publishedAt?: Maybe<Scalars['String']['output']>;
  requiresTranslation?: Maybe<Scalars['Boolean']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['Time']['output']>;
  updatedBy?: Maybe<Scalars['Int']['output']>;
};

export type Team = {
  __typename?: 'Team';
  abbreviation?: Maybe<Scalars['String']['output']>;
  alias?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  league: Scalars['String']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  record?: Maybe<Scalars['String']['output']>;
};

export type TeamFilter = {
  abbreviations?: InputMaybe<Array<Scalars['String']['input']>>;
  leagues?: InputMaybe<Array<Scalars['String']['input']>>;
  names?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type TeamListResponse = {
  __typename?: 'TeamListResponse';
  items: Array<Team>;
  limit: Scalars['Int']['output'];
  offset: Scalars['Int']['output'];
};

export enum Timeframe {
  Timeframe1Day = 'Timeframe1Day',
  Timeframe1H = 'Timeframe1H',
  Timeframe1Month = 'Timeframe1Month',
  Timeframe1Week = 'Timeframe1Week',
  Timeframe6Hour = 'Timeframe6Hour',
  TimeframeAll = 'TimeframeAll'
}

export type ToggleCommentReactionInput = {
  commentId: Scalars['String']['input'];
  commentSource: CommentSource;
  icon?: InputMaybe<Scalars['String']['input']>;
  reactionType: ReactionType;
};

export type TokenHolders = {
  __typename?: 'TokenHolders';
  holders: Array<MarketHolder>;
  token: Scalars['String']['output'];
};

export enum TradeFilterType {
  Cash = 'CASH',
  Tokens = 'TOKENS'
}

export enum TradeSide {
  Buy = 'BUY',
  Sell = 'SELL'
}

export enum TwitterCategory {
  All = 'ALL',
  Breaking = 'BREAKING',
  JustIn = 'JUST_IN',
  NewPolymarket = 'NEW_POLYMARKET'
}

export type UpdateCommentInput = {
  body: Scalars['String']['input'];
  id: Scalars['String']['input'];
};

export type UserActivity = {
  __typename?: 'UserActivity';
  bio: Scalars['String']['output'];
  conditionId: Scalars['String']['output'];
  eventId: Scalars['String']['output'];
  eventSlug: Scalars['String']['output'];
  icon: Scalars['String']['output'];
  isCloseable: Scalars['Boolean']['output'];
  isLost: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  outcome: Scalars['String']['output'];
  outcomeIndex: Scalars['Int']['output'];
  price: Scalars['Decimal']['output'];
  profileImage: Scalars['String']['output'];
  profileImageOptimized: Scalars['String']['output'];
  proxyWallet: Scalars['String']['output'];
  pseudonym: Scalars['String']['output'];
  side: Scalars['String']['output'];
  size: Scalars['Decimal']['output'];
  slug: Scalars['String']['output'];
  timestamp: Scalars['Int64']['output'];
  title: Scalars['String']['output'];
  tokenID: Scalars['String']['output'];
  tokenNoTickSize: Scalars['Decimal']['output'];
  tokenYesTickSize: Scalars['Decimal']['output'];
  transactionHash: Scalars['String']['output'];
  type: Scalars['String']['output'];
  usdcSize: Scalars['Decimal']['output'];
};

export type UserActivityListResponse = {
  __typename?: 'UserActivityListResponse';
  items: Array<UserActivity>;
  limit: Scalars['Int']['output'];
  offset: Scalars['Int']['output'];
};

export type UserData = {
  __typename?: 'UserData';
  createdAt: Scalars['String']['output'];
  displayUsernamePublic: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  profileImage: Scalars['String']['output'];
  proxyWallet: Scalars['String']['output'];
  pseudonym: Scalars['String']['output'];
  users: Array<UserDataUser>;
  verifiedBadge: Scalars['Boolean']['output'];
};

export type UserDataUser = {
  __typename?: 'UserDataUser';
  creator: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  mod: Scalars['Boolean']['output'];
};

export enum UserPnlFidelity {
  /** 1 day granularity */
  OneDay = 'ONE_DAY',
  /** 1 hour granularity */
  OneHour = 'ONE_HOUR'
}

export enum UserPnlInterval {
  /** All time */
  All = 'ALL',
  /** 1 month */
  OneMonth = 'ONE_MONTH',
  /** 1 week */
  OneWeek = 'ONE_WEEK'
}

export type UserPnlPoint = {
  __typename?: 'UserPnlPoint';
  /** PnL value at this timestamp */
  p: Scalars['Decimal']['output'];
  /** Unix timestamp in seconds */
  t: Scalars['Int64']['output'];
};

export type UserPnlResponse = {
  __typename?: 'UserPnlResponse';
  /** Array of PnL data points */
  history: Array<UserPnlPoint>;
};

export type UserPosition = {
  __typename?: 'UserPosition';
  avgPrice: Scalars['Decimal']['output'];
  cashPnl: Scalars['Decimal']['output'];
  conditionId: Scalars['String']['output'];
  curPrice: Scalars['Decimal']['output'];
  currentValue: Scalars['Decimal']['output'];
  endDate: Scalars['String']['output'];
  eventId: Scalars['String']['output'];
  eventSlug: Scalars['String']['output'];
  icon: Scalars['String']['output'];
  initialValue: Scalars['Decimal']['output'];
  marketId: Scalars['String']['output'];
  marketInfo?: Maybe<PositionMarketInfo>;
  mergeable: Scalars['Boolean']['output'];
  negativeRisk: Scalars['Boolean']['output'];
  oppositeAsset: Scalars['String']['output'];
  oppositeOutcome: Scalars['String']['output'];
  outcome: Scalars['String']['output'];
  outcomeIndex: Scalars['Int']['output'];
  percentPnl: Scalars['Decimal']['output'];
  percentRealizedPnl: Scalars['Decimal']['output'];
  proxyWallet: Scalars['String']['output'];
  realizedPnl: Scalars['Decimal']['output'];
  redeemable: Scalars['Boolean']['output'];
  size: Scalars['Decimal']['output'];
  slug: Scalars['String']['output'];
  tickSize: Scalars['Decimal']['output'];
  title: Scalars['String']['output'];
  tokenId: Scalars['String']['output'];
  totalBought: Scalars['Decimal']['output'];
  winningToken: Scalars['String']['output'];
};

export type UserPositionFilter = {
  conditionID?: InputMaybe<Array<Scalars['String']['input']>>;
  eventId?: InputMaybe<Array<Scalars['String']['input']>>;
  mergeable?: InputMaybe<Scalars['Boolean']['input']>;
  redeemable?: InputMaybe<Scalars['Boolean']['input']>;
  sizeThreshold?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UserPositionListResponse = {
  __typename?: 'UserPositionListResponse';
  items: Array<UserPosition>;
  limit: Scalars['Int']['output'];
  offset: Scalars['Int']['output'];
};

export type UserStats = {
  __typename?: 'UserStats';
  joinDate?: Maybe<Scalars['String']['output']>;
  largestWin: Scalars['Decimal']['output'];
  trades: Scalars['Int']['output'];
  views: Scalars['Int']['output'];
};

export type UserTotalValue = {
  __typename?: 'UserTotalValue';
  user: Scalars['String']['output'];
  value: Scalars['Decimal']['output'];
};

export type UserTrade = {
  __typename?: 'UserTrade';
  bio: Scalars['String']['output'];
  conditionId: Scalars['String']['output'];
  eventSlug: Scalars['String']['output'];
  icon: Scalars['String']['output'];
  marketId: Scalars['String']['output'];
  name: Scalars['String']['output'];
  outcome: Scalars['String']['output'];
  outcomeIndex: Scalars['Int']['output'];
  price: Scalars['Decimal']['output'];
  profileImage: Scalars['String']['output'];
  profileImageOptimized: Scalars['String']['output'];
  proxyWallet: Scalars['String']['output'];
  pseudonym: Scalars['String']['output'];
  side: Scalars['String']['output'];
  size: Scalars['Decimal']['output'];
  slug: Scalars['String']['output'];
  timestamp: Scalars['Int64']['output'];
  title: Scalars['String']['output'];
  tokenId: Scalars['String']['output'];
  tokenNoTickSize: Scalars['Decimal']['output'];
  tokenYesTickSize: Scalars['Decimal']['output'];
  transactionHash: Scalars['String']['output'];
};

export type UserTradeListResponse = {
  __typename?: 'UserTradeListResponse';
  items: Array<UserTrade>;
  limit: Scalars['Int']['output'];
  offset: Scalars['Int']['output'];
};
