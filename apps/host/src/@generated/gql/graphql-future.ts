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
  File: { input: any; output: any; }
  Int64: { input: any; output: any; }
  JSON: { input: any; output: any; }
  JSONObject: { input: any; output: any; }
  Map: { input: any; output: any; }
  Time: { input: any; output: any; }
};

export type AddFollowingWalletReq = {
  chain: ChainType;
  follows: Array<InputMaybe<FollowingWalletDto>>;
};

export type AllCategoriesInput = {
  chainId: Scalars['Int']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};

export type BlacklistAddressReq = {
  address: Scalars['String']['input'];
  chain: ChainType;
};

export type BlacklistAddressResp = {
  __typename?: 'BlacklistAddressResp';
  address: Scalars['String']['output'];
  chainId: Scalars['Int']['output'];
  createdTime: Scalars['Time']['output'];
};

export type BundleInput = {
  chain?: InputMaybe<ChainType>;
  token: Scalars['String']['input'];
};

export type BundleResponse = {
  __typename?: 'BundleResponse';
  athHold?: Maybe<Scalars['Float']['output']>;
  bundledToken?: Maybe<Scalars['Float']['output']>;
  bundledTotal?: Maybe<Scalars['Decimal']['output']>;
  holdPct?: Maybe<Scalars['Float']['output']>;
  totalBundler?: Maybe<Scalars['Int']['output']>;
};

export type CategoryDto = {
  __typename?: 'CategoryDTO';
  categoryId?: Maybe<Scalars['String']['output']>;
  isEnabled: Scalars['Boolean']['output'];
  marketCap: Scalars['Decimal']['output'];
  name?: Maybe<Scalars['String']['output']>;
  price1hChangeHistory?: Maybe<Array<Scalars['Decimal']['output']>>;
  price24hChange: Scalars['Decimal']['output'];
  priceDownCount?: Maybe<Scalars['Int']['output']>;
  priceUpCount?: Maybe<Scalars['Int']['output']>;
  tokensCount?: Maybe<Scalars['Int']['output']>;
  top1TokenAddress?: Maybe<Scalars['String']['output']>;
  top1TokenLogo?: Maybe<Scalars['String']['output']>;
  top1TokenName?: Maybe<Scalars['String']['output']>;
  top1TokenP24hChange: Scalars['Decimal']['output'];
  top1TokenSymbol?: Maybe<Scalars['String']['output']>;
  topGainers?: Maybe<Array<TopGainers>>;
  volume1hHistory?: Maybe<Array<Scalars['Decimal']['output']>>;
  volume24h: Scalars['Decimal']['output'];
};

export type CategoryPagination = {
  __typename?: 'CategoryPagination';
  data: Array<CategoryDto>;
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
};

export type CategoryStatisticDto = {
  __typename?: 'CategoryStatisticDTO';
  marketCap: Scalars['Decimal']['output'];
  price24hChange: Scalars['Decimal']['output'];
  priceDownCount: Scalars['Int']['output'];
  priceUpCount: Scalars['Int']['output'];
  tokensCount: Scalars['Int']['output'];
  volume24h: Scalars['Decimal']['output'];
};

export type CategoryStatisticInput = {
  categoryId: Scalars['String']['input'];
  chainId: Scalars['Int']['input'];
};

export enum ChainType {
  All = 'ALL',
  Arb = 'ARB',
  Bsc = 'BSC',
  Eth = 'ETH',
  Evm = 'EVM',
  Mon = 'MON',
  Solana = 'SOLANA',
  Tron = 'TRON'
}

export type ClassificationStatisticDto = {
  __typename?: 'ClassificationStatisticDTO';
  bot?: Maybe<Scalars['Int']['output']>;
  bundler?: Maybe<Scalars['Int']['output']>;
  dev?: Maybe<Scalars['Int']['output']>;
  followed?: Maybe<Scalars['Int']['output']>;
  fresh?: Maybe<Scalars['Int']['output']>;
  insider?: Maybe<Scalars['Int']['output']>;
  kol?: Maybe<Scalars['Int']['output']>;
  phishing?: Maybe<Scalars['Int']['output']>;
  smartMoney?: Maybe<Scalars['Int']['output']>;
  sniper?: Maybe<Scalars['Int']['output']>;
  top10?: Maybe<Scalars['Int']['output']>;
  whale?: Maybe<Scalars['Int']['output']>;
};

export type ClassificationStatisticInput = {
  chainId?: Scalars['Int']['input'];
  token: Scalars['String']['input'];
  type: ClassificationStatisticType;
};

export enum ClassificationStatisticType {
  Holder = 'Holder',
  Pool = 'Pool',
  Trade = 'Trade'
}

export type ClientGeoInfo = {
  __typename?: 'ClientGeoInfo';
  continent?: Maybe<Scalars['String']['output']>;
  continentCode?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  countryCode?: Maybe<Scalars['String']['output']>;
  ip?: Maybe<Scalars['String']['output']>;
};

export type DailyProfitDto = {
  __typename?: 'DailyProfitDTO';
  pnl: Scalars['Float']['output'];
  timestamp: Scalars['Int64']['output'];
};

export enum DayTimeRange {
  D1 = 'd1',
  D7 = 'd7',
  D30 = 'd30'
}

export enum DevAction {
  AddLiquidity = 'AddLiquidity',
  Burnt = 'Burnt',
  Hold = 'Hold',
  RemoveLiquidity = 'RemoveLiquidity',
  SellAll = 'SellAll'
}

export type DevHoldInput = {
  address: Scalars['String']['input'];
  chain?: InputMaybe<ChainType>;
};

export type DevHoldResponse = {
  __typename?: 'DevHoldResponse';
  fundingAddress?: Maybe<Scalars['String']['output']>;
  time?: Maybe<Scalars['Time']['output']>;
  transferIn?: Maybe<Scalars['Decimal']['output']>;
};

/** Supported DEX platforms */
export enum Dex {
  Aldrin = 'Aldrin',
  AldrinV2 = 'AldrinV2',
  All = 'All',
  Aquifer = 'Aquifer',
  Bags = 'Bags',
  Balansol = 'Balansol',
  Believe = 'Believe',
  Bonk = 'Bonk',
  BonkSwap = 'BonkSwap',
  Boop = 'Boop',
  Crema = 'Crema',
  Cropper = 'Cropper',
  Cykura = 'Cykura',
  Dexlab = 'Dexlab',
  Dradex = 'Dradex',
  FluxBeam = 'FluxBeam',
  Fusion = 'Fusion',
  GonFi = 'GonFi',
  GooseFx = 'GooseFX',
  GooseFxv2 = 'GooseFXV2',
  HeliumNetwork = 'HeliumNetwork',
  HumidiFi = 'HumidiFi',
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
  Obric = 'Obric',
  Openbook = 'Openbook',
  OpenbookV2 = 'OpenbookV2',
  Orca = 'Orca',
  OrcaTokenSwap = 'OrcaTokenSwap',
  PancakeSwap = 'PancakeSwap',
  PancakeSwapV2 = 'PancakeSwapV2',
  PancakeSwapV3 = 'PancakeSwapV3',
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
  Serum = 'Serum',
  SolFi = 'SolFi',
  SolFiV2 = 'SolFiV2',
  Step = 'Step',
  Stepn = 'Stepn',
  Symmetry = 'Symmetry',
  TesseraV = 'TesseraV',
  TokenSwap = 'TokenSwap',
  UnstakeIt = 'UnstakeIt',
  Whirlpool = 'Whirlpool',
  ZeroFi = 'ZeroFi'
}

export enum DexPaid {
  Paid = 'Paid',
  UnPaid = 'UnPaid'
}

export enum EventType {
  Add = 'Add',
  Burnt = 'Burnt',
  Buy = 'Buy',
  Remove = 'Remove',
  Sell = 'Sell'
}

/** Favorite token type filter */
export enum FavoriteType {
  /** All favorite tokens - sorted by order (default) */
  All = 'ALL',
  /** Meme tokens - sorted by order */
  Meme = 'MEME',
  /** XStock tokens - sorted by xStockOrder */
  Xstock = 'XSTOCK'
}

export type FollowingWalletDto = {
  address: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};

export type FollowingWalletInfo = {
  __typename?: 'FollowingWalletInfo';
  address: Scalars['String']['output'];
  alias: Scalars['String']['output'];
  avatar: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type FollowingWalletInfoReq = {
  address: Scalars['String']['input'];
  alias: Scalars['String']['input'];
};

export type GetBlacklistAddressesResp = {
  __typename?: 'GetBlacklistAddressesResp';
  addresses?: Maybe<Array<BlacklistAddressResp>>;
};

export type GetBlacklistInput = {
  chain?: ChainType;
  type: UserBlacklistType;
};

export type GetFollowingWalletReq = {
  chain: ChainType;
  chainId?: InputMaybe<Scalars['Int']['input']>;
};

export type GetHolderCountReq = {
  chainId: Scalars['Int']['input'];
  tokenAddress: Scalars['String']['input'];
};

export type GetPortfolioStatistic = {
  smartMoneyDetailReqs?: InputMaybe<Array<InputMaybe<SmartMoneyDetailReq>>>;
};

export type GetTokenPoolInfoInput = {
  chainId: Scalars['Int']['input'];
  pagination?: InputMaybe<PaginationInput>;
  tokenAddress: Scalars['String']['input'];
};

export type GetTokenPortraitInput = {
  address: Scalars['String']['input'];
  chainId: Scalars['Int']['input'];
};

export type GetWalletPnlInput = {
  /** Wallet addresses (supports multiple wallets) */
  addresses: Array<Scalars['String']['input']>;
  /** Chain type (e.g., SOL, ETH) */
  chain: ChainType;
  /** Time frame to get wallet PnL */
  timeFrame: GetWalletPnlTimeFrame;
  /** Date in year-month format (e.g., "2025-10-18T10:11:00Z"). Will be truncated by timeframe */
  toDate: Scalars['Time']['input'];
};

export type GetWalletPnlResponse = {
  __typename?: 'GetWalletPnlResponse';
  /** List of wallet PnL data */
  wallets: Array<WalletPnlData>;
};

export type GetWalletStatisticInput = {
  address: Scalars['String']['input'];
  chainId: Scalars['Int']['input'];
  timeRange?: InputMaybe<DayTimeRange>;
  tokenAddress: Scalars['String']['input'];
};

export type GetWalletStatisticRepsonse = {
  __typename?: 'GetWalletStatisticRepsonse';
  data: WalletStatistic;
};

export type HolderChart = {
  __typename?: 'HolderChart';
  averageHoldingPerWalletHistory?: Maybe<Array<Scalars['Decimal']['output']>>;
  botHistory?: Maybe<Array<Scalars['Decimal']['output']>>;
  bundleHistory?: Maybe<Array<Scalars['Decimal']['output']>>;
  inactiveWalletHistory?: Maybe<Array<Scalars['Decimal']['output']>>;
  insiderHoldingHistory?: Maybe<Array<Scalars['Decimal']['output']>>;
  newWalletHistory?: Maybe<Array<Scalars['Decimal']['output']>>;
  numberOfHolderHistory?: Maybe<Array<Scalars['Decimal']['output']>>;
  phishingWalletHistory?: Maybe<Array<Scalars['Decimal']['output']>>;
  steps?: Maybe<Array<Scalars['Int64']['output']>>;
  top10HolderHistory?: Maybe<Array<Scalars['Decimal']['output']>>;
};

export type HolderChartInput = {
  chainId: Scalars['Int']['input'];
  token: Scalars['String']['input'];
};

export type HolderDto = {
  __typename?: 'HolderDTO';
  address: Scalars['String']['output'];
  addressAlias?: Maybe<Scalars['String']['output']>;
  avgMarketCap: Scalars['Decimal']['output'];
  avgPriceUsd: Scalars['Decimal']['output'];
  balance: Scalars['Decimal']['output'];
  buys: Scalars['Float']['output'];
  chainId: Scalars['Int']['output'];
  createdAt?: Maybe<Scalars['Time']['output']>;
  decimal: Scalars['Int']['output'];
  holdingDuration: Scalars['Int64']['output'];
  isFresh: Scalars['Boolean']['output'];
  isInsider: Scalars['Boolean']['output'];
  isKOL: Scalars['Boolean']['output'];
  isPumpSM: Scalars['Boolean']['output'];
  isSmartMoney: Scalars['Boolean']['output'];
  isSniper: Scalars['Boolean']['output'];
  isWhale: Scalars['Boolean']['output'];
  label: Scalars['String']['output'];
  labels?: Maybe<Array<Scalars['String']['output']>>;
  lastSellAt: Scalars['Int64']['output'];
  lastTxTime?: Maybe<Scalars['Time']['output']>;
  maxHoldingQty: Scalars['Decimal']['output'];
  nativeBalance: Scalars['Decimal']['output'];
  nativeCreatedAt?: Maybe<Scalars['Time']['output']>;
  netInflow: Scalars['Decimal']['output'];
  numberTransaction: Scalars['Int']['output'];
  rawBalance: Scalars['Decimal']['output'];
  realizedPnL: Scalars['Decimal']['output'];
  realizedProfit: Scalars['Decimal']['output'];
  sells: Scalars['Float']['output'];
  solCreatedAt?: Maybe<Scalars['Time']['output']>;
  sourceFundingInfo: SourceFundingInformation;
  sourceOfFunding: Scalars['String']['output'];
  sourceOfFundingTxHash: Scalars['String']['output'];
  sourceOfFundingTxTime: Scalars['String']['output'];
  statistic: WalletTokenStatistic;
  symbol: Scalars['String']['output'];
  token: Scalars['String']['output'];
  tokenAccount: Scalars['String']['output'];
  tokenSource: Scalars['String']['output'];
  tokenSourceTime?: Maybe<Scalars['Time']['output']>;
  tokenSourceTxHash?: Maybe<Scalars['String']['output']>;
  /** Deprecated field */
  topHolder: Scalars['Int']['output'];
  totalBuyQty: Scalars['Decimal']['output'];
  totalBuyTxs: Scalars['Int']['output'];
  totalBuyUsd: Scalars['Decimal']['output'];
  totalProfit: Scalars['Decimal']['output'];
  totalSellQty: Scalars['Decimal']['output'];
  totalSellTxs: Scalars['Int']['output'];
  totalSellUsd: Scalars['Decimal']['output'];
  totalSupply: Scalars['Decimal']['output'];
  totalTradedQty: Scalars['Decimal']['output'];
  totalUsdValue: Scalars['Decimal']['output'];
  unrealizedProfit: Scalars['Decimal']['output'];
  updatedAt: Scalars['Time']['output'];
};

export type HolderInput = {
  chainId: Scalars['Int']['input'];
  classification?: TransactionClassification;
  holder?: InputMaybe<Scalars['String']['input']>;
  holders?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
  page?: Scalars['Int']['input'];
  sortBy?: InputMaybe<Scalars['String']['input']>;
  token: Scalars['String']['input'];
};

export enum HolderLabel {
  Bot = 'Bot',
  Bundler = 'Bundler',
  Dev = 'Dev',
  Fresh = 'Fresh',
  Insider = 'Insider',
  Kol = 'KOL',
  Phishing = 'Phishing',
  SameSource = 'SameSource',
  SmartMoney = 'SmartMoney',
  Sniper = 'Sniper',
  TopTrader = 'TopTrader',
  Whale = 'Whale'
}

export type HolderPagination = {
  __typename?: 'HolderPagination';
  data?: Maybe<Array<HolderDto>>;
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
};

export type ImportFollowingWalletReq = {
  chain: ChainType;
  followings: Array<InputMaybe<FollowingWalletInfoReq>>;
};

export type KlineStickerDto = {
  __typename?: 'KlineStickerDTO';
  data: Array<KlineWalletStatisticDto>;
  ts: Scalars['Int64']['output'];
};

export type KlineStickerInput = {
  chainId: Scalars['Int']['input'];
  fromTimeStamp?: InputMaybe<Scalars['Int64']['input']>;
  timeframe: Timeframe;
  token: Scalars['String']['input'];
  type?: InputMaybe<Array<KlineStickerUserType>>;
  userAddress?: InputMaybe<Scalars['String']['input']>;
};

export enum KlineStickerTxType {
  Buy = 'buy',
  Sell = 'sell'
}

export enum KlineStickerUserType {
  Bot = 'bot',
  Dev = 'dev',
  Fresh = 'fresh',
  Insider = 'insider',
  Kol = 'kol',
  Renames = 'renames',
  Smart = 'smart',
  Sniper = 'sniper',
  Top10 = 'top10',
  Tracking = 'tracking',
  User = 'user',
  Whale = 'whale'
}

export type KlineWalletStatisticDto = {
  __typename?: 'KlineWalletStatisticDTO';
  nativeAmount: Scalars['Decimal']['output'];
  tokenAmount: Scalars['Decimal']['output'];
  txs: Scalars['Int']['output'];
  type: KlineStickerTxType;
  usdAmount: Scalars['Decimal']['output'];
  userType: KlineStickerUserType;
  walletAddress: Scalars['String']['output'];
};

export type LanguagePackInput = {
  lang: Scalars['String']['input'];
};

export type LastTransaction = {
  __typename?: 'LastTransaction';
  baseAmount: Scalars['Decimal']['output'];
  chainId: Scalars['String']['output'];
  eventIndex: Scalars['Int']['output'];
  factory: Scalars['String']['output'];
  isKlineTx: Scalars['Boolean']['output'];
  liquidity: Scalars['Decimal']['output'];
  logIndex: Scalars['Int']['output'];
  maker: Scalars['String']['output'];
  marketCap: Scalars['Decimal']['output'];
  nativeAmount: Scalars['Decimal']['output'];
  priceUsd: Scalars['Decimal']['output'];
  quoteAmount: Scalars['Decimal']['output'];
  reasonFiltering?: Maybe<ReasonFiltering>;
  symbol: Scalars['String']['output'];
  timestamp: Scalars['Int64']['output'];
  token: Scalars['String']['output'];
  topLiquidity: Scalars['Decimal']['output'];
  totalFee: Scalars['Decimal']['output'];
  totalFeeUSD: Scalars['Decimal']['output'];
  transactionType: EventType;
  txid: Scalars['String']['output'];
  usdAmount: Scalars['Decimal']['output'];
};

export type LastTransactionPagination = {
  __typename?: 'LastTransactionPagination';
  data?: Maybe<Array<LastTransaction>>;
  fromTimestamp: Scalars['Int64']['output'];
};

/** Token launchpad platforms */
export enum Launchpad {
  Moonshot = 'Moonshot',
  Pumpfun = 'Pumpfun'
}

export enum LifecycleStates {
  Completed = 'completed',
  Completing = 'completing',
  NewCreation = 'newCreation',
  Soaring = 'soaring'
}

export type MaintenanceStatus = {
  __typename?: 'MaintenanceStatus';
  from?: Maybe<Scalars['Time']['output']>;
  isMaintainSchedule: Scalars['Boolean']['output'];
  to?: Maybe<Scalars['Time']['output']>;
  warningAt?: Maybe<Scalars['Time']['output']>;
};

export type MemeDto = {
  __typename?: 'MemeDTO';
  activityUpdatedAt?: Maybe<Scalars['Time']['output']>;
  advertisesOnDex?: Maybe<Scalars['Boolean']['output']>;
  athDate?: Maybe<Scalars['Time']['output']>;
  athPrice: Scalars['Decimal']['output'];
  atlDate?: Maybe<Scalars['Time']['output']>;
  atlPrice: Scalars['Decimal']['output'];
  avatarUrl?: Maybe<Scalars['String']['output']>;
  blacklist: Scalars['Boolean']['output'];
  /** deprecated field, please remove it from the query */
  botHoldPct?: Maybe<Scalars['Float']['output']>;
  botHolder?: Maybe<Scalars['Int']['output']>;
  botTxCount?: Maybe<Scalars['Int']['output']>;
  bundlerHoldingPercent: Scalars['Decimal']['output'];
  burnt: Scalars['Boolean']['output'];
  buyTxs1h: Scalars['Int']['output'];
  buyTxs1m: Scalars['Int']['output'];
  buyTxs5m: Scalars['Int']['output'];
  buyTxs6h: Scalars['Int']['output'];
  buyTxs24h: Scalars['Int']['output'];
  categoryIds?: Maybe<Array<Scalars['String']['output']>>;
  chainId: Scalars['Int']['output'];
  circulatingSupply: Scalars['Decimal']['output'];
  createdTime?: Maybe<Scalars['Time']['output']>;
  createdTimeRaw?: Maybe<Scalars['Time']['output']>;
  creator?: Maybe<Scalars['String']['output']>;
  debug?: Maybe<TokenTrendingDebug>;
  decimals?: Maybe<Scalars['String']['output']>;
  devHold?: Maybe<Scalars['Float']['output']>;
  devLaunched?: Maybe<Scalars['Int']['output']>;
  devMigrated?: Maybe<Scalars['Int']['output']>;
  dexes?: Maybe<Array<Scalars['String']['output']>>;
  /** Order position in user's favorites (null if not a favorite) */
  favoriteOrder?: Maybe<Scalars['Int']['output']>;
  firstPrice: Scalars['Decimal']['output'];
  image: Scalars['String']['output'];
  initLiquidity: Scalars['Decimal']['output'];
  insider?: Maybe<Scalars['Float']['output']>;
  insiderRawBalance: Scalars['Decimal']['output'];
  internalMarketProgress: Scalars['Decimal']['output'];
  isExclusive?: Maybe<Scalars['Boolean']['output']>;
  isFavorite: Scalars['Boolean']['output'];
  isHotToken: Scalars['Boolean']['output'];
  launchpad?: Maybe<Scalars['String']['output']>;
  liquidity: Scalars['Decimal']['output'];
  marketCap5mChangeUsd: Scalars['Decimal']['output'];
  marketcap: Scalars['Decimal']['output'];
  marketcap5m: Scalars['Decimal']['output'];
  memeTooltip?: Maybe<MemeTooltip>;
  metadataCustom?: Maybe<Scalars['Map']['output']>;
  migratedAt?: Maybe<Scalars['Time']['output']>;
  mint: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  numberOfHolder?: Maybe<Scalars['Int64']['output']>;
  numberUniqueAddresses?: Maybe<NumberUniqueAddresses>;
  /** deprecated field, please remove it from the query */
  ohlc?: Maybe<Array<Ohlcdto>>;
  openPrice: Scalars['Decimal']['output'];
  openPrice24h: Scalars['Decimal']['output'];
  price: Scalars['Decimal']['output'];
  price1hAgo: Scalars['Decimal']['output'];
  price1hChange: Scalars['Decimal']['output'];
  price1mAgo: Scalars['Decimal']['output'];
  price1mChange: Scalars['Decimal']['output'];
  price5mAgo: Scalars['Decimal']['output'];
  price5mChange: Scalars['Decimal']['output'];
  price6hChange: Scalars['Decimal']['output'];
  price24hAgo: Scalars['Decimal']['output'];
  price24hChange: Scalars['Decimal']['output'];
  rug?: Maybe<Scalars['Boolean']['output']>;
  rugReason?: Maybe<Scalars['String']['output']>;
  rugTime?: Maybe<Scalars['Time']['output']>;
  sameSourceWallet?: Maybe<Scalars['String']['output']>;
  sellTxs1h: Scalars['Int']['output'];
  sellTxs1m: Scalars['Int']['output'];
  sellTxs5m: Scalars['Int']['output'];
  sellTxs6h: Scalars['Int']['output'];
  sellTxs24h: Scalars['Int']['output'];
  smartMoneyHolder: Scalars['Decimal']['output'];
  smartMoneyPct: Scalars['Decimal']['output'];
  sniperCount?: Maybe<Scalars['Int']['output']>;
  sniperHoldAmount?: Maybe<Scalars['String']['output']>;
  sniperHoldPct?: Maybe<Scalars['Float']['output']>;
  symbol: Scalars['String']['output'];
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  token: Scalars['String']['output'];
  top10Holder: Scalars['Decimal']['output'];
  topTrending?: Maybe<Scalars['Int']['output']>;
  totalAmount?: Maybe<TotalAmount>;
  totalSupply: Scalars['Decimal']['output'];
  totalTransactions?: Maybe<TotalTransactions>;
  trendingScore1h?: Maybe<Scalars['Float']['output']>;
  trendingScore1m?: Maybe<Scalars['Float']['output']>;
  trendingScore5m?: Maybe<Scalars['Float']['output']>;
  trendingScore6h?: Maybe<Scalars['Float']['output']>;
  trendingScore24h?: Maybe<Scalars['Float']['output']>;
  turnoverRate24h: Scalars['Decimal']['output'];
  tweetId?: Maybe<Scalars['String']['output']>;
  twitterNameChangeCount?: Maybe<Scalars['Int']['output']>;
  twitterUrl?: Maybe<Scalars['String']['output']>;
  /** Deprecated, please use sniperHoldPct instead */
  txBySniperPct: Scalars['Decimal']['output'];
  txs1h: Scalars['Int']['output'];
  txs1m: Scalars['Int']['output'];
  txs5m: Scalars['Int']['output'];
  txs6h: Scalars['Int']['output'];
  txs24h: Scalars['Int']['output'];
  /** Favorite type: XSTOCK or MEME */
  type?: Maybe<Scalars['String']['output']>;
  uri?: Maybe<Scalars['String']['output']>;
  volume1h: Scalars['Decimal']['output'];
  volume1m: Scalars['Decimal']['output'];
  volume5m: Scalars['Decimal']['output'];
  volume6h: Scalars['Decimal']['output'];
  volume24h: Scalars['Decimal']['output'];
  website?: Maybe<Scalars['String']['output']>;
};

export type MemeInput = {
  chain?: ChainType;
  dex?: InputMaybe<Dex>;
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
  openingTimeFrom?: InputMaybe<Scalars['Int64']['input']>;
  openingTimeTo?: InputMaybe<Scalars['Int64']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pagination?: InputMaybe<PaginationInput>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  timeRange: TimeRange;
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
  bundlerCount: Scalars['Decimal']['output'];
  bundlerHoldAmount: Scalars['Decimal']['output'];
  devHoldAmount: Scalars['Decimal']['output'];
  insiderCount: Scalars['Decimal']['output'];
  insiderHoldAmount: Scalars['Decimal']['output'];
  top10HolderAmount: Scalars['Decimal']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addBlacklistAddresses: Scalars['Boolean']['output'];
  addFollowingWallet: Scalars['Boolean']['output'];
  addToFavorite: Scalars['Boolean']['output'];
  aliasWallet: Scalars['Boolean']['output'];
  followWallet: Scalars['Boolean']['output'];
  importFollowingWallet: Scalars['Boolean']['output'];
  removeBlacklistAddresses: Scalars['Boolean']['output'];
  removeTokenFavorite: Scalars['Boolean']['output'];
  unFollowWallet: Scalars['Boolean']['output'];
  /**
   * Update the order of a favorite token.
   * Moves the token to the specified position, shifting other tokens as needed.
   * Requires authentication.
   */
  updateFavoriteTokenOrder: Scalars['Boolean']['output'];
};


export type MutationAddBlacklistAddressesArgs = {
  req: UpdateBlacklistAddressesReq;
};


export type MutationAddFollowingWalletArgs = {
  req: AddFollowingWalletReq;
};


export type MutationAddToFavoriteArgs = {
  chain?: InputMaybe<ChainType>;
  tokens: Scalars['String']['input'];
};


export type MutationAliasWalletArgs = {
  req: WalletAliasReq;
};


export type MutationFollowWalletArgs = {
  req: SmartMoneyFollowInput;
};


export type MutationImportFollowingWalletArgs = {
  req: ImportFollowingWalletReq;
};


export type MutationRemoveBlacklistAddressesArgs = {
  req: UpdateBlacklistAddressesReq;
};


export type MutationRemoveTokenFavoriteArgs = {
  chain?: InputMaybe<ChainType>;
  tokens: Scalars['String']['input'];
};


export type MutationUnFollowWalletArgs = {
  req: SmartMoneyFollowInput;
};


export type MutationUpdateFavoriteTokenOrderArgs = {
  input: UpdateFavoriteTokenOrderInput;
};

export type NumberUniqueAddresses = {
  __typename?: 'NumberUniqueAddresses';
  numberOfBuyAddress1h: Scalars['Int']['output'];
  numberOfBuyAddress5m: Scalars['Int']['output'];
  numberOfBuyAddress6h: Scalars['Int']['output'];
  numberOfBuyAddress24h: Scalars['Int']['output'];
  numberOfSellAddress1h: Scalars['Int']['output'];
  numberOfSellAddress5m: Scalars['Int']['output'];
  numberOfSellAddress6h: Scalars['Int']['output'];
  numberOfSellAddress24h: Scalars['Int']['output'];
};

export type Ohlcdto = {
  __typename?: 'OHLCDTO';
  chainId: Scalars['Int']['output'];
  close: Scalars['Decimal']['output'];
  high: Scalars['Decimal']['output'];
  low: Scalars['Decimal']['output'];
  open: Scalars['Decimal']['output'];
  price: Scalars['Decimal']['output'];
  token: Scalars['String']['output'];
  tokenVolume: Scalars['Decimal']['output'];
  ts: Scalars['Int']['output'];
  usdVolume: Scalars['Decimal']['output'];
};

export type OhlcInput = {
  chainId?: Scalars['Int']['input'];
  fromTimeStamp?: InputMaybe<Scalars['Int64']['input']>;
  isMC?: InputMaybe<Scalars['Boolean']['input']>;
  isPatch?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  timeframe: Timeframe;
  token: Scalars['String']['input'];
};

export type Pagination = {
  __typename?: 'Pagination';
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  total?: Maybe<Scalars['Int64']['output']>;
};

export type PaginationInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};

export type PoolTransactionInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  addresses?: InputMaybe<Scalars['String']['input']>;
  chainId: Scalars['Int']['input'];
  classification?: TransactionClassification;
  /** Cursor for pagination. Format: timestamp:logIndex:eventIndex */
  cursor?: InputMaybe<Scalars['String']['input']>;
  dex?: InputMaybe<Dex>;
  eventType?: InputMaybe<EventType>;
  lastTimestamp?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
  nativeAmountFrom?: InputMaybe<Scalars['Float']['input']>;
  nativeAmountTo?: InputMaybe<Scalars['Float']['input']>;
  /** sortBy these fields timestamp, usdAmount, baseAmount, with prefix + is asc, - is desc, example: +timestamp */
  sortBy?: InputMaybe<Scalars['String']['input']>;
  timestampFrom?: InputMaybe<Scalars['String']['input']>;
  timestampTo?: InputMaybe<Scalars['String']['input']>;
  token: Scalars['String']['input'];
  transactionUsdAmountFrom?: InputMaybe<Scalars['Float']['input']>;
  transactionUsdAmountTo?: InputMaybe<Scalars['Float']['input']>;
  transactionVolumeFrom?: InputMaybe<Scalars['Float']['input']>;
  transactionVolumeTo?: InputMaybe<Scalars['Float']['input']>;
  type?: TxType;
};

export type PoolTransactionPagination = {
  __typename?: 'PoolTransactionPagination';
  /** Cursor for next page pagination. Format: timestamp:logIndex:eventIndex */
  cursor?: Maybe<Scalars['String']['output']>;
  data?: Maybe<Array<TransactionDto>>;
  fromTimestamp: Scalars['String']['output'];
  limit: Scalars['Int']['output'];
  liquidity: Scalars['Decimal']['output'];
  numberOfPools: Scalars['Int64']['output'];
};

export type PriceDto = {
  __typename?: 'PriceDTO';
  chainId: Scalars['Int']['output'];
  price: Scalars['Decimal']['output'];
  token: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  getAllCategories: CategoryPagination;
  getBlacklist: GetBlacklistAddressesResp;
  getBrowserHistory: Array<TokenBrowserHistoryDto>;
  getBundle: BundleResponse;
  getCategoryStatistic: CategoryStatisticDto;
  getClassificationStatistic: ClassificationStatisticDto;
  getClientLocation: ClientGeoInfo;
  getDevHold: DevHoldResponse;
  getErrorMessages: Scalars['JSONObject']['output'];
  getFavoriteToken: TokenStatisticPagination;
  getFollowedTransactions: TradingTransactionPagination;
  getFollowingSmartMoneys: Array<SmartMoneyDto>;
  getFollowingWallets?: Maybe<Array<Maybe<FollowingWalletInfo>>>;
  getHolder: HolderPagination;
  getHolderChart: HolderChart;
  getHolderCount: Scalars['Int']['output'];
  getKlineSticker: Array<KlineStickerDto>;
  getLanguagePackage: Scalars['JSONObject']['output'];
  getMemeToken: MemePagination;
  getOHLC: Array<Ohlcdto>;
  getPoolTransactions: PoolTransactionPagination;
  getPortfolioStatistic?: Maybe<Array<Maybe<SmartMoneyDetailResp>>>;
  getPrices: Array<PriceDto>;
  getServerTime: Scalars['Int64']['output'];
  getSmartMoneyActions?: Maybe<SmartMoneyActionPaginationDto>;
  getSmartMoneyActionsV2?: Maybe<SmartMoneyActionCursorPaginationDto>;
  getSmartMoneyHolderCount: Scalars['Int']['output'];
  getSmartMoneyInfo?: Maybe<SmartMoneyInfo>;
  getSmartMoneyStatistic?: Maybe<SmartMoneyDetailResp>;
  getSmartMoneyTokenStatistics?: Maybe<Array<Maybe<SmartMoneyTokenStatisticResp>>>;
  getSmartMoneyTradeHistories?: Maybe<Array<Maybe<SmartMoneyTradeHistoryResp>>>;
  getSmartMoneyTxHistories?: Maybe<Array<Maybe<SmartMoneyTxHistoryResp>>>;
  /** V2: Get smart money transaction histories with cursor-based pagination */
  getSmartMoneyTxHistoriesV2?: Maybe<SmartMoneyTxHistoryPaginationRespV2>;
  getSystemMaintenanceSchedule: MaintenanceStatus;
  getTokenCreatedByDev: TokenCreatedByDevDto;
  getTokenDetail: TokenDetail;
  getTokenInsight: TokenInsightDto;
  getTokenMetadata: TokenMetadataDto;
  getTokenPoolInfo: TokenPoolInfoPagination;
  getTokenPortrait: TokenPortrait;
  getTokenSniper: TokenSniperDto;
  getTokenSymbols: Array<TokenSymbol>;
  getTokenTrending: TokenStatisticPagination;
  getTokenTrendingSearchBar: TokenTrendingSearchBarPagination;
  getTop100HolderStatistic: Top100HolderStatistic;
  getTopSourceOfFunding: Array<SourceFundingFrequency>;
  getTradingTransactions: TradingTransactionPagination;
  getWalletBalance: Scalars['Decimal']['output'];
  getWalletInfo: Array<WalletStatisticDto>;
  /** Get wallet PnL statistics for a specific month */
  getWalletPnl: GetWalletPnlResponse;
  getWalletPnlStatistic: WalletPnlStatistic;
  getWalletStatistic: GetWalletStatisticRepsonse;
  getWalletTokenHoldingStatistic: WalletTokenHoldingStatistic;
  getWalletTokenStatistic: WalletTokenStatisticDto;
  lastTransactions: LastTransactionPagination;
  rank: Array<SmartMoneyDto>;
  /** Search tokens with text and chain filtering */
  search: SearchPagination;
  /** Search similar tokens */
  searchSimilar: SearchSimilarPagination;
  /** Universal search with support for both tokens and wallets */
  searchUniversal: SearchUniversalPagination;
  tokensByCategory: TokensStatisticByCategoryPagination;
};


export type QueryGetAllCategoriesArgs = {
  input: AllCategoriesInput;
};


export type QueryGetBlacklistArgs = {
  input: GetBlacklistInput;
};


export type QueryGetBrowserHistoryArgs = {
  input: TokenBrowserHistoryInput;
};


export type QueryGetBundleArgs = {
  input: BundleInput;
};


export type QueryGetCategoryStatisticArgs = {
  input: CategoryStatisticInput;
};


export type QueryGetClassificationStatisticArgs = {
  input: ClassificationStatisticInput;
};


export type QueryGetDevHoldArgs = {
  input: DevHoldInput;
};


export type QueryGetErrorMessagesArgs = {
  input?: InputMaybe<LanguagePackInput>;
};


export type QueryGetFavoriteTokenArgs = {
  input: TokenFilterInput;
};


export type QueryGetFollowedTransactionsArgs = {
  input: TransactionInput;
};


export type QueryGetFollowingSmartMoneysArgs = {
  filter: SmartMoneyFollowFilterInput;
};


export type QueryGetFollowingWalletsArgs = {
  req: GetFollowingWalletReq;
};


export type QueryGetHolderArgs = {
  input: HolderInput;
};


export type QueryGetHolderChartArgs = {
  input: HolderChartInput;
};


export type QueryGetHolderCountArgs = {
  req: GetHolderCountReq;
};


export type QueryGetKlineStickerArgs = {
  input?: InputMaybe<KlineStickerInput>;
};


export type QueryGetLanguagePackageArgs = {
  input?: InputMaybe<LanguagePackInput>;
};


export type QueryGetMemeTokenArgs = {
  input: MemeInput;
};


export type QueryGetOhlcArgs = {
  input: OhlcInput;
};


export type QueryGetPoolTransactionsArgs = {
  input: PoolTransactionInput;
};


export type QueryGetPortfolioStatisticArgs = {
  req: GetPortfolioStatistic;
};


export type QueryGetPricesArgs = {
  chainId?: InputMaybe<Scalars['Int']['input']>;
  tokens: Array<Scalars['String']['input']>;
};


export type QueryGetSmartMoneyActionsArgs = {
  req: SmartMoneyActionFilterInput;
};


export type QueryGetSmartMoneyActionsV2Args = {
  req: SmartMoneyActionFilterInputV2;
};


export type QueryGetSmartMoneyHolderCountArgs = {
  req: GetHolderCountReq;
};


export type QueryGetSmartMoneyInfoArgs = {
  req: SmartMoneyInfoReq;
};


export type QueryGetSmartMoneyStatisticArgs = {
  req: SmartMoneyDetailReq;
};


export type QueryGetSmartMoneyTokenStatisticsArgs = {
  req: SmartMoneyTokenStatisticReq;
};


export type QueryGetSmartMoneyTradeHistoriesArgs = {
  req: SmartMoneyTradeHistoryReq;
};


export type QueryGetSmartMoneyTxHistoriesArgs = {
  req: SmartMoneyTxHistoryReq;
};


export type QueryGetSmartMoneyTxHistoriesV2Args = {
  req: SmartMoneyTxHistoryReqV2;
};


export type QueryGetTokenCreatedByDevArgs = {
  input: TokenCreatedByDevInput;
};


export type QueryGetTokenDetailArgs = {
  token: TokenDetailInput;
};


export type QueryGetTokenInsightArgs = {
  token: TokenDetailInput;
};


export type QueryGetTokenMetadataArgs = {
  address: Scalars['String']['input'];
  chainId?: Scalars['Int']['input'];
};


export type QueryGetTokenPoolInfoArgs = {
  input: GetTokenPoolInfoInput;
};


export type QueryGetTokenPortraitArgs = {
  input: GetTokenPortraitInput;
};


export type QueryGetTokenSniperArgs = {
  input: TokenSniperInput;
};


export type QueryGetTokenSymbolsArgs = {
  chainId: Scalars['Int']['input'];
  tokens: Array<Scalars['String']['input']>;
};


export type QueryGetTokenTrendingArgs = {
  input: TokenTrendingInput;
};


export type QueryGetTokenTrendingSearchBarArgs = {
  input: TokenTrendingInput;
};


export type QueryGetTop100HolderStatisticArgs = {
  chainId: Scalars['Int']['input'];
  token: Scalars['String']['input'];
};


export type QueryGetTopSourceOfFundingArgs = {
  input: TopSourceFundingInput;
};


export type QueryGetTradingTransactionsArgs = {
  input: TradingTransactionInput;
};


export type QueryGetWalletBalanceArgs = {
  req: WalletBalanceInput;
};


export type QueryGetWalletInfoArgs = {
  input: WalletInfoInput;
};


export type QueryGetWalletPnlArgs = {
  input: GetWalletPnlInput;
};


export type QueryGetWalletPnlStatisticArgs = {
  req: SmartMoneyDetailReq;
};


export type QueryGetWalletStatisticArgs = {
  input?: InputMaybe<GetWalletStatisticInput>;
};


export type QueryGetWalletTokenHoldingStatisticArgs = {
  req: SmartMoneyDetailReq;
};


export type QueryGetWalletTokenStatisticArgs = {
  address: Scalars['String']['input'];
  chainId: Scalars['Int']['input'];
  token: Scalars['String']['input'];
};


export type QueryLastTransactionsArgs = {
  input: SearchLastTransactionInput;
};


export type QueryRankArgs = {
  filter?: InputMaybe<SmartMoneyFilterInput>;
};


export type QuerySearchArgs = {
  input: SearchInput;
};


export type QuerySearchSimilarArgs = {
  input: SearchSimilarInput;
};


export type QuerySearchUniversalArgs = {
  input: SearchInput;
};


export type QueryTokensByCategoryArgs = {
  input: TokensByCategoryInput;
};

export enum ReasonFiltering {
  DexNotSupported = 'DexNotSupported',
  PriceManipulation = 'PriceManipulation',
  SmallVolume = 'SmallVolume'
}

/** Token search result data */
export type SearchData = {
  __typename?: 'SearchData';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  chainId: Scalars['Int']['output'];
  createdTime?: Maybe<Scalars['Int64']['output']>;
  dexes: Array<Scalars['String']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  isFavorite: Scalars['Boolean']['output'];
  isHotToken?: Maybe<Scalars['Boolean']['output']>;
  isXStock?: Maybe<Scalars['Boolean']['output']>;
  liquidity?: Maybe<Scalars['String']['output']>;
  marketcap?: Maybe<Scalars['String']['output']>;
  metadataCustom?: Maybe<Scalars['Map']['output']>;
  name: Scalars['String']['output'];
  openPrice24h?: Maybe<Scalars['String']['output']>;
  price: Scalars['String']['output'];
  price24hChange: Scalars['String']['output'];
  symbol: Scalars['String']['output'];
  telegramUrl?: Maybe<Scalars['String']['output']>;
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  token: Scalars['String']['output'];
  twitterId?: Maybe<Scalars['String']['output']>;
  twitterUrl?: Maybe<Scalars['String']['output']>;
  /** Favorite type: XSTOCK or MEME */
  type?: Maybe<Scalars['String']['output']>;
  volume24h: Scalars['String']['output'];
};

/** Input for search with chain filtering */
export type SearchInput = {
  chainId?: InputMaybe<Scalars['Int']['input']>;
  isStock?: InputMaybe<Scalars['Boolean']['input']>;
  pagination?: InputMaybe<PaginationInput>;
  searchString: Scalars['String']['input'];
};

export type SearchLastTransactionInput = {
  addresses?: InputMaybe<Scalars['String']['input']>;
  chainId?: Scalars['Int']['input'];
  lastTimestamp?: InputMaybe<Scalars['Int64']['input']>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Decimal']['input']>;
  minAmount?: InputMaybe<Scalars['Decimal']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  token: Scalars['String']['input'];
};

/** Pagination wrapper for search results   */
export type SearchPagination = {
  __typename?: 'SearchPagination';
  data: Array<SearchData>;
  pagination: Pagination;
};

export type SearchSimilarData = {
  __typename?: 'SearchSimilarData';
  createdAt: Scalars['Time']['output'];
  image?: Maybe<Scalars['String']['output']>;
  lastTxAt?: Maybe<Scalars['Time']['output']>;
  marketCap: Scalars['String']['output'];
  name: Scalars['String']['output'];
  symbol: Scalars['String']['output'];
  token: Scalars['String']['output'];
};

export type SearchSimilarInput = {
  chainId: Scalars['Int']['input'];
  token: Scalars['String']['input'];
};

export type SearchSimilarPagination = {
  __typename?: 'SearchSimilarPagination';
  data: Array<SearchSimilarData>;
};

/** Union for universal search results (tokens and wallets) */
export type SearchUniversalData = SearchData | SearchWalletData;

/** Universal search pagination wrapper */
export type SearchUniversalPagination = {
  __typename?: 'SearchUniversalPagination';
  data: Array<SearchUniversalData>;
  pagination: Pagination;
};

/** Search wallet result */
export type SearchWalletData = {
  __typename?: 'SearchWalletData';
  address: Scalars['String']['output'];
  alias: Scalars['String']['output'];
  balance?: Maybe<Scalars['String']['output']>;
  chainId: Scalars['Int']['output'];
  numAlias?: Maybe<Scalars['Int']['output']>;
  /** @deprecated This field is deprecated. Please use numAlias instead */
  numRenamed?: Maybe<Scalars['Int']['output']>;
  numTracked?: Maybe<Scalars['Int']['output']>;
};

export type Security = {
  __typename?: 'Security';
  buyTax?: Maybe<Scalars['String']['output']>;
  sellTax?: Maybe<Scalars['String']['output']>;
};

export type SmartMoneyAction = {
  __typename?: 'SmartMoneyAction';
  address: Scalars['String']['output'];
  alias: Scalars['String']['output'];
  avatar: Scalars['String']['output'];
  baseAmount: Scalars['Decimal']['output'];
  nativeAmount: Scalars['Decimal']['output'];
  timestamp: Scalars['Int64']['output'];
  token: Token;
  totalSMTx: Scalars['Int']['output'];
  txHash: Scalars['String']['output'];
  txType: TransactionType;
  usdAmount: Scalars['Decimal']['output'];
  usdPrice: Scalars['Decimal']['output'];
};

/** V2: Cursor-based pagination response for smart money actions */
export type SmartMoneyActionCursorPaginationDto = {
  __typename?: 'SmartMoneyActionCursorPaginationDTO';
  /** List of smart money actions */
  actions: Array<SmartMoneyAction>;
  /** Whether there are more results */
  hasMore: Scalars['Boolean']['output'];
  /** Next cursor for pagination (timestamp in UnixMilli) */
  nextCursor?: Maybe<Scalars['Int64']['output']>;
};

export type SmartMoneyActionFilterInput = {
  chain: ChainType;
  limit: Scalars['Int']['input'];
  minAmountUsd?: InputMaybe<Scalars['Float']['input']>;
  page: Scalars['Int']['input'];
  transactionType?: InputMaybe<TransactionType>;
  walletAddresses?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

/** V2: Cursor-based pagination request for smart money actions */
export type SmartMoneyActionFilterInputV2 = {
  chain: ChainType;
  /** Cursor for pagination (timestamp in UnixMilli). Omit for first page. */
  cursor?: InputMaybe<Scalars['Int64']['input']>;
  /** Number of records to fetch (default: 20) */
  limit?: InputMaybe<Scalars['Int']['input']>;
  maxAmountUsd?: InputMaybe<Scalars['Float']['input']>;
  minAmountUsd?: InputMaybe<Scalars['Float']['input']>;
  /** Time range filter in milliseconds (e.g., 3600000 for 1 hour). Omit to fetch all history. */
  timeRange?: TimeRange;
  transactionType?: InputMaybe<TransactionType>;
  walletAddresses?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type SmartMoneyActionPaginationDto = {
  __typename?: 'SmartMoneyActionPaginationDTO';
  actions?: Maybe<Array<Maybe<SmartMoneyAction>>>;
};

export type SmartMoneyDto = {
  __typename?: 'SmartMoneyDTO';
  address: Scalars['String']['output'];
  addressAlias?: Maybe<Scalars['String']['output']>;
  avatar: Scalars['String']['output'];
  avgCost7d: Scalars['Float']['output'];
  dailyProfits?: Maybe<Array<DailyProfitDto>>;
  followedAt: Scalars['Int64']['output'];
  info?: Maybe<WalletInfo>;
  lastActivityAt: Scalars['Int64']['output'];
  name: Scalars['String']['output'];
  nativeTokenBalance: Scalars['Decimal']['output'];
  pnl1d: Scalars['Float']['output'];
  pnl7d: Scalars['Float']['output'];
  pnl30d: Scalars['Float']['output'];
  /** @deprecated Use nativeTokenBalance instead for multi-chain support */
  solBalance: Scalars['Decimal']['output'];
  tags?: Maybe<Array<Scalars['String']['output']>>;
  totalBuy1d: Scalars['Float']['output'];
  totalBuy7d: Scalars['Float']['output'];
  totalBuy30d: Scalars['Float']['output'];
  totalBuyCount7d: Scalars['Int']['output'];
  totalSellCount7d: Scalars['Int']['output'];
  winRate7d: Scalars['Float']['output'];
};

export type SmartMoneyDetailReq = {
  /** wallet address */
  address: Scalars['String']['input'];
  chain: ChainType;
  /** the time range in days used for statistics or data filtering (e.g., past 1, 7, or 30 days) */
  dayDuration: Scalars['Int']['input'];
};

export type SmartMoneyDetailResp = {
  __typename?: 'SmartMoneyDetailResp';
  /** number of users who renamed this wallet */
  aliasCount: Scalars['Int']['output'];
  /** The average cost buy tokens (buyAmountUsd / (number of token has tx in time range)) */
  avgBuyAmountUsd: Scalars['Float']['output'];
  /** The average duration that tokens hold of the wallet */
  avgHoldDuration: Scalars['Int64']['output'];
  /** The average profit and loss (Pnl) per token in time range */
  avgRealizedPnlUsd: Scalars['Float']['output'];
  /** Total amount spent on purchasing all tokens within the time range. */
  buyAmountUsd: Scalars['Float']['output'];
  /** data for share wallet feature */
  buyAmountUsd30D: Scalars['Float']['output'];
  /** number of buy tx in time range */
  buys: Scalars['Int']['output'];
  /** data for share wallet feature */
  buys30D: Scalars['Int']['output'];
  /** num of token has 200% < pnl percent <= 500% */
  pnl2xTo5xNum: Scalars['Int']['output'];
  /** num of token has pnl percent > 500% */
  pnlGt5xNum: Scalars['Int']['output'];
  /** num of token has 0% < pnl percent <= 200% */
  pnlLt2xNum: Scalars['Int']['output'];
  /** num of token has pnl percent <= -50% */
  pnlLtMinusDot5Num: Scalars['Int']['output'];
  /** num of token has -50% < pnl percent <= 0% */
  pnlMinusDot5To0xNum: Scalars['Int']['output'];
  /** Realized profit and loss (PnL) over the selected time range, calculated in USD. */
  realizedPnlUsd: Scalars['Float']['output'];
  /** data for share wallet feature */
  realizedPnlUsd30D: Scalars['Float']['output'];
  /** number of sell tx in time range */
  sells: Scalars['Int']['output'];
  /** data for share wallet feature */
  sells30D: Scalars['Int']['output'];
  totalBuyUsd: Scalars['Float']['output'];
  /** Total realized profit and loss (PnL), calculated in USD. */
  totalRealizedPnlUsd: Scalars['Float']['output'];
  /** number of followers */
  trackingCount: Scalars['Int']['output'];
};

export type SmartMoneyFilterInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  chain: ChainType;
  limit: Scalars['Int']['input'];
  page: Scalars['Int']['input'];
  type?: InputMaybe<Array<SmartMoneyType>>;
};

export type SmartMoneyFollowFilterInput = {
  chain: ChainType;
  limit: Scalars['Int']['input'];
  page: Scalars['Int']['input'];
  sortType?: InputMaybe<SmartMoneySortType>;
};

export type SmartMoneyFollowInput = {
  chain: ChainType;
  walletAddress: Scalars['String']['input'];
};

export type SmartMoneyInfo = {
  __typename?: 'SmartMoneyInfo';
  address: Scalars['String']['output'];
  addressAlias?: Maybe<Scalars['String']['output']>;
  avatar: Scalars['String']['output'];
  info?: Maybe<WalletInfo>;
  lastActivityAt: Scalars['Int64']['output'];
  name: Scalars['String']['output'];
  tags?: Maybe<Array<Maybe<SmartMoneyType>>>;
};

export type SmartMoneyInfoReq = {
  address: Scalars['String']['input'];
  chain: ChainType;
};

export type SmartMoneyPaginationDto = {
  __typename?: 'SmartMoneyPaginationDTO';
  rank: Array<SmartMoneyDto>;
};

export enum SmartMoneySortType {
  FollowTime = 'follow_time',
  Pnl_7d = 'pnl_7d',
  WinRate_7d = 'winRate_7d'
}

export type SmartMoneyTokenStatisticReq = {
  address: Scalars['String']['input'];
  chain: ChainType;
  isOnlyHolding: Scalars['Boolean']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<SortTokenHolding>;
  sortOrder?: InputMaybe<SortDirection>;
};

export type SmartMoneyTokenStatisticResp = {
  __typename?: 'SmartMoneyTokenStatisticResp';
  address: Scalars['String']['output'];
  avgPriceUsd: Scalars['Decimal']['output'];
  balance: Scalars['Float']['output'];
  buys: Scalars['Int']['output'];
  chainId: Scalars['Int']['output'];
  holdingDuration: Scalars['Int64']['output'];
  lastTxTime: Scalars['Int64']['output'];
  realizedPnlUsd: Scalars['Float']['output'];
  sells: Scalars['Int']['output'];
  token: Token;
  totalBuyAmountUsd: Scalars['Decimal']['output'];
  totalBuyQuantity: Scalars['Decimal']['output'];
  totalSellAmountUsd: Scalars['Decimal']['output'];
  totalSellQuantity: Scalars['Decimal']['output'];
};

export type SmartMoneyTradeHistoryReq = {
  duration?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  token: TokenReq;
};

export type SmartMoneyTradeHistoryResp = {
  __typename?: 'SmartMoneyTradeHistoryResp';
  /** wallet address */
  address: Scalars['String']['output'];
  addressAlias?: Maybe<Scalars['String']['output']>;
  amount: Scalars['Decimal']['output'];
  avatar: Scalars['String']['output'];
  name: Scalars['String']['output'];
  nativeAmount: Scalars['Decimal']['output'];
  timestamp: Scalars['Int64']['output'];
  token: Token;
  transactionHash: Scalars['String']['output'];
  type: TransactionType;
  usdAmount: Scalars['Decimal']['output'];
  usdPrice: Scalars['Decimal']['output'];
};

/** V2: Cursor-based pagination response for smart money transaction history */
export type SmartMoneyTxHistoryPaginationRespV2 = {
  __typename?: 'SmartMoneyTxHistoryPaginationRespV2';
  /** Whether there are more results */
  hasMore: Scalars['Boolean']['output'];
  /** Next cursor for pagination (timestamp of last transaction) */
  nextCursor?: Maybe<Scalars['Int64']['output']>;
  /** List of transactions */
  transactions: Array<SmartMoneyTxHistoryResp>;
};

export type SmartMoneyTxHistoryReq = {
  address: Scalars['String']['input'];
  chain: ChainType;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<SortTransactionHistory>;
  sortOrder?: InputMaybe<SortDirection>;
  tokenAddress?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Array<InputMaybe<TransactionType>>>;
};

/** V2: Cursor-based pagination request for smart money transaction history */
export type SmartMoneyTxHistoryReqV2 = {
  address: Scalars['String']['input'];
  chain: ChainType;
  /** Cursor for pagination (timestamp). Omit for first page. */
  cursor?: InputMaybe<Scalars['Int64']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<SortTransactionHistory>;
  sortOrder?: InputMaybe<SortDirection>;
  tokenAddress?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Array<InputMaybe<TransactionType>>>;
};

export type SmartMoneyTxHistoryResp = {
  __typename?: 'SmartMoneyTxHistoryResp';
  avgPriceUsd: Scalars['Decimal']['output'];
  nativeAmount: Scalars['Decimal']['output'];
  nativePrice: Scalars['Decimal']['output'];
  price: Scalars['Decimal']['output'];
  quantity: Scalars['Decimal']['output'];
  timestamp: Scalars['Int64']['output'];
  token: Token;
  transactionHash: Scalars['String']['output'];
  type: TransactionType;
  usdAmount: Scalars['Decimal']['output'];
  usdPrice: Scalars['Decimal']['output'];
};

export enum SmartMoneyType {
  Bot = 'Bot',
  Bundle = 'Bundle',
  Fresh = 'Fresh',
  Insider = 'Insider',
  Kol = 'KOL',
  Phishing = 'Phishing',
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

export type SocialInfo = {
  __typename?: 'SocialInfo';
  type: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export enum SortDirection {
  Asc = 'asc',
  Desc = 'desc'
}

export enum SortTokenHolding {
  LastTxTime = 'lastTxTime',
  RealizedPnl = 'realizedPnl'
}

export enum SortTransactionHistory {
  Timestamp = 'timestamp'
}

/** Top source of funding frequency for token holders */
export type SourceFundingFrequency = {
  __typename?: 'SourceFundingFrequency';
  count: Scalars['Int']['output'];
  source: Scalars['String']['output'];
};

export type SourceFundingInformation = {
  __typename?: 'SourceFundingInformation';
  sourceOfFunding: Scalars['String']['output'];
  sourceOfFundingTxTime: Scalars['Int']['output'];
};

export enum TimeRange {
  H1 = 'h1',
  H6 = 'h6',
  H24 = 'h24',
  M1 = 'm1',
  M5 = 'm5'
}

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

export type Token = {
  __typename?: 'Token';
  address: Scalars['String']['output'];
  createdAt: Scalars['Int64']['output'];
  isLowLiquidity: Scalars['Boolean']['output'];
  logo: Scalars['String']['output'];
  name: Scalars['String']['output'];
  symbol: Scalars['String']['output'];
  totalSupply: Scalars['Decimal']['output'];
};

export type TokenBrowserHistoryDto = {
  __typename?: 'TokenBrowserHistoryDTO';
  categoryIds?: Maybe<Array<Scalars['String']['output']>>;
  chainId: Scalars['Int']['output'];
  createdTime: Scalars['Time']['output'];
  dexes: Array<Scalars['String']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  isFavorite: Scalars['Boolean']['output'];
  marketCap: Scalars['Decimal']['output'];
  price24hChange: Scalars['Decimal']['output'];
  symbol: Scalars['String']['output'];
  token: Scalars['String']['output'];
  /** Favorite type: XSTOCK or MEME */
  type?: Maybe<Scalars['String']['output']>;
  volume24h: Scalars['Decimal']['output'];
};

export type TokenBrowserHistoryInput = {
  chain?: ChainType;
  tokenAddresses: Array<Scalars['String']['input']>;
};

export type TokenCreatedByDevDto = {
  __typename?: 'TokenCreatedByDevDTO';
  athMarketCap: Scalars['Decimal']['output'];
  athMarketCapToken: Scalars['String']['output'];
  avatar?: Maybe<Scalars['String']['output']>;
  lastCreatedAt: Scalars['Time']['output'];
  lastCreatedToken: Scalars['String']['output'];
  tokens?: Maybe<Array<TokenCreatedByDevDataDto>>;
  total?: Maybe<Scalars['Int']['output']>;
  totalActive?: Maybe<Scalars['Int']['output']>;
  totalMigrated?: Maybe<Scalars['Int']['output']>;
  totalRug?: Maybe<Scalars['Int']['output']>;
};

export type TokenCreatedByDevDataDto = {
  __typename?: 'TokenCreatedByDevDataDTO';
  address: Scalars['String']['output'];
  createdAt: Scalars['Time']['output'];
  dexes?: Maybe<Array<Scalars['String']['output']>>;
  holder: Scalars['Int']['output'];
  liquidity: Scalars['Decimal']['output'];
  logoUrl: Scalars['String']['output'];
  marketCap: Scalars['Decimal']['output'];
  migratedAt?: Maybe<Scalars['Time']['output']>;
  rug?: Maybe<Scalars['Boolean']['output']>;
  rugReason?: Maybe<Scalars['String']['output']>;
  rugTime?: Maybe<Scalars['Time']['output']>;
  symbol: Scalars['String']['output'];
  volume1h: Scalars['Decimal']['output'];
  volume6h: Scalars['Decimal']['output'];
  volume24h: Scalars['Decimal']['output'];
};

export type TokenCreatedByDevInput = {
  chainId?: Scalars['Int']['input'];
  devAddress: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};

export type TokenDto = {
  __typename?: 'TokenDTO';
  address: Scalars['String']['output'];
  info: TokenInfo;
  name: Scalars['String']['output'];
  symbol: Scalars['String']['output'];
  totalSupply: Scalars['String']['output'];
};

export type TokenDetail = {
  __typename?: 'TokenDetail';
  address: Scalars['String']['output'];
  athDate?: Maybe<Scalars['Time']['output']>;
  athPrice: Scalars['Decimal']['output'];
  atlDate?: Maybe<Scalars['Time']['output']>;
  atlPrice: Scalars['Decimal']['output'];
  burnRatio: Scalars['Float']['output'];
  burnStatus: Scalars['String']['output'];
  buyTxs: Scalars['Decimal']['output'];
  chainId: Scalars['Int']['output'];
  circulatingSupply: Scalars['Decimal']['output'];
  contractCreator: Scalars['String']['output'];
  contractOwner: Scalars['String']['output'];
  createdTime?: Maybe<Scalars['Time']['output']>;
  createdTimeRaw?: Maybe<Scalars['Time']['output']>;
  creator: Scalars['String']['output'];
  decimals: Scalars['String']['output'];
  devHold: Scalars['Float']['output'];
  dexes: Array<Scalars['String']['output']>;
  health: TokenHealth;
  holders: Scalars['Float']['output'];
  info: TokenInfo;
  initLiquidity: Scalars['Decimal']['output'];
  internalMarketProgress: Scalars['Decimal']['output'];
  isBlacklisted: Scalars['Boolean']['output'];
  isExclusive?: Maybe<Scalars['Boolean']['output']>;
  isFavorite: Scalars['Boolean']['output'];
  isHoneypot: Scalars['Boolean']['output'];
  isHotToken: Scalars['Boolean']['output'];
  isMigrated: Scalars['Boolean']['output'];
  isOG?: Maybe<Scalars['Boolean']['output']>;
  liquidity: Scalars['Decimal']['output'];
  marketCap: Scalars['Decimal']['output'];
  metadataCustom: Scalars['JSONObject']['output'];
  mintDisable: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  numberMigratedTokenByDev: Scalars['Int']['output'];
  numberProTrader: Scalars['Int']['output'];
  numberUniqueAddresses: NumberUniqueAddresses;
  openPrice: Scalars['Decimal']['output'];
  openPrice24h: Scalars['Decimal']['output'];
  openTime24h: Scalars['Int']['output'];
  ownershipRenounced: Scalars['Boolean']['output'];
  price: Scalars['Decimal']['output'];
  price1hChange: Scalars['Decimal']['output'];
  price5mChange: Scalars['Decimal']['output'];
  price6hChange: Scalars['Decimal']['output'];
  price24hChange: Scalars['Decimal']['output'];
  ratTraderAmountRate: Scalars['Float']['output'];
  security: Security;
  sellTxs: Scalars['Decimal']['output'];
  symbol: Scalars['String']['output'];
  tags?: Maybe<Array<Scalars['String']['output']>>;
  top10Holder: Scalars['Decimal']['output'];
  top10HolderRate: Scalars['Float']['output'];
  topTrending: Scalars['Int']['output'];
  totalAmount: TotalAmount;
  totalFee?: Maybe<Scalars['Decimal']['output']>;
  totalFeeUsd?: Maybe<Scalars['Decimal']['output']>;
  totalSupply: Scalars['String']['output'];
  totalTransactions: TotalTransactions;
  turnoverRate24h: Scalars['Decimal']['output'];
  /** Favorite type: XSTOCK or MEME */
  type?: Maybe<Scalars['String']['output']>;
  volume24h: Scalars['Decimal']['output'];
};

export type TokenDetailInput = {
  address: Scalars['String']['input'];
  chainId?: Scalars['Int']['input'];
};

export enum TokenDirection {
  AiAnalysis = 'AiAnalysis',
  Gainer = 'Gainer',
  Loser = 'Loser',
  Popular = 'Popular'
}

export type TokenFilterInput = {
  chain?: InputMaybe<ChainType>;
  dex?: InputMaybe<Dex>;
  dexes?: InputMaybe<Scalars['String']['input']>;
  /** Filter favorite tokens by type. XSTOCK: sorted by xStockOrder, MEME: sorted by order, ALL: all favorites sorted by order (default) */
  favoriteType?: InputMaybe<FavoriteType>;
  internalMarketProgressFrom?: InputMaybe<Scalars['Float']['input']>;
  internalMarketProgressTo?: InputMaybe<Scalars['Float']['input']>;
  launchpad?: InputMaybe<Launchpad>;
  /** Number of items per page. If not specified along with page, returns all tokens. */
  limit?: InputMaybe<Scalars['Int']['input']>;
  liquidityPoolFrom?: InputMaybe<Scalars['String']['input']>;
  liquidityPoolTo?: InputMaybe<Scalars['String']['input']>;
  marketValueFrom?: InputMaybe<Scalars['String']['input']>;
  marketValueTo?: InputMaybe<Scalars['String']['input']>;
  numberOfHolderFrom?: InputMaybe<Scalars['Int']['input']>;
  numberOfHolderTo?: InputMaybe<Scalars['Int']['input']>;
  openingTimeFrom?: InputMaybe<Scalars['Int64']['input']>;
  openingTimeTo?: InputMaybe<Scalars['Int64']['input']>;
  /** Page number for pagination. If not specified along with limit, returns all tokens. */
  page?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  timeRange: TimeRange;
  tradingVolume1hFrom?: InputMaybe<Scalars['String']['input']>;
  tradingVolume1hTo?: InputMaybe<Scalars['String']['input']>;
  tradingVolumeFrom?: InputMaybe<Scalars['String']['input']>;
  tradingVolumeTo?: InputMaybe<Scalars['String']['input']>;
  transaction1hFrom?: InputMaybe<Scalars['Int']['input']>;
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
  top10?: Maybe<Scalars['Decimal']['output']>;
  verifiedSourceCode: Scalars['Boolean']['output'];
};

export type TokenHolding = {
  __typename?: 'TokenHolding';
  address: Scalars['String']['output'];
  avgPriceUsd: Scalars['Decimal']['output'];
  balance: Scalars['Float']['output'];
  isLowLiquidity: Scalars['Boolean']['output'];
};

export type TokenInfo = {
  __typename?: 'TokenInfo';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  bannerUrl: Scalars['String']['output'];
  dexScreenerBoosts: Scalars['Boolean']['output'];
  logoUrl: Scalars['String']['output'];
  socials: Array<Maybe<SocialInfo>>;
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  websites: Array<Maybe<WebsitesInfo>>;
};

export type TokenInsightDto = {
  __typename?: 'TokenInsightDto';
  Bundler: Scalars['Decimal']['output'];
  DevHold: Scalars['Decimal']['output'];
  DexPaid: DexPaid;
  Holders: Scalars['Int']['output'];
  Insider: Scalars['Decimal']['output'];
  LPBurned?: Maybe<Scalars['Decimal']['output']>;
  LPMint?: Maybe<Scalars['Decimal']['output']>;
  Sniper: Scalars['Decimal']['output'];
  top10Holder: Scalars['Decimal']['output'];
};

export type TokenMetadataDto = {
  __typename?: 'TokenMetadataDTO';
  chainId: Scalars['Int']['output'];
  createdAt: Scalars['Time']['output'];
  creator: Scalars['String']['output'];
  decimals: Scalars['Int']['output'];
  description: Scalars['String']['output'];
  symbol: Scalars['String']['output'];
  totalSupply: Scalars['String']['output'];
  totalSupplyRaw: Scalars['String']['output'];
};

export type TokenPoolInfo = {
  __typename?: 'TokenPoolInfo';
  address: Scalars['String']['output'];
  baseSymbol?: Maybe<Scalars['String']['output']>;
  baseToken: Scalars['String']['output'];
  baseTokenLiquidity: Scalars['Decimal']['output'];
  chainId: Scalars['Int']['output'];
  createdAt?: Maybe<Scalars['Time']['output']>;
  createdTime?: Maybe<Scalars['Int64']['output']>;
  creator?: Maybe<Scalars['String']['output']>;
  dex?: Maybe<Scalars['String']['output']>;
  quoteLiquidity: Scalars['Decimal']['output'];
  quoteSymbol?: Maybe<Scalars['String']['output']>;
  quoteToken: Scalars['String']['output'];
  quoteTokenPrice?: Maybe<Scalars['Decimal']['output']>;
  usdLiquidity: Scalars['Decimal']['output'];
};

export type TokenPoolInfoPagination = {
  __typename?: 'TokenPoolInfoPagination';
  data: Array<TokenPoolInfo>;
  pagination: Pagination;
};

export type TokenPopularDto = {
  __typename?: 'TokenPopularDTO';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  chainId: Scalars['Int']['output'];
  /** @deprecated Remove in future */
  dexes: Array<Scalars['String']['output']>;
  hot: Scalars['Boolean']['output'];
  logoUrl?: Maybe<Scalars['String']['output']>;
  /** @deprecated Remove in future */
  marketcap?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  /** @deprecated Remove in future */
  price24hChange?: Maybe<Scalars['String']['output']>;
  symbol: Scalars['String']['output'];
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
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

export type TokenReq = {
  address: Scalars['String']['input'];
  chain: ChainType;
};

export enum TokenSniper {
  BuyMore = 'BuyMore',
  Hold = 'Hold',
  SellAll = 'SellAll',
  SellPart = 'SellPart',
  Sniper = 'Sniper'
}

export type TokenSniperDto = {
  __typename?: 'TokenSniperDto';
  currentTotalHolding: Scalars['Decimal']['output'];
  top10Holders: Scalars['Decimal']['output'];
  top100Holders: Scalars['Decimal']['output'];
  totalBought: Scalars['Decimal']['output'];
  traders: Array<SniperTradeDto>;
};

export type TokenSniperInput = {
  chainId: Scalars['Int']['input'];
  tokenAddress: Scalars['String']['input'];
};

export enum TokenSortFields {
  CreatedTime = 'CreatedTime',
  Liquidity = 'Liquidity',
  MarketCap = 'MarketCap',
  Price = 'Price',
  Price1hChange = 'Price1hChange',
  Price1mChange = 'Price1mChange',
  Price5mChange = 'Price5mChange',
  Price6hChange = 'Price6hChange',
  Price24hChange = 'Price24hChange',
  Txs1h = 'Txs1h',
  Txs1m = 'Txs1m',
  Txs5m = 'Txs5m',
  Txs6h = 'Txs6h',
  Txs24h = 'Txs24h',
  Volume1h = 'Volume1h',
  Volume1m = 'Volume1m',
  Volume5m = 'Volume5m',
  Volume6h = 'Volume6h',
  Volume24h = 'Volume24h'
}

export type TokenStatisticPagination = {
  __typename?: 'TokenStatisticPagination';
  data: Array<MemeDto>;
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
};

export type TokenSymbol = {
  __typename?: 'TokenSymbol';
  chainId: Scalars['Int']['output'];
  symbol: Scalars['String']['output'];
  token: Scalars['String']['output'];
};

export type TokenTrendingDebug = {
  __typename?: 'TokenTrendingDebug';
  calculatedAt: Scalars['Time']['output'];
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
  dex: Dex;
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
  openingTimeFrom?: InputMaybe<Scalars['Int64']['input']>;
  openingTimeTo?: InputMaybe<Scalars['Int64']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  timeRange: TimeRange;
  tradingVolume1hFrom?: InputMaybe<Scalars['String']['input']>;
  tradingVolume1hTo?: InputMaybe<Scalars['String']['input']>;
  tradingVolumeFrom?: InputMaybe<Scalars['String']['input']>;
  tradingVolumeTo?: InputMaybe<Scalars['String']['input']>;
  transaction1hFrom?: InputMaybe<Scalars['Int']['input']>;
  transaction1hTo?: InputMaybe<Scalars['Int']['input']>;
  transactionFrom?: InputMaybe<Scalars['Int']['input']>;
  transactionTo?: InputMaybe<Scalars['Int']['input']>;
};

export type TokenTrendingSearchBarData = {
  __typename?: 'TokenTrendingSearchBarData';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  chainId: Scalars['Int']['output'];
  createdTime: Scalars['Int64']['output'];
  dexes: Array<Scalars['String']['output']>;
  /** Order position in user's favorites (null if not a favorite) */
  favoriteOrder?: Maybe<Scalars['Int']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  isFavorite: Scalars['Boolean']['output'];
  isHot?: Maybe<Scalars['Boolean']['output']>;
  isXStock?: Maybe<Scalars['Boolean']['output']>;
  liquidity?: Maybe<Scalars['String']['output']>;
  marketcap: Scalars['String']['output'];
  metadataCustom: Scalars['Map']['output'];
  name?: Maybe<Scalars['String']['output']>;
  openPrice24h: Scalars['String']['output'];
  price: Scalars['String']['output'];
  price24hChange: Scalars['Float']['output'];
  symbol: Scalars['String']['output'];
  telegramUrl?: Maybe<Scalars['String']['output']>;
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  token: Scalars['String']['output'];
  twitterId?: Maybe<Scalars['String']['output']>;
  twitterUrl?: Maybe<Scalars['String']['output']>;
  /** Favorite type: XSTOCK or MEME */
  type?: Maybe<Scalars['String']['output']>;
  volume24h: Scalars['String']['output'];
};

export type TokenTrendingSearchBarPagination = {
  __typename?: 'TokenTrendingSearchBarPagination';
  data: Array<TokenTrendingSearchBarData>;
};

export type TokensByCategoryInput = {
  categoryId: Scalars['String']['input'];
  chainId: Scalars['Int']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: TokenSortFields;
  sortType?: SortDirection;
};

export type TokensStatisticByCategoryDto = {
  __typename?: 'TokensStatisticByCategoryDTO';
  address: Scalars['String']['output'];
  advertisesOnDex: Scalars['Boolean']['output'];
  blacklist: Scalars['Boolean']['output'];
  botHoldPct: Scalars['Float']['output'];
  botHolder: Scalars['Int']['output'];
  botTxCount: Scalars['Int']['output'];
  bundlerHoldingPercent: Scalars['Decimal']['output'];
  burnt: Scalars['Boolean']['output'];
  /** buy transaction count in 1 hour */
  buyTxs1h: Scalars['Int']['output'];
  /** buy transaction count in 1 min */
  buyTxs1m: Scalars['Int']['output'];
  /** buy transaction count in 5 min */
  buyTxs5m: Scalars['Int']['output'];
  /** buy transaction count in 6 hour */
  buyTxs6h: Scalars['Int']['output'];
  /** buy transaction count in 24 hour */
  buyTxs24h: Scalars['Int']['output'];
  chainId: Scalars['String']['output'];
  /** time token created */
  createdTime: Scalars['Int64']['output'];
  createdTimeRaw: Scalars['Int64']['output'];
  creator: Scalars['String']['output'];
  devHold: Scalars['Float']['output'];
  devLaunched: Scalars['Int']['output'];
  devMigrated: Scalars['Int']['output'];
  dexes?: Maybe<Array<Scalars['String']['output']>>;
  /** @deprecated Use xStockOrder instead for token ordering in XStock category */
  favoriteAt?: Maybe<Scalars['Time']['output']>;
  insider: Scalars['Float']['output'];
  isFavorite: Scalars['Boolean']['output'];
  liquidity: Scalars['Decimal']['output'];
  logoUrl: Scalars['String']['output'];
  marketCap: Scalars['Decimal']['output'];
  mint: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  numberOfHolder: Scalars['Int64']['output'];
  price: Scalars['Decimal']['output'];
  /** price 1 hour change */
  price1hChange: Scalars['Decimal']['output'];
  /** price 1 min change */
  price1mChange: Scalars['Decimal']['output'];
  /** price 5 min change */
  price5mChange: Scalars['Decimal']['output'];
  /** price 6 hour change */
  price6hChange: Scalars['Decimal']['output'];
  /** price 24 hour change */
  price24hChange: Scalars['Decimal']['output'];
  sameSourceWallet: Scalars['String']['output'];
  /** sell transaction count in 1 hour */
  sellTxs1h: Scalars['Int']['output'];
  /** sell transaction count in 1 min */
  sellTxs1m: Scalars['Int']['output'];
  /** sell transaction count in 5 min */
  sellTxs5m: Scalars['Int']['output'];
  /** sell transaction count in 6 hour */
  sellTxs6h: Scalars['Int']['output'];
  /** sell transaction count in 24 hour */
  sellTxs24h: Scalars['Int']['output'];
  smartMoneyHolder: Scalars['Decimal']['output'];
  sniperHoldPct: Scalars['Float']['output'];
  symbol: Scalars['String']['output'];
  telegram: Scalars['String']['output'];
  top10Holder: Scalars['Decimal']['output'];
  trendingScore1h: Scalars['Float']['output'];
  trendingScore1m: Scalars['Float']['output'];
  trendingScore5m: Scalars['Float']['output'];
  trendingScore6h: Scalars['Float']['output'];
  trendingScore24h: Scalars['Float']['output'];
  tweetId: Scalars['String']['output'];
  twitterNameChangeCount: Scalars['Int']['output'];
  twitterUrl: Scalars['String']['output'];
  /** Favorite type: XSTOCK or MEME */
  type?: Maybe<Scalars['String']['output']>;
  /** volume in 1 hour */
  volume1h: Scalars['Decimal']['output'];
  /** volume in 1 min */
  volume1m: Scalars['Decimal']['output'];
  /** volume in 5 min */
  volume5m: Scalars['Decimal']['output'];
  /** volume in 6 hour */
  volume6h: Scalars['Decimal']['output'];
  /** volume in 24 hour */
  volume24h: Scalars['Decimal']['output'];
  website: Scalars['String']['output'];
  xStockOrder?: Maybe<Scalars['Int']['output']>;
};

export type TokensStatisticByCategoryPagination = {
  __typename?: 'TokensStatisticByCategoryPagination';
  data: Array<TokensStatisticByCategoryDto>;
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
};

export type Top100HolderStatistic = {
  __typename?: 'Top100HolderStatistic';
  averageBuyPrice: Scalars['Decimal']['output'];
  averageBuyPrice24hChangePct: Scalars['Decimal']['output'];
  averageSellPrice: Scalars['Decimal']['output'];
  averageSellPrice24hChangePct: Scalars['Decimal']['output'];
  totalHoldingPct: Scalars['Decimal']['output'];
};

export type TopGainers = {
  __typename?: 'TopGainers';
  address?: Maybe<Scalars['String']['output']>;
  logoUrl?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  price24hChange: Scalars['Decimal']['output'];
  symbol?: Maybe<Scalars['String']['output']>;
};

export type TopSourceFundingInput = {
  chainId: Scalars['Int']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  token: Scalars['String']['input'];
};

export type TotalAmount = {
  __typename?: 'TotalAmount';
  totalBuyAmount1h: Scalars['Decimal']['output'];
  totalBuyAmount5m: Scalars['Decimal']['output'];
  totalBuyAmount6h: Scalars['Decimal']['output'];
  totalBuyAmount24h: Scalars['Decimal']['output'];
  totalSellAmount1h: Scalars['Decimal']['output'];
  totalSellAmount5m: Scalars['Decimal']['output'];
  totalSellAmount6h: Scalars['Decimal']['output'];
  totalSellAmount24h: Scalars['Decimal']['output'];
};

export type TotalTransactions = {
  __typename?: 'TotalTransactions';
  numberOfPurchases1h: Scalars['Int']['output'];
  numberOfPurchases5m: Scalars['Int']['output'];
  numberOfPurchases6h: Scalars['Int']['output'];
  numberOfPurchases24h: Scalars['Int']['output'];
  numberOfSales1h: Scalars['Int']['output'];
  numberOfSales5m: Scalars['Int']['output'];
  numberOfSales6h: Scalars['Int']['output'];
  numberOfSales24h: Scalars['Int']['output'];
};

export type TradingTransactionInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  addresses?: InputMaybe<Scalars['String']['input']>;
  chainId: Scalars['Int']['input'];
  classification?: TransactionClassification;
  cursor?: InputMaybe<Scalars['String']['input']>;
  eventType?: InputMaybe<EventType>;
  filterRobot?: Scalars['Boolean']['input'];
  lastTimestamp?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
  nativeAmountFrom?: InputMaybe<Scalars['Float']['input']>;
  nativeAmountTo?: InputMaybe<Scalars['Float']['input']>;
  /** sortBy these fields timestamp, usdAmount, baseAmount, with prefix + is asc, - is desc, example: +timestamp */
  sortBy?: InputMaybe<Scalars['String']['input']>;
  timestampFrom?: InputMaybe<Scalars['String']['input']>;
  timestampTo?: InputMaybe<Scalars['String']['input']>;
  token: Scalars['String']['input'];
  transactionUsdAmountFrom?: InputMaybe<Scalars['Float']['input']>;
  transactionUsdAmountTo?: InputMaybe<Scalars['Float']['input']>;
  transactionVolumeFrom?: InputMaybe<Scalars['Float']['input']>;
  transactionVolumeTo?: InputMaybe<Scalars['Float']['input']>;
  type?: TxType;
};

export type TradingTransactionPagination = {
  __typename?: 'TradingTransactionPagination';
  /** Cursor for next page pagination. Format: timestamp:logIndex:eventIndex */
  cursor?: Maybe<Scalars['String']['output']>;
  data: Array<TransactionDto>;
  fromTimestamp: Scalars['String']['output'];
};

/** transaction classification */
export enum TransactionClassification {
  All = 'All',
  Bot = 'Bot',
  Bundlers = 'Bundlers',
  Followed = 'Followed',
  Fresh = 'Fresh',
  Insider = 'Insider',
  Kol = 'KOL',
  Phishing = 'Phishing',
  ProjectParty = 'ProjectParty',
  SameSource = 'SameSource',
  SmartMoney = 'SmartMoney',
  Sniper = 'Sniper',
  Top10 = 'Top10',
  Whale = 'Whale'
}

export type TransactionDto = {
  __typename?: 'TransactionDTO';
  MakerAlias?: Maybe<Scalars['String']['output']>;
  baseAmount: Scalars['Decimal']['output'];
  baseToken: Scalars['String']['output'];
  chainId: Scalars['Int']['output'];
  decimals: Scalars['Int']['output'];
  dex: Scalars['String']['output'];
  eventIndex: Scalars['Int']['output'];
  holderPct: Scalars['String']['output'];
  holdingProgress: Scalars['Float']['output'];
  isBundler: Scalars['Boolean']['output'];
  isDev: Scalars['Boolean']['output'];
  isFreshWallet: Scalars['Boolean']['output'];
  isHugeValue: Scalars['Boolean']['output'];
  isInsider: Scalars['Boolean']['output'];
  isKOL: Scalars['Boolean']['output'];
  isKlineTx?: Maybe<Scalars['Boolean']['output']>;
  isNativeWallet: Scalars['Boolean']['output'];
  isNewActivity: Scalars['Boolean']['output'];
  isPoolContract: Scalars['Boolean']['output'];
  isSingleSideTransaction: Scalars['Boolean']['output'];
  isSmartMoney: Scalars['Boolean']['output'];
  isSniper: Scalars['Boolean']['output'];
  isTopTrader: Scalars['Boolean']['output'];
  isWhale: Scalars['Boolean']['output'];
  liquidity: Scalars['Decimal']['output'];
  logIndex: Scalars['Int']['output'];
  maker: Scalars['String']['output'];
  nativeAmount: Scalars['Decimal']['output'];
  nativePrice: Scalars['Decimal']['output'];
  pair: Scalars['String']['output'];
  price: Scalars['Decimal']['output'];
  quoteAmount: Scalars['Decimal']['output'];
  quoteToken: Scalars['String']['output'];
  reasonFiltering?: Maybe<ReasonFiltering>;
  timestamp: Scalars['String']['output'];
  totalAddBaseLiq?: Maybe<Scalars['Decimal']['output']>;
  totalAddQuoteLiq?: Maybe<Scalars['Decimal']['output']>;
  totalFee: Scalars['Decimal']['output'];
  totalFeeUSD: Scalars['Decimal']['output'];
  totalSupply: Scalars['Decimal']['output'];
  tx24h: Scalars['Int64']['output'];
  txHash: Scalars['String']['output'];
  type: EventType;
  usdAmount: Scalars['Decimal']['output'];
  usdPrice: Scalars['Decimal']['output'];
};

export type TransactionInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  addresses?: InputMaybe<Scalars['String']['input']>;
  chainId: Scalars['Int']['input'];
  /** Cursor for pagination. Format: timestamp:logIndex:eventIndex */
  cursor?: InputMaybe<Scalars['String']['input']>;
  eventType?: InputMaybe<EventType>;
  lastTimestamp?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
  nativeAmountFrom?: InputMaybe<Scalars['Float']['input']>;
  nativeAmountTo?: InputMaybe<Scalars['Float']['input']>;
  /** sortBy these fields timestamp, usdAmount, baseAmount, with prefix + is asc, - is desc, example: +timestamp */
  sortBy?: InputMaybe<Scalars['String']['input']>;
  timestampFrom?: InputMaybe<Scalars['String']['input']>;
  timestampTo?: InputMaybe<Scalars['String']['input']>;
  token: Scalars['String']['input'];
  transactionUsdAmountFrom?: InputMaybe<Scalars['Float']['input']>;
  transactionUsdAmountTo?: InputMaybe<Scalars['Float']['input']>;
  transactionVolumeFrom?: InputMaybe<Scalars['Float']['input']>;
  transactionVolumeTo?: InputMaybe<Scalars['Float']['input']>;
  type?: TxType;
};

export enum TransactionType {
  Add = 'add',
  Buy = 'buy',
  Liquidity = 'liquidity',
  Remove = 'remove',
  Sell = 'sell',
  Trading = 'trading'
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
  tokenCreatedAt: Scalars['Time']['output'];
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

export enum TxType {
  AddLiquidity = 'AddLiquidity',
  All = 'All',
  Burnt = 'Burnt',
  Buy = 'Buy',
  Liquidity = 'Liquidity',
  RemoveLiquidity = 'RemoveLiquidity',
  Sell = 'Sell',
  SingleSideLiquidity = 'SingleSideLiquidity'
}

export type UpdateBlacklistAddressesReq = {
  addresses?: InputMaybe<Array<Scalars['String']['input']>>;
  chain?: ChainType;
  type: UserBlacklistType;
};

/** Input for reordering a favorite token */
export type UpdateFavoriteTokenOrderInput = {
  /** The chain type */
  chain: ChainType;
  /** The new position (0-based index) for the token. Provide either newPosition OR xStockOrder, not both. */
  newPosition?: InputMaybe<Scalars['Int']['input']>;
  /** The token address to move */
  token: Scalars['String']['input'];
  /** The xStock order position (for XStock category tokens only). Provide either newPosition OR xStockOrder, not both. */
  xStockOrder?: InputMaybe<Scalars['Int']['input']>;
};

export enum UserBlacklistType {
  Dev = 'Dev',
  Token = 'Token'
}

export type UserFeedbackDto = {
  __typename?: 'UserFeedbackDTO';
  category: Scalars['String']['output'];
  email: Scalars['String']['output'];
  feedback: Scalars['String']['output'];
  id: Scalars['String']['output'];
  imageUrls?: Maybe<Array<Scalars['String']['output']>>;
};

export type UserFeedbackFilterInput = {
  category?: InputMaybe<Scalars['String']['input']>;
};

export type UserFeedbackInput = {
  category: Scalars['String']['input'];
  email: Scalars['String']['input'];
  feedback: Scalars['String']['input'];
  imageUrls?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UserFeedbackPagination = {
  __typename?: 'UserFeedbackPagination';
  data: Array<UserFeedbackDto>;
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
};

export type WalletAlias = {
  __typename?: 'WalletAlias';
  address: Scalars['String']['output'];
  alias?: Maybe<Scalars['String']['output']>;
  chainId: Scalars['Int']['output'];
};

export type WalletAliasReq = {
  address: Scalars['String']['input'];
  alias: Scalars['String']['input'];
  chainId: Scalars['Int']['input'];
};

export type WalletBalanceInput = {
  address: Scalars['String']['input'];
  chain: ChainType;
};

export type WalletInfo = {
  __typename?: 'WalletInfo';
  twitterAvatarUrl?: Maybe<Scalars['String']['output']>;
  twitterName?: Maybe<Scalars['String']['output']>;
  twitterUsername?: Maybe<Scalars['String']['output']>;
  walletName: Scalars['String']['output'];
};

export type WalletInfoInput = {
  addresses: Scalars['String']['input'];
  chainId: Scalars['Int']['input'];
  token: Scalars['String']['input'];
};

export type WalletPnlData = {
  __typename?: 'WalletPnlData';
  /** Wallet address */
  address: Scalars['String']['output'];
  /** List of PnL per day in the requested month */
  pnlPerDay: Array<WalletPnlPerDay>;
  /** Total buy transactions count */
  totalBuy: Scalars['Int']['output'];
  /** Total sell transactions count */
  totalSell: Scalars['Int']['output'];
};

export type WalletPnlPerDay = {
  __typename?: 'WalletPnlPerDay';
  /** Date in ISO format (e.g., "2025-01-15") */
  t: Scalars['String']['output'];
  /** PnL value as string */
  v: Scalars['String']['output'];
};

export type WalletPnlStatistic = {
  __typename?: 'WalletPnlStatistic';
  /** The average duration that tokens hold of the wallet */
  avgHoldDuration: Scalars['Int64']['output'];
  /** num of token has 200% < pnl percent <= 500% */
  pnl2xTo5xNum: Scalars['Int']['output'];
  /** num of token has pnl percent > 500% */
  pnlGt5xNum: Scalars['Int']['output'];
  /** num of token has 0% < pnl percent <= 200% */
  pnlLt2xNum: Scalars['Int']['output'];
  pnlLtMinusDot5Num: Scalars['Int']['output'];
  /** num of token has -50% < pnl percent <= 0% */
  pnlMinusDot5To0xNum: Scalars['Int']['output'];
};

export type WalletStatistic = {
  __typename?: 'WalletStatistic';
  address: Scalars['String']['output'];
  chainId: Scalars['Int']['output'];
  tokenAddress: Scalars['String']['output'];
  walletStatisticInfo?: Maybe<WalletStatisticInfo>;
  walletTokenInfo?: Maybe<WalletTokenInfo>;
};

export type WalletStatisticDto = {
  __typename?: 'WalletStatisticDTO';
  avgBuyMarketCap: Scalars['Decimal']['output'];
  avgHolding7d: Scalars['Decimal']['output'];
  avgSellMarketCap: Scalars['Decimal']['output'];
  currentHolding: Scalars['Decimal']['output'];
  holdingDuration: Scalars['Int64']['output'];
  label: Scalars['String']['output'];
  labels: Array<Scalars['String']['output']>;
  maxHolding: Scalars['Decimal']['output'];
  noted: Scalars['Int']['output'];
  pnl: Scalars['Decimal']['output'];
  pnl7d: Scalars['Decimal']['output'];
  tokens7d: Scalars['Decimal']['output'];
  totalBuyTxs: Scalars['Int']['output'];
  totalFee: Scalars['Decimal']['output'];
  totalFeeUSD: Scalars['Decimal']['output'];
  totalSellTxs: Scalars['Int']['output'];
  totalTokenBuyAmount: Scalars['Decimal']['output'];
  totalTokenSellAmount: Scalars['Decimal']['output'];
  totalUsdBuyAmount: Scalars['Decimal']['output'];
  totalUsdSellAmount: Scalars['Decimal']['output'];
  tracked: Scalars['Int']['output'];
  trades7d: Scalars['Decimal']['output'];
  walletAddress: Scalars['String']['output'];
  whaleTrack: Scalars['Decimal']['output'];
  winrate7d: Scalars['Decimal']['output'];
};

export type WalletStatisticInfo = {
  __typename?: 'WalletStatisticInfo';
  avgHoldingTime?: Maybe<Scalars['Time']['output']>;
  /** Number unique tokens trade within this time range */
  currency?: Maybe<Scalars['Int']['output']>;
  profit: Scalars['String']['output'];
  totalBuy: Scalars['Int']['output'];
  totalSell: Scalars['Int']['output'];
  winningRate: Scalars['String']['output'];
};

export type WalletTokenHoldingStatistic = {
  __typename?: 'WalletTokenHoldingStatistic';
  /** token holding info */
  tokenHoldings: Array<Maybe<TokenHolding>>;
};

export type WalletTokenInfo = {
  __typename?: 'WalletTokenInfo';
  balance: Scalars['String']['output'];
  highestBalance: Scalars['String']['output'];
  /** Max USD amount by the largest transaction of the wallet (include buy and sell actions) */
  maxUsdAmountByTx: Scalars['String']['output'];
  totalAliased: Scalars['Int']['output'];
  totalBuy: Scalars['Int']['output'];
  totalBuyUsd: Scalars['String']['output'];
  /** @deprecated Use totalAliased instead */
  totalFollowed: Scalars['Int']['output'];
  totalSell: Scalars['Int']['output'];
  totalSellUsd: Scalars['String']['output'];
  totalTracked: Scalars['Int']['output'];
  totalUsdFee: Scalars['String']['output'];
  /**
   * Number of transactions have amount > 10k -> dolphin transactions
   * @deprecated This field is deprecated
   */
  txGT10k?: Maybe<Scalars['Int']['output']>;
  /**
   * Number of transactions have amount > 50k -> Whale transactions
   * @deprecated This field is deprecated
   */
  txGT50k?: Maybe<Scalars['Int']['output']>;
};

export type WalletTokenStatistic = {
  __typename?: 'WalletTokenStatistic';
  startTimeHolding?: Maybe<Scalars['Time']['output']>;
  totalBuyTxs: Scalars['Int']['output'];
  totalBuyTxs24h: Scalars['Int']['output'];
  totalSellTxs: Scalars['Int']['output'];
  totalSellTxs24h: Scalars['Int']['output'];
};

export type WalletTokenStatisticDto = {
  __typename?: 'WalletTokenStatisticDTO';
  balance: Scalars['Decimal']['output'];
  buys: Scalars['Int']['output'];
  holdingDuration: Scalars['Int64']['output'];
  maxHoldingQty: Scalars['Decimal']['output'];
  sells: Scalars['Int']['output'];
  totalBuyAmount: Scalars['Decimal']['output'];
  totalProfit: Scalars['Decimal']['output'];
  totalSellAmount: Scalars['Decimal']['output'];
  totalUsdBuyAmount: Scalars['Decimal']['output'];
  totalUsdSellAmount: Scalars['Decimal']['output'];
};

export type WebsitesInfo = {
  __typename?: 'WebsitesInfo';
  label: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export enum GetWalletPnlTimeFrame {
  D7 = 'd7',
  H24 = 'h24',
  M1 = 'm1',
  Y1 = 'y1'
}
