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
  DateTime: { input: any; output: any; }
  Decimal: { input: any; output: any; }
  Time: { input: any; output: any; }
};

export type AddressGroupResponse = {
  __typename?: 'AddressGroupResponse';
  createdAt: Scalars['Time']['output'];
  id: Scalars['String']['output'];
  isDefault: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  order: Scalars['Int']['output'];
  updatedAt: Scalars['Time']['output'];
  userId?: Maybe<Scalars['String']['output']>;
};

export type AddressResponse = {
  __typename?: 'AddressResponse';
  address: Scalars['String']['output'];
  createdAt: Scalars['Time']['output'];
  groupIds: Array<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  ownerUserId?: Maybe<Scalars['String']['output']>;
  profit1d?: Maybe<Scalars['Float']['output']>;
  profit7d?: Maybe<Scalars['Float']['output']>;
  profit30d?: Maybe<Scalars['Float']['output']>;
  remarkName?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['Time']['output'];
  userAddress?: Maybe<Scalars['String']['output']>;
};

export type BackfillRequest = {
  candleCount: Scalars['Int']['input'];
  timeframe: OhlcIntervalEnum;
};

export type BackfillResponse = {
  __typename?: 'BackfillResponse';
  candleCount: Scalars['Int']['output'];
  duration: Scalars['Float']['output'];
  errors: Array<Scalars['String']['output']>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
  symbolCount: Scalars['Int']['output'];
  timeframe: Scalars['String']['output'];
};

export type BatchCreateAddressRequest = {
  addresses: Array<CreateAddressRequest>;
};

export type BatchUpdateAddressGroupsRequest = {
  groups: Array<UpdateAddressGroupRequest>;
};

export type CoinPositionDetail = {
  __typename?: 'CoinPositionDetail';
  accountValue: Scalars['String']['output'];
  address: Scalars['String']['output'];
  coin: Scalars['String']['output'];
  createdAt: Scalars['Time']['output'];
  crossMaintenanceMarginUsed: Scalars['String']['output'];
  crossMarginRatio: Scalars['Float']['output'];
  cumFundingAllTime: Scalars['String']['output'];
  cumFundingSinceChange: Scalars['String']['output'];
  cumFundingSinceOpen: Scalars['String']['output'];
  entryPx: Scalars['String']['output'];
  leverageType: Scalars['String']['output'];
  leverageValue: Scalars['Int']['output'];
  liquidationPx?: Maybe<Scalars['String']['output']>;
  marginUsed: Scalars['String']['output'];
  maxLeverage: Scalars['Int']['output'];
  openTime?: Maybe<Scalars['Float']['output']>;
  positionType: Scalars['String']['output'];
  positionValue: Scalars['String']['output'];
  returnOnEquity: Scalars['String']['output'];
  szi: Scalars['String']['output'];
  unrealizedPnl: Scalars['String']['output'];
  updatedAt: Scalars['Time']['output'];
};

export type CoinTransactionDetail = {
  __typename?: 'CoinTransactionDetail';
  accountValue: Scalars['String']['output'];
  address: Scalars['String']['output'];
  closedPnl: Scalars['String']['output'];
  coin: Scalars['String']['output'];
  createdAt: Scalars['Time']['output'];
  crossMaintenanceMarginUsed: Scalars['String']['output'];
  crossMarginRatio: Scalars['Float']['output'];
  crossed: Scalars['Boolean']['output'];
  cumFundingAllTime: Scalars['String']['output'];
  cumFundingSinceChange: Scalars['String']['output'];
  cumFundingSinceOpen: Scalars['String']['output'];
  dir: Scalars['String']['output'];
  entryPx: Scalars['String']['output'];
  fee: Scalars['String']['output'];
  hash: Scalars['String']['output'];
  leverageType: Scalars['String']['output'];
  leverageValue: Scalars['Int']['output'];
  liquidationPx?: Maybe<Scalars['String']['output']>;
  marginUsed: Scalars['String']['output'];
  maxLeverage: Scalars['Int']['output'];
  oid: Scalars['Int']['output'];
  openTime?: Maybe<Scalars['Float']['output']>;
  positionType: Scalars['String']['output'];
  positionValue: Scalars['String']['output'];
  px: Scalars['String']['output'];
  returnOnEquity: Scalars['String']['output'];
  side: Scalars['String']['output'];
  startPosition: Scalars['String']['output'];
  szi: Scalars['String']['output'];
  tid: Scalars['Int']['output'];
  time: Scalars['Int']['output'];
  twapId?: Maybe<Scalars['Int']['output']>;
  unrealizedPnl: Scalars['String']['output'];
  updatedAt: Scalars['Time']['output'];
};

export type CreateAddressGroupRequest = {
  isDefault: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
};

export type CreateAddressRequest = {
  address: Scalars['String']['input'];
  groupIds?: InputMaybe<Array<Scalars['String']['input']>>;
  remarkName?: InputMaybe<Scalars['String']['input']>;
  userAddress?: InputMaybe<Scalars['String']['input']>;
};

export type ExportAddressesRequest = {
  format?: InputMaybe<Scalars['String']['input']>;
  groupId?: InputMaybe<Scalars['String']['input']>;
  userAddress?: InputMaybe<Scalars['String']['input']>;
};

export type ExportAddressesResponse = {
  __typename?: 'ExportAddressesResponse';
  content: Scalars['String']['output'];
  count: Scalars['Int']['output'];
  format: Scalars['String']['output'];
};

export type FollowedAddressesLatestPositionsResponse = {
  __typename?: 'FollowedAddressesLatestPositionsResponse';
  positions: Array<CoinTransactionDetail>;
  totalCount: Scalars['Int']['output'];
};

export type FollowedAddressesPositionsResponse = {
  __typename?: 'FollowedAddressesPositionsResponse';
  lastUpdated?: Maybe<Scalars['Time']['output']>;
  positionGroups: Array<PositionGroupByCoin>;
  totalAddresses: Scalars['Int']['output'];
  totalPositions: Scalars['Int']['output'];
};

export type FollowerCountResponse = {
  __typename?: 'FollowerCountResponse';
  count: Scalars['Int']['output'];
  userAddress: Scalars['String']['output'];
};

export type FundingFeeComparison = {
  __typename?: 'FundingFeeComparison';
  binanceFundingRate1d: Scalars['Decimal']['output'];
  binanceFundingRate1h: Scalars['Decimal']['output'];
  binanceFundingRate1m: Scalars['Decimal']['output'];
  binanceFundingRate1y: Scalars['Decimal']['output'];
  binanceFundingRate4h: Scalars['Decimal']['output'];
  binanceFundingRate7d: Scalars['Decimal']['output'];
  binanceFundingRate8h: Scalars['Decimal']['output'];
  bybitFundingRate1d: Scalars['Decimal']['output'];
  bybitFundingRate1h: Scalars['Decimal']['output'];
  bybitFundingRate1m: Scalars['Decimal']['output'];
  bybitFundingRate1y: Scalars['Decimal']['output'];
  bybitFundingRate4h: Scalars['Decimal']['output'];
  bybitFundingRate7d: Scalars['Decimal']['output'];
  bybitFundingRate8h: Scalars['Decimal']['output'];
  fundingCap?: Maybe<Scalars['Decimal']['output']>;
  fundingFloor?: Maybe<Scalars['Decimal']['output']>;
  /** Funding rate of asset */
  fundingRate: Scalars['Decimal']['output'];
  fundingRate1d: Scalars['Decimal']['output'];
  fundingRate1h: Scalars['Decimal']['output'];
  fundingRate1m: Scalars['Decimal']['output'];
  fundingRate1y: Scalars['Decimal']['output'];
  fundingRate4h: Scalars['Decimal']['output'];
  fundingRate7d: Scalars['Decimal']['output'];
  fundingRate8h: Scalars['Decimal']['output'];
  fundingTime: Scalars['Time']['output'];
  /** Interest rate of asset */
  interestRate: Scalars['Decimal']['output'];
  /** Interval of asset */
  interval: Scalars['String']['output'];
  markPrice?: Maybe<Scalars['Decimal']['output']>;
  /** Open interest of asset */
  openInterest: Scalars['Decimal']['output'];
  /** Open interest value in USD */
  openInterestValue: Scalars['Decimal']['output'];
  /** Symbol of asset (eg. BTCUSDC, ETHUSDC, ...) */
  symbol: Scalars['String']['output'];
};

export type FundingRate = {
  __typename?: 'FundingRate';
  /** Funding cap of asset */
  fundingCap?: Maybe<Scalars['Decimal']['output']>;
  /** Funding floor of asset */
  fundingFloor?: Maybe<Scalars['Decimal']['output']>;
  /** Funding rate of asset */
  fundingRate: Scalars['Decimal']['output'];
  /** Funding time of asset */
  fundingTime: Scalars['Time']['output'];
  /** Interest rate of asset */
  interestRate: Scalars['Decimal']['output'];
  /** Interval of asset */
  interval: Scalars['String']['output'];
  /** Mark price of asset */
  markPrice?: Maybe<Scalars['Decimal']['output']>;
  /** Symbol of asset (eg. BTCUSDC, ETHUSDC, ...) */
  symbol: Scalars['String']['output'];
};

export enum FundingRateInterval {
  /** 1 day interval - returns raw hourly data points for 7 or 14 days (limit must be 7 or 14) */
  Interval_1D = 'INTERVAL_1D',
  /** 1 hour interval (default) - returns raw hourly data points with standard pagination (limit 1-100) */
  Interval_1H = 'INTERVAL_1H'
}

export type GetFundingFeeComparisonInput = {
  pagination?: InputMaybe<PaginationInput>;
};

export type GetFundingFeeComparisonResponse = {
  __typename?: 'GetFundingFeeComparisonResponse';
  data: Array<FundingFeeComparison>;
  pagination: Pagination;
};

export type GetFundingRateHistoryInput = {
  /**
   * Interval selection (default: INTERVAL_1H).
   * - INTERVAL_1H: Standard pagination with limit 1-100
   * - INTERVAL_1D: Returns raw 1h data for 7 days (limit=7) or 14 days (limit=14)
   */
  interval?: InputMaybe<FundingRateInterval>;
  pagination?: InputMaybe<PaginationInput>;
  symbol: Scalars['String']['input'];
};

export type GetFundingRateHistoryResponse = {
  __typename?: 'GetFundingRateHistoryResponse';
  data: Array<FundingRate>;
  pagination: Pagination;
};

export type GetListFundingRateInput = {
  pagination?: InputMaybe<PaginationInput>;
  /**
   * Sort parameters (optional).
   * If not provided, defaults to openInterestValue DESC (highest market cap first).
   * Supported sort fields: symbol, fundingRate, markPrice, openInterestValue.
   */
  sort?: InputMaybe<SortInput>;
};

export type GetListFundingRateResponse = {
  __typename?: 'GetListFundingRateResponse';
  data: Array<FundingRate>;
  pagination: Pagination;
};

export type GroupOrderItem = {
  groupId: Scalars['String']['input'];
  order: Scalars['Int']['input'];
};

export type ImportAddressesRequest = {
  followerAddress?: InputMaybe<Scalars['String']['input']>;
  groupIds?: InputMaybe<Array<Scalars['String']['input']>>;
  text: Scalars['String']['input'];
};

export type ImportAddressesResponse = {
  __typename?: 'ImportAddressesResponse';
  addresses: Array<AddressResponse>;
  errors: Array<Scalars['String']['output']>;
  failedCount: Scalars['Int']['output'];
  successCount: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
};

export type LastOperationInfo = {
  __typename?: 'LastOperationInfo';
  coin: Scalars['String']['output'];
  direction: Scalars['String']['output'];
  fee: Scalars['Float']['output'];
  pnl: Scalars['Float']['output'];
  price: Scalars['Float']['output'];
  side: Scalars['String']['output'];
  size: Scalars['Float']['output'];
  time: Scalars['Int']['output'];
  tradeType: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  batchCreateAddresses: Array<AddressResponse>;
  batchUpdateAddressGroups: Array<AddressGroupResponse>;
  createAddress: AddressResponse;
  createAddressGroup: AddressGroupResponse;
  deleteAddress: Scalars['Boolean']['output'];
  deleteAddressGroup: Scalars['Boolean']['output'];
  exportAddresses: ExportAddressesResponse;
  importAddresses: ImportAddressesResponse;
  triggerBackfill: BackfillResponse;
  updateAddress: AddressResponse;
  updateFlowGroupOrder: Array<AddressGroupResponse>;
};


export type MutationBatchCreateAddressesArgs = {
  input: BatchCreateAddressRequest;
};


export type MutationBatchUpdateAddressGroupsArgs = {
  input: BatchUpdateAddressGroupsRequest;
};


export type MutationCreateAddressArgs = {
  input: CreateAddressRequest;
};


export type MutationCreateAddressGroupArgs = {
  input: CreateAddressGroupRequest;
};


export type MutationDeleteAddressArgs = {
  address?: InputMaybe<Scalars['String']['input']>;
  groupId: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
};


export type MutationDeleteAddressGroupArgs = {
  id: Scalars['String']['input'];
};


export type MutationExportAddressesArgs = {
  input: ExportAddressesRequest;
};


export type MutationImportAddressesArgs = {
  input: ImportAddressesRequest;
};


export type MutationTriggerBackfillArgs = {
  input: BackfillRequest;
};


export type MutationUpdateAddressArgs = {
  input: UpdateAddressRequest;
};


export type MutationUpdateFlowGroupOrderArgs = {
  input: UpdateFlowGroupOrderRequest;
};

export type Ohlc = {
  __typename?: 'OHLC';
  close: Scalars['Float']['output'];
  high: Scalars['Float']['output'];
  low: Scalars['Float']['output'];
  open: Scalars['Float']['output'];
  timestamp: Scalars['Int']['output'];
  volume: Scalars['Float']['output'];
};

export enum OhlcIntervalEnum {
  EightHours = 'EIGHT_HOURS',
  FifteenMinutes = 'FIFTEEN_MINUTES',
  FiveMinutes = 'FIVE_MINUTES',
  FourHours = 'FOUR_HOURS',
  OneDay = 'ONE_DAY',
  OneHour = 'ONE_HOUR',
  OneMinute = 'ONE_MINUTE',
  OneMonth = 'ONE_MONTH',
  OneWeek = 'ONE_WEEK',
  ThirtyMinutes = 'THIRTY_MINUTES',
  ThreeDays = 'THREE_DAYS',
  ThreeMinutes = 'THREE_MINUTES',
  TwelveHours = 'TWELVE_HOURS',
  TwoHours = 'TWO_HOURS'
}

export type OhlcRequest = {
  interval: OhlcIntervalEnum;
  isForward: Scalars['Boolean']['input'];
  limit: Scalars['Int']['input'];
  symbol: Scalars['String']['input'];
  timestamp: Scalars['Int']['input'];
};

export type OhlcResponse = {
  __typename?: 'OHLCResponse';
  data: Array<Ohlc>;
  symbol: Scalars['String']['output'];
};

export type Pagination = {
  __typename?: 'Pagination';
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  total?: Maybe<Scalars['Int']['output']>;
};

export type PaginationInfo = {
  __typename?: 'PaginationInfo';
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type PaginationInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};

export type PositionGroupByCoin = {
  __typename?: 'PositionGroupByCoin';
  addressCount: Scalars['Int']['output'];
  avgLeverage: Scalars['Float']['output'];
  coin: Scalars['String']['output'];
  longAvgLeverage: Scalars['Float']['output'];
  longPositionValue: Scalars['String']['output'];
  positionCount: Scalars['Int']['output'];
  positions: Array<CoinPositionDetail>;
  shortAvgLeverage: Scalars['Float']['output'];
  shortPositionValue: Scalars['String']['output'];
  totalDiffPositionValue: Scalars['String']['output'];
  totalMarginUsed: Scalars['String']['output'];
  totalPositionValue: Scalars['String']['output'];
  totalSzi: Scalars['String']['output'];
  totalUnrealizedPnl: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  analyzeSmartMoneyStrategy: TraderAnalysisResponse;
  getActiveSmartMoney: SmartMoneyResponse;
  getAddress: AddressResponse;
  getAddressGroup: AddressGroupResponse;
  getFlowAddressOngroup: Array<AddressGroupResponse>;
  getFollowedAddressesLatestPositions: FollowedAddressesLatestPositionsResponse;
  getFollowedAddressesPositions?: Maybe<FollowedAddressesPositionsResponse>;
  getFollowerCount: FollowerCountResponse;
  getFundingFeeComparison: GetFundingFeeComparisonResponse;
  getFundingRateHistory: GetFundingRateHistoryResponse;
  getListFundingRate: GetListFundingRateResponse;
  getMyUserProfile: UserProfileResponse;
  getOHLC: OhlcResponse;
  getSmartMoneyByAddress: SmartMoneyByAddressResponse;
  getSmartMoneyRoi: SmartMoneyRoiResponse;
  getTraderTagDefinitions: Array<TraderTagDefinition>;
  getTraderTagsByAddress: Array<TraderTag>;
  getTradingSession: TradingSessionResult;
  getUserPositionHoldingTime: Array<UserPositionHoldingTimeResponse>;
  getUserPositionHoldingTimeByCoin?: Maybe<UserPositionHoldingTimeResponse>;
  health: Scalars['String']['output'];
  listAddressGroups: Array<AddressGroupResponse>;
  listAddresses: Array<AddressResponse>;
};


export type QueryAnalyzeSmartMoneyStrategyArgs = {
  periodDays?: InputMaybe<Scalars['Int']['input']>;
  userAddress: Scalars['String']['input'];
};


export type QueryGetActiveSmartMoneyArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  periodDays?: InputMaybe<Scalars['Int']['input']>;
  recentDays?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<SmartMoneySortField>;
  tagIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  userAddress?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetAddressArgs = {
  address?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetAddressGroupArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetFlowAddressOngroupArgs = {
  flowAddress: Scalars['String']['input'];
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetFollowedAddressesLatestPositionsArgs = {
  groupId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetFollowedAddressesPositionsArgs = {
  groupId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetFollowerCountArgs = {
  userAddress: Scalars['String']['input'];
};


export type QueryGetFundingFeeComparisonArgs = {
  input: GetFundingFeeComparisonInput;
};


export type QueryGetFundingRateHistoryArgs = {
  input: GetFundingRateHistoryInput;
};


export type QueryGetListFundingRateArgs = {
  input: GetListFundingRateInput;
};


export type QueryGetOhlcArgs = {
  input: OhlcRequest;
};


export type QueryGetSmartMoneyByAddressArgs = {
  periodDays?: InputMaybe<Scalars['Int']['input']>;
  userAddress: Scalars['String']['input'];
};


export type QueryGetSmartMoneyRoiArgs = {
  userAddress: Scalars['String']['input'];
};


export type QueryGetTraderTagsByAddressArgs = {
  userAddress: Scalars['String']['input'];
};


export type QueryGetTradingSessionArgs = {
  timeRange: TradingSessionTimeRange;
  userAddress: Scalars['String']['input'];
};


export type QueryGetUserPositionHoldingTimeArgs = {
  userAddress: Scalars['String']['input'];
};


export type QueryGetUserPositionHoldingTimeByCoinArgs = {
  coin: Scalars['String']['input'];
  userAddress: Scalars['String']['input'];
};


export type QueryListAddressesArgs = {
  groupId?: InputMaybe<Scalars['String']['input']>;
  ownerUserId?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type SmartMoneyByAddressResponse = {
  __typename?: 'SmartMoneyByAddressResponse';
  data?: Maybe<SmartMoneyTrader>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type SmartMoneyResponse = {
  __typename?: 'SmartMoneyResponse';
  data: Array<SmartMoneyTrader>;
  message: Scalars['String']['output'];
  pagination: PaginationInfo;
  success: Scalars['Boolean']['output'];
};

export type SmartMoneyRoiData = {
  __typename?: 'SmartMoneyRoiData';
  periodDays: Scalars['Int']['output'];
  roi: Scalars['Float']['output'];
  userAddress: Scalars['String']['output'];
};

export type SmartMoneyRoiResponse = {
  __typename?: 'SmartMoneyRoiResponse';
  data?: Maybe<SmartMoneyRoiData>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export enum SmartMoneySortField {
  AvgWinRate = 'AVG_WIN_RATE',
  NetPnl = 'NET_PNL',
  Roi = 'ROI'
}

export type SmartMoneyTrader = {
  __typename?: 'SmartMoneyTrader';
  avgDailyVolume?: Maybe<Scalars['Float']['output']>;
  avgTradesPerDay?: Maybe<Scalars['Float']['output']>;
  avgWinRate: Scalars['Float']['output'];
  followerCount?: Maybe<Scalars['Int']['output']>;
  kolLabels?: Maybe<Array<Scalars['String']['output']>>;
  kolLabelsDescription?: Maybe<Scalars['String']['output']>;
  lastOperation?: Maybe<LastOperationInfo>;
  maxDrawdown: Scalars['Float']['output'];
  netPnl: Scalars['Float']['output'];
  periodDays: Scalars['Int']['output'];
  profitLossRatio?: Maybe<Scalars['Float']['output']>;
  roi: Scalars['Float']['output'];
  sharpeRatio?: Maybe<Scalars['Float']['output']>;
  tags?: Maybe<Array<TraderTag>>;
  totalTrades?: Maybe<Scalars['Int']['output']>;
  totalVolume?: Maybe<Scalars['Float']['output']>;
  tradingDays?: Maybe<Scalars['Int']['output']>;
  uniqueCoinsCount?: Maybe<Scalars['Int']['output']>;
  userAddress: Scalars['String']['output'];
};

/** Sort direction for queries */
export enum SortDirection {
  /** Ascending order (A-Z, 0-9, oldest-newest) */
  Asc = 'ASC',
  /** Descending order (Z-A, 9-0, newest-oldest) */
  Desc = 'DESC'
}

/**
 * Common sort input for list queries.
 * Currently supports sorting by symbol only.
 */
export type SortInput = {
  /** Sort direction. Defaults to ASC if not provided. */
  direction?: InputMaybe<SortDirection>;
  /**
   * Sort field name. Currently only "symbol" is supported.
   * Case-insensitive. Will be validated in the application layer.
   */
  field: Scalars['String']['input'];
};

export type TraderAnalysisResponse = {
  __typename?: 'TraderAnalysisResponse';
  analyzedAt: Scalars['Time']['output'];
  strategyCn: Scalars['String']['output'];
  strategyEn: Scalars['String']['output'];
};

export type TraderTag = {
  __typename?: 'TraderTag';
  category: Scalars['String']['output'];
  color: Scalars['String']['output'];
  description: Scalars['String']['output'];
  name: Scalars['String']['output'];
  nameCn: Scalars['String']['output'];
  priority: Scalars['Int']['output'];
};

export type TraderTagDefinition = {
  __typename?: 'TraderTagDefinition';
  category: Scalars['String']['output'];
  color: Scalars['String']['output'];
  createdAt: Scalars['Time']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  nameCn: Scalars['String']['output'];
};

export type TradingSessionResult = {
  __typename?: 'TradingSessionResult';
  slot0004Count: Scalars['Int']['output'];
  slot0408Count: Scalars['Int']['output'];
  slot0812Count: Scalars['Int']['output'];
  slot1216Count: Scalars['Int']['output'];
  slot1620Count: Scalars['Int']['output'];
  slot2024Count: Scalars['Int']['output'];
  statDate?: Maybe<Scalars['Time']['output']>;
};

export enum TradingSessionTimeRange {
  All = 'ALL',
  OneDay = 'ONE_DAY',
  SevenDays = 'SEVEN_DAYS',
  ThirtyDays = 'THIRTY_DAYS'
}

export type UpdateAddressGroupRequest = {
  id: Scalars['String']['input'];
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateAddressRequest = {
  address?: InputMaybe<Scalars['String']['input']>;
  groupIds?: InputMaybe<Array<Scalars['String']['input']>>;
  id?: InputMaybe<Scalars['String']['input']>;
  remarkName?: InputMaybe<Scalars['String']['input']>;
  userAddress?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateFlowGroupOrderRequest = {
  array: Array<GroupOrderItem>;
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type UserPositionHoldingTimeResponse = {
  __typename?: 'UserPositionHoldingTimeResponse';
  coin: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['Time']['output']>;
  id: Scalars['Int']['output'];
  lastFillsId?: Maybe<Scalars['Int']['output']>;
  lastOpenTime?: Maybe<Scalars['Int']['output']>;
  status: Scalars['String']['output'];
  timeSum: Scalars['Int']['output'];
  totalHoldingTime: Scalars['Int']['output'];
  updatedAt?: Maybe<Scalars['Time']['output']>;
  userAddress: Scalars['String']['output'];
};

export type UserProfileResponse = {
  __typename?: 'UserProfileResponse';
  authenticatedAt: Scalars['Time']['output'];
  message: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};
