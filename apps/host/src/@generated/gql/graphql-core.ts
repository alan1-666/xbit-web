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
  BigInt: { input: any; output: any; }
  DateScalar: { input: any; output: any; }
  DateTime: { input: any; output: any; }
  DecimalScalar: { input: any; output: any; }
  JSONObject: { input: any; output: any; }
};

export type AdminTokenInput = {
  address: Array<Scalars['String']['input']>;
  chainId?: Scalars['Int']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};

export type AdminTokenPagination = {
  __typename?: 'AdminTokenPagination';
  data: Array<TokenDto>;
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
};

export type AiAnalyticDto = {
  __typename?: 'AiAnalyticDTO';
  address: Scalars['String']['output'];
  avatarAnalytic?: Maybe<Scalars['String']['output']>;
  chainId: Scalars['Int']['output'];
  socialWebsiteAnalytic?: Maybe<Scalars['String']['output']>;
  themeNarrativeAnalytic?: Maybe<Scalars['String']['output']>;
};

export type AiAnalyzedInfoInput = {
  includeAvatarAnalytic?: Scalars['Boolean']['input'];
  includeSocialWebsiteAnalytic?: Scalars['Boolean']['input'];
  includeThemeNarrativeAnalytic?: Scalars['Boolean']['input'];
  lang?: InputMaybe<AiAnalyzedInfoLang>;
  tokenAddress: Scalars['String']['input'];
};

/** Supported languages for AI analysis */
export enum AiAnalyzedInfoLang {
  En = 'EN',
  Hi = 'HI',
  Hk = 'HK',
  Ja = 'JA',
  Vi = 'VI',
  ZhHans = 'ZH_HANS'
}

export type AllCategoriesInput = {
  chainId: Scalars['Int']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};

export type AssetBalanceDto = {
  __typename?: 'AssetBalanceDTO';
  balance: Scalars['DecimalScalar']['output'];
  logoUrl?: Maybe<Scalars['String']['output']>;
  symbol: Scalars['String']['output'];
  tokenAddress: Scalars['String']['output'];
};

export type AssetBalanceInput = {
  hideSmallBalance?: InputMaybe<Scalars['Boolean']['input']>;
  userAddress: Scalars['String']['input'];
};

export type AssetChartItemDto = {
  __typename?: 'AssetChartItemDTO';
  t: Scalars['DateTime']['output'];
  v: Scalars['DecimalScalar']['output'];
};

export type AssetFirstDepositDto = {
  __typename?: 'AssetFirstDepositDTO';
  isFirst: Scalars['Boolean']['output'];
};

export type AssetHistoryDto = {
  __typename?: 'AssetHistoryDTO';
  balance: Scalars['DecimalScalar']['output'];
  timestamp: Scalars['Int']['output'];
};

export type AssetHistoryInput = {
  timeframe: AssetHistoryTimeFrame;
  tokenAddress?: InputMaybe<Scalars['String']['input']>;
  type: AssetHistoryType;
  userAddress?: InputMaybe<Scalars['String']['input']>;
};

/** asset history time frame */
export enum AssetHistoryTimeFrame {
  D1 = 'd1',
  M1 = 'm1',
  W1 = 'w1',
  Y1 = 'y1'
}

/** asset history type */
export enum AssetHistoryType {
  Collapse = 'Collapse',
  Expand = 'Expand'
}

export type BooleanOptionInfo = {
  __typename?: 'BooleanOptionInfo';
  description?: Maybe<Scalars['String']['output']>;
  label: Scalars['Boolean']['output'];
  value: Scalars['String']['output'];
};

export type CategoryDto = {
  __typename?: 'CategoryDTO';
  categoryId?: Maybe<Scalars['String']['output']>;
  isEnabled: Scalars['Boolean']['output'];
  marketCap?: Maybe<Scalars['DecimalScalar']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  price1hChangeHistory?: Maybe<Array<Scalars['DecimalScalar']['output']>>;
  price24hChange?: Maybe<Scalars['DecimalScalar']['output']>;
  priceDownCount?: Maybe<Scalars['Float']['output']>;
  priceUpCount?: Maybe<Scalars['Float']['output']>;
  tokensCount?: Maybe<Scalars['Float']['output']>;
  top1TokenAddress?: Maybe<Scalars['String']['output']>;
  top1TokenSymbol?: Maybe<Scalars['String']['output']>;
  topGainers?: Maybe<Array<TopGainers>>;
  volume1hHistory?: Maybe<Array<Scalars['DecimalScalar']['output']>>;
  volume24h?: Maybe<Scalars['DecimalScalar']['output']>;
};

export type CategoryPagination = {
  __typename?: 'CategoryPagination';
  data: Array<CategoryDto>;
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
};

export type CategoryStatisticDto = {
  __typename?: 'CategoryStatisticDTO';
  marketCap?: Maybe<Scalars['DecimalScalar']['output']>;
  price24hChange?: Maybe<Scalars['DecimalScalar']['output']>;
  priceDownCount?: Maybe<Scalars['Float']['output']>;
  priceUpCount?: Maybe<Scalars['Float']['output']>;
  tokensCount?: Maybe<Scalars['Float']['output']>;
  volume24h?: Maybe<Scalars['DecimalScalar']['output']>;
};

export type CategoryStatisticInput = {
  categoryId: Scalars['String']['input'];
  chainId: Scalars['Int']['input'];
};

/** Supported blockchain types */
export enum ChainType {
  All = 'ALL',
  Evm = 'EVM',
  Solana = 'SOLANA',
  Tron = 'TRON'
}

export type CryptoCurrencyPriceDto = {
  __typename?: 'CryptoCurrencyPriceDTO';
  symbol: Scalars['String']['output'];
  usdPrice: Scalars['String']['output'];
};

export type DailyProfitDto = {
  __typename?: 'DailyProfitDTO';
  pnl: Scalars['Float']['output'];
  timestamp: Scalars['Int']['output'];
};

export type DeprecatedAssetDto = {
  __typename?: 'DeprecatedAssetDTO';
  balance: Scalars['DecimalScalar']['output'];
  balanceUsd: Scalars['DecimalScalar']['output'];
  chainId: Scalars['Int']['output'];
  token: Scalars['String']['output'];
};

export type DeprecatedAssetResultDto = {
  __typename?: 'DeprecatedAssetResultDTO';
  assets: Array<DeprecatedAssetDto>;
  confirmedBackup: Scalars['Boolean']['output'];
  deprecated: Scalars['Boolean']['output'];
};

/** dev actions  */
export enum DevAction {
  AddLiquidity = 'AddLiquidity',
  Burnt = 'Burnt',
  Hold = 'Hold',
  RemoveLiquidity = 'RemoveLiquidity',
  SellAll = 'SellAll'
}

export type DevHoldDto = {
  __typename?: 'DevHoldDTO';
  chainId: Scalars['Int']['output'];
  devHold: Scalars['DecimalScalar']['output'];
  token: Scalars['String']['output'];
};

export type DevHoldInput = {
  chainId: Scalars['Int']['input'];
  tokens: Array<Scalars['String']['input']>;
};

export type Dex = {
  __typename?: 'Dex';
  dex: Scalars['String']['output'];
  factory: Scalars['String']['output'];
  pair: Scalars['String']['output'];
};

export type DexScreenPoolDto = {
  __typename?: 'DexScreenPoolDTO';
  address: Scalars['String']['output'];
  baseSymbol?: Maybe<Scalars['String']['output']>;
  baseToken: Scalars['String']['output'];
  baseTokenLiquidity?: Maybe<Scalars['DecimalScalar']['output']>;
  chainId: Scalars['Int']['output'];
  createdAt: Scalars['String']['output'];
  createdAtDate?: Maybe<Scalars['DateScalar']['output']>;
  dex?: Maybe<Scalars['String']['output']>;
  quoteLiquidity?: Maybe<Scalars['DecimalScalar']['output']>;
  quoteSymbol?: Maybe<Scalars['String']['output']>;
  quoteToken: Scalars['String']['output'];
  quoteTokenPrice?: Maybe<Scalars['DecimalScalar']['output']>;
  usdLiquidity?: Maybe<Scalars['DecimalScalar']['output']>;
};

export type FavoriteToken = {
  __typename?: 'FavoriteToken';
  createdTime?: Maybe<Scalars['DateScalar']['output']>;
  token?: Maybe<Scalars['String']['output']>;
};

export type FollowedTransaction = {
  __typename?: 'FollowedTransaction';
  baseAmount?: Maybe<Scalars['DecimalScalar']['output']>;
  baseToken: Scalars['String']['output'];
  chainId: Scalars['Int']['output'];
  decimals?: Maybe<Scalars['Int']['output']>;
  holderPct?: Maybe<Scalars['String']['output']>;
  holdingProgress?: Maybe<Scalars['Float']['output']>;
  isBundler: Scalars['Boolean']['output'];
  isDev: Scalars['Boolean']['output'];
  isFreshWallet: Scalars['Boolean']['output'];
  isHugeValue: Scalars['Boolean']['output'];
  isInsider: Scalars['Boolean']['output'];
  isKOL: Scalars['Boolean']['output'];
  isNativeWallet: Scalars['Boolean']['output'];
  isNewActivity: Scalars['Boolean']['output'];
  isPoolContract: Scalars['Boolean']['output'];
  isSingleSideTransaction: Scalars['Boolean']['output'];
  isSmartMoney: Scalars['Boolean']['output'];
  isSniper: Scalars['Boolean']['output'];
  isTopTrader: Scalars['Boolean']['output'];
  isWhale: Scalars['Boolean']['output'];
  liquidity?: Maybe<Scalars['DecimalScalar']['output']>;
  logIndex?: Maybe<Scalars['Int']['output']>;
  maker: Scalars['String']['output'];
  nativeAmount?: Maybe<Scalars['DecimalScalar']['output']>;
  nativePrice?: Maybe<Scalars['DecimalScalar']['output']>;
  pair?: Maybe<Scalars['String']['output']>;
  price?: Maybe<Scalars['DecimalScalar']['output']>;
  quoteAmount?: Maybe<Scalars['DecimalScalar']['output']>;
  quoteToken?: Maybe<Scalars['String']['output']>;
  timestamp: Scalars['String']['output'];
  totalSupply?: Maybe<Scalars['DecimalScalar']['output']>;
  tx24h?: Maybe<Scalars['Int']['output']>;
  txHash: Scalars['String']['output'];
  type: Scalars['String']['output'];
  usdAmount?: Maybe<Scalars['DecimalScalar']['output']>;
  usdPrice?: Maybe<Scalars['DecimalScalar']['output']>;
};

export type FollowedTransactionPagination = {
  __typename?: 'FollowedTransactionPagination';
  data: Array<FollowedTransaction>;
  fromTimestamp: Scalars['String']['output'];
};

export type GetLiquidityChartInput = {
  chainId: Scalars['Int']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  token: Scalars['String']['input'];
};

export type GetManyTokenInput = {
  chainId: Scalars['Int']['input'];
  tokens: Array<Scalars['String']['input']>;
};

export type HolderChart = {
  __typename?: 'HolderChart';
  averageHoldingPerWalletHistory?: Maybe<Array<Scalars['DecimalScalar']['output']>>;
  insiderHoldingHistory?: Maybe<Array<Scalars['DecimalScalar']['output']>>;
  numberOfHolderHistory?: Maybe<Array<Scalars['DecimalScalar']['output']>>;
  steps?: Maybe<Array<Scalars['Int']['output']>>;
  top10HolderHistory?: Maybe<Array<Scalars['DecimalScalar']['output']>>;
};

export type HolderChartInput = {
  chainId: Scalars['Int']['input'];
  token: Scalars['String']['input'];
};

export type HolderDto = {
  __typename?: 'HolderDTO';
  address?: Maybe<Scalars['String']['output']>;
  avgMarketCap?: Maybe<Scalars['DecimalScalar']['output']>;
  avgPriceUsd?: Maybe<Scalars['DecimalScalar']['output']>;
  avgSellMarketCap?: Maybe<Scalars['DecimalScalar']['output']>;
  balance?: Maybe<Scalars['DecimalScalar']['output']>;
  balanceUpdatedTime?: Maybe<Scalars['Int']['output']>;
  buys?: Maybe<Scalars['Float']['output']>;
  chainId?: Maybe<Scalars['Int']['output']>;
  createdAt?: Maybe<Scalars['DateScalar']['output']>;
  decimal?: Maybe<Scalars['Int']['output']>;
  hourStatistics?: Maybe<Array<WalletTokenHourStatistic>>;
  isFresh: Scalars['Boolean']['output'];
  isInsider: Scalars['Boolean']['output'];
  isKOL: Scalars['Boolean']['output'];
  isPumpSM: Scalars['Boolean']['output'];
  isSmartMoney: Scalars['Boolean']['output'];
  isSniper: Scalars['Boolean']['output'];
  isWhale: Scalars['Boolean']['output'];
  label?: Maybe<Scalars['String']['output']>;
  labels?: Maybe<Array<HolderLabel>>;
  lastTxTime?: Maybe<Scalars['DateScalar']['output']>;
  maxHoldingQty?: Maybe<Scalars['DecimalScalar']['output']>;
  nativeBalance?: Maybe<Scalars['DecimalScalar']['output']>;
  numberTransaction?: Maybe<Scalars['Int']['output']>;
  rawBalance?: Maybe<Scalars['DecimalScalar']['output']>;
  realizedPnL?: Maybe<Scalars['DecimalScalar']['output']>;
  realizedProfit?: Maybe<Scalars['DecimalScalar']['output']>;
  sells?: Maybe<Scalars['Float']['output']>;
  solCreatedAt?: Maybe<Scalars['DateScalar']['output']>;
  sourceFundingInfo?: Maybe<SourceFundingInformation>;
  sourceOfFunding?: Maybe<Scalars['String']['output']>;
  sourceOfFundingTxTime?: Maybe<Scalars['String']['output']>;
  startTimeHolding?: Maybe<Scalars['DateScalar']['output']>;
  statistic?: Maybe<WalletTokenStatistic>;
  symbol?: Maybe<Scalars['String']['output']>;
  token?: Maybe<Scalars['String']['output']>;
  tokenAccount?: Maybe<Scalars['String']['output']>;
  topHolder?: Maybe<Scalars['Int']['output']>;
  totalBuyQty?: Maybe<Scalars['DecimalScalar']['output']>;
  totalBuyUsd?: Maybe<Scalars['DecimalScalar']['output']>;
  totalFee?: Maybe<Scalars['DecimalScalar']['output']>;
  totalFeeUsd?: Maybe<Scalars['DecimalScalar']['output']>;
  totalProfit?: Maybe<Scalars['DecimalScalar']['output']>;
  totalSellQty?: Maybe<Scalars['DecimalScalar']['output']>;
  totalSellUsd?: Maybe<Scalars['DecimalScalar']['output']>;
  totalSupply?: Maybe<Scalars['DecimalScalar']['output']>;
  totalTradedQty?: Maybe<Scalars['DecimalScalar']['output']>;
  totalUsdValue?: Maybe<Scalars['DecimalScalar']['output']>;
  unrealizedProfit?: Maybe<Scalars['DecimalScalar']['output']>;
  updatedAt?: Maybe<Scalars['DateScalar']['output']>;
};

export type HolderInput = {
  chainId: Scalars['Int']['input'];
  classification?: TransactionClassification;
  holder?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
  page?: Scalars['Int']['input'];
  sortBy?: InputMaybe<Scalars['String']['input']>;
  token: Scalars['String']['input'];
};

export enum HolderLabel {
  Dev = 'Dev',
  Fresh = 'Fresh',
  Insider = 'Insider',
  Kol = 'KOL',
  SameSource = 'SameSource',
  SmartMoney = 'SmartMoney',
  Sniper = 'Sniper',
  TopTrader = 'TopTrader',
  Whale = 'Whale'
}

export type HolderPagination = {
  __typename?: 'HolderPagination';
  data?: Maybe<Array<HolderDto>>;
  limit?: Maybe<Scalars['Int']['output']>;
  page?: Maybe<Scalars['Int']['output']>;
};

export type InfluentialTwitterFollowerDto = {
  __typename?: 'InfluentialTwitterFollowerDTO';
  address: Scalars['String']['output'];
  chainId: Scalars['Int']['output'];
  numberOfFollowers: Scalars['Int']['output'];
  url: Scalars['String']['output'];
};

export type Info = {
  __typename?: 'Info';
  avatarUrl: Scalars['String']['output'];
  twitterName: Scalars['String']['output'];
  twitterUsername: Scalars['String']['output'];
};

export type LastTransaction = {
  __typename?: 'LastTransaction';
  baseAmount: Scalars['DecimalScalar']['output'];
  chainId: Scalars['String']['output'];
  factory?: Maybe<Scalars['String']['output']>;
  isKlineTx: Scalars['Boolean']['output'];
  liquidity?: Maybe<Scalars['DecimalScalar']['output']>;
  marketCap: Scalars['DecimalScalar']['output'];
  priceUsd: Scalars['DecimalScalar']['output'];
  quoteAmount?: Maybe<Scalars['DecimalScalar']['output']>;
  symbol: Scalars['String']['output'];
  timestamp: Scalars['String']['output'];
  token: Scalars['String']['output'];
  topLiquidity?: Maybe<Scalars['DecimalScalar']['output']>;
  transactionType: TransactionType;
  txid: Scalars['String']['output'];
  usdAmount: Scalars['DecimalScalar']['output'];
};

export type LastTransactionPagination = {
  __typename?: 'LastTransactionPagination';
  data?: Maybe<Array<LastTransaction>>;
  fromTimestamp: Scalars['String']['output'];
};

/** token launchpad */
export enum Launchpad {
  Moonit = 'Moonit',
  Pumpfun = 'Pumpfun'
}

export enum LifecycleStates {
  Completed = 'completed',
  Completing = 'completing',
  NewCreation = 'newCreation',
  Soaring = 'soaring'
}

export type LiquidityChartDto = {
  __typename?: 'LiquidityChartDTO';
  liquidity1hAt: Scalars['DateTime']['output'];
  liquiditySum1h: Scalars['Float']['output'];
  token: Scalars['String']['output'];
};

export type ListInfluentialTwitterFollowerResponse = {
  __typename?: 'ListInfluentialTwitterFollowerResponse';
  data: Array<InfluentialTwitterFollowerDto>;
  pagination: Pagination;
};

export type ListInfluentialTwitterFollowersInput = {
  address: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};

export type ManageTokenCategoryInput = {
  categoryId: Scalars['String']['input'];
  chainId: Scalars['Int']['input'];
  tokenAddress: Scalars['String']['input'];
};

export type MemeDto = {
  __typename?: 'MemeDTO';
  activityUpdatedAt?: Maybe<Scalars['DateScalar']['output']>;
  advertisesOnDex?: Maybe<Scalars['Boolean']['output']>;
  athDate?: Maybe<Scalars['DateScalar']['output']>;
  athPrice?: Maybe<Scalars['DecimalScalar']['output']>;
  atlDate?: Maybe<Scalars['DateScalar']['output']>;
  atlPrice?: Maybe<Scalars['DecimalScalar']['output']>;
  bundlerHoldingPercent?: Maybe<Scalars['DecimalScalar']['output']>;
  buyTxs1h: Scalars['Float']['output'];
  buyTxs1m: Scalars['Float']['output'];
  buyTxs5m: Scalars['Float']['output'];
  buyTxs6h: Scalars['Float']['output'];
  buyTxs24h: Scalars['Float']['output'];
  categoryIds?: Maybe<Array<Scalars['String']['output']>>;
  chainId: Scalars['Int']['output'];
  circulatingSupply?: Maybe<Scalars['DecimalScalar']['output']>;
  createdTime?: Maybe<Scalars['DateScalar']['output']>;
  debug?: Maybe<TokenTrendingDebug>;
  decimals?: Maybe<Scalars['String']['output']>;
  devHold?: Maybe<Scalars['Float']['output']>;
  devLaunched?: Maybe<Scalars['Float']['output']>;
  dexes?: Maybe<Array<Scalars['String']['output']>>;
  firstPrice?: Maybe<Scalars['DecimalScalar']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  initLiquidity?: Maybe<Scalars['DecimalScalar']['output']>;
  insider?: Maybe<Scalars['Float']['output']>;
  insiderRawBalance?: Maybe<Scalars['DecimalScalar']['output']>;
  internalMarketProgress?: Maybe<Scalars['DecimalScalar']['output']>;
  isFavorite: Scalars['Boolean']['output'];
  isHotToken: Scalars['Boolean']['output'];
  isMigrated: Scalars['Boolean']['output'];
  launchpad?: Maybe<Scalars['String']['output']>;
  liquidity?: Maybe<Scalars['DecimalScalar']['output']>;
  marketCap5mChangeUsd?: Maybe<Scalars['DecimalScalar']['output']>;
  marketcap?: Maybe<Scalars['DecimalScalar']['output']>;
  marketcap5m?: Maybe<Scalars['DecimalScalar']['output']>;
  memeTooltip?: Maybe<MemeTooltip>;
  metadataCustom?: Maybe<Scalars['JSONObject']['output']>;
  migratedAt?: Maybe<Scalars['DateScalar']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  numberOfHolder?: Maybe<Scalars['Int']['output']>;
  numberUniqueAddresses?: Maybe<NumberUniqueAddresses>;
  ohlc?: Maybe<Array<Ohlcdto>>;
  openPrice?: Maybe<Scalars['DecimalScalar']['output']>;
  openPrice24h?: Maybe<Scalars['DecimalScalar']['output']>;
  price?: Maybe<Scalars['DecimalScalar']['output']>;
  price1hAgo?: Maybe<Scalars['DecimalScalar']['output']>;
  price1hChange?: Maybe<Scalars['DecimalScalar']['output']>;
  price1mAgo?: Maybe<Scalars['DecimalScalar']['output']>;
  price1mChange?: Maybe<Scalars['DecimalScalar']['output']>;
  price5mAgo?: Maybe<Scalars['DecimalScalar']['output']>;
  price5mChange?: Maybe<Scalars['DecimalScalar']['output']>;
  price6hChange?: Maybe<Scalars['DecimalScalar']['output']>;
  price24hAgo?: Maybe<Scalars['DecimalScalar']['output']>;
  price24hChange?: Maybe<Scalars['DecimalScalar']['output']>;
  rug?: Maybe<Scalars['Boolean']['output']>;
  rugReason?: Maybe<Scalars['String']['output']>;
  rugTime?: Maybe<Scalars['DateScalar']['output']>;
  sameSourceWallet?: Maybe<Scalars['String']['output']>;
  sellTxs1h: Scalars['Float']['output'];
  sellTxs1m: Scalars['Float']['output'];
  sellTxs5m: Scalars['Float']['output'];
  sellTxs6h: Scalars['Float']['output'];
  sellTxs24h: Scalars['Float']['output'];
  smartMoneyHolder?: Maybe<Scalars['DecimalScalar']['output']>;
  smartMoneyPct?: Maybe<Scalars['DecimalScalar']['output']>;
  sniperCount?: Maybe<Scalars['Int']['output']>;
  sniperHoldAmount?: Maybe<Scalars['String']['output']>;
  sniperHoldPct?: Maybe<Scalars['Float']['output']>;
  symbol?: Maybe<Scalars['String']['output']>;
  token: Scalars['String']['output'];
  top10Holder?: Maybe<Scalars['DecimalScalar']['output']>;
  topTrending?: Maybe<Scalars['Int']['output']>;
  totalAmount?: Maybe<TotalAmount>;
  totalSupply?: Maybe<Scalars['DecimalScalar']['output']>;
  totalTransactions?: Maybe<TotalTransactions>;
  trendingScore1h?: Maybe<Scalars['Float']['output']>;
  trendingScore1m?: Maybe<Scalars['Float']['output']>;
  trendingScore5m?: Maybe<Scalars['Float']['output']>;
  trendingScore6h?: Maybe<Scalars['Float']['output']>;
  trendingScore24h?: Maybe<Scalars['Float']['output']>;
  turnoverRate24h?: Maybe<Scalars['DecimalScalar']['output']>;
  tweetId?: Maybe<Scalars['String']['output']>;
  twitterNameChangeCount?: Maybe<Scalars['Int']['output']>;
  twitterUrl?: Maybe<Scalars['String']['output']>;
  /** Deprecated, please use sniperHoldPct instead */
  txBySniperPct?: Maybe<Scalars['DecimalScalar']['output']>;
  txs1h: Scalars['Float']['output'];
  txs1m: Scalars['Float']['output'];
  txs5m: Scalars['Float']['output'];
  txs6h: Scalars['Float']['output'];
  txs24h: Scalars['Float']['output'];
  volume1h?: Maybe<Scalars['DecimalScalar']['output']>;
  volume1m?: Maybe<Scalars['DecimalScalar']['output']>;
  volume5m?: Maybe<Scalars['DecimalScalar']['output']>;
  volume6h?: Maybe<Scalars['DecimalScalar']['output']>;
  volume24h?: Maybe<Scalars['DecimalScalar']['output']>;
  website?: Maybe<Scalars['String']['output']>;
};

export type MemeInput = {
  chain?: ChainType;
  dex?: InputMaybe<TokenSource>;
  dexes?: InputMaybe<Scalars['String']['input']>;
  internalMarketProgressFrom?: InputMaybe<Scalars['Float']['input']>;
  internalMarketProgressTo?: InputMaybe<Scalars['Float']['input']>;
  launchpad?: InputMaybe<Launchpad>;
  lifecycleStates?: LifecycleStates;
  limit?: InputMaybe<Scalars['Int']['input']>;
  liquidityPoolFrom?: InputMaybe<Scalars['String']['input']>;
  liquidityPoolTo?: InputMaybe<Scalars['String']['input']>;
  marketValueFrom?: InputMaybe<Scalars['String']['input']>;
  marketValueTo?: InputMaybe<Scalars['String']['input']>;
  numberOfHolderFrom?: InputMaybe<Scalars['Int']['input']>;
  numberOfHolderTo?: InputMaybe<Scalars['Int']['input']>;
  openingTimeFrom?: InputMaybe<Scalars['Int']['input']>;
  openingTimeTo?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pagination?: InputMaybe<PaginationInput>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  timeRange: TokenTimeRange;
  /** deprecated field, use tradingVolumeFrom instead */
  tradingVolume1hFrom?: InputMaybe<Scalars['String']['input']>;
  /** deprecated field, use tradingVolumeFrom instead */
  tradingVolume1hTo?: InputMaybe<Scalars['String']['input']>;
  tradingVolumeFrom?: InputMaybe<Scalars['String']['input']>;
  tradingVolumeTo?: InputMaybe<Scalars['String']['input']>;
  /** deprecated field, use transactionFrom instead */
  transaction1hFrom?: InputMaybe<Scalars['Int']['input']>;
  /** deprecated field, use transactionTo instead */
  transaction1hTo?: InputMaybe<Scalars['Int']['input']>;
  transactionFrom?: InputMaybe<Scalars['Int']['input']>;
  transactionTo?: InputMaybe<Scalars['Int']['input']>;
};

export type MemePagination = {
  __typename?: 'MemePagination';
  data: Array<MemeDto>;
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
};

export type MemeTooltip = {
  __typename?: 'MemeTooltip';
  bundlerCount?: Maybe<Scalars['DecimalScalar']['output']>;
  bundlerHoldAmount?: Maybe<Scalars['DecimalScalar']['output']>;
  devHoldAmount?: Maybe<Scalars['DecimalScalar']['output']>;
  insiderCount?: Maybe<Scalars['DecimalScalar']['output']>;
  insiderHoldAmount?: Maybe<Scalars['DecimalScalar']['output']>;
  top10HolderAmount?: Maybe<Scalars['DecimalScalar']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addToFavorite: Scalars['Boolean']['output'];
  addTokenToCategory: Scalars['Boolean']['output'];
  confirmAssetBackup: Scalars['Boolean']['output'];
  followWallet: Scalars['Boolean']['output'];
  refreshWalletBalance: Scalars['Boolean']['output'];
  removeTokenFavorite: Scalars['Boolean']['output'];
  removeTokenFromCategory: Scalars['Boolean']['output'];
  setCategoryName: Scalars['Boolean']['output'];
  toggleCategory: Scalars['Boolean']['output'];
  unFollowWallet: Scalars['Boolean']['output'];
};


export type MutationAddToFavoriteArgs = {
  tokens: Scalars['String']['input'];
};


export type MutationAddTokenToCategoryArgs = {
  input: ManageTokenCategoryInput;
};


export type MutationFollowWalletArgs = {
  input: SmartMoneyFollowInput;
};


export type MutationRefreshWalletBalanceArgs = {
  input: RefreshWalletBalanceInput;
};


export type MutationRemoveTokenFavoriteArgs = {
  tokens: Scalars['String']['input'];
};


export type MutationRemoveTokenFromCategoryArgs = {
  input: ManageTokenCategoryInput;
};


export type MutationSetCategoryNameArgs = {
  input: SetCategoryNameInput;
};


export type MutationToggleCategoryArgs = {
  input: ToggleCategoryInput;
};


export type MutationUnFollowWalletArgs = {
  input: SmartMoneyFollowInput;
};

export type NumberUniqueAddresses = {
  __typename?: 'NumberUniqueAddresses';
  numberOfBuyAddress1h?: Maybe<Scalars['Int']['output']>;
  numberOfBuyAddress5m?: Maybe<Scalars['Int']['output']>;
  numberOfBuyAddress6h?: Maybe<Scalars['Int']['output']>;
  numberOfBuyAddress24h?: Maybe<Scalars['Int']['output']>;
  numberOfSellAddress1h?: Maybe<Scalars['Int']['output']>;
  numberOfSellAddress5m?: Maybe<Scalars['Int']['output']>;
  numberOfSellAddress6h?: Maybe<Scalars['Int']['output']>;
  numberOfSellAddress24h?: Maybe<Scalars['Int']['output']>;
};

export type Ohlcdto = {
  __typename?: 'OHLCDTO';
  chainId: Scalars['Int']['output'];
  close: Scalars['String']['output'];
  high: Scalars['String']['output'];
  low: Scalars['String']['output'];
  open?: Maybe<Scalars['String']['output']>;
  token: Scalars['String']['output'];
  tokenVolume?: Maybe<Scalars['String']['output']>;
  ts?: Maybe<Scalars['Int']['output']>;
  usdVolume?: Maybe<Scalars['String']['output']>;
};

export type OhlcInput = {
  chainId?: Scalars['Int']['input'];
  fromTimeStamp?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  timeframe: Timeframe;
  token: Scalars['String']['input'];
};

export type OnChainDataAnalyticDto = {
  __typename?: 'OnChainDataAnalyticDTO';
  address: Scalars['String']['output'];
  chainId: Scalars['Int']['output'];
  devTokenHoldingPercentage: Scalars['Float']['output'];
  insiderPercentage: Scalars['Float']['output'];
  linkedWalletsPercentage: Scalars['Float']['output'];
  numberOfDevProjectsLaunched: Scalars['Int']['output'];
  numberOfHolder: Scalars['Int']['output'];
  numberOfLinkedWallets: Scalars['Int']['output'];
  numberOfRugPullWareHouseAddresses: Scalars['Int']['output'];
  twitterAccountCreationDate: Scalars['DateScalar']['output'];
  twitterNameChangeCount: Scalars['Int']['output'];
};

export type OnChainDataAnalyticInput = {
  address: Scalars['String']['input'];
  chainId?: Scalars['Int']['input'];
};

export type Pagination = {
  __typename?: 'Pagination';
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
};

/**
 * /**
 *  * Common pagination input for API requests
 *  *
 *  * 1. Use 'limitOption' for predefined page sizes (recommended)
 *  * 2. Use 'limit' for custom page sizes within range
 *  * 3. 'page' represents the current page number (1-based)
 *  *
 *  * Priority: limitOption > limit > backend default
 *  *\/
 */
export type PaginationInput = {
  /** Items per page (1-20, use limitOption for predefined sizes) */
  limit?: InputMaybe<Scalars['Int']['input']>;
  /** Predefined page sizes: 1, 20, 40, 60, 80, 100 (recommended over limit) */
  limitOption?: InputMaybe<Scalars['Int']['input']>;
  /** Page number (1-based, max: 20) */
  page?: InputMaybe<Scalars['Int']['input']>;
};

export type PoolDto = {
  __typename?: 'PoolDTO';
  address: Scalars['String']['output'];
  baseToken?: Maybe<Scalars['Int']['output']>;
  chainId?: Maybe<Scalars['Int']['output']>;
  createdTime?: Maybe<Scalars['Float']['output']>;
  decimal0?: Maybe<Scalars['Int']['output']>;
  decimal1?: Maybe<Scalars['Int']['output']>;
  factory?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  liquidity?: Maybe<Scalars['DecimalScalar']['output']>;
  reserve0?: Maybe<Scalars['String']['output']>;
  reserve1?: Maybe<Scalars['String']['output']>;
  tags?: Maybe<Array<Scalars['String']['output']>>;
  token0: Scalars['String']['output'];
  token0Info?: Maybe<TokenDto>;
  token1: Scalars['String']['output'];
  token1Info?: Maybe<TokenDto>;
};

export type PoolTransactionInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  chainId: Scalars['Int']['input'];
  classification?: TransactionClassification;
  lastTimestamp?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
  /** sortBy these fields timestamp, usdAmount, baseAmount, with prefix + is asc, - is desc, example: +timestamp */
  sortBy?: InputMaybe<Scalars['String']['input']>;
  timestampFrom?: InputMaybe<Scalars['String']['input']>;
  timestampTo?: InputMaybe<Scalars['String']['input']>;
  token: Scalars['String']['input'];
  transactionUsdAmountFrom?: InputMaybe<Scalars['Float']['input']>;
  transactionUsdAmountTo?: InputMaybe<Scalars['Float']['input']>;
  transactionVolumeFrom?: InputMaybe<Scalars['Float']['input']>;
  transactionVolumeTo?: InputMaybe<Scalars['Float']['input']>;
  type?: TransactionType;
};

export type PoolTransactionPagination = {
  __typename?: 'PoolTransactionPagination';
  data?: Maybe<Array<TransactionDto>>;
  fromTimestamp: Scalars['String']['output'];
  limit?: Maybe<Scalars['Int']['output']>;
  liquidity?: Maybe<Scalars['DecimalScalar']['output']>;
  numberOfPools?: Maybe<Scalars['Int']['output']>;
};

export type PortfolioAddressMetadata = {
  __typename?: 'PortfolioAddressMetadata';
  chainId: Scalars['Int']['output'];
  /** List of completed transaction hashes */
  completedTxs?: Maybe<Array<Scalars['String']['output']>>;
  userAddress: Scalars['String']['output'];
};

export type PortfolioDto = {
  __typename?: 'PortfolioDTO';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  avgMarketCap?: Maybe<Scalars['DecimalScalar']['output']>;
  avgPriceUsd?: Maybe<Scalars['DecimalScalar']['output']>;
  balanceUpdatedTime?: Maybe<Scalars['Int']['output']>;
  chainId?: Maybe<Scalars['Int']['output']>;
  decimals?: Maybe<Scalars['Int']['output']>;
  holdingTime?: Maybe<Scalars['String']['output']>;
  isQuoteToken: Scalars['Boolean']['output'];
  isXStock: Scalars['Boolean']['output'];
  lastTxTime?: Maybe<Scalars['DateScalar']['output']>;
  launchedOnPump: Scalars['Boolean']['output'];
  logoUrl?: Maybe<Scalars['String']['output']>;
  lowLiquidity: Scalars['Boolean']['output'];
  maxHoldingQty?: Maybe<Scalars['DecimalScalar']['output']>;
  price?: Maybe<Scalars['DecimalScalar']['output']>;
  /** price24hChange: percent change at the user trading time */
  price24hChange?: Maybe<Scalars['DecimalScalar']['output']>;
  realizedPnL?: Maybe<Scalars['DecimalScalar']['output']>;
  symbol?: Maybe<Scalars['String']['output']>;
  token?: Maybe<Scalars['String']['output']>;
  /** totalBaseAmount is balance */
  totalBaseAmount?: Maybe<Scalars['DecimalScalar']['output']>;
  /** totalBuyBaseAmount is buys: Number of purchases */
  totalBuyBaseAmount?: Maybe<Scalars['Float']['output']>;
  totalBuyQty?: Maybe<Scalars['DecimalScalar']['output']>;
  totalBuyUsd?: Maybe<Scalars['DecimalScalar']['output']>;
  totalFee?: Maybe<Scalars['DecimalScalar']['output']>;
  totalFeeUsd?: Maybe<Scalars['DecimalScalar']['output']>;
  /** totalSellBaseAmount is sells: Number of sales */
  totalSellBaseAmount?: Maybe<Scalars['Float']['output']>;
  totalSellQty?: Maybe<Scalars['DecimalScalar']['output']>;
  totalSellUsd?: Maybe<Scalars['DecimalScalar']['output']>;
  totalTradedQty?: Maybe<Scalars['DecimalScalar']['output']>;
  totalUsdValue?: Maybe<Scalars['DecimalScalar']['output']>;
  updatedAt?: Maybe<Scalars['DateScalar']['output']>;
  userAddress?: Maybe<Scalars['String']['output']>;
};

export type PortfolioManyWalletDto = {
  __typename?: 'PortfolioManyWalletDTO';
  data?: Maybe<Array<PortfolioDto>>;
  totalHoldingTokens: Scalars['Int']['output'];
};

export type PortfolioManyWalletInput = {
  chainId?: Scalars['Int']['input'];
  isTopValue?: Scalars['Boolean']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  onlyMeme?: Scalars['Boolean']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  pagination?: InputMaybe<PaginationInput>;
  token?: InputMaybe<Scalars['String']['input']>;
  userAddress: Array<Scalars['String']['input']>;
};

export type PortfolioManyWalletPagination = {
  __typename?: 'PortfolioManyWalletPagination';
  data: Array<PortfolioManyWalletDto>;
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
};

export type PortfolioOverviewDto = {
  __typename?: 'PortfolioOverviewDTO';
  chainId?: Maybe<Scalars['Int']['output']>;
  decimals?: Maybe<Scalars['Int']['output']>;
  holdingRatio?: Maybe<Scalars['DecimalScalar']['output']>;
  holdingTime?: Maybe<Scalars['String']['output']>;
  isQuoteToken: Scalars['Boolean']['output'];
  isXStock: Scalars['Boolean']['output'];
  liquidity?: Maybe<Scalars['DecimalScalar']['output']>;
  logoUrl?: Maybe<Scalars['String']['output']>;
  lowLiquidity: Scalars['Boolean']['output'];
  price?: Maybe<Scalars['DecimalScalar']['output']>;
  price24hChange?: Maybe<Scalars['DecimalScalar']['output']>;
  symbol?: Maybe<Scalars['String']['output']>;
  token?: Maybe<Scalars['String']['output']>;
  /** totalBaseAmount is balance */
  totalBaseAmount?: Maybe<Scalars['DecimalScalar']['output']>;
  totalUsdValue?: Maybe<Scalars['DecimalScalar']['output']>;
  unrealizedPnl?: Maybe<Scalars['DecimalScalar']['output']>;
};

export type PortfolioOverviewPagination = {
  __typename?: 'PortfolioOverviewPagination';
  data: Array<PortfolioOverviewDto>;
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  totalHoldingTokens: Scalars['Int']['output'];
};

export type PortfolioPagination = {
  __typename?: 'PortfolioPagination';
  /** Address-level metadata including completed transactions */
  addressMetadata?: Maybe<Array<PortfolioAddressMetadata>>;
  data: Array<PortfolioDto>;
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  totalHoldingTokens: Scalars['Int']['output'];
};

export type PriceDto = {
  __typename?: 'PriceDTO';
  chainId: Scalars['Int']['output'];
  price?: Maybe<Scalars['DecimalScalar']['output']>;
  price24hAgo?: Maybe<Scalars['DecimalScalar']['output']>;
  token: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  checkUserDeprecatedAsset: DeprecatedAssetResultDto;
  getAiAnalyzedInfo: AiAnalyticDto;
  getAllCategories: CategoryPagination;
  getAssetBalance: Array<AssetBalanceDto>;
  getAssetChart: Array<AssetChartItemDto>;
  getAssetChartPreview: Array<AssetChartItemDto>;
  getAssetHistory: Array<AssetHistoryDto>;
  getBrowserHistory: Array<TokenBrowserHistoryDto>;
  getCategoryStatistic: CategoryStatisticDto;
  getCryptoCurrencyPrice: Array<CryptoCurrencyPriceDto>;
  getDevHold: Array<DevHoldDto>;
  getErrorMessages: Scalars['JSONObject']['output'];
  getFavoriteToken: TokenStatisticPagination;
  getFirstDepositUSDC: AssetFirstDepositDto;
  /** deprecate api, use getHolder instead */
  getFollowedHolder: HolderPagination;
  getFollowedTransactions: FollowedTransactionPagination;
  getFollowingSmartMoneys: Array<SmartMoneyDto>;
  getFollowingWalletAddressess: Array<Scalars['String']['output']>;
  getFundingWalletHistory: Array<WalletTransferItem>;
  getHolder: HolderPagination;
  getHolderChart: HolderChart;
  getLiquidityChart: Array<LiquidityChartDto>;
  getListDex: Array<Dex>;
  getManyToken: Array<Token>;
  getMemeToken: MemePagination;
  getOHLC: Array<Ohlcdto>;
  getOnChainDataAnalytic: OnChainDataAnalyticDto;
  getPoolTransactions: PoolTransactionPagination;
  getPopularTokens: Array<TokenPopularDto>;
  getPortfolio: PortfolioPagination;
  getPortfolioManyWallet: PortfolioManyWalletPagination;
  getPortfolioOverview: PortfolioOverviewPagination;
  getPrices: Array<PriceDto>;
  getQuoteToken: WalletToken;
  getServerTime: Scalars['String']['output'];
  getSmartMoneyActions: SmartMoneyActionPaginationDto;
  getTokenCreatedByDev: Array<TokenCreatedByDevDto>;
  getTokenDetail: TokenDetail;
  getTokenMetadata: TokenSymbolsDto;
  getTokenOfficialInformation: TokenOfficialInformation;
  getTokenPoolInfo: Array<DexScreenPoolDto>;
  getTokenPortrait: TokenPortrait;
  getTokenSniper: TokenSniperDto;
  getTokenTelegram: TokenInfoDto;
  getTokenTrending: TokenStatisticPagination;
  getTokens: AdminTokenPagination;
  getTotalSMByToken: SmartMoneyByTokenDto;
  getTradeHistory: TradeHistoryPagination;
  getTradingTransactions: TradingTransactionPagination;
  getWalletBalance: Array<WalletBalanceDto>;
  getWalletInfo: Array<WalletStatisticDto>;
  getWalletInfoOnHover: WalletInfoOnHoverDto;
  getWalletStatistic: WalletStatisticDto;
  lastTransactions: LastTransactionPagination;
  listInfluentialTwitterFollowers: ListInfluentialTwitterFollowerResponse;
  rank: Array<SmartMoneyDto>;
  search: Array<TokenSearchLiteDto>;
  searchToken: Array<TokenStatisticDto>;
  searchTokenLite: Array<TokenSearchLiteDto>;
  tokensByCategory: TokensStatisticByCategoryPagination;
};


export type QueryGetAiAnalyzedInfoArgs = {
  input: AiAnalyzedInfoInput;
};


export type QueryGetAllCategoriesArgs = {
  input: AllCategoriesInput;
};


export type QueryGetAssetBalanceArgs = {
  input: AssetBalanceInput;
};


export type QueryGetAssetChartArgs = {
  input: WalletAssetChartInput;
};


export type QueryGetAssetChartPreviewArgs = {
  input: WalletAssetChartInput;
};


export type QueryGetAssetHistoryArgs = {
  input: AssetHistoryInput;
};


export type QueryGetBrowserHistoryArgs = {
  input: TokenBrowserHistoryInput;
};


export type QueryGetCategoryStatisticArgs = {
  input: CategoryStatisticInput;
};


export type QueryGetDevHoldArgs = {
  input: DevHoldInput;
};


export type QueryGetFavoriteTokenArgs = {
  input: TokenFilterInput;
};


export type QueryGetFollowedHolderArgs = {
  input: HolderInput;
};


export type QueryGetFollowedTransactionsArgs = {
  input: TransactionInput;
};


export type QueryGetFollowingSmartMoneysArgs = {
  filter: SmartMoneyFollowFilterInput;
};


export type QueryGetFollowingWalletAddressessArgs = {
  filter: SmartMoneyActionFilterInput;
};


export type QueryGetFundingWalletHistoryArgs = {
  input: SearchFundingWalletTransferHistory;
};


export type QueryGetHolderArgs = {
  input: HolderInput;
};


export type QueryGetHolderChartArgs = {
  input: HolderChartInput;
};


export type QueryGetLiquidityChartArgs = {
  input: GetLiquidityChartInput;
};


export type QueryGetListDexArgs = {
  chainId: Scalars['Int']['input'];
  token: Scalars['String']['input'];
};


export type QueryGetManyTokenArgs = {
  input: GetManyTokenInput;
};


export type QueryGetMemeTokenArgs = {
  input: MemeInput;
};


export type QueryGetOhlcArgs = {
  input: OhlcInput;
};


export type QueryGetOnChainDataAnalyticArgs = {
  input: OnChainDataAnalyticInput;
};


export type QueryGetPoolTransactionsArgs = {
  input: PoolTransactionInput;
};


export type QueryGetPortfolioArgs = {
  input: SearchPortfolioInput;
};


export type QueryGetPortfolioManyWalletArgs = {
  input: PortfolioManyWalletInput;
};


export type QueryGetPortfolioOverviewArgs = {
  input: SearchPortfolioOverviewInput;
};


export type QueryGetPricesArgs = {
  chainId: Scalars['Int']['input'];
  tokens: Array<Scalars['String']['input']>;
};


export type QueryGetQuoteTokenArgs = {
  input: QuoteTokenInput;
};


export type QueryGetSmartMoneyActionsArgs = {
  filter: SmartMoneyActionFilterInput;
};


export type QueryGetTokenCreatedByDevArgs = {
  input: TokenCreatedByDevInput;
};


export type QueryGetTokenDetailArgs = {
  token: TokenDetailInput;
};


export type QueryGetTokenMetadataArgs = {
  address: Scalars['String']['input'];
  chainId?: Scalars['Int']['input'];
};


export type QueryGetTokenOfficialInformationArgs = {
  address: Scalars['String']['input'];
  chainId?: Scalars['Int']['input'];
};


export type QueryGetTokenPoolInfoArgs = {
  input: TokenDetailInput;
};


export type QueryGetTokenPortraitArgs = {
  input: TokenDetailInput;
};


export type QueryGetTokenSniperArgs = {
  input: TokenSniperInput;
};


export type QueryGetTokenTelegramArgs = {
  input: TelegramTokenInput;
};


export type QueryGetTokenTrendingArgs = {
  input: TokenTrendingInput;
};


export type QueryGetTokensArgs = {
  input: AdminTokenInput;
};


export type QueryGetTotalSmByTokenArgs = {
  input: TokenDetailInput;
};


export type QueryGetTradeHistoryArgs = {
  input: TokenTradeHistoryInput;
};


export type QueryGetTradingTransactionsArgs = {
  input: TradingTransactionInput;
};


export type QueryGetWalletBalanceArgs = {
  input: WalletBalanceInput;
};


export type QueryGetWalletInfoArgs = {
  input: WalletInfoInput;
};


export type QueryGetWalletInfoOnHoverArgs = {
  input: WalletInfoOnHoverInput;
};


export type QueryGetWalletStatisticArgs = {
  input: WalletStatisticInput;
};


export type QueryLastTransactionsArgs = {
  input: SearchLastTransactionInput;
};


export type QueryListInfluentialTwitterFollowersArgs = {
  input: ListInfluentialTwitterFollowersInput;
};


export type QueryRankArgs = {
  filter: SmartMoneyFilterInput;
};


export type QuerySearchArgs = {
  input: SearchTokenLiteInput;
};


export type QuerySearchTokenArgs = {
  input: Scalars['String']['input'];
};


export type QuerySearchTokenLiteArgs = {
  input: Scalars['String']['input'];
};


export type QueryTokensByCategoryArgs = {
  input: TokensByCategoryInput;
};

export type QuoteTokenInput = {
  tokenAddress: Scalars['String']['input'];
  walletAddress: Scalars['String']['input'];
};

export type RefreshWalletBalanceInput = {
  chainId?: InputMaybe<Scalars['Int']['input']>;
  wallets: Array<Scalars['String']['input']>;
};

export type SearchFundingWalletTransferHistory = {
  chainId?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  includeDeprecatedAsset?: Scalars['Boolean']['input'];
  limit?: Scalars['Int']['input'];
  page?: Scalars['Int']['input'];
  token?: InputMaybe<Scalars['String']['input']>;
  txid?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<TransferType>;
  types?: InputMaybe<Array<TransferType>>;
  walletAddress?: InputMaybe<Scalars['String']['input']>;
};

export type SearchLastTransactionInput = {
  chainId?: Scalars['Int']['input'];
  lastTimestamp?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  maxAmount?: InputMaybe<Scalars['DecimalScalar']['input']>;
  minAmount?: InputMaybe<Scalars['DecimalScalar']['input']>;
  token: Scalars['String']['input'];
};

export type SearchPortfolioInput = {
  allToken?: InputMaybe<Scalars['Boolean']['input']>;
  chainId?: InputMaybe<Scalars['Int']['input']>;
  currencyName?: InputMaybe<Scalars['String']['input']>;
  hideModestBalance?: Scalars['Boolean']['input'];
  hideSmallBalance?: Scalars['Boolean']['input'];
  hideSmallLiquidity?: Scalars['Boolean']['input'];
  hideZeroBalance?: Scalars['Boolean']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  /** sortBy these field rawBalance, holdingValue, lastTxTime, totalBuyUsd, totalSellUsd, totalFee with prefix + is asc, - is desc, eg: +rawBalance */
  sortBy?: InputMaybe<Scalars['String']['input']>;
  tag?: InputMaybe<Scalars['String']['input']>;
  token?: InputMaybe<Scalars['String']['input']>;
  userAddress?: InputMaybe<Scalars['String']['input']>;
  userAddresses?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type SearchPortfolioOverviewInput = {
  allToken?: InputMaybe<Scalars['Boolean']['input']>;
  /** Optional chain IDs to filter portfolio. If not provided, returns all chains. Supported: Ethereum (1), Arbitrum (42161), BSC (56), Solana (501424). Invalid IDs are filtered out. Example: [1, 56, 501424] */
  chainIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  hideSmallBalance?: Scalars['Boolean']['input'];
  hideSmallLiquidity?: Scalars['Boolean']['input'];
  hideZeroBalance?: Scalars['Boolean']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  /** search by prefix of symbol */
  search?: InputMaybe<Scalars['String']['input']>;
  /** sortBy these field rawBalance, holdingValue with prefix + is asc, - is desc, eg: +rawBalance */
  sortBy?: InputMaybe<Scalars['String']['input']>;
  userAddresses: Array<Scalars['String']['input']>;
};

export type SearchTokenLiteInput = {
  chainId?: Scalars['Int']['input'];
  searchString: Scalars['String']['input'];
};

export type Security = {
  __typename?: 'Security';
  buyTax?: Maybe<Scalars['String']['output']>;
  sellTax?: Maybe<Scalars['String']['output']>;
};

export type SetCategoryNameInput = {
  categoryId: Scalars['String']['input'];
  chainId: Scalars['Int']['input'];
  name: Scalars['String']['input'];
};

export type SmartMoneyActionDto = {
  __typename?: 'SmartMoneyActionDTO';
  address: Scalars['String']['output'];
  baseAmount?: Maybe<Scalars['DecimalScalar']['output']>;
  timestamp: Scalars['Float']['output'];
  token: TokenDto;
  txType: TransactionType;
  usdAmount?: Maybe<Scalars['DecimalScalar']['output']>;
};

export type SmartMoneyActionFilterInput = {
  chain: ChainType;
  limit?: Scalars['Int']['input'];
  minAmountUsd?: InputMaybe<Scalars['Int']['input']>;
  page?: Scalars['Int']['input'];
  transactionType?: InputMaybe<Array<TransactionType>>;
  walletAddresses?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type SmartMoneyActionPaginationDto = {
  __typename?: 'SmartMoneyActionPaginationDTO';
  actions?: Maybe<Array<SmartMoneyActionDto>>;
};

export type SmartMoneyByTokenDto = {
  __typename?: 'SmartMoneyByTokenDTO';
  address: Scalars['String']['output'];
  chainId: Scalars['Int']['output'];
  totalSM: Scalars['Int']['output'];
};

export type SmartMoneyDto = {
  __typename?: 'SmartMoneyDTO';
  address: Scalars['String']['output'];
  avatar?: Maybe<Scalars['String']['output']>;
  avgCost7d: Scalars['Float']['output'];
  dailyProfits?: Maybe<Array<DailyProfitDto>>;
  lastActivityAt?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  pnl1d: Scalars['Float']['output'];
  pnl7d: Scalars['Float']['output'];
  pnl30d: Scalars['Float']['output'];
  tags?: Maybe<Array<Scalars['String']['output']>>;
  totalBuy1d?: Maybe<Scalars['Float']['output']>;
  totalBuy7d?: Maybe<Scalars['Float']['output']>;
  totalBuy30d?: Maybe<Scalars['Float']['output']>;
  twitterUsername?: Maybe<Scalars['String']['output']>;
  winRate7d: Scalars['Float']['output'];
};

export type SmartMoneyFilterInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  chain?: ChainType;
  /** Items per page (1-20, use limitOption for predefined sizes) */
  limit?: InputMaybe<Scalars['Int']['input']>;
  /** Predefined page sizes: 1, 20, 40, 60, 80, 100 (recommended over limit) */
  limitOption?: InputMaybe<Scalars['Int']['input']>;
  /** Page number (1-based, max: 20) */
  page?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Array<SmartMoneyType>>;
};

export type SmartMoneyFollowFilterInput = {
  chain?: ChainType;
  /** Items per page (1-20, use limitOption for predefined sizes) */
  limit?: InputMaybe<Scalars['Int']['input']>;
  /** Predefined page sizes: 1, 20, 40, 60, 80, 100 (recommended over limit) */
  limitOption?: InputMaybe<Scalars['Int']['input']>;
  /** Page number (1-based, max: 20) */
  page?: InputMaybe<Scalars['Int']['input']>;
  sortType?: SmartMoneySortType;
};

export type SmartMoneyFollowInput = {
  chain?: ChainType;
  walletAddress: Scalars['String']['input'];
};

export enum SmartMoneySortType {
  FollowTime = 'FollowTime',
  Pnl7D = 'Pnl7D'
}

export enum SmartMoneyType {
  Fresh = 'Fresh',
  Kol = 'KOL',
  PumpSm = 'PumpSM',
  SmartMoney = 'SmartMoney',
  Sniper = 'Sniper',
  TopTrader = 'TopTrader',
  Whale = 'Whale'
}

export type SniperTradeDto = {
  __typename?: 'SniperTradeDTO';
  address?: Maybe<Scalars['String']['output']>;
  isSniper?: Maybe<Scalars['Boolean']['output']>;
  status?: Maybe<TokenSniper>;
};

export type SocialDetailInfo = {
  __typename?: 'SocialDetailInfo';
  averageCommentsPerPost?: Maybe<Scalars['Float']['output']>;
  averageForwardingPerPost?: Maybe<Scalars['Float']['output']>;
  averageLikesPerPost?: Maybe<Scalars['Float']['output']>;
  averageViewPerPost?: Maybe<Scalars['Float']['output']>;
  nameChanges?: Maybe<Array<Scalars['String']['output']>>;
  numberFollowers?: Maybe<Scalars['String']['output']>;
  numberPosts?: Maybe<Scalars['String']['output']>;
  registrationDate?: Maybe<Scalars['DateTime']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type SocialInfo = {
  __typename?: 'SocialInfo';
  type?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type SourceFundingInformation = {
  __typename?: 'SourceFundingInformation';
  sourceOfFunding?: Maybe<Scalars['String']['output']>;
  sourceOfFundingTxTime?: Maybe<Scalars['Int']['output']>;
};

export type TelegramTokenInput = {
  chain?: ChainType;
  tokenAddress?: InputMaybe<Scalars['String']['input']>;
  walletAddress?: InputMaybe<Scalars['String']['input']>;
};

/** timeframe supported */
export enum Timeframe {
  D1 = 'd1',
  H1 = 'h1',
  H2 = 'h2',
  H4 = 'h4',
  H6 = 'h6',
  M1 = 'm1',
  M5 = 'm5',
  M10 = 'm10',
  M15 = 'm15',
  M30 = 'm30',
  S1 = 's1',
  S30 = 's30',
  W1 = 'w1'
}

export type ToggleCategoryInput = {
  categoryId: Scalars['String']['input'];
  chainId: Scalars['Int']['input'];
  isEnabled: Scalars['Boolean']['input'];
};

export type Token = {
  __typename?: 'Token';
  address?: Maybe<Scalars['String']['output']>;
  aiAnalyzedAt?: Maybe<Scalars['DateTime']['output']>;
  chainId?: Maybe<Scalars['Int']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  creator?: Maybe<Scalars['String']['output']>;
  decimals?: Maybe<Scalars['String']['output']>;
  info?: Maybe<TokenInfo>;
  isBlacklisted?: Maybe<Scalars['Boolean']['output']>;
  logo?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  symbol?: Maybe<Scalars['String']['output']>;
  tags?: Maybe<Array<Scalars['String']['output']>>;
  totalSupply?: Maybe<Scalars['String']['output']>;
  volume24h?: Maybe<Scalars['DecimalScalar']['output']>;
};

export type TokenBrowserHistoryDto = {
  __typename?: 'TokenBrowserHistoryDTO';
  chainId: Scalars['Int']['output'];
  createdTime: Scalars['DateTime']['output'];
  dexes: Array<Scalars['String']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  isFavorite: Scalars['Boolean']['output'];
  marketCap: Scalars['DecimalScalar']['output'];
  price24hChange: Scalars['DecimalScalar']['output'];
  symbol: Scalars['String']['output'];
  token: Scalars['String']['output'];
  volume24h: Scalars['DecimalScalar']['output'];
};

export type TokenBrowserHistoryInput = {
  tokenAddresses: Array<Scalars['String']['input']>;
};

export type TokenCreatedByDevDto = {
  __typename?: 'TokenCreatedByDevDTO';
  address: Scalars['String']['output'];
  avatar?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateScalar']['output'];
  marketCap?: Maybe<Scalars['DecimalScalar']['output']>;
  migratedAt?: Maybe<Scalars['DateScalar']['output']>;
  rug?: Maybe<Scalars['Boolean']['output']>;
  rugReason?: Maybe<Scalars['String']['output']>;
  rugTime?: Maybe<Scalars['DateScalar']['output']>;
  symbol: Scalars['String']['output'];
  total?: Maybe<Scalars['Int']['output']>;
  totalActive?: Maybe<Scalars['Int']['output']>;
  totalMigrated?: Maybe<Scalars['Int']['output']>;
  totalRug?: Maybe<Scalars['Int']['output']>;
};

export type TokenCreatedByDevInput = {
  chainId?: Scalars['Int']['input'];
  devAddress: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};

export type TokenDto = {
  __typename?: 'TokenDTO';
  address?: Maybe<Scalars['String']['output']>;
  burnRatio?: Maybe<Scalars['Float']['output']>;
  burnStatus?: Maybe<Scalars['String']['output']>;
  chainId?: Maybe<Scalars['Int']['output']>;
  decimals?: Maybe<Scalars['String']['output']>;
  info?: Maybe<TokenInfo>;
  isBlacklisted?: Maybe<Scalars['Boolean']['output']>;
  isHoneypot?: Maybe<Scalars['Boolean']['output']>;
  mintDisable?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  ratTraderAmountRate?: Maybe<Scalars['Float']['output']>;
  security?: Maybe<Security>;
  symbol?: Maybe<Scalars['String']['output']>;
  tags?: Maybe<Array<Scalars['String']['output']>>;
  top10HolderRate?: Maybe<Scalars['Float']['output']>;
  totalSupply?: Maybe<Scalars['String']['output']>;
};

export type TokenDetail = {
  __typename?: 'TokenDetail';
  address?: Maybe<Scalars['String']['output']>;
  athDate?: Maybe<Scalars['DateScalar']['output']>;
  athPrice?: Maybe<Scalars['DecimalScalar']['output']>;
  atlDate?: Maybe<Scalars['DateScalar']['output']>;
  atlPrice?: Maybe<Scalars['DecimalScalar']['output']>;
  burnRatio?: Maybe<Scalars['Float']['output']>;
  burnStatus?: Maybe<Scalars['String']['output']>;
  buyTxs?: Maybe<Scalars['DecimalScalar']['output']>;
  chainId?: Maybe<Scalars['Int']['output']>;
  circulatingSupply?: Maybe<Scalars['DecimalScalar']['output']>;
  contractCreator?: Maybe<Scalars['String']['output']>;
  contractOwner?: Maybe<Scalars['String']['output']>;
  createdTime?: Maybe<Scalars['DateScalar']['output']>;
  creator?: Maybe<Scalars['String']['output']>;
  decimals?: Maybe<Scalars['String']['output']>;
  devHold?: Maybe<Scalars['Float']['output']>;
  dexes?: Maybe<Array<Scalars['String']['output']>>;
  health?: Maybe<TokenHealth>;
  holders: Scalars['Float']['output'];
  info?: Maybe<TokenInfo>;
  initLiquidity?: Maybe<Scalars['DecimalScalar']['output']>;
  internalMarketProgress?: Maybe<Scalars['DecimalScalar']['output']>;
  isBlacklisted?: Maybe<Scalars['Boolean']['output']>;
  isFavorite: Scalars['Boolean']['output'];
  isHoneypot?: Maybe<Scalars['Boolean']['output']>;
  isHotToken: Scalars['Boolean']['output'];
  isMigrated: Scalars['Boolean']['output'];
  liquidity?: Maybe<Scalars['DecimalScalar']['output']>;
  marketCap?: Maybe<Scalars['DecimalScalar']['output']>;
  metadataCustom?: Maybe<Scalars['JSONObject']['output']>;
  mintDisable?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  numberProTrader: Scalars['Int']['output'];
  numberUniqueAddresses?: Maybe<NumberUniqueAddresses>;
  openPrice?: Maybe<Scalars['DecimalScalar']['output']>;
  openPrice24h?: Maybe<Scalars['DecimalScalar']['output']>;
  openTime24h?: Maybe<Scalars['Int']['output']>;
  pairs?: Maybe<Array<DexScreenPoolDto>>;
  /** deprecate field, use pairs instead */
  pools?: Maybe<Array<PoolDto>>;
  /** deprecated fields, use query getTokenPortrait instead */
  portrait?: Maybe<TokenPortrait>;
  price?: Maybe<Scalars['DecimalScalar']['output']>;
  price1hChange?: Maybe<Scalars['DecimalScalar']['output']>;
  price5mChange?: Maybe<Scalars['DecimalScalar']['output']>;
  price6hChange?: Maybe<Scalars['DecimalScalar']['output']>;
  price24hChange?: Maybe<Scalars['DecimalScalar']['output']>;
  ratTraderAmountRate?: Maybe<Scalars['Float']['output']>;
  security?: Maybe<Security>;
  sellTxs?: Maybe<Scalars['DecimalScalar']['output']>;
  symbol?: Maybe<Scalars['String']['output']>;
  tags?: Maybe<Array<Scalars['String']['output']>>;
  top10Holder?: Maybe<Scalars['DecimalScalar']['output']>;
  top10HolderRate?: Maybe<Scalars['Float']['output']>;
  topTrending?: Maybe<Scalars['Int']['output']>;
  totalAmount?: Maybe<TotalAmount>;
  totalSupply?: Maybe<Scalars['String']['output']>;
  totalTransactions?: Maybe<TotalTransactions>;
  turnoverRate24h?: Maybe<Scalars['DecimalScalar']['output']>;
  volume24h?: Maybe<Scalars['DecimalScalar']['output']>;
};

export type TokenDetailInput = {
  address: Scalars['String']['input'];
  chainId?: Scalars['Int']['input'];
};

/** token trending direction */
export enum TokenDirection {
  AiAnalysis = 'AiAnalysis',
  Gainer = 'Gainer',
  Loser = 'Loser',
  Popular = 'Popular'
}

export type TokenFilterInput = {
  chain?: ChainType;
  dex?: InputMaybe<TokenSource>;
  dexes?: InputMaybe<Scalars['String']['input']>;
  internalMarketProgressFrom?: InputMaybe<Scalars['Float']['input']>;
  internalMarketProgressTo?: InputMaybe<Scalars['Float']['input']>;
  launchpad?: InputMaybe<Launchpad>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  liquidityPoolFrom?: InputMaybe<Scalars['String']['input']>;
  liquidityPoolTo?: InputMaybe<Scalars['String']['input']>;
  marketValueFrom?: InputMaybe<Scalars['String']['input']>;
  marketValueTo?: InputMaybe<Scalars['String']['input']>;
  numberOfHolderFrom?: InputMaybe<Scalars['Int']['input']>;
  numberOfHolderTo?: InputMaybe<Scalars['Int']['input']>;
  openingTimeFrom?: InputMaybe<Scalars['Int']['input']>;
  openingTimeTo?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pagination?: InputMaybe<PaginationInput>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  timeRange: TokenTimeRange;
  /** deprecated field, use tradingVolumeFrom instead */
  tradingVolume1hFrom?: InputMaybe<Scalars['String']['input']>;
  /** deprecated field, use tradingVolumeFrom instead */
  tradingVolume1hTo?: InputMaybe<Scalars['String']['input']>;
  tradingVolumeFrom?: InputMaybe<Scalars['String']['input']>;
  tradingVolumeTo?: InputMaybe<Scalars['String']['input']>;
  /** deprecated field, use transactionFrom instead */
  transaction1hFrom?: InputMaybe<Scalars['Int']['input']>;
  /** deprecated field, use transactionTo instead */
  transaction1hTo?: InputMaybe<Scalars['Int']['input']>;
  transactionFrom?: InputMaybe<Scalars['Int']['input']>;
  transactionTo?: InputMaybe<Scalars['Int']['input']>;
};

export type TokenHealth = {
  __typename?: 'TokenHealth';
  burnt: Scalars['Boolean']['output'];
  canSell: Scalars['Boolean']['output'];
  noBlackListWhiteListFunction: Scalars['Boolean']['output'];
  noHighTax: Scalars['Boolean']['output'];
  notMint: Scalars['Boolean']['output'];
  top10?: Maybe<Scalars['DecimalScalar']['output']>;
  verifiedSourceCode: Scalars['Boolean']['output'];
};

export type TokenHolding = {
  __typename?: 'TokenHolding';
  balance: Scalars['DecimalScalar']['output'];
  chainId: Scalars['Int']['output'];
  holdingPercent: Scalars['DecimalScalar']['output'];
  lastUpdated: Scalars['DateScalar']['output'];
  tokenAddress: Scalars['String']['output'];
  totalSupply: Scalars['DecimalScalar']['output'];
};

export type TokenInfo = {
  __typename?: 'TokenInfo';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  bannerUrl?: Maybe<Scalars['String']['output']>;
  dexScreenerAdvertised?: Maybe<Scalars['Boolean']['output']>;
  dexScreenerBoosts?: Maybe<Scalars['Boolean']['output']>;
  logoUrl?: Maybe<Scalars['String']['output']>;
  socials?: Maybe<Array<SocialInfo>>;
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  websites?: Maybe<Array<WebsitesInfo>>;
};

export type TokenInfoDto = {
  __typename?: 'TokenInfoDTO';
  address?: Maybe<Scalars['String']['output']>;
  burnRatio?: Maybe<Scalars['Float']['output']>;
  burnStatus?: Maybe<Scalars['String']['output']>;
  chainId?: Maybe<Scalars['Int']['output']>;
  decimals?: Maybe<Scalars['String']['output']>;
  dexes?: Maybe<Array<Scalars['String']['output']>>;
  info?: Maybe<TokenInfo>;
  isBlacklisted?: Maybe<Scalars['Boolean']['output']>;
  isHoneypot?: Maybe<Scalars['Boolean']['output']>;
  marketCap?: Maybe<Scalars['DecimalScalar']['output']>;
  mintDisable?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  price?: Maybe<Scalars['DecimalScalar']['output']>;
  ratTraderAmountRate?: Maybe<Scalars['Float']['output']>;
  security?: Maybe<Security>;
  solanaPrice?: Maybe<Scalars['DecimalScalar']['output']>;
  symbol?: Maybe<Scalars['String']['output']>;
  tags?: Maybe<Array<Scalars['String']['output']>>;
  top10HolderRate?: Maybe<Scalars['Float']['output']>;
  totalSupply?: Maybe<Scalars['String']['output']>;
  walletToken?: Maybe<WalletToken>;
};

export type TokenOfficialInformation = {
  __typename?: 'TokenOfficialInformation';
  addPoolTime?: Maybe<Scalars['DateScalar']['output']>;
  balanceProjectPartyDev?: Maybe<Scalars['String']['output']>;
  booleanOptions?: Maybe<Array<BooleanOptionInfo>>;
  contractAddress?: Maybe<Scalars['String']['output']>;
  devEntrepreneurshipHistory?: Maybe<Scalars['String']['output']>;
  openingDate?: Maybe<Scalars['DateScalar']['output']>;
  poolAddress?: Maybe<Scalars['String']['output']>;
  poolAddresses: Array<Scalars['String']['output']>;
  poolNativeBalance?: Maybe<Scalars['DecimalScalar']['output']>;
  poolTokenBalance?: Maybe<Scalars['DecimalScalar']['output']>;
  projectPartyDevAddress?: Maybe<Scalars['String']['output']>;
  projectPartyDevHistory?: Maybe<Scalars['String']['output']>;
  socials?: Maybe<Array<SocialDetailInfo>>;
};

export type TokenPopularDto = {
  __typename?: 'TokenPopularDTO';
  chainId: Scalars['Float']['output'];
  dexes?: Maybe<Array<Scalars['String']['output']>>;
  hot?: Maybe<Scalars['Boolean']['output']>;
  logoUrl?: Maybe<Scalars['String']['output']>;
  marketcap?: Maybe<Scalars['DecimalScalar']['output']>;
  name: Scalars['String']['output'];
  price24hChange?: Maybe<Scalars['DecimalScalar']['output']>;
  symbol: Scalars['String']['output'];
  token: Scalars['String']['output'];
};

export type TokenPortrait = {
  __typename?: 'TokenPortrait';
  abandoned?: Maybe<Scalars['Boolean']['output']>;
  advertisesOnDex?: Maybe<Scalars['Boolean']['output']>;
  ageSinceCreation?: Maybe<Scalars['Boolean']['output']>;
  bannerUrl?: Maybe<Scalars['String']['output']>;
  devAction?: Maybe<Array<DevAction>>;
  devAddLiquidity?: Maybe<Scalars['Boolean']['output']>;
  devStatus?: Maybe<Scalars['Boolean']['output']>;
  explorer?: Maybe<Scalars['String']['output']>;
  launchedOnPump?: Maybe<Scalars['Boolean']['output']>;
  lowLiquidity?: Maybe<Scalars['Boolean']['output']>;
  officialTelegram?: Maybe<Scalars['String']['output']>;
  officialTwitter?: Maybe<Scalars['String']['output']>;
  officialWebsite?: Maybe<Scalars['String']['output']>;
  tweetId?: Maybe<Scalars['String']['output']>;
  twitterNameChangeCount?: Maybe<Scalars['Int']['output']>;
  updatedSocialOnDex?: Maybe<Scalars['Boolean']['output']>;
  walletActive1h: Scalars['Int']['output'];
};

export type TokenSearchLiteDto = {
  __typename?: 'TokenSearchLiteDTO';
  chainId: Scalars['Int']['output'];
  createdTime?: Maybe<Scalars['DateScalar']['output']>;
  dexes?: Maybe<Array<Scalars['String']['output']>>;
  image?: Maybe<Scalars['String']['output']>;
  isFavorite: Scalars['Boolean']['output'];
  isHotToken: Scalars['Boolean']['output'];
  marketcap?: Maybe<Scalars['DecimalScalar']['output']>;
  metadataCustom?: Maybe<Scalars['JSONObject']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  openPrice24h?: Maybe<Scalars['DecimalScalar']['output']>;
  price?: Maybe<Scalars['DecimalScalar']['output']>;
  price24hChange?: Maybe<Scalars['DecimalScalar']['output']>;
  symbol?: Maybe<Scalars['String']['output']>;
  token: Scalars['String']['output'];
  volume24h?: Maybe<Scalars['DecimalScalar']['output']>;
};

/** TokenSniper */
export enum TokenSniper {
  BuyMore = 'BuyMore',
  Hold = 'Hold',
  SellAll = 'SellAll',
  SellPart = 'SellPart',
  Sniper = 'Sniper'
}

export type TokenSniperDto = {
  __typename?: 'TokenSniperDto';
  currentTotalHolding?: Maybe<Scalars['DecimalScalar']['output']>;
  /** Deprecated, please use traders field instead */
  snipers?: Maybe<Array<TokenSniper>>;
  top10Holders?: Maybe<Scalars['DecimalScalar']['output']>;
  top100Holders?: Maybe<Scalars['DecimalScalar']['output']>;
  totalBought?: Maybe<Scalars['DecimalScalar']['output']>;
  traders?: Maybe<Array<SniperTradeDto>>;
};

export type TokenSniperInput = {
  chainId: Scalars['Int']['input'];
  tokenAddress: Scalars['String']['input'];
};

/** token creation source */
export enum TokenSource {
  Aldrin = 'Aldrin',
  AldrinV2 = 'AldrinV2',
  All = 'All',
  Bags = 'Bags',
  Balansol = 'Balansol',
  Believe = 'Believe',
  Bonk = 'Bonk',
  BonkSwap = 'BonkSwap',
  Crema = 'Crema',
  Cropper = 'Cropper',
  Cykura = 'Cykura',
  Dexlab = 'Dexlab',
  Dradex = 'Dradex',
  DynamicBc = 'Dynamic_BC',
  FluxBeam = 'FluxBeam',
  GooseFx = 'GooseFX',
  GooseFxv2 = 'GooseFXV2',
  HeliumNetwork = 'HeliumNetwork',
  Invariant = 'Invariant',
  Launchlab = 'Launchlab',
  Lifinity = 'Lifinity',
  LifinityV2 = 'LifinityV2',
  MarcoPolo = 'MarcoPolo',
  Marinade = 'Marinade',
  Mercurial = 'Mercurial',
  Meteora = 'Meteora',
  MeteoraDbc = 'MeteoraDBC',
  MeteoraDlmm = 'MeteoraDLMM',
  MeteoraDammV2 = 'Meteora_DAMM_V2',
  Moonit = 'Moonit',
  ObricV2 = 'ObricV2',
  Openbook = 'Openbook',
  OpenbookV2 = 'OpenbookV2',
  Orca = 'Orca',
  OrcaTokenSwap = 'OrcaTokenSwap',
  OrcaWhirlpools = 'Orca_Whirlpools',
  Penguin = 'Penguin',
  Perps = 'Perps',
  Phoenix = 'Phoenix',
  PumpSwap = 'PumpSwap',
  Pumpfun = 'Pumpfun',
  Raydium = 'Raydium',
  RaydiumClmm = 'RaydiumCLMM',
  Saber = 'Saber',
  SaberDecimalWrapper = 'SaberDecimalWrapper',
  Saros = 'Saros',
  Sencha = 'Sencha',
  SolFi = 'SolFi',
  Step = 'Step',
  Stepn = 'Stepn',
  Symmetry = 'Symmetry',
  TokenSwap = 'TokenSwap',
  UnstakeIt = 'UnstakeIt',
  Whirlpool = 'Whirlpool'
}

export type TokenStatisticDto = {
  __typename?: 'TokenStatisticDTO';
  activityUpdatedAt?: Maybe<Scalars['DateScalar']['output']>;
  advertisesOnDex?: Maybe<Scalars['Boolean']['output']>;
  athDate?: Maybe<Scalars['DateScalar']['output']>;
  athPrice?: Maybe<Scalars['DecimalScalar']['output']>;
  atlDate?: Maybe<Scalars['DateScalar']['output']>;
  atlPrice?: Maybe<Scalars['DecimalScalar']['output']>;
  bundlerHoldingPercent?: Maybe<Scalars['DecimalScalar']['output']>;
  buyTxs1h: Scalars['Float']['output'];
  buyTxs1m: Scalars['Float']['output'];
  buyTxs5m: Scalars['Float']['output'];
  buyTxs6h: Scalars['Float']['output'];
  buyTxs24h: Scalars['Float']['output'];
  categoryIds?: Maybe<Array<Scalars['String']['output']>>;
  chainId: Scalars['Int']['output'];
  circulatingSupply?: Maybe<Scalars['DecimalScalar']['output']>;
  createdTime?: Maybe<Scalars['DateScalar']['output']>;
  debug?: Maybe<TokenTrendingDebug>;
  decimals?: Maybe<Scalars['String']['output']>;
  devHold?: Maybe<Scalars['Float']['output']>;
  devLaunched?: Maybe<Scalars['Float']['output']>;
  dexes?: Maybe<Array<Scalars['String']['output']>>;
  firstPrice?: Maybe<Scalars['DecimalScalar']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  initLiquidity?: Maybe<Scalars['DecimalScalar']['output']>;
  insider?: Maybe<Scalars['Float']['output']>;
  insiderRawBalance?: Maybe<Scalars['DecimalScalar']['output']>;
  internalMarketProgress?: Maybe<Scalars['DecimalScalar']['output']>;
  isFavorite: Scalars['Boolean']['output'];
  isHotToken: Scalars['Boolean']['output'];
  isMigrated: Scalars['Boolean']['output'];
  launchpad?: Maybe<Scalars['String']['output']>;
  liquidity?: Maybe<Scalars['DecimalScalar']['output']>;
  marketCap5mChangeUsd?: Maybe<Scalars['DecimalScalar']['output']>;
  marketcap?: Maybe<Scalars['DecimalScalar']['output']>;
  marketcap5m?: Maybe<Scalars['DecimalScalar']['output']>;
  metadataCustom?: Maybe<Scalars['JSONObject']['output']>;
  migratedAt?: Maybe<Scalars['DateScalar']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  numberOfHolder?: Maybe<Scalars['Int']['output']>;
  numberUniqueAddresses?: Maybe<NumberUniqueAddresses>;
  ohlc?: Maybe<Array<Ohlcdto>>;
  openPrice?: Maybe<Scalars['DecimalScalar']['output']>;
  openPrice24h?: Maybe<Scalars['DecimalScalar']['output']>;
  price?: Maybe<Scalars['DecimalScalar']['output']>;
  price1hAgo?: Maybe<Scalars['DecimalScalar']['output']>;
  price1hChange?: Maybe<Scalars['DecimalScalar']['output']>;
  price1mAgo?: Maybe<Scalars['DecimalScalar']['output']>;
  price1mChange?: Maybe<Scalars['DecimalScalar']['output']>;
  price5mAgo?: Maybe<Scalars['DecimalScalar']['output']>;
  price5mChange?: Maybe<Scalars['DecimalScalar']['output']>;
  price6hChange?: Maybe<Scalars['DecimalScalar']['output']>;
  price24hAgo?: Maybe<Scalars['DecimalScalar']['output']>;
  price24hChange?: Maybe<Scalars['DecimalScalar']['output']>;
  rug?: Maybe<Scalars['Boolean']['output']>;
  rugReason?: Maybe<Scalars['String']['output']>;
  rugTime?: Maybe<Scalars['DateScalar']['output']>;
  sameSourceWallet?: Maybe<Scalars['String']['output']>;
  sellTxs1h: Scalars['Float']['output'];
  sellTxs1m: Scalars['Float']['output'];
  sellTxs5m: Scalars['Float']['output'];
  sellTxs6h: Scalars['Float']['output'];
  sellTxs24h: Scalars['Float']['output'];
  smartMoneyHolder?: Maybe<Scalars['DecimalScalar']['output']>;
  smartMoneyPct?: Maybe<Scalars['DecimalScalar']['output']>;
  sniperCount?: Maybe<Scalars['Int']['output']>;
  sniperHoldAmount?: Maybe<Scalars['String']['output']>;
  sniperHoldPct?: Maybe<Scalars['Float']['output']>;
  symbol?: Maybe<Scalars['String']['output']>;
  token: Scalars['String']['output'];
  top10Holder?: Maybe<Scalars['DecimalScalar']['output']>;
  topTrending?: Maybe<Scalars['Int']['output']>;
  totalAmount?: Maybe<TotalAmount>;
  totalSupply?: Maybe<Scalars['DecimalScalar']['output']>;
  totalTransactions?: Maybe<TotalTransactions>;
  trendingScore1h?: Maybe<Scalars['Float']['output']>;
  trendingScore1m?: Maybe<Scalars['Float']['output']>;
  trendingScore5m?: Maybe<Scalars['Float']['output']>;
  trendingScore6h?: Maybe<Scalars['Float']['output']>;
  trendingScore24h?: Maybe<Scalars['Float']['output']>;
  turnoverRate24h?: Maybe<Scalars['DecimalScalar']['output']>;
  tweetId?: Maybe<Scalars['String']['output']>;
  twitterNameChangeCount?: Maybe<Scalars['Int']['output']>;
  twitterUrl?: Maybe<Scalars['String']['output']>;
  /** Deprecated, please use sniperHoldPct instead */
  txBySniperPct?: Maybe<Scalars['DecimalScalar']['output']>;
  txs1h: Scalars['Float']['output'];
  txs1m: Scalars['Float']['output'];
  txs5m: Scalars['Float']['output'];
  txs6h: Scalars['Float']['output'];
  txs24h: Scalars['Float']['output'];
  volume1h?: Maybe<Scalars['DecimalScalar']['output']>;
  volume1m?: Maybe<Scalars['DecimalScalar']['output']>;
  volume5m?: Maybe<Scalars['DecimalScalar']['output']>;
  volume6h?: Maybe<Scalars['DecimalScalar']['output']>;
  volume24h?: Maybe<Scalars['DecimalScalar']['output']>;
  website?: Maybe<Scalars['String']['output']>;
};

export type TokenStatisticPagination = {
  __typename?: 'TokenStatisticPagination';
  data: Array<TokenStatisticDto>;
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
};

export type TokenSymbolsDto = {
  __typename?: 'TokenSymbolsDTO';
  chainId?: Maybe<Scalars['Int']['output']>;
  createdAt?: Maybe<Scalars['DateScalar']['output']>;
  creator?: Maybe<Scalars['String']['output']>;
  decimals?: Maybe<Scalars['String']['output']>;
  symbol?: Maybe<Scalars['String']['output']>;
  totalSupply?: Maybe<Scalars['String']['output']>;
  totalSupplyRaw?: Maybe<Scalars['String']['output']>;
};

/** token time range for filtering */
export enum TokenTimeRange {
  H1 = 'h1',
  H6 = 'h6',
  H24 = 'h24',
  M1 = 'm1',
  M5 = 'm5'
}

export type TokenTradeHistoryInput = {
  chain?: ChainType;
  filter?: InputMaybe<TradeHistoryFilterInput>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pagination?: InputMaybe<PaginationInput>;
  tokenAddress: Scalars['String']['input'];
};

export type TokenTrendingDebug = {
  __typename?: 'TokenTrendingDebug';
  calculatedAt: Scalars['DateTime']['output'];
  debugData: TrendingScoreDebug;
  isHotToken: Scalars['Boolean']['output'];
  rank: Scalars['Int']['output'];
  score: Scalars['Float']['output'];
  timeframe: Scalars['String']['output'];
  token: Scalars['String']['output'];
};

export type TokenTrendingInput = {
  chain?: ChainType;
  debug?: InputMaybe<Scalars['Boolean']['input']>;
  dex?: InputMaybe<TokenSource>;
  dexes?: InputMaybe<Scalars['String']['input']>;
  direction?: TokenDirection;
  internalMarketProgressFrom?: InputMaybe<Scalars['Float']['input']>;
  internalMarketProgressTo?: InputMaybe<Scalars['Float']['input']>;
  launchpad?: InputMaybe<Launchpad>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  liquidityPoolFrom?: InputMaybe<Scalars['String']['input']>;
  liquidityPoolTo?: InputMaybe<Scalars['String']['input']>;
  marketValueFrom?: InputMaybe<Scalars['String']['input']>;
  marketValueTo?: InputMaybe<Scalars['String']['input']>;
  numberOfHolderFrom?: InputMaybe<Scalars['Int']['input']>;
  numberOfHolderTo?: InputMaybe<Scalars['Int']['input']>;
  openingTimeFrom?: InputMaybe<Scalars['Int']['input']>;
  openingTimeTo?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pagination?: InputMaybe<PaginationInput>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  timeRange: TokenTimeRange;
  /** deprecated field, use tradingVolumeFrom instead */
  tradingVolume1hFrom?: InputMaybe<Scalars['String']['input']>;
  /** deprecated field, use tradingVolumeFrom instead */
  tradingVolume1hTo?: InputMaybe<Scalars['String']['input']>;
  tradingVolumeFrom?: InputMaybe<Scalars['String']['input']>;
  tradingVolumeTo?: InputMaybe<Scalars['String']['input']>;
  /** deprecated field, use transactionFrom instead */
  transaction1hFrom?: InputMaybe<Scalars['Int']['input']>;
  /** deprecated field, use transactionTo instead */
  transaction1hTo?: InputMaybe<Scalars['Int']['input']>;
  transactionFrom?: InputMaybe<Scalars['Int']['input']>;
  transactionTo?: InputMaybe<Scalars['Int']['input']>;
};

export type TokensByCategoryInput = {
  categoryId: Scalars['String']['input'];
  chainId: Scalars['Int']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: TokensByCategorySortFields;
  sortType?: SortType;
};

/** sort fields for tokens by category */
export enum TokensByCategorySortFields {
  MarketCap = 'MarketCap',
  Price = 'Price',
  Price24hChange = 'Price24hChange',
  Volume24h = 'Volume24h'
}

export type TokensStatisticByCategoryDto = {
  __typename?: 'TokensStatisticByCategoryDTO';
  address?: Maybe<Scalars['String']['output']>;
  chainId?: Maybe<Scalars['String']['output']>;
  isFavorite: Scalars['Boolean']['output'];
  liquidity?: Maybe<Scalars['DecimalScalar']['output']>;
  logoUrl?: Maybe<Scalars['String']['output']>;
  marketCap?: Maybe<Scalars['DecimalScalar']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  price?: Maybe<Scalars['DecimalScalar']['output']>;
  price24hChange?: Maybe<Scalars['DecimalScalar']['output']>;
  symbol?: Maybe<Scalars['String']['output']>;
  volume24h?: Maybe<Scalars['DecimalScalar']['output']>;
};

export type TokensStatisticByCategoryPagination = {
  __typename?: 'TokensStatisticByCategoryPagination';
  data: Array<TokensStatisticByCategoryDto>;
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
};

export type TopGainers = {
  __typename?: 'TopGainers';
  logoUrl?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  price24hChange?: Maybe<Scalars['DecimalScalar']['output']>;
  symbol?: Maybe<Scalars['String']['output']>;
};

export type TotalAmount = {
  __typename?: 'TotalAmount';
  totalBuyAmount1h?: Maybe<Scalars['DecimalScalar']['output']>;
  totalBuyAmount5m?: Maybe<Scalars['DecimalScalar']['output']>;
  totalBuyAmount6h?: Maybe<Scalars['DecimalScalar']['output']>;
  totalBuyAmount24h?: Maybe<Scalars['DecimalScalar']['output']>;
  totalSellAmount1h?: Maybe<Scalars['DecimalScalar']['output']>;
  totalSellAmount5m?: Maybe<Scalars['DecimalScalar']['output']>;
  totalSellAmount6h?: Maybe<Scalars['DecimalScalar']['output']>;
  totalSellAmount24h?: Maybe<Scalars['DecimalScalar']['output']>;
};

export type TotalTransactions = {
  __typename?: 'TotalTransactions';
  numberOfPurchases1h?: Maybe<Scalars['Int']['output']>;
  numberOfPurchases5m?: Maybe<Scalars['Int']['output']>;
  numberOfPurchases6h?: Maybe<Scalars['Int']['output']>;
  numberOfPurchases24h?: Maybe<Scalars['Int']['output']>;
  numberOfSales1h?: Maybe<Scalars['Int']['output']>;
  numberOfSales5m?: Maybe<Scalars['Int']['output']>;
  numberOfSales6h?: Maybe<Scalars['Int']['output']>;
  numberOfSales24h?: Maybe<Scalars['Int']['output']>;
};

export type TradeHistoryDto = {
  __typename?: 'TradeHistoryDTO';
  balance: Scalars['DecimalScalar']['output'];
  marketCap: Scalars['DecimalScalar']['output'];
  maxHoldingQty: Scalars['DecimalScalar']['output'];
  price: Scalars['DecimalScalar']['output'];
  quantity: Scalars['DecimalScalar']['output'];
  timestamp: Scalars['String']['output'];
  tradeValue: Scalars['DecimalScalar']['output'];
  type: TransactionType;
  wallet: Scalars['String']['output'];
};

export type TradeHistoryFilterInput = {
  fromTimestamp?: InputMaybe<Scalars['Int']['input']>;
  quantityMax?: InputMaybe<Scalars['DecimalScalar']['input']>;
  quantityMin?: InputMaybe<Scalars['DecimalScalar']['input']>;
  sortType?: SortType;
  toTime?: InputMaybe<Scalars['Int']['input']>;
  tradeValueMax?: InputMaybe<Scalars['DecimalScalar']['input']>;
  tradeValueMin?: InputMaybe<Scalars['DecimalScalar']['input']>;
  type?: TransactionType;
  wallets?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type TradeHistoryPagination = {
  __typename?: 'TradeHistoryPagination';
  data: Array<TradeHistoryDto>;
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
};

export type TradingTransactionInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  chainId: Scalars['Int']['input'];
  classification?: TransactionClassification;
  filterRobot?: Scalars['Boolean']['input'];
  lastTimestamp?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
  /** sortBy these fields timestamp, usdAmount, baseAmount, with prefix + is asc, - is desc, example: +timestamp */
  sortBy?: InputMaybe<Scalars['String']['input']>;
  timestampFrom?: InputMaybe<Scalars['String']['input']>;
  timestampTo?: InputMaybe<Scalars['String']['input']>;
  token: Scalars['String']['input'];
  transactionUsdAmountFrom?: InputMaybe<Scalars['Float']['input']>;
  transactionUsdAmountTo?: InputMaybe<Scalars['Float']['input']>;
  transactionVolumeFrom?: InputMaybe<Scalars['Float']['input']>;
  transactionVolumeTo?: InputMaybe<Scalars['Float']['input']>;
  type?: TransactionType;
};

export type TradingTransactionPagination = {
  __typename?: 'TradingTransactionPagination';
  data: Array<FollowedTransaction>;
  fromTimestamp: Scalars['String']['output'];
};

/** transaction classification */
export enum TransactionClassification {
  All = 'All',
  Bundlers = 'Bundlers',
  Followed = 'Followed',
  Fresh = 'Fresh',
  Insider = 'Insider',
  Kol = 'KOL',
  ProjectParty = 'ProjectParty',
  SameSource = 'SameSource',
  SmartMoney = 'SmartMoney',
  Sniper = 'Sniper',
  Whale = 'Whale'
}

export type TransactionDto = {
  __typename?: 'TransactionDTO';
  baseAmount?: Maybe<Scalars['DecimalScalar']['output']>;
  baseToken: Scalars['String']['output'];
  chainId: Scalars['Int']['output'];
  decimals?: Maybe<Scalars['Int']['output']>;
  holderPct?: Maybe<Scalars['String']['output']>;
  holdingProgress?: Maybe<Scalars['Float']['output']>;
  isBundler: Scalars['Boolean']['output'];
  isDev: Scalars['Boolean']['output'];
  isFreshWallet: Scalars['Boolean']['output'];
  isHugeValue: Scalars['Boolean']['output'];
  isInsider: Scalars['Boolean']['output'];
  isKOL: Scalars['Boolean']['output'];
  isNativeWallet: Scalars['Boolean']['output'];
  isNewActivity: Scalars['Boolean']['output'];
  isSingleSideTransaction: Scalars['Boolean']['output'];
  isSmartMoney: Scalars['Boolean']['output'];
  isSniper: Scalars['Boolean']['output'];
  isTopTrader: Scalars['Boolean']['output'];
  isWhale: Scalars['Boolean']['output'];
  liquidity?: Maybe<Scalars['DecimalScalar']['output']>;
  logIndex?: Maybe<Scalars['Int']['output']>;
  maker: Scalars['String']['output'];
  nativeAmount?: Maybe<Scalars['DecimalScalar']['output']>;
  nativePrice?: Maybe<Scalars['DecimalScalar']['output']>;
  pair?: Maybe<Scalars['String']['output']>;
  price?: Maybe<Scalars['DecimalScalar']['output']>;
  quoteAmount?: Maybe<Scalars['DecimalScalar']['output']>;
  quoteToken?: Maybe<Scalars['String']['output']>;
  timestamp: Scalars['String']['output'];
  totalSupply?: Maybe<Scalars['DecimalScalar']['output']>;
  tx24h?: Maybe<Scalars['Int']['output']>;
  txHash: Scalars['String']['output'];
  type: Scalars['String']['output'];
  usdAmount?: Maybe<Scalars['DecimalScalar']['output']>;
  usdPrice?: Maybe<Scalars['DecimalScalar']['output']>;
};

export type TransactionEvent = {
  __typename?: 'TransactionEvent';
  baseAmount: Scalars['DecimalScalar']['output'];
  baseAmountRaw?: Maybe<Scalars['String']['output']>;
  baseToken: Scalars['String']['output'];
  factory?: Maybe<Scalars['String']['output']>;
  isSniper?: Maybe<Scalars['Boolean']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  liquidityUsd?: Maybe<Scalars['DecimalScalar']['output']>;
  nativeAmount: Scalars['DecimalScalar']['output'];
  nativePrice: Scalars['DecimalScalar']['output'];
  pair: Scalars['String']['output'];
  price: Scalars['DecimalScalar']['output'];
  quoteAmount: Scalars['DecimalScalar']['output'];
  quoteAmountRaw?: Maybe<Scalars['String']['output']>;
  quoteReserves: Scalars['DecimalScalar']['output'];
  quoteToken: Scalars['String']['output'];
  realTokenReserves: Scalars['DecimalScalar']['output'];
  type: Scalars['String']['output'];
  usdAmount: Scalars['DecimalScalar']['output'];
  usdPrice: Scalars['DecimalScalar']['output'];
};

export type TransactionInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  chainId: Scalars['Int']['input'];
  lastTimestamp?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
  /** sortBy these fields timestamp, usdAmount, baseAmount, with prefix + is asc, - is desc, example: +timestamp */
  sortBy?: InputMaybe<Scalars['String']['input']>;
  timestampFrom?: InputMaybe<Scalars['String']['input']>;
  timestampTo?: InputMaybe<Scalars['String']['input']>;
  token: Scalars['String']['input'];
  transactionUsdAmountFrom?: InputMaybe<Scalars['Float']['input']>;
  transactionUsdAmountTo?: InputMaybe<Scalars['Float']['input']>;
  transactionVolumeFrom?: InputMaybe<Scalars['Float']['input']>;
  transactionVolumeTo?: InputMaybe<Scalars['Float']['input']>;
  type?: TransactionType;
};

/** type of transaction */
export enum TransactionType {
  AddLiquidity = 'AddLiquidity',
  All = 'All',
  Buy = 'Buy',
  Liquidity = 'Liquidity',
  RemoveLiquidity = 'RemoveLiquidity',
  Sell = 'Sell',
  SingleSideLiquidity = 'SingleSideLiquidity',
  Trading = 'Trading'
}

export enum TransferStatus {
  Failed = 'Failed',
  Processing = 'Processing',
  Success = 'Success'
}

/** Transfer type (Withdraw, Deposit, Other) */
export enum TransferType {
  Deposit = 'DEPOSIT',
  DepositFuture = 'DEPOSIT_FUTURE',
  DepositFutureExternal = 'DEPOSIT_FUTURE_EXTERNAL',
  DepositPredictExternal = 'DEPOSIT_PREDICT_EXTERNAL',
  Other = 'OTHER',
  Swap = 'SWAP',
  Withdraw = 'WITHDRAW',
  WithdrawFuture = 'WITHDRAW_FUTURE',
  WithdrawFutureExternal = 'WITHDRAW_FUTURE_EXTERNAL',
  WithdrawPredictExternal = 'WITHDRAW_PREDICT_EXTERNAL'
}

export type TrendingScoreDebug = {
  __typename?: 'TrendingScoreDebug';
  ageBoost: Scalars['Float']['output'];
  agePenalty: Scalars['Float']['output'];
  avgHg: Scalars['Float']['output'];
  avgLq: Scalars['Float']['output'];
  avgPriceChange: Scalars['Float']['output'];
  avgTx: Scalars['Float']['output'];
  avgVol: Scalars['Float']['output'];
  baseScore: Scalars['Float']['output'];
  cappedZHolder: Scalars['Float']['output'];
  cappedZLiq: Scalars['Float']['output'];
  cappedZPrice: Scalars['Float']['output'];
  cappedZTx: Scalars['Float']['output'];
  cappedZVol: Scalars['Float']['output'];
  finalScore: Scalars['Float']['output'];
  holderGrowthPercentage: Scalars['Float']['output'];
  liqMCPercentage: Scalars['Float']['output'];
  liquidityPenalty: Scalars['Float']['output'];
  normalizedBase: Scalars['Float']['output'];
  priceChange: Scalars['Float']['output'];
  sdHg: Scalars['Float']['output'];
  sdLq: Scalars['Float']['output'];
  sdPriceChange: Scalars['Float']['output'];
  sdTx: Scalars['Float']['output'];
  sdVol: Scalars['Float']['output'];
  securityBoost: Scalars['Float']['output'];
  timeframeWindow: Scalars['String']['output'];
  tokenAge: Scalars['String']['output'];
  tokenCreatedAt: Scalars['DateTime']['output'];
  transactionMultiplier: Scalars['Float']['output'];
  txCount: Scalars['Float']['output'];
  volUsd: Scalars['Float']['output'];
  volumeMultiplier: Scalars['Float']['output'];
  zHolder: Scalars['Float']['output'];
  zLiq: Scalars['Float']['output'];
  zPrice: Scalars['Float']['output'];
  zTx: Scalars['Float']['output'];
  zVol: Scalars['Float']['output'];
};

export type WalletAssetChartInput = {
  chainId?: InputMaybe<Scalars['Int']['input']>;
  duration: WalletDuration;
  unit: WalletBalanceUnit;
  walletAddress?: InputMaybe<Scalars['String']['input']>;
};

export type WalletBalanceDto = {
  __typename?: 'WalletBalanceDTO';
  balanceChangeNative: Scalars['DecimalScalar']['output'];
  balanceChangeUsd: Scalars['DecimalScalar']['output'];
  chainId?: Maybe<Scalars['Float']['output']>;
  duration: WalletDuration;
  nativeTokenAddress: Scalars['String']['output'];
  nativeTokenBalance: Scalars['DecimalScalar']['output'];
  nativeTokenSymbol: Scalars['String']['output'];
  realizedPnl: Scalars['DecimalScalar']['output'];
  unrealizedPnl: Scalars['DecimalScalar']['output'];
  usdBalance: Scalars['DecimalScalar']['output'];
  userId: Scalars['String']['output'];
  walletAddress: Scalars['String']['output'];
  walletType: WalletType;
};

export type WalletBalanceInput = {
  chainId?: InputMaybe<Scalars['Int']['input']>;
  duration: WalletDuration;
  walletAddress?: InputMaybe<Scalars['String']['input']>;
};

export enum WalletBalanceUnit {
  Native = 'Native',
  Usd = 'Usd'
}

export enum WalletDuration {
  D1 = 'd1',
  M1 = 'm1',
  W1 = 'w1',
  Y1 = 'y1'
}

export type WalletInfoInput = {
  addresses: Scalars['String']['input'];
  chainId: Scalars['Int']['input'];
  token: Scalars['String']['input'];
};

export type WalletInfoOnHoverDto = {
  __typename?: 'WalletInfoOnHoverDTO';
  balance: Scalars['DecimalScalar']['output'];
  buys: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  realizedPnL: Scalars['DecimalScalar']['output'];
  sells: Scalars['Float']['output'];
  totalBuyUsd: Scalars['DecimalScalar']['output'];
  totalSellUsd: Scalars['DecimalScalar']['output'];
  totalUsdValue: Scalars['DecimalScalar']['output'];
};

export type WalletInfoOnHoverInput = {
  chain?: ChainType;
  tokenAddress: Scalars['String']['input'];
  wallet: Scalars['String']['input'];
};

export type WalletStatisticDto = {
  __typename?: 'WalletStatisticDTO';
  avgBuyMarketCap?: Maybe<Scalars['DecimalScalar']['output']>;
  avgHolding7d?: Maybe<Scalars['DecimalScalar']['output']>;
  avgSellMarketCap?: Maybe<Scalars['DecimalScalar']['output']>;
  currentHolding?: Maybe<Scalars['DecimalScalar']['output']>;
  holdingDuration?: Maybe<Scalars['BigInt']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  labels?: Maybe<Array<Scalars['String']['output']>>;
  maxHolding?: Maybe<Scalars['DecimalScalar']['output']>;
  noted?: Maybe<Scalars['Int']['output']>;
  pnl?: Maybe<Scalars['DecimalScalar']['output']>;
  pnl7d?: Maybe<Scalars['DecimalScalar']['output']>;
  tokens7d?: Maybe<Scalars['DecimalScalar']['output']>;
  totalBuyTxs?: Maybe<Scalars['Int']['output']>;
  totalSellTxs?: Maybe<Scalars['Int']['output']>;
  totalUsdBuyAmount?: Maybe<Scalars['DecimalScalar']['output']>;
  totalUsdSellAmount?: Maybe<Scalars['DecimalScalar']['output']>;
  tracked?: Maybe<Scalars['Int']['output']>;
  trades7d?: Maybe<Scalars['DecimalScalar']['output']>;
  walletAddress?: Maybe<Scalars['String']['output']>;
  winrate7d?: Maybe<Scalars['DecimalScalar']['output']>;
};

export type WalletStatisticInput = {
  address: Scalars['String']['input'];
  chainId: Scalars['Int']['input'];
  token: Scalars['String']['input'];
};

export type WalletToken = {
  __typename?: 'WalletToken';
  address?: Maybe<Scalars['String']['output']>;
  avgMarketCap?: Maybe<Scalars['DecimalScalar']['output']>;
  avgPriceUsd?: Maybe<Scalars['DecimalScalar']['output']>;
  avgSellMarketCap?: Maybe<Scalars['DecimalScalar']['output']>;
  balance?: Maybe<Scalars['DecimalScalar']['output']>;
  balanceUpdatedTime?: Maybe<Scalars['Int']['output']>;
  buys?: Maybe<Scalars['Float']['output']>;
  chainId?: Maybe<Scalars['Int']['output']>;
  createdAt?: Maybe<Scalars['DateScalar']['output']>;
  hourStatistics?: Maybe<Array<WalletTokenHourStatistic>>;
  isFresh: Scalars['Boolean']['output'];
  isInsider: Scalars['Boolean']['output'];
  isKOL: Scalars['Boolean']['output'];
  isPumpSM: Scalars['Boolean']['output'];
  isSmartMoney: Scalars['Boolean']['output'];
  isSniper: Scalars['Boolean']['output'];
  isWhale: Scalars['Boolean']['output'];
  lastTxTime?: Maybe<Scalars['DateScalar']['output']>;
  maxHoldingQty?: Maybe<Scalars['DecimalScalar']['output']>;
  nativeBalance?: Maybe<Scalars['DecimalScalar']['output']>;
  rawBalance?: Maybe<Scalars['DecimalScalar']['output']>;
  realizedPnL?: Maybe<Scalars['DecimalScalar']['output']>;
  sells?: Maybe<Scalars['Float']['output']>;
  sourceFundingInfo?: Maybe<SourceFundingInformation>;
  startTimeHolding?: Maybe<Scalars['DateScalar']['output']>;
  statistic?: Maybe<WalletTokenStatistic>;
  symbol?: Maybe<Scalars['String']['output']>;
  token?: Maybe<Scalars['String']['output']>;
  tokenAccount?: Maybe<Scalars['String']['output']>;
  totalBuyQty?: Maybe<Scalars['DecimalScalar']['output']>;
  totalBuyUsd?: Maybe<Scalars['DecimalScalar']['output']>;
  totalFee?: Maybe<Scalars['DecimalScalar']['output']>;
  totalFeeUsd?: Maybe<Scalars['DecimalScalar']['output']>;
  totalSellQty?: Maybe<Scalars['DecimalScalar']['output']>;
  totalSellUsd?: Maybe<Scalars['DecimalScalar']['output']>;
  totalTradedQty?: Maybe<Scalars['DecimalScalar']['output']>;
  totalUsdValue?: Maybe<Scalars['DecimalScalar']['output']>;
  updatedAt?: Maybe<Scalars['DateScalar']['output']>;
};

export type WalletTokenHourStatistic = {
  __typename?: 'WalletTokenHourStatistic';
  buyTokenVolume?: Maybe<Scalars['DecimalScalar']['output']>;
  buyTxs?: Maybe<Scalars['Int']['output']>;
  buyUsdVolume?: Maybe<Scalars['DecimalScalar']['output']>;
  sellTokenVolume?: Maybe<Scalars['DecimalScalar']['output']>;
  sellTxs?: Maybe<Scalars['Int']['output']>;
  sellUsdVolume?: Maybe<Scalars['DecimalScalar']['output']>;
  ts?: Maybe<Scalars['Int']['output']>;
};

export type WalletTokenStatistic = {
  __typename?: 'WalletTokenStatistic';
  totalBuyTxs?: Maybe<Scalars['Int']['output']>;
  totalBuyTxs24h?: Maybe<Scalars['Int']['output']>;
  totalSellTxs?: Maybe<Scalars['Int']['output']>;
  totalSellTxs24h?: Maybe<Scalars['Int']['output']>;
};

export type WalletTransferItem = {
  __typename?: 'WalletTransferItem';
  address: Scalars['String']['output'];
  amount?: Maybe<Scalars['DecimalScalar']['output']>;
  amountUsd?: Maybe<Scalars['DecimalScalar']['output']>;
  balance?: Maybe<Scalars['DecimalScalar']['output']>;
  blockNumber?: Maybe<Scalars['Int']['output']>;
  chainId: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  crossChainFee?: Maybe<Scalars['DecimalScalar']['output']>;
  crossChainFeeUnit?: Maybe<Scalars['String']['output']>;
  depositAddress?: Maybe<Scalars['String']['output']>;
  depositAmount?: Maybe<Scalars['DecimalScalar']['output']>;
  depositChainId?: Maybe<Scalars['Int']['output']>;
  depositErrorCode?: Maybe<Scalars['String']['output']>;
  depositErrorMessage?: Maybe<Scalars['String']['output']>;
  depositFee?: Maybe<Scalars['DecimalScalar']['output']>;
  depositStatus?: Maybe<Scalars['String']['output']>;
  depositToken?: Maybe<Scalars['String']['output']>;
  depositTxHash?: Maybe<Scalars['String']['output']>;
  errorCode?: Maybe<Scalars['String']['output']>;
  errorMessage?: Maybe<Scalars['String']['output']>;
  estimationTime?: Maybe<Scalars['Int']['output']>;
  fee?: Maybe<Scalars['DecimalScalar']['output']>;
  from: Scalars['String']['output'];
  id?: Maybe<Scalars['String']['output']>;
  memo?: Maybe<Scalars['String']['output']>;
  nativeBalance?: Maybe<Scalars['DecimalScalar']['output']>;
  rawBalance?: Maybe<Scalars['DecimalScalar']['output']>;
  rawFee?: Maybe<Scalars['DecimalScalar']['output']>;
  route?: Maybe<Scalars['String']['output']>;
  status?: Maybe<TransferStatus>;
  timestamp: Scalars['Float']['output'];
  to: Scalars['String']['output'];
  toAmount?: Maybe<Scalars['DecimalScalar']['output']>;
  toAmountUsd?: Maybe<Scalars['DecimalScalar']['output']>;
  toBlockNumber?: Maybe<Scalars['Int']['output']>;
  toChainId?: Maybe<Scalars['Int']['output']>;
  toTimestamp?: Maybe<Scalars['Float']['output']>;
  toToken?: Maybe<Scalars['String']['output']>;
  toTxHash?: Maybe<Scalars['String']['output']>;
  token: Scalars['String']['output'];
  tokenAccount: Scalars['String']['output'];
  txHash: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export enum WalletType {
  Funding = 'Funding',
  Futures = 'Futures',
  Spot = 'Spot'
}

export type WebsitesInfo = {
  __typename?: 'WebsitesInfo';
  label?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export enum SortType {
  Asc = 'ASC',
  Desc = 'DESC'
}
