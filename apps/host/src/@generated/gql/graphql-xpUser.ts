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
  DateScalar: { input: any; output: any; }
  DateTime: { input: any; output: any; }
  DecimalScalar: { input: any; output: any; }
  JSONObject: { input: any; output: any; }
};

/** USDC allowance information for Polymarket trading */
export type AllowanceResponseDto = {
  __typename?: 'AllowanceResponseDTO';
  /** Allowance in USDC (human-readable) */
  allowanceUSDC: Scalars['Float']['output'];
  /** Allowance in wei (smallest unit) */
  allowanceWei: Scalars['String']['output'];
  /** Proxy wallet address */
  proxyWallet: Scalars['String']['output'];
};

export type ApproveResponseDto = {
  __typename?: 'ApproveResponseDTO';
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
  transactionId?: Maybe<Scalars['String']['output']>;
};

export type BuyMarketInput = {
  /** Exact USDC amount to spend (100% balance supported) */
  amount: Scalars['Float']['input'];
  /** Fee rate in basis points (0-10000) */
  feeRateBps?: InputMaybe<Scalars['Int']['input']>;
  marketId: Scalars['String']['input'];
  outcome: Outcome;
  /** Token ID for the outcome (YES/NO) */
  tokenId?: InputMaybe<Scalars['String']['input']>;
};

/** CLOB allowance information with sync status */
export type ClobAllowanceResponseDto = {
  __typename?: 'CLOBAllowanceResponseDTO';
  /** Asset type (COLLATERAL or CONDITIONAL) */
  assetType: Scalars['String']['output'];
  /** CLOB cached balance (available for trading) */
  clobBalance: Scalars['String']['output'];
  /** On-chain balance (for COLLATERAL only) */
  onChainBalance?: Maybe<Scalars['String']['output']>;
  /** Reason for sync if performed */
  syncReason?: Maybe<Scalars['String']['output']>;
  /** Token ID for conditional tokens */
  tokenId?: Maybe<Scalars['String']['output']>;
  /** Whether CLOB cache was refreshed/synced */
  wasSynced: Scalars['Boolean']['output'];
};

export type CalculateMarketPriceInput = {
  /** Amount to trade (in USDC for BUY, in shares for SELL) */
  amount: Scalars['Float']['input'];
  /** Market ID */
  marketId: Scalars['String']['input'];
  /** Market outcome (YES or NO) */
  outcome: Outcome;
  /** Order side (BUY or SELL) */
  side: OrderSide;
  /** Token ID for the outcome (optional, will be fetched if not provided) */
  tokenId?: InputMaybe<Scalars['String']['input']>;
};

export type CalculateMarketPriceResponseDto = {
  __typename?: 'CalculateMarketPriceResponseDTO';
  /** Amount requested to trade */
  amount: Scalars['Float']['output'];
  /** Market ID */
  marketId: Scalars['String']['output'];
  /** Calculated average market price (0-1 range) */
  price: Scalars['Float']['output'];
  /** Order side (BUY or SELL) */
  side: OrderSide;
  /** Token ID for the outcome */
  tokenId: Scalars['String']['output'];
  /** Total cost in USDC (for BUY orders) or total USDC received (for SELL orders) */
  totalCost: Scalars['Float']['output'];
};

export type ClaimPositionInput = {
  /** Condition ID of the position to claim */
  conditionId: Scalars['String']['input'];
  /** Token ID of the position to claim */
  tokenId: Scalars['String']['input'];
};

export type ClaimPositionItem = {
  /** Condition ID of the position to claim */
  conditionId: Scalars['String']['input'];
  /** Token ID of the position to claim */
  tokenId: Scalars['String']['input'];
};

export type ClaimPositionsInput = {
  /** Array of positions to claim (minimum 1 position) */
  positions: Array<ClaimPositionItem>;
};

export type ClaimablePositionDto = {
  __typename?: 'ClaimablePositionDTO';
  asset: Scalars['String']['output'];
  conditionId: Scalars['String']['output'];
  currentValue: Scalars['Float']['output'];
  endDate?: Maybe<Scalars['String']['output']>;
  marketSlug: Scalars['String']['output'];
  marketTitle: Scalars['String']['output'];
  outcome: Scalars['String']['output'];
  outcomeIndex: Scalars['Int']['output'];
  size: Scalars['Float']['output'];
  tokenId: Scalars['String']['output'];
};

export type ClaimablePositionsResponseDto = {
  __typename?: 'ClaimablePositionsResponseDTO';
  positions: Array<ClaimablePositionDto>;
  totalClaimable: Scalars['Int']['output'];
  totalValue: Scalars['Float']['output'];
};

export type CreateLimitOrderInput = {
  /** Order expiration timestamp (optional) */
  expiration?: InputMaybe<Scalars['String']['input']>;
  /** Fee rate in basis points (0-10000) */
  feeRateBps?: InputMaybe<Scalars['Int']['input']>;
  marketId: Scalars['String']['input'];
  outcome: Outcome;
  /** Order price (0.01 to 0.99 for predictions) */
  price: Scalars['Float']['input'];
  side: OrderSide;
  /** DEPRECATED: User signature for order authentication. Use Turnkey signing instead. */
  signature?: InputMaybe<Scalars['String']['input']>;
  /** Order size in USDC */
  size: Scalars['Float']['input'];
  /** Token ID for the outcome (YES/NO) */
  tokenId?: InputMaybe<Scalars['String']['input']>;
};

export type CreateMarketOrderInput = {
  /** Fee rate in basis points (0-10000) */
  feeRateBps?: InputMaybe<Scalars['Int']['input']>;
  marketId: Scalars['String']['input'];
  /** Maximum slippage percentage (e.g., 1 for 1%) */
  maxSlippage?: InputMaybe<Scalars['Float']['input']>;
  outcome: Outcome;
  side: OrderSide;
  /** DEPRECATED: User signature for order authentication. Use Turnkey signing instead. */
  signature?: InputMaybe<Scalars['String']['input']>;
  /** Order size in USDC */
  size: Scalars['Float']['input'];
  /** Token ID for the outcome (YES/NO) */
  tokenId?: InputMaybe<Scalars['String']['input']>;
};

export type CrossChainWithdrawInput = {
  /** Destination address on target chain */
  destinationAddress: Scalars['String']['input'];
  /** Quote ID from getWithdrawQuote (user has accepted fees) */
  quoteId: Scalars['String']['input'];
};

export type EnableTradingInput = {
  /** Chain to enable trading on (default: polygon) */
  chain?: InputMaybe<Scalars['String']['input']>;
};

export type EnableTradingResponseDto = {
  __typename?: 'EnableTradingResponseDTO';
  /** Chain where the proxy wallet is deployed */
  chain: Scalars['String']['output'];
  /** Whether the proxy wallet was newly deployed or already existed */
  isNewDeployment: Scalars['Boolean']['output'];
  /** Owner wallet address (EVM address from Turnkey) */
  ownerAddress: Scalars['String']['output'];
  /** Polymarket proxy wallet address */
  proxyWalletAddress: Scalars['String']['output'];
  /** Transaction hash of deployment (if newly deployed) */
  transactionHash?: Maybe<Scalars['String']['output']>;
};

export type FeeBreakdownDto = {
  __typename?: 'FeeBreakdownDTO';
  /** Fee amount in base units */
  amount: Scalars['String']['output'];
  /** Fee amount in USD */
  amountUsd: Scalars['Float']['output'];
};

export type FeesDto = {
  __typename?: 'FeesDTO';
  /** App fee */
  app: FeeBreakdownDto;
  /** Gas fee on origin chain */
  gas: FeeBreakdownDto;
  /** Relayer fee */
  relayer: FeeBreakdownDto;
  /** Relayer gas fee on destination */
  relayerGas: FeeBreakdownDto;
  /** Relayer service fee */
  relayerService: FeeBreakdownDto;
  /** Subsidized amount */
  subsidized?: Maybe<FeeBreakdownDto>;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Approve USDC spending for Polymarket CTF Exchange (required before first order) */
  approvePolymarketUSDC: ApproveResponseDto;
  /** Buy market tokens with exact USDC amount (supports 100% balance) */
  buyPolymarketMarket: OrderResponseDto;
  /** Cancel a specific order */
  cancelPolymarketOrder: ApproveResponseDto;
  /** Claim/redeem a specific winning position from a settled Polymarket market */
  claimPolymarketPosition: RedeemResponseDto;
  /** Batch claim multiple winning positions in a single transaction - more efficient than individual claims */
  claimPolymarketPositions: RedeemResponseDto;
  /** Create a limit order on Polymarket for a prediction market */
  createPolymarketLimitOrder: OrderResponseDto;
  /** Create a market order on Polymarket for immediate execution */
  createPolymarketMarketOrder: OrderResponseDto;
  /** Enable Polymarket trading by creating/deploying proxy wallet */
  enablePolymarketTrading: EnableTradingResponseDto;
  /** Sell market shares at best market price (no price specification needed) */
  sellPolymarketMarket: OrderResponseDto;
  /** Manually trigger recovery service to find and re-queue stuck transactions (for debugging) */
  triggerRecoveryService: Scalars['String']['output'];
  /** Withdraw USDC cross-chain using Relay.link (supports BSC, Ethereum, Arbitrum, Optimism, Base) */
  withdrawPolymarketCrossChain: WithdrawResponseDto;
  /** Withdraw USDC.e from Proxy Wallet to external EVM address */
  withdrawPolymarketUSDC: WithdrawResponseDto;
};


export type MutationBuyPolymarketMarketArgs = {
  input: BuyMarketInput;
};


export type MutationCancelPolymarketOrderArgs = {
  orderId: Scalars['String']['input'];
};


export type MutationClaimPolymarketPositionArgs = {
  input: ClaimPositionInput;
};


export type MutationClaimPolymarketPositionsArgs = {
  input: ClaimPositionsInput;
};


export type MutationCreatePolymarketLimitOrderArgs = {
  input: CreateLimitOrderInput;
};


export type MutationCreatePolymarketMarketOrderArgs = {
  input: CreateMarketOrderInput;
};


export type MutationEnablePolymarketTradingArgs = {
  input: EnableTradingInput;
};


export type MutationSellPolymarketMarketArgs = {
  input: SellMarketInput;
};


export type MutationWithdrawPolymarketCrossChainArgs = {
  input: CrossChainWithdrawInput;
};


export type MutationWithdrawPolymarketUsdcArgs = {
  input: WithdrawInput;
};

export type OpenOrderDto = {
  __typename?: 'OpenOrderDTO';
  asset_id?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['Float']['output']>;
  expiration?: Maybe<Scalars['Float']['output']>;
  market?: Maybe<Scalars['String']['output']>;
  marketInfo?: Maybe<OpenOrderMarketInfoDto>;
  orderID: Scalars['String']['output'];
  price: Scalars['String']['output'];
  side: Scalars['String']['output'];
  size: Scalars['String']['output'];
  sizeFilled: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type OpenOrderMarketInfoDto = {
  __typename?: 'OpenOrderMarketInfoDTO';
  clobTokenIds?: Maybe<Array<Scalars['String']['output']>>;
  conditionId?: Maybe<Scalars['String']['output']>;
  eventSlug?: Maybe<Scalars['String']['output']>;
  groupItemTitle?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  outcomes?: Maybe<Array<Scalars['String']['output']>>;
  question?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
};

export type OrderResponseDto = {
  __typename?: 'OrderResponseDTO';
  avgFillPrice?: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['DateTime']['output'];
  errorMessage?: Maybe<Scalars['String']['output']>;
  /** Percentage of order filled (0-100). Always 100 for market orders when matched. */
  fillPercentage?: Maybe<Scalars['Float']['output']>;
  filledSize?: Maybe<Scalars['Float']['output']>;
  /** True if limit order is partially matched (not terminal), false for terminal states or market orders */
  isPartiallyFilled?: Maybe<Scalars['Boolean']['output']>;
  marketId: Scalars['String']['output'];
  marketTitle?: Maybe<Scalars['String']['output']>;
  matchedSize?: Maybe<Scalars['Float']['output']>;
  orderId: Scalars['String']['output'];
  orderType: OrderType;
  outcome: Outcome;
  /** Polymarket order response data (only for matched FOK orders) */
  polymarketOrder?: Maybe<PolymarketOrderDto>;
  price?: Maybe<Scalars['Float']['output']>;
  side: OrderSide;
  size: Scalars['Float']['output'];
  status: OrderStatus;
  transactionHash?: Maybe<Scalars['String']['output']>;
};

/** Order side (BUY, SELL) */
export enum OrderSide {
  Buy = 'BUY',
  Sell = 'SELL'
}

/** Order status (PENDING, LIVE, MATCHED, MINED, CONFIRMED, FILLED, CANCELLED, FAILED) */
export enum OrderStatus {
  Cancelled = 'CANCELLED',
  Confirmed = 'CONFIRMED',
  Failed = 'FAILED',
  Filled = 'FILLED',
  Live = 'LIVE',
  Matched = 'MATCHED',
  Mined = 'MINED',
  Pending = 'PENDING'
}

/** Order type (LIMIT, MARKET) */
export enum OrderType {
  Limit = 'LIMIT',
  Market = 'MARKET'
}

/** Prediction outcome (YES, NO) */
export enum Outcome {
  No = 'NO',
  Yes = 'YES'
}

export type PolymarketDepositAddress = {
  __typename?: 'PolymarketDepositAddress';
  chainId: Scalars['String']['output'];
  chainName: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  depositAddress: Scalars['String']['output'];
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  memo?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  userId: Scalars['String']['output'];
};

export type PolymarketOrderDto = {
  __typename?: 'PolymarketOrderDTO';
  makingAmount: Scalars['String']['output'];
  orderID: Scalars['String']['output'];
  status: Scalars['String']['output'];
  takingAmount: Scalars['String']['output'];
  transactionsHashes: Array<Scalars['String']['output']>;
};

export type PolymarketPositionDto = {
  __typename?: 'PolymarketPositionDTO';
  /** Token ID (asset address) */
  asset: Scalars['String']['output'];
  /** Available shares */
  availableSize: Scalars['Float']['output'];
  /** Available value (availableSize * currentPrice) */
  availableValue: Scalars['Float']['output'];
  /** Condition ID from CTF protocol */
  conditionId: Scalars['String']['output'];
  /** Current price per share */
  currentPrice: Scalars['Float']['output'];
  /** Market end date (ISO 8601) */
  endDate?: Maybe<Scalars['String']['output']>;
  /** Market ID */
  marketId: Scalars['String']['output'];
  /** Market slug for URLs */
  marketSlug: Scalars['String']['output'];
  /** Market title/description */
  marketTitle: Scalars['String']['output'];
  /** Outcome (YES/NO) */
  outcome: Scalars['String']['output'];
  /** Outcome index (0 or 1) */
  outcomeIndex: Scalars['Int']['output'];
  /** Total shares held */
  size: Scalars['Float']['output'];
  /** Total position value (size * currentPrice) */
  totalValue: Scalars['Float']['output'];
};

export type PolymarketPositionsResponseDto = {
  __typename?: 'PolymarketPositionsResponseDTO';
  /** List of open positions */
  positions: Array<PolymarketPositionDto>;
  /** Total number of positions */
  totalPositions: Scalars['Int']['output'];
  /** Total value of all positions */
  totalValue: Scalars['Float']['output'];
};

export type ProxyWalletResponseDto = {
  __typename?: 'ProxyWalletResponseDTO';
  /** Polymarket proxy wallet address */
  proxyWallet: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  /** Calculate expected market price for an order without placing it */
  calculatePolymarketPrice: CalculateMarketPriceResponseDto;
  /** Get active limit orders from database (PENDING or partially filled MATCHED orders) */
  getActiveLimitOrders: Array<OrderResponseDto>;
  /** Get CLOB allowance and sync with on-chain if out of sync */
  getCLOBAllowanceAndSync: ClobAllowanceResponseDto;
  getErrorMessages: Scalars['JSONObject']['output'];
  /** Get funding wallet transfer history for the authenticated user */
  getFundingWalletHistory: Array<WalletTransferItem>;
  /** Get claimable (redeemable) positions from settled Polymarket markets */
  getPolymarketClaimablePositions: ClaimablePositionsResponseDto;
  /** Get deposit address for a specific chain */
  getPolymarketDepositAddress: PolymarketDepositAddress;
  /** Get all open/active orders for the authenticated user from Polymarket CLOB */
  getPolymarketOpenOrders: Array<OpenOrderDto>;
  /** Get a specific order by ID from Polymarket CLOB */
  getPolymarketOrder?: Maybe<OpenOrderDto>;
  /** Get open Polymarket positions */
  getPolymarketPositions: PolymarketPositionsResponseDto;
  /** Get Polymarket proxy wallet address for the authenticated user */
  getPolymarketProxyWallet: ProxyWalletResponseDto;
  /** Get Polymarket relayer transaction status (supports single or multiple transaction IDs) */
  getPolymarketRelayerStatus: RelayerStatusBatchResponseDto;
  /** Get list of supported assets for Polymarket deposits */
  getPolymarketSupportedAssets: Array<SupportedAsset>;
  /** Get current USDC allowance for Polymarket CTF Exchange */
  getPolymarketUSDCAllowance: AllowanceResponseDto;
  /** Get all deposit addresses for the authenticated user */
  getPolymarketUserDepositAddresses: Array<PolymarketDepositAddress>;
  /** Get user credentials for frontend websocket and relayer operations */
  getUserCredentials: UserCredentialsResponseDto;
  /** Get user EOA wallet address for balance checking */
  getUserWalletAddress: Scalars['String']['output'];
  /** Get a specific withdraw by relayer transaction ID */
  getWithdraw?: Maybe<WithdrawHistoryDto>;
  /** Get withdraw history for the authenticated user */
  getWithdrawHistory: Array<WithdrawHistoryDto>;
  /** Get cross-chain withdraw quote from Relay.link for multi-chain withdrawals */
  getWithdrawQuote: WithdrawQuoteDto;
  /** Get withdraw statistics for the authenticated user */
  getWithdrawStats: Array<WithdrawStatsDto>;
  /** Get list of supported assets/tokens for cross-chain withdrawals via Relay.link */
  supportedRelayAssets: Array<RelayAsset>;
  /** Get list of supported chains for cross-chain withdrawals via Relay.link */
  supportedRelayChains: Array<RelayChain>;
};


export type QueryCalculatePolymarketPriceArgs = {
  input: CalculateMarketPriceInput;
};


export type QueryGetActiveLimitOrdersArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  marketId?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Float']['input']>;
};


export type QueryGetClobAllowanceAndSyncArgs = {
  forceRefresh?: InputMaybe<Scalars['Boolean']['input']>;
  tokenId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetFundingWalletHistoryArgs = {
  input: SearchFundingWalletTransferHistory;
};


export type QueryGetPolymarketClaimablePositionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetPolymarketDepositAddressArgs = {
  chainId: Scalars['String']['input'];
};


export type QueryGetPolymarketOpenOrdersArgs = {
  marketId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetPolymarketOrderArgs = {
  orderId: Scalars['String']['input'];
};


export type QueryGetPolymarketRelayerStatusArgs = {
  transactionIds: Array<Scalars['String']['input']>;
};


export type QueryGetPolymarketSupportedAssetsArgs = {
  chainId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetWithdrawArgs = {
  relayerTransactionId: Scalars['String']['input'];
};


export type QueryGetWithdrawHistoryArgs = {
  fromChainId?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Float']['input']>;
  skip?: InputMaybe<Scalars['Float']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  toChainId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetWithdrawQuoteArgs = {
  amount: Scalars['String']['input'];
  fromChainId: Scalars['Int']['input'];
  toAddress: Scalars['String']['input'];
  toChainId: Scalars['Int']['input'];
  toTokenAddress?: InputMaybe<Scalars['String']['input']>;
};

export type RedeemResponseDto = {
  __typename?: 'RedeemResponseDTO';
  message: Scalars['String']['output'];
  redeemedPositions?: Maybe<Scalars['Int']['output']>;
  success: Scalars['Boolean']['output'];
  transactionHash?: Maybe<Scalars['String']['output']>;
};

export type RelayAsset = {
  __typename?: 'RelayAsset';
  address: Scalars['String']['output'];
  chainId: Scalars['Int']['output'];
  decimals: Scalars['Int']['output'];
  iconUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  symbol: Scalars['String']['output'];
};

export type RelayChain = {
  __typename?: 'RelayChain';
  chainId: Scalars['Int']['output'];
  currencySymbol?: Maybe<Scalars['String']['output']>;
  displayName?: Maybe<Scalars['String']['output']>;
  explorerUrl?: Maybe<Scalars['String']['output']>;
  iconUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  rpcUrl?: Maybe<Scalars['String']['output']>;
};

/** Batch response for multiple relayer transaction statuses */
export type RelayerStatusBatchResponseDto = {
  __typename?: 'RelayerStatusBatchResponseDTO';
  /** Array of transaction statuses */
  transactions: Array<RelayerStatusResponseDto>;
};

/** Polymarket relayer transaction status */
export type RelayerStatusResponseDto = {
  __typename?: 'RelayerStatusResponseDTO';
  /** Creation timestamp (ISO 8601) */
  createdAt?: Maybe<Scalars['String']['output']>;
  /** Transaction data */
  data?: Maybe<Scalars['String']['output']>;
  /** From address */
  from?: Maybe<Scalars['String']['output']>;
  /** Error message if state is STATE_UNKNOWN */
  message?: Maybe<Scalars['String']['output']>;
  /** Additional metadata (funwithdraw, fundeposit, order, etc.) */
  metadata?: Maybe<Scalars['String']['output']>;
  /** Transaction nonce */
  nonce?: Maybe<Scalars['String']['output']>;
  /** Owner address */
  owner?: Maybe<Scalars['String']['output']>;
  /** Proxy wallet address */
  proxyAddress?: Maybe<Scalars['String']['output']>;
  /** Transaction signature */
  signature?: Maybe<Scalars['String']['output']>;
  /** Current state of the transaction */
  state: Scalars['String']['output'];
  /** To address */
  to?: Maybe<Scalars['String']['output']>;
  /** On-chain transaction hash (null if not yet confirmed) */
  transactionHash?: Maybe<Scalars['String']['output']>;
  /** Relayer transaction ID */
  transactionId: Scalars['String']['output'];
  /** Transaction type (SAFE) */
  type?: Maybe<Scalars['String']['output']>;
  /** Last update timestamp (ISO 8601) */
  updatedAt?: Maybe<Scalars['String']['output']>;
  /** Transaction value */
  value?: Maybe<Scalars['String']['output']>;
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

export type SellMarketInput = {
  /** Fee rate in basis points (default: 0) */
  feeRateBps?: InputMaybe<Scalars['Int']['input']>;
  /** Market ID (contract address) */
  marketId: Scalars['String']['input'];
  /** Outcome to sell (YES or NO) */
  outcome: Outcome;
  /** Number of shares to sell */
  size: Scalars['Float']['input'];
  /** Token ID (optional, auto-resolved from marketId + outcome) */
  tokenId?: InputMaybe<Scalars['String']['input']>;
};

export type SupportedAsset = {
  __typename?: 'SupportedAsset';
  /** Chain ID */
  chainId: Scalars['String']['output'];
  /** Chain name (e.g., Ethereum, Polygon) */
  chainName: Scalars['String']['output'];
  /** Minimum checkout amount in USD */
  minCheckoutUsd: Scalars['Float']['output'];
  /** Token information */
  token: SupportedAssetToken;
};

export type SupportedAssetToken = {
  __typename?: 'SupportedAssetToken';
  /** Token contract address */
  address: Scalars['String']['output'];
  /** Token decimals */
  decimals: Scalars['Float']['output'];
  /** Token name */
  name: Scalars['String']['output'];
  /** Token symbol */
  symbol: Scalars['String']['output'];
};

/** Transfer status (Success, Failed) */
export enum TransferStatus {
  Failed = 'FAILED',
  Processing = 'PROCESSING',
  Success = 'SUCCESS'
}

/** Transfer type (Withdraw, Deposit, Other) */
export enum TransferType {
  Deposit = 'DEPOSIT',
  DepositFuture = 'DEPOSIT_FUTURE',
  DepositFutureExternal = 'DEPOSIT_FUTURE_EXTERNAL',
  Other = 'OTHER',
  Swap = 'SWAP',
  Withdraw = 'WITHDRAW',
  WithdrawFuture = 'WITHDRAW_FUTURE',
  WithdrawFutureExternal = 'WITHDRAW_FUTURE_EXTERNAL'
}

/** User credentials for frontend websocket and relayer operations */
export type UserCredentialsResponseDto = {
  __typename?: 'UserCredentialsResponseDTO';
  /** Polymarket CLOB API key */
  apiKey: Scalars['String']['output'];
  /** Polymarket CLOB API passphrase */
  apiPassphrase: Scalars['String']['output'];
  /** Polymarket CLOB API secret */
  apiSecret: Scalars['String']['output'];
  /** Chain ID for Polygon network */
  chainId: Scalars['Float']['output'];
  /** Proxy wallet address for signing transactions (empty if not enabled) */
  proxyWalletAddress: Scalars['String']['output'];
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

export type WithdrawFeeDto = {
  __typename?: 'WithdrawFeeDTO';
  amount?: Maybe<Scalars['String']['output']>;
  amountUsd?: Maybe<Scalars['Float']['output']>;
};

export type WithdrawFeesDto = {
  __typename?: 'WithdrawFeesDTO';
  app?: Maybe<WithdrawFeeDto>;
  gas?: Maybe<WithdrawFeeDto>;
  relayer?: Maybe<WithdrawFeeDto>;
  relayerGas?: Maybe<WithdrawFeeDto>;
  relayerService?: Maybe<WithdrawFeeDto>;
  subsidized?: Maybe<WithdrawFeeDto>;
};

/** Withdraw history record */
export type WithdrawHistoryDto = {
  __typename?: 'WithdrawHistoryDTO';
  /** Amount in base units */
  amount: Scalars['String']['output'];
  /** Human-readable amount */
  amountFormatted: Scalars['String']['output'];
  /** Creation timestamp */
  createdAt: Scalars['String']['output'];
  /** Error message if failed */
  errorMessage?: Maybe<Scalars['String']['output']>;
  /** Estimated checkout time in ms */
  estCheckoutTimeMs?: Maybe<Scalars['Float']['output']>;
  /** Estimated total amount */
  estTotalFromAmount?: Maybe<Scalars['String']['output']>;
  /** Estimated total USD */
  estTotalUsd?: Maybe<Scalars['Float']['output']>;
  /** Exchange rate */
  exchangeRate?: Maybe<Scalars['Float']['output']>;
  /** Fee breakdown */
  fees?: Maybe<WithdrawFeesDto>;
  /** Final destination amount */
  finalToAmountBaseUnit?: Maybe<Scalars['String']['output']>;
  /** Source chain ID */
  fromChainId: Scalars['String']['output'];
  /** Source token address */
  fromTokenAddress: Scalars['String']['output'];
  /** Fun.xyz quote ID */
  quoteId?: Maybe<Scalars['String']['output']>;
  /** Recipient address */
  recipientAddress: Scalars['String']['output'];
  /** Relayer transaction ID */
  relayerTransactionId: Scalars['String']['output'];
  /** Current status */
  status: Scalars['String']['output'];
  /** Destination chain ID */
  toChainId: Scalars['String']['output'];
  /** Destination token address */
  toTokenAddress: Scalars['String']['output'];
  /** Blockchain transaction hash */
  transactionHash?: Maybe<Scalars['String']['output']>;
  /** Last update timestamp */
  updatedAt: Scalars['String']['output'];
  /** User ID */
  userId: Scalars['String']['output'];
};

export type WithdrawInput = {
  /** Amount of USDC to withdraw. If null, withdraws MAX available balance. */
  amount?: InputMaybe<Scalars['Float']['input']>;
  /** Destination EVM address (must be a valid 0x address) */
  destinationAddress: Scalars['String']['input'];
};

/** Cross-chain withdraw quote from Relay.link */
export type WithdrawQuoteDto = {
  __typename?: 'WithdrawQuoteDTO';
  /** Estimated checkout time in milliseconds */
  estCheckoutTimeMs: Scalars['Int']['output'];
  /** Total amount from origin (formatted) */
  estTotalFromAmount: Scalars['String']['output'];
  /** Total amount in USD */
  estTotalUsd: Scalars['Float']['output'];
  /** Exchange rate */
  exchangeRate?: Maybe<Scalars['Float']['output']>;
  /** Fee breakdown */
  fees: FeesDto;
  /** Final amount on destination (base units) */
  finalToAmountBaseUnit: Scalars['String']['output'];
  /** Origin chain ID */
  fromChainId: Scalars['Int']['output'];
  /** From token symbol */
  fromTokenSymbol: Scalars['String']['output'];
  /** Relay quote/request ID */
  quoteId: Scalars['String']['output'];
  /** Destination chain ID */
  toChainId: Scalars['Int']['output'];
  /** To token symbol */
  toTokenSymbol: Scalars['String']['output'];
};

export type WithdrawResponseDto = {
  __typename?: 'WithdrawResponseDTO';
  amount: Scalars['Float']['output'];
  destination: Scalars['String']['output'];
  /** Message or info about the withdrawal */
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
  /** Relayer Task ID for tracking status */
  transactionId: Scalars['String']['output'];
};

/** Withdraw statistics */
export type WithdrawStatsDto = {
  __typename?: 'WithdrawStatsDTO';
  /** Status */
  _id: Scalars['String']['output'];
  /** Count */
  count: Scalars['Float']['output'];
  /** Total amount in USD */
  totalAmountUsd: Scalars['Float']['output'];
};
