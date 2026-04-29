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
  JSON: { input: any; output: any; }
  Time: { input: any; output: any; }
};

/** Supported blockchain types */
export enum ChainType {
  Bsc = 'BSC',
  Evm = 'EVM',
  Mon = 'MON',
  Solana = 'SOLANA',
  Tron = 'TRON'
}

/** Enum defining the types of buy strategies available for copy trading. Values: (MaxAmount, FixedAmount) */
export enum ConfigBuyType {
  /** Buy with a fixed specified amount */
  FixedAmount = 'FixedAmount',
  /** Buy with maximum available amount */
  MaxAmount = 'MaxAmount'
}

/** Enum defining the supported trading platforms. Values: (Pump, Moonshot, Raydium, Others) */
export enum ConfigPlatform {
  /** Moonshot platform for trading */
  Moonshot = 'Moonshot',
  /** Other trading platforms */
  Others = 'Others',
  /** Pump platform for trading */
  Pump = 'Pump',
  /** Raydium DEX platform */
  Raydium = 'Raydium'
}

/** Enum defining the types of sell strategies available for copy trading. Values: (Auto, NoCopy, SingleTPSL, MultiTPSL) */
export enum ConfigSellType {
  /** Automatically follow leader's sell actions */
  Auto = 'Auto',
  /** Use multiple take profit and stop loss levels */
  MultiTpsl = 'MultiTPSL',
  /** Do not copy leader's sell actions */
  NoCopy = 'NoCopy',
  /** Use single take profit and stop loss levels */
  SingleTpsl = 'SingleTPSL'
}

/** Enum defining the possible states of a copy trade configuration. Values: (Active, Paused, Canceled) */
export enum ConfigStatus {
  /** Configuration is actively copying trades */
  Active = 'Active',
  /** Configuration has been permanently canceled */
  Canceled = 'Canceled',
  /** Configuration is temporarily paused */
  Paused = 'Paused'
}

/** Configuration for copy trading settings and parameters */
export type CopyTradeConfig = {
  __typename?: 'CopyTradeConfig';
  /** Type of buy strategy to use. Values: (MaxAmount, FixedAmount) */
  buyType: ConfigBuyType;
  /** Blockchain network ID where trading occurs */
  chainId: Scalars['String']['output'];
  /** Amount to use for buying based on buyType */
  configAmount: Scalars['Decimal']['output'];
  /** When this config was created */
  createdAt: Scalars['Time']['output'];
  /** When this config was deleted, if applicable */
  deletedAt?: Maybe<Scalars['Time']['output']>;
  /** Unique identifier for the copy trade config */
  id: Scalars['ID']['output'];
  /** Wallet address of the leader being copied */
  leaderAddress: Scalars['String']['output'];
  /** Nickname of the leader being copied */
  leaderNickname: Scalars['String']['output'];
  /** Tags of the leader being copied */
  leaderTags?: Maybe<Array<Scalars['String']['output']>>;
  /** Maximum amount filter for trades */
  maxAmount?: Maybe<Scalars['Decimal']['output']>;
  /** Maximum burn liquidity filter for tokens */
  maxBurnLiquidity?: Maybe<Scalars['Decimal']['output']>;
  /**
   * Maximum token creation time filter
   * @deprecated Use maxCreationTimeInt instead. This field will be removed in the future
   */
  maxCreationTime?: Maybe<Scalars['Time']['output']>;
  /** User only copy trade token created before `maxCreationTimeInt` minutes from the time the leader create the transaction */
  maxCreationTimeInt?: Maybe<Scalars['Int']['output']>;
  /** Maximum liquidity filter for tokens */
  maxLiquidity?: Maybe<Scalars['Decimal']['output']>;
  /** Maximum market cap filter for tokens */
  maxMarketCap?: Maybe<Scalars['Decimal']['output']>;
  /** Maximum number of purchases allowed per token */
  maxPurchasePerToken?: Maybe<Scalars['Int']['output']>;
  /** Whether MEV protection is enabled */
  mevProtect?: Maybe<Scalars['Boolean']['output']>;
  /** Minimum amount filter for trades */
  minAmount?: Maybe<Scalars['Decimal']['output']>;
  /** Minimum burn liquidity filter for tokens */
  minBurnLiquidity?: Maybe<Scalars['Decimal']['output']>;
  /**
   * Minimum token creation time filter
   * @deprecated Use minCreationTimeInt instead. This field will be removed in the future
   */
  minCreationTime?: Maybe<Scalars['Time']['output']>;
  /** User only copy trade token created after `minCreationTimeInt` minutes from the time the leader create the transaction */
  minCreationTimeInt?: Maybe<Scalars['Int']['output']>;
  /** Minimum liquidity filter for tokens */
  minLiquidity?: Maybe<Scalars['Decimal']['output']>;
  /** Minimum market cap filter for tokens */
  minMarketCap?: Maybe<Scalars['Decimal']['output']>;
  /** List of platforms where trading is allowed. Values: (Pump, Moonshot, Raydium, Others) */
  platform: Array<ConfigPlatform>;
  /** Priority fee price for transactions */
  priorityFeePrice?: Maybe<Scalars['Decimal']['output']>;
  /** Type of sell strategy to use. Values: (Auto, NoCopy, SingleTPSL, MultiTPSL) */
  sellType: ConfigSellType;
  /** Stop loss percentage */
  sl?: Maybe<Scalars['Decimal']['output']>;
  /** Maximum allowed slippage percentage */
  slippage?: Maybe<Scalars['Decimal']['output']>;
  /** Statistics for this copy trade config */
  statistic?: Maybe<CopyTradeConfigStatistic>;
  /** Current status of the copy trade config. Values: (Active, Paused, Canceled) */
  status: ConfigStatus;
  /** Take profit percentage */
  tp?: Maybe<Scalars['Decimal']['output']>;
  /** Configuration for take profit and stop loss levels */
  tpslConfig?: Maybe<Array<TpSlConfig>>;
  /** Whether trailing stop loss is enabled */
  trailingSl?: Maybe<Scalars['Boolean']['output']>;
  /** When this config was last updated */
  updatedAt: Scalars['Time']['output'];
  /** Wallet address of the user who owns this config */
  userAddress: Scalars['String']['output'];
  /** ID of the user who owns this config */
  userId: Scalars['String']['output'];
};

export type CopyTradeConfigStatistic = {
  __typename?: 'CopyTradeConfigStatistic';
  /** Reference to the parent copy trade config */
  copyTradeConfigID: Scalars['ID']['output'];
  /** List of token holding statistics for this config */
  copyTradeTokenHoldingStatistics: Array<CopyTradeTokenHoldingStatistic>;
  /** Unique identifier for the statistic */
  id: Scalars['ID']['output'];
  /** Timestamp of the most recent trade */
  lastTradeTime?: Maybe<Scalars['Time']['output']>;
  /** Current status of the statistic update process */
  updateStatus: Scalars['String']['output'];
};

export type CopyTradeOrdersFilters = {
  __typename?: 'CopyTradeOrdersFilters';
  uniqueBaseAddresses: Array<UniqueBaseAddress>;
  uniqueBaseSymbols: Array<UniqueBaseSymbol>;
};

export type CopyTradeTokenHoldingStatistic = {
  __typename?: 'CopyTradeTokenHoldingStatistic';
  /** Average cost per token in quote token (ex: SOL, EVM, ...) */
  avgCostPriceInQuoteToken: Scalars['Decimal']['output'];
  /** Average cost per token in USD */
  avgCostPriceInUsd: Scalars['Decimal']['output'];
  /** Address of the base token (ex: TRUMP, BTC, ...) */
  baseAddress: Scalars['String']['output'];
  /** Total amount of tokens bought in last 24 hours */
  buyAmount1d: Scalars['Decimal']['output'];
  /** Total amount of tokens bought in last 7 days */
  buyAmount7d: Scalars['Decimal']['output'];
  /** Total amount of tokens bought in last 30 days */
  buyAmount30d: Scalars['Decimal']['output'];
  /** Total cost of remaining purchases in quote token */
  buyCostInQuoteToken: Scalars['Decimal']['output'];
  /** Total cost of remaining purchases in quote token in last 24 hours */
  buyCostInQuoteToken1d: Scalars['Decimal']['output'];
  /** Total cost of remaining purchases in quote token in last 7 days */
  buyCostInQuoteToken7d: Scalars['Decimal']['output'];
  /** Total cost of remaining purchases in quote token in last 30 days */
  buyCostInQuoteToken30d: Scalars['Decimal']['output'];
  /** Total cost of remaining purchases in USD */
  buyCostInUsd: Scalars['Decimal']['output'];
  /** Total cost of remaining purchases in USD in last 24 hours */
  buyCostInUsd1d: Scalars['Decimal']['output'];
  /** Total cost of remaining purchases in USD in last 7 days */
  buyCostInUsd7d: Scalars['Decimal']['output'];
  /** Total cost of remaining purchases in USD in last 30 days */
  buyCostInUsd30d: Scalars['Decimal']['output'];
  /** Reference to the parent copy trade statistic */
  copyTradeStatisticID: Scalars['ID']['output'];
  /** Unique identifier for the statistic */
  id: Scalars['ID']['output'];
  /** Timestamp of the most recent trade */
  lastTradeTime?: Maybe<Scalars['Time']['output']>;
  /** Address of the quote token (ex: SOL, EVM, ...) */
  quoteAddress: Scalars['String']['output'];
  /** Current amount of tokens still held */
  remainingAmount: Scalars['Decimal']['output'];
  /** Total amount of tokens sold in last 24 hours */
  sellAmount1d: Scalars['Decimal']['output'];
  /** Total amount of tokens sold in last 7 days */
  sellAmount7d: Scalars['Decimal']['output'];
  /** Total amount of tokens sold in last 30 days */
  sellAmount30d: Scalars['Decimal']['output'];
  /** Number of sell transactions in last 24 hours */
  sellIn1d: Scalars['Int']['output'];
  /** Number of sell transactions in last 7 days */
  sellIn7d: Scalars['Int']['output'];
  /** Number of sell transactions in last 30 days */
  sellIn30d: Scalars['Int']['output'];
  /** Total amount received in quote token from sales in last 24 hours */
  sellInQuoteToken1d: Scalars['Decimal']['output'];
  /** Total amount received in quote token from sales in last 7 days */
  sellInQuoteToken7d: Scalars['Decimal']['output'];
  /** Total amount received in quote token from sales in last 30 days */
  sellInQuoteToken30d: Scalars['Decimal']['output'];
  /** Total amount received in USD from sales in last 24 hours */
  sellInUsd1d: Scalars['Decimal']['output'];
  /** Total amount received in USD from sales in last 7 days */
  sellInUsd7d: Scalars['Decimal']['output'];
  /** Total amount received in USD from sales in last 30 days */
  sellInUsd30d: Scalars['Decimal']['output'];
  /** Number of profitable sell transactions in last 24 hours */
  sellWithProfit1d: Scalars['Int']['output'];
  /** Number of profitable sell transactions in last 7 days */
  sellWithProfit7d: Scalars['Int']['output'];
  /** Number of profitable sell transactions in last 30 days */
  sellWithProfit30d: Scalars['Int']['output'];
  /** Total number of buy transactions */
  totalBuy: Scalars['Int']['output'];
  /** Number of buy transactions in last 24 hours */
  totalBuyIn1d: Scalars['Int']['output'];
  /** Number of buy transactions in last 7 days */
  totalBuyIn7d: Scalars['Int']['output'];
  /** Number of buy transactions in last 30 days */
  totalBuyIn30d: Scalars['Int']['output'];
  /** Total amount spent in quote token for all purchases */
  totalBuyInQuoteToken: Scalars['Decimal']['output'];
  /** Total amount spent in USD for all purchases */
  totalBuyInUsd: Scalars['Decimal']['output'];
  /** Total profit in quote token (ex: SOL, EVM, ...) */
  totalProfitInQuoteToken: Scalars['Decimal']['output'];
  /** Total profit in USD */
  totalProfitInUsd: Scalars['Decimal']['output'];
  /** Total number of sell transactions */
  totalSell: Scalars['Int']['output'];
  /** Total amount received in quote token from all sales */
  totalSellInQuoteToken: Scalars['Decimal']['output'];
  /** Total amount received in USD from all sales */
  totalSellInUsd: Scalars['Decimal']['output'];
  /** Number of sell transactions that resulted in profit */
  totalSellWithProfit: Scalars['Int']['output'];
};

/** Input for creating copy trade configuration */
export type CreateCopyTradeConfigInput = {
  /** Type of buy configuration */
  buyType: ConfigBuyType;
  /** Blockchain network ID */
  chainId: Scalars['String']['input'];
  /** Amount to use for trading */
  configAmount: Scalars['Decimal']['input'];
  /** Leader's wallet address to copy trades from */
  leaderAddress: Scalars['String']['input'];
  /** Leader's nickname */
  leaderNickname?: InputMaybe<Scalars['String']['input']>;
  /** Maximum amount of the token to copy trade */
  maxAmount?: InputMaybe<Scalars['Decimal']['input']>;
  /** Maximum burn liquidity of the token to copy trade */
  maxBurnLiquidity?: InputMaybe<Scalars['Decimal']['input']>;
  /** User only copy trade token created before `maxCreationTime` */
  maxCreationTime?: InputMaybe<Scalars['Time']['input']>;
  /** User only copy trade token created before `maxCreationTimeInt` minutes from the time the leader create the transaction */
  maxCreationTimeInt?: InputMaybe<Scalars['Int']['input']>;
  /** Maximum liquidity of the token to copy trade */
  maxLiquidity?: InputMaybe<Scalars['Decimal']['input']>;
  /** Maximum market cap of the token to copy trade */
  maxMarketCap?: InputMaybe<Scalars['Decimal']['input']>;
  /** Maximum number of purchases per token */
  maxPurchasePerToken?: InputMaybe<Scalars['Int']['input']>;
  /** Whether to enable MEV protection */
  mevProtect?: InputMaybe<Scalars['Boolean']['input']>;
  /** Minimum amount of the token to copy trade */
  minAmount?: InputMaybe<Scalars['Decimal']['input']>;
  /** Minimum burn liquidity of the token to copy trade */
  minBurnLiquidity?: InputMaybe<Scalars['Decimal']['input']>;
  /** User only copy trade token created after `minCreationTime` */
  minCreationTime?: InputMaybe<Scalars['Time']['input']>;
  /** User only copy trade token created after `minCreationTimeInt` minutes from the time the leader create the transaction */
  minCreationTimeInt?: InputMaybe<Scalars['Int']['input']>;
  /** Minimum liquidity of the token to copy trade */
  minLiquidity?: InputMaybe<Scalars['Decimal']['input']>;
  /** Minimum market cap of the token to copy trade */
  minMarketCap?: InputMaybe<Scalars['Decimal']['input']>;
  /** Trading platforms to use */
  platform: Array<ConfigPlatform>;
  /** Priority fee price in native token */
  priorityFeePrice?: InputMaybe<Scalars['Decimal']['input']>;
  /** Type of sell configuration */
  sellType: ConfigSellType;
  /** Stop loss percentage */
  sl?: InputMaybe<Scalars['Decimal']['input']>;
  /** Slippage tolerance percentage */
  slippage?: InputMaybe<Scalars['Decimal']['input']>;
  /** Take profit percentage */
  tp?: InputMaybe<Scalars['Decimal']['input']>;
  /** Take profit/stop loss configurations */
  tpslConfig?: InputMaybe<Array<TpSlConfigInput>>;
  /** Whether trailing stop loss is enabled */
  trailingSl?: InputMaybe<Scalars['Boolean']['input']>;
  /** User's wallet address */
  walletAddress: Scalars['String']['input'];
};

export type CreateOrderInput = {
  baseAddress: Scalars['String']['input'];
  baseAmount?: InputMaybe<Scalars['Decimal']['input']>;
  /** Percentage of current holdings to sell (0-100). Only valid for sell orders. Executor calculates actual amount. */
  baseAmountPercent?: InputMaybe<Scalars['Decimal']['input']>;
  briberyFeePrice?: InputMaybe<Scalars['Decimal']['input']>;
  callbackRate?: InputMaybe<Scalars['Decimal']['input']>;
  chainId: Scalars['String']['input'];
  customRPC?: InputMaybe<Scalars['String']['input']>;
  doublePrincipalAfterPurchase?: InputMaybe<Scalars['Boolean']['input']>;
  /** The type of engine used to submit transactions to the blockchain. Default: Swap */
  engine?: InputMaybe<SubmitEngineType>;
  limitMarketCap?: InputMaybe<Scalars['Decimal']['input']>;
  limitPrice?: InputMaybe<Scalars['Decimal']['input']>;
  mevProtect?: InputMaybe<Scalars['Boolean']['input']>;
  mevProtectionType?: InputMaybe<MevProtectionType>;
  priorityFeePrice?: InputMaybe<Scalars['Decimal']['input']>;
  quoteAddress: Scalars['String']['input'];
  quoteAmount?: InputMaybe<Scalars['Decimal']['input']>;
  signedTx?: InputMaybe<Scalars['String']['input']>;
  sl?: InputMaybe<Scalars['Decimal']['input']>;
  slippage?: InputMaybe<Scalars['Decimal']['input']>;
  tp?: InputMaybe<Scalars['Decimal']['input']>;
  transaction?: InputMaybe<Scalars['String']['input']>;
  transactionType: TransactionType;
  triggerPrice?: InputMaybe<Scalars['Decimal']['input']>;
  type: OrderType;
  userAddress: Scalars['String']['input'];
};

export enum Currency {
  Sol = 'SOL',
  Usd = 'USD'
}

/** Fee details for Ethereum network */
export type EthereumFee = {
  __typename?: 'EthereumFee';
  estimatedBaseFee?: Maybe<Scalars['String']['output']>;
  high?: Maybe<FeeLevel>;
  low?: Maybe<FeeLevel>;
  medium?: Maybe<FeeLevel>;
};

export type FakePriceInput = {
  Address: Scalars['String']['input'];
  MarketCap: Scalars['Decimal']['input'];
  Price: Scalars['Decimal']['input'];
};

/** Fee level details */
export type FeeLevel = {
  __typename?: 'FeeLevel';
  maxWaitTimeEstimate?: Maybe<Scalars['Float']['output']>;
  minWaitTimeEstimate?: Maybe<Scalars['Float']['output']>;
  suggestedMaxFeePerGas?: Maybe<Scalars['String']['output']>;
  suggestedMaxPriorityFeePerGas?: Maybe<Scalars['String']['output']>;
};

export type FillWeb3OrderEvent = {
  __typename?: 'FillWeb3OrderEvent';
  orderId: Scalars['ID']['output'];
  txid?: Maybe<Scalars['String']['output']>;
  userAddress: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type FillWeb3OrderFailed = {
  __typename?: 'FillWeb3OrderFailed';
  event: FillWeb3OrderEvent;
  message: Scalars['String']['output'];
};

/** Input for getting copy trade configuration */
export type GetCopyTradeConfigInput = {
  /** Configuration ID */
  id: Scalars['ID']['input'];
};

export type GetCopyTradeOrdersFiltersInput = {
  chainId: Scalars['String']['input'];
  copyTradeConfigId: Scalars['ID']['input'];
  status?: InputMaybe<Status>;
};

export type GetUniqueBaseSymbolInput = {
  chainId: Scalars['String']['input'];
  copyTradeConfigId: Scalars['ID']['input'];
};

export type HoldingToken = {
  __typename?: 'HoldingToken';
  address: Scalars['String']['output'];
  balance: Scalars['Decimal']['output'];
  chainId: Scalars['String']['output'];
  pendingBalance: Scalars['Decimal']['output'];
  token: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type LastTransaction = {
  __typename?: 'LastTransaction';
  baseAmount: Scalars['Decimal']['output'];
  chainId: Scalars['String']['output'];
  priceUsd: Scalars['Decimal']['output'];
  quoteAmount: Scalars['Decimal']['output'];
  symbol: Scalars['String']['output'];
  token: Scalars['String']['output'];
  transactionType: TransactionType;
  txid: Scalars['String']['output'];
};

/** Input for listing copied addresses (leader addresses) */
export type ListCopiedAddressesInput = {
  /** Chain ID to filter addresses by network */
  chainId: Scalars['String']['input'];
};

/** Input for listing copy trade configurations */
export type ListCopyTradeConfigInput = {
  /** Blockchain network ID */
  chainId: Scalars['String']['input'];
  /** Page number for pagination */
  page: Scalars['Int']['input'];
  /** Number of items per page */
  size: Scalars['Int']['input'];
};

/** Response containing list of copy trade configurations */
export type ListCopyTradeConfigResponse = {
  __typename?: 'ListCopyTradeConfigResponse';
  /** List of copy trade configurations */
  items: Array<CopyTradeConfig>;
  /** Pagination information */
  pagination: PaginationInfo;
};

/** Input for listing blacklisted tokens */
export type ListTokenBlacklistInput = {
  /** Page number for pagination */
  page: Scalars['Int']['input'];
  /** Number of items per page */
  size: Scalars['Int']['input'];
  /** User ID to get blacklist for */
  userId: Scalars['String']['input'];
};

/** Response containing list of blacklisted tokens */
export type ListTokenBlacklistResponse = {
  __typename?: 'ListTokenBlacklistResponse';
  /** List of blacklisted tokens */
  items: Array<TokenBlacklist>;
  /** Pagination information */
  pagination: PaginationInfo;
};

export type MarketDepth = {
  __typename?: 'MarketDepth';
  buy?: Maybe<Array<MarketDepthItem>>;
  sell?: Maybe<Array<MarketDepthItem>>;
  step: Scalars['Float']['output'];
  token: Scalars['String']['output'];
};

export type MarketDepthItem = {
  __typename?: 'MarketDepthItem';
  price: Scalars['Decimal']['output'];
  volumn: Scalars['Decimal']['output'];
};

export enum MevProtectionType {
  Normal = 'Normal',
  Off = 'Off',
  Secure = 'Secure'
}

export type ModifyOrderInput = {
  baseAmount?: InputMaybe<Scalars['Decimal']['input']>;
  briberyFeePrice?: InputMaybe<Scalars['Decimal']['input']>;
  callbackRate?: InputMaybe<Scalars['Decimal']['input']>;
  customRPC?: InputMaybe<Scalars['String']['input']>;
  doublePrincipalAfterPurchase?: InputMaybe<Scalars['Boolean']['input']>;
  id: Scalars['ID']['input'];
  limitMarketCap?: InputMaybe<Scalars['Decimal']['input']>;
  limitPrice?: InputMaybe<Scalars['Decimal']['input']>;
  mevProtect?: InputMaybe<Scalars['Boolean']['input']>;
  mevProtectionType?: InputMaybe<MevProtectionType>;
  priorityFeePrice?: InputMaybe<Scalars['Decimal']['input']>;
  quoteAmount?: InputMaybe<Scalars['Decimal']['input']>;
  sl?: InputMaybe<Scalars['Decimal']['input']>;
  slippage?: InputMaybe<Scalars['Decimal']['input']>;
  tp?: InputMaybe<Scalars['Decimal']['input']>;
  triggerPrice?: InputMaybe<Scalars['Decimal']['input']>;
};

/** Input for modifying token blacklist */
export type ModifyTokenBlacklistInput = {
  /** Action to perform (Add/Remove) */
  action: TokenBlacklistAction;
  /** Token address to blacklist/unblacklist */
  token: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  cancelOrder: Order;
  /** Create a new copy trade configuration */
  createCopyTradeConfig: CopyTradeConfig;
  createOrder: Order;
  fakePrice: Token;
  modifyOrder: Order;
  /** Modify token blacklist (Add/Remove tokens) */
  modifyTokenBlacklist: TokenBlacklist;
  saveWeb3Order: Web3OrderResp;
  /** Update an existing copy trade configuration */
  updateCopyTradeConfig: CopyTradeConfig;
  /** Update the status of a copy trade configuration */
  updateCopyTradeConfigStatus: CopyTradeConfig;
};


export type MutationCancelOrderArgs = {
  id: Scalars['ID']['input'];
};


export type MutationCreateCopyTradeConfigArgs = {
  input: CreateCopyTradeConfigInput;
};


export type MutationCreateOrderArgs = {
  input: CreateOrderInput;
};


export type MutationFakePriceArgs = {
  input: FakePriceInput;
};


export type MutationModifyOrderArgs = {
  input: ModifyOrderInput;
};


export type MutationModifyTokenBlacklistArgs = {
  input: ModifyTokenBlacklistInput;
};


export type MutationSaveWeb3OrderArgs = {
  input: SaveWeb3OrderInput;
};


export type MutationUpdateCopyTradeConfigArgs = {
  input: UpdateCopyTradeConfigInput;
};


export type MutationUpdateCopyTradeConfigStatusArgs = {
  input: UpdateCopyTradeConfigStatusInput;
};

/** Type representing network fee details */
export type NetworkFee = {
  __typename?: 'NetworkFee';
  bsc?: Maybe<EthereumFee>;
  ethereum?: Maybe<EthereumFee>;
  mon?: Maybe<EthereumFee>;
  solana?: Maybe<SolanaFee>;
};

/** Input type for specifying network fee details */
export type NetworkFeeInput = {
  chain: ChainType;
};

/** A closed order always have a reason */
export type Order = {
  __typename?: 'Order';
  /** Timestamp when the copy trade statistics were last aggregated */
  aggregateStatisticAt?: Maybe<Scalars['Time']['output']>;
  antiMevFee?: Maybe<Scalars['Decimal']['output']>;
  antiMevFeeAmount?: Maybe<Scalars['Decimal']['output']>;
  avgCostPrice?: Maybe<Scalars['Decimal']['output']>;
  /** Base token address */
  baseAddress: Scalars['String']['output'];
  /** Base token amount */
  baseAmount: Scalars['Decimal']['output'];
  baseDecimal: Scalars['Int']['output'];
  baseSymbol: Scalars['String']['output'];
  callbackRate?: Maybe<Scalars['Decimal']['output']>;
  chainId: Scalars['String']['output'];
  closeBaseUsdRate?: Maybe<Scalars['Decimal']['output']>;
  closePriceQuote?: Maybe<Scalars['Decimal']['output']>;
  closePriceUsd?: Maybe<Scalars['Decimal']['output']>;
  closeQuoteUsdRate?: Maybe<Scalars['Decimal']['output']>;
  closeSubmitMeta?: Maybe<Scalars['String']['output']>;
  closeTxid?: Maybe<Scalars['String']['output']>;
  copyConfig?: Maybe<OrderCopyTradeConfig>;
  /**
   * Snapshot of essential copy trading configuration at order creation time.
   * Contains only execution-critical fields (buy/sell types, TP/SL values, max amounts, etc.)
   * that remain immutable even if the source configuration is modified or deleted.
   * Excludes sensitive data like user addresses and platform-specific details.
   */
  copyConfigSnapshot?: Maybe<Scalars['JSON']['output']>;
  /** Average buy price in quote token for copy trade positions */
  copyTradeAvgBuyPriceQuoteToken?: Maybe<Scalars['Decimal']['output']>;
  /** Average buy price in USD for copy trade positions */
  copyTradeAvgBuyPriceUsd?: Maybe<Scalars['Decimal']['output']>;
  /** Total cost in quote token for copy trade buy transactions */
  copyTradeBuyCostQuoteToken?: Maybe<Scalars['Decimal']['output']>;
  /** Total cost in USD for copy trade buy transactions */
  copyTradeBuyCostUsd?: Maybe<Scalars['Decimal']['output']>;
  /** Order creation timestamp */
  createdAt: Scalars['Time']['output'];
  deletedAt?: Maybe<Scalars['Time']['output']>;
  doublePrincipalAfterPurchase?: Maybe<Scalars['Boolean']['output']>;
  engine?: Maybe<SubmitEngineType>;
  exit?: Maybe<Scalars['Decimal']['output']>;
  exitAt?: Maybe<Scalars['Time']['output']>;
  feeRate: Scalars['Float']['output'];
  filledAt?: Maybe<Scalars['Time']['output']>;
  gasFee?: Maybe<Scalars['Decimal']['output']>;
  gasFeeAmount?: Maybe<Scalars['Decimal']['output']>;
  /** Order ID */
  id: Scalars['ID']['output'];
  /** Base token amount placed by the user */
  inputBaseAmount: Scalars['Decimal']['output'];
  /** Quote token amount placed by the user */
  inputQuoteAmount: Scalars['Decimal']['output'];
  isXStock: Scalars['Boolean']['output'];
  /** Limit order price based on market cap */
  limitMarketCap: Scalars['Decimal']['output'];
  /** Limit order price in USD */
  limitPrice: Scalars['Decimal']['output'];
  marketCap?: Maybe<Scalars['Decimal']['output']>;
  mevProtect?: Maybe<Scalars['Boolean']['output']>;
  openBaseUsdRate?: Maybe<Scalars['Decimal']['output']>;
  /** Market cap at the time of order creation */
  openMarketCap: Scalars['Decimal']['output'];
  /** Base token price in USD at the time of order creation */
  openPrice: Scalars['Decimal']['output'];
  openPriceQuote?: Maybe<Scalars['Decimal']['output']>;
  openPriceUsd?: Maybe<Scalars['Decimal']['output']>;
  openQuoteUsdRate?: Maybe<Scalars['Decimal']['output']>;
  openSubmitMeta?: Maybe<Scalars['String']['output']>;
  openTxid?: Maybe<Scalars['String']['output']>;
  platformFee?: Maybe<Scalars['Decimal']['output']>;
  platformFeeAmount?: Maybe<Scalars['Decimal']['output']>;
  platformFeeMint?: Maybe<Scalars['String']['output']>;
  pnl?: Maybe<Scalars['Decimal']['output']>;
  priorityFee?: Maybe<Scalars['Decimal']['output']>;
  priorityFeeAmount?: Maybe<Scalars['Decimal']['output']>;
  priorityFeePrice?: Maybe<Scalars['Decimal']['output']>;
  pumpFee?: Maybe<Scalars['Decimal']['output']>;
  pumpFeeAmount?: Maybe<Scalars['Decimal']['output']>;
  /** Quote token address */
  quoteAddress: Scalars['String']['output'];
  /** Quote token amount */
  quoteAmount: Scalars['Decimal']['output'];
  quoteSymbol: Scalars['String']['output'];
  sl?: Maybe<Scalars['Decimal']['output']>;
  slippage: Scalars['Decimal']['output'];
  slippageLoss?: Maybe<Scalars['Decimal']['output']>;
  slippageLossAmount?: Maybe<Scalars['Decimal']['output']>;
  slippageLossMint?: Maybe<Scalars['String']['output']>;
  status: Status;
  submitCode?: Maybe<Scalars['String']['output']>;
  totalFee?: Maybe<Scalars['Decimal']['output']>;
  tp?: Maybe<Scalars['Decimal']['output']>;
  tp2?: Maybe<Scalars['Decimal']['output']>;
  trailingOrderTriggered?: Maybe<Scalars['Boolean']['output']>;
  /** Transaction type: Buy/Sell */
  transactionType: TransactionType;
  triggerAt?: Maybe<Scalars['Time']['output']>;
  triggerPrice?: Maybe<Scalars['Decimal']['output']>;
  txid: Scalars['String']['output'];
  /** Order type: Market/Limit/TrailingTPSL/TPSL */
  type: OrderType;
  /** Last updated timestamp */
  updatedAt: Scalars['Time']['output'];
  /** User's wallet address */
  userAddress: Scalars['String']['output'];
};

export type OrderCopyTradeConfig = {
  __typename?: 'OrderCopyTradeConfig';
  buyType: ConfigBuyType;
  id: Scalars['ID']['output'];
  sellType: ConfigSellType;
  /** Stop loss percentage */
  sl?: Maybe<Scalars['Decimal']['output']>;
  /** Take profit percentage */
  tp?: Maybe<Scalars['Decimal']['output']>;
  /** Configuration for take profit and stop loss levels */
  tpslConfig?: Maybe<Array<TpSlConfig>>;
};

export type OrderListResponse = {
  __typename?: 'OrderListResponse';
  orders: Array<Order>;
  total: Scalars['Int']['output'];
};

export enum OrderSortField {
  CreatedAt = 'created_at'
}

export type OrderStatistic = {
  __typename?: 'OrderStatistic';
  totalBuyQuote: Scalars['Decimal']['output'];
  totalBuyUsd: Scalars['Decimal']['output'];
  totalOrder: Scalars['Decimal']['output'];
  totalSellQuote: Scalars['Decimal']['output'];
  totalSellUsd: Scalars['Decimal']['output'];
  userAddress: Scalars['String']['output'];
};

export type OrderSubmitFailed = {
  __typename?: 'OrderSubmitFailed';
  code: Scalars['String']['output'];
  message: Scalars['String']['output'];
  order: Order;
};

export enum OrderType {
  Limit = 'Limit',
  Market = 'Market',
  Tpsl = 'TPSL',
  TrailingTpsl = 'TrailingTPSL'
}

/** Pagination info */
export type PaginationInfo = {
  __typename?: 'PaginationInfo';
  page: Scalars['Int']['output'];
  size: Scalars['Int']['output'];
};

export type Portfolio = {
  __typename?: 'Portfolio';
  avgMarketCap: Scalars['Decimal']['output'];
  avgPriceQuote: Scalars['Decimal']['output'];
  avgPriceUsd: Scalars['Decimal']['output'];
  symbol: Scalars['String']['output'];
  token: Scalars['String']['output'];
  totalBaseAmount: Scalars['Decimal']['output'];
  totalBuyBaseAmount: Scalars['Decimal']['output'];
  totalBuyQuoteAmount: Scalars['Decimal']['output'];
  totalQuoteAmount: Scalars['Decimal']['output'];
  totalSellBaseAmount: Scalars['Decimal']['output'];
  totalSellQuoteAmount: Scalars['Decimal']['output'];
  userAddress: Scalars['String']['output'];
};

/** Priority fee price details */
export type PriorityFeePrice = {
  __typename?: 'PriorityFeePrice';
  high?: Maybe<Scalars['Float']['output']>;
  medium?: Maybe<Scalars['Float']['output']>;
  veryHigh?: Maybe<Scalars['Float']['output']>;
};

export type Query = {
  __typename?: 'Query';
  /** Get current trading config */
  config: TradingConfig;
  /** Get copy trade orders with pagination */
  copyTradeOrders: Array<Order>;
  getAllTransactions: Array<Order>;
  /** Get copy trade configuration by ID */
  getCopyTradeConfig: CopyTradeConfig;
  /** Get copy trade order filters including unique base symbols and addresses */
  getCopyTradeOrdersFilters: CopyTradeOrdersFilters;
  getNetworkFee: NetworkFee;
  getPendingOrders: OrderListResponse;
  getTransactions: Array<Order>;
  getUncompletedOrders: OrderListResponse;
  /** Get unique base symbols for copy trade */
  getUniqueBaseSymbolCopyTrade: Array<UniqueBaseSymbol>;
  history: Array<Order>;
  historyStatistic: OrderStatistic;
  lastTransactions: Array<LastTransaction>;
  /** List all leader addresses that have been copied (exclude canceled configs) */
  listCopiedAddresses: Array<Scalars['String']['output']>;
  /** List copy trade configurations with pagination */
  listCopyTradeConfig: ListCopyTradeConfigResponse;
  /** List blacklisted tokens with pagination */
  listTokenBlacklist: ListTokenBlacklistResponse;
  marketDepth: MarketDepth;
  order?: Maybe<Order>;
  orders: Array<Order>;
  portfolio: Array<Portfolio>;
  transactionTokens: Array<TransactionToken>;
};


export type QueryCopyTradeOrdersArgs = {
  input: SearchCopyTradeOrderInput;
};


export type QueryGetAllTransactionsArgs = {
  input: SearchAllOrderInput;
};


export type QueryGetCopyTradeConfigArgs = {
  input: GetCopyTradeConfigInput;
};


export type QueryGetCopyTradeOrdersFiltersArgs = {
  input: GetCopyTradeOrdersFiltersInput;
};


export type QueryGetNetworkFeeArgs = {
  input: NetworkFeeInput;
};


export type QueryGetPendingOrdersArgs = {
  input: SearchOrderInput;
};


export type QueryGetTransactionsArgs = {
  input: SearchOrderInput;
};


export type QueryGetUncompletedOrdersArgs = {
  input: SearchOrderInput;
};


export type QueryGetUniqueBaseSymbolCopyTradeArgs = {
  input: GetUniqueBaseSymbolInput;
};


export type QueryHistoryArgs = {
  input: SearchOrderInput;
};


export type QueryHistoryStatisticArgs = {
  input: SearchOrderInput;
};


export type QueryLastTransactionsArgs = {
  input: SearchLastTransactionInput;
};


export type QueryListCopiedAddressesArgs = {
  input: ListCopiedAddressesInput;
};


export type QueryListCopyTradeConfigArgs = {
  input: ListCopyTradeConfigInput;
};


export type QueryListTokenBlacklistArgs = {
  input: ListTokenBlacklistInput;
};


export type QueryMarketDepthArgs = {
  input: SearchMarketDepthInput;
};


export type QueryOrderArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOrdersArgs = {
  input: SearchOrderInput;
};


export type QueryPortfolioArgs = {
  input: SearchPortfolioInput;
};


export type QueryTransactionTokensArgs = {
  input: TransactionTokenInput;
};

export type SaveWeb3OrderInput = {
  chain: ChainType;
  txid: Scalars['String']['input'];
  userAddress: Scalars['String']['input'];
};

export type SearchAllOrderInput = {
  baseAddress?: InputMaybe<Scalars['String']['input']>;
  chain?: InputMaybe<ChainType>;
  excludeOrderType?: InputMaybe<OrderType>;
  fromTime?: InputMaybe<Scalars['Int']['input']>;
  isXStock?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderType?: InputMaybe<OrderType>;
  sortDir?: InputMaybe<SortDirection>;
  sortField?: InputMaybe<OrderSortField>;
  toTime?: InputMaybe<Scalars['Int']['input']>;
  transactionType?: InputMaybe<TransactionType>;
  userAddress: Scalars['ID']['input'];
};

export type SearchCopyTradeOrderInput = {
  baseAddress?: InputMaybe<Scalars['String']['input']>;
  baseSymbol?: InputMaybe<Scalars['String']['input']>;
  chainId: Scalars['String']['input'];
  copyTradeConfigId?: InputMaybe<Scalars['ID']['input']>;
  createdAt?: InputMaybe<SortDirection>;
  currency?: InputMaybe<Currency>;
  maxVolume?: InputMaybe<Scalars['Decimal']['input']>;
  minVolume?: InputMaybe<Scalars['Decimal']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Status>;
  transactionType?: InputMaybe<TransactionType>;
};

export type SearchLastTransactionInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  maxAmount?: InputMaybe<Scalars['Decimal']['input']>;
  minAmount?: InputMaybe<Scalars['Decimal']['input']>;
  token: Scalars['String']['input'];
};

export type SearchMarketDepthInput = {
  chainId: Scalars['String']['input'];
  step: Scalars['Float']['input'];
  token: Scalars['String']['input'];
};

export type SearchOrderInput = {
  baseAddress?: InputMaybe<Scalars['String']['input']>;
  chain?: InputMaybe<ChainType>;
  excludeOrderType?: InputMaybe<OrderType>;
  fromTime?: InputMaybe<Scalars['Int']['input']>;
  isXStock?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderType?: InputMaybe<OrderType>;
  sortDir?: InputMaybe<SortDirection>;
  sortField?: InputMaybe<OrderSortField>;
  status?: InputMaybe<Status>;
  toTime?: InputMaybe<Scalars['Int']['input']>;
  transactionType?: InputMaybe<TransactionType>;
  userAddress: Scalars['ID']['input'];
  userAddresses?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type SearchOrderStatisticInput = {
  token?: InputMaybe<Scalars['String']['input']>;
  userAddress: Scalars['ID']['input'];
};

export type SearchPortfolioInput = {
  hideSmallBalance?: InputMaybe<Scalars['Boolean']['input']>;
  hideSmallLiquidity?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  token?: InputMaybe<Scalars['String']['input']>;
  userAddress: Scalars['ID']['input'];
};

/** Fee details for Solana network */
export type SolanaFee = {
  __typename?: 'SolanaFee';
  autoTipFee?: Maybe<Scalars['Float']['output']>;
  feeAccount: Scalars['String']['output'];
  maxComputeUnits?: Maybe<Scalars['Int']['output']>;
  minTipFee?: Maybe<Scalars['Float']['output']>;
  platformFee: Scalars['Float']['output'];
  priorityFeePrice?: Maybe<PriorityFeePrice>;
  xstockPlatformFee: Scalars['Float']['output'];
};

export enum SortDirection {
  Asc = 'asc',
  Desc = 'desc'
}

export enum Status {
  /** Order has been canceled */
  Canceled = 'Canceled',
  /** Order was successfully submitted on-chain and is now in the finalized status */
  Completed = 'Completed',
  /** Order has been submitted on-chain and has a Confirmed status */
  Confirmed = 'Confirmed',
  /** Only for TrailingTPSL orders, when the order has been triggered */
  Filled = 'Filled',
  /** New order created, not yet submitted on-chain */
  Pending = 'Pending'
}

export enum SubmitEngineType {
  Swap = 'Swap',
  Ultra = 'Ultra'
}

export type Token = {
  __typename?: 'Token';
  Address: Scalars['String']['output'];
  Chain: Scalars['String']['output'];
  MarketCap: Scalars['Decimal']['output'];
  Price: Scalars['Decimal']['output'];
};

/** Blacklisted token information */
export type TokenBlacklist = {
  __typename?: 'TokenBlacklist';
  /** Unique identifier */
  id: Scalars['ID']['output'];
  /** Token address that is blacklisted */
  token: Scalars['String']['output'];
  /** User ID who blacklisted the token */
  userId: Scalars['String']['output'];
};

/** Actions that can be performed on token blacklist. Ex: (Add, Remove, Update) */
export enum TokenBlacklistAction {
  Add = 'Add',
  Remove = 'Remove',
  Update = 'Update'
}

/** Configuration for take profit and stop loss levels */
export type TpSlConfig = {
  __typename?: 'TpSlConfig';
  /** Reference to the parent copy trade config */
  configId: Scalars['ID']['output'];
  /** Unique identifier for the TP/SL config */
  id: Scalars['ID']['output'];
  /** Percentage of position to sell at this level */
  sellRate: Scalars['Float']['output'];
  /** Price value for this TP/SL level */
  value: Scalars['Float']['output'];
};

/** Input for take profit/stop loss configuration */
export type TpSlConfigInput = {
  /** Percentage of position to sell at target price */
  sellRate: Scalars['Float']['input'];
  /** Target price value */
  value: Scalars['Float']['input'];
};

export type TradingConfig = {
  __typename?: 'TradingConfig';
  createdAt?: Maybe<Scalars['Time']['output']>;
  platformFee: Scalars['Float']['output'];
  updatedAt?: Maybe<Scalars['Time']['output']>;
  xstockPlatformFee: Scalars['Float']['output'];
};

export type TradingConfigInput = {
  platformFee: Scalars['Float']['input'];
  xstockPlatformFee: Scalars['Float']['input'];
};

export type TransactionToken = {
  __typename?: 'TransactionToken';
  address: Scalars['String']['output'];
  chainId: Scalars['String']['output'];
  symbol: Scalars['String']['output'];
};

export type TransactionTokenInput = {
  userAddress?: InputMaybe<Scalars['String']['input']>;
  userAddresses?: InputMaybe<Array<Scalars['String']['input']>>;
};

export enum TransactionType {
  Buy = 'Buy',
  Sell = 'Sell'
}

export type UniqueBaseAddress = {
  __typename?: 'UniqueBaseAddress';
  baseAddress: Scalars['String']['output'];
  baseSymbol: Scalars['String']['output'];
};

export type UniqueBaseSymbol = {
  __typename?: 'UniqueBaseSymbol';
  baseAddress: Scalars['String']['output'];
  baseSymbol: Scalars['String']['output'];
};

/** Input for updating copy trade configuration */
export type UpdateCopyTradeConfigInput = {
  /** Type of buy configuration */
  buyType?: InputMaybe<ConfigBuyType>;
  /** Amount to use for trading */
  configAmount?: InputMaybe<Scalars['Decimal']['input']>;
  /** Configuration ID */
  id: Scalars['ID']['input'];
  /** Leader's nickname */
  leaderNickname?: InputMaybe<Scalars['String']['input']>;
  /** Maximum amount of the token to copy trade */
  maxAmount?: InputMaybe<Scalars['Decimal']['input']>;
  /** Maximum burn liquidity of the token to copy trade */
  maxBurnLiquidity?: InputMaybe<Scalars['Decimal']['input']>;
  /** Maximum token creation time filter */
  maxCreationTime?: InputMaybe<Scalars['Time']['input']>;
  /** User only copy trade token created before `maxCreationTimeInt` minutes from the time the leader create the transaction */
  maxCreationTimeInt?: InputMaybe<Scalars['Int']['input']>;
  /** Maximum liquidity of the token to copy trade */
  maxLiquidity?: InputMaybe<Scalars['Decimal']['input']>;
  /** Maximum market cap of the token to copy trade */
  maxMarketCap?: InputMaybe<Scalars['Decimal']['input']>;
  /** Maximum number of purchases per token */
  maxPurchasePerToken?: InputMaybe<Scalars['Int']['input']>;
  /** Whether to enable MEV protection */
  mevProtect?: InputMaybe<Scalars['Boolean']['input']>;
  /** Minimum amount of the token to copy trade */
  minAmount?: InputMaybe<Scalars['Decimal']['input']>;
  /** Minimum burn liquidity of the token to copy trade */
  minBurnLiquidity?: InputMaybe<Scalars['Decimal']['input']>;
  /** Minimum token creation time filter */
  minCreationTime?: InputMaybe<Scalars['Time']['input']>;
  /** User only copy trade token created after `minCreationTimeInt` minutes from the time the leader create the transaction */
  minCreationTimeInt?: InputMaybe<Scalars['Int']['input']>;
  /** Minimum liquidity of the token to copy trade */
  minLiquidity?: InputMaybe<Scalars['Decimal']['input']>;
  /** Minimum market cap of the token to copy trade */
  minMarketCap?: InputMaybe<Scalars['Decimal']['input']>;
  /** Trading platforms to use */
  platform?: InputMaybe<Array<ConfigPlatform>>;
  /** Priority fee price in native token */
  priorityFeePrice?: InputMaybe<Scalars['Decimal']['input']>;
  /** Type of sell configuration */
  sellType?: InputMaybe<ConfigSellType>;
  /** Stop loss percentage */
  sl?: InputMaybe<Scalars['Decimal']['input']>;
  /** Slippage tolerance percentage */
  slippage?: InputMaybe<Scalars['Decimal']['input']>;
  /** Take profit percentage */
  tp?: InputMaybe<Scalars['Decimal']['input']>;
  /** Take profit/stop loss configurations */
  tpslConfig?: InputMaybe<Array<TpSlConfigInput>>;
  /** Whether trailing stop loss is enabled */
  trailingSl?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Input for updating copy trade configuration status */
export type UpdateCopyTradeConfigStatusInput = {
  /** Configuration ID */
  id: Scalars['ID']['input'];
  /** New status to set */
  status: ConfigStatus;
};

/** Input for updating take profit/stop loss configuration */
export type UpdateTpSlConfig = {
  /** Configuration ID */
  id: Scalars['ID']['input'];
  /** Percentage of position to sell at target price */
  sellRate: Scalars['Float']['input'];
  /** Target price value */
  value: Scalars['Float']['input'];
};

/** Input for updating take profit/stop loss configurations */
export type UpdateTpslConfigInput = {
  /** New configurations to add */
  add?: InputMaybe<Array<TpSlConfigInput>>;
  /** Configuration IDs to delete */
  delete?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** Existing configurations to update */
  update?: InputMaybe<Array<UpdateTpSlConfig>>;
};

export type Web3OrderResp = {
  __typename?: 'Web3OrderResp';
  id?: Maybe<Scalars['String']['output']>;
};
