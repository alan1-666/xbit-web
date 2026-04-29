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

export type Action = {
  __typename?: 'Action';
  parameters: ActionParameters;
  type: Scalars['String']['output'];
};

export type ActionParameters = {
  __typename?: 'ActionParameters';
  amount: Scalars['String']['output'];
  destination: Scalars['String']['output'];
  destinationDex: Scalars['String']['output'];
  fromSubAccount: Scalars['String']['output'];
  hyperliquidChain: Scalars['String']['output'];
  nonce: Scalars['Int']['output'];
  sourceDex: Scalars['String']['output'];
  token: Scalars['String']['output'];
};

export type AlertSymbolSetting = {
  __typename?: 'AlertSymbolSetting';
  isActivated: Scalars['Boolean']['output'];
  isReminderOnce: Scalars['Boolean']['output'];
  settingId: Scalars['String']['output'];
  symbol: Scalars['String']['output'];
  triggerValue: Scalars['Float']['output'];
  type: NotificationTypeEnum;
};

export type Asset = {
  __typename?: 'Asset';
  address: Scalars['String']['output'];
  blockchain: Scalars['String']['output'];
  symbol: Scalars['String']['output'];
};

export type Banner = {
  __typename?: 'Banner';
  category: Scalars['String']['output'];
  clickCount: Scalars['Int']['output'];
  createdAt: Scalars['String']['output'];
  displaySetting: DisplaySetting;
  enImage1Url: Scalars['String']['output'];
  enImageUrl: Scalars['String']['output'];
  endAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  platform: Platform;
  route: Scalars['String']['output'];
  sortIndex: Scalars['Int']['output'];
  startAt: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['String']['output']>;
  zhImage1Url: Scalars['String']['output'];
  zhImageUrl: Scalars['String']['output'];
};

export type BannerResponse = {
  __typename?: 'BannerResponse';
  data: Banner;
  message: Scalars['String']['output'];
};

export type BannersResponse = {
  __typename?: 'BannersResponse';
  data: Array<Banner>;
  message: Scalars['String']['output'];
};

export type BridgeExtra = {
  __typename?: 'BridgeExtra';
  destTx: Scalars['String']['output'];
  requireRefundAction: Scalars['Boolean']['output'];
  srcTx: Scalars['String']['output'];
};

export type CallBackRequest = {
  requestId: Scalars['String']['input'];
  step: Scalars['Int']['input'];
  txHash: Scalars['String']['input'];
};

export type CallBackResponse = {
  __typename?: 'CallBackResponse';
  success: Scalars['String']['output'];
};

export type CallbackUserBalanceRequest = {
  walletAddress: Scalars['String']['input'];
};

export type CallbackUserBalanceResponse = {
  __typename?: 'CallbackUserBalanceResponse';
  error?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
};

export type CategoryResponse = {
  __typename?: 'CategoryResponse';
  categories: Array<Maybe<Scalars['String']['output']>>;
};

export type Chain = {
  __typename?: 'Chain';
  chainId: Scalars['String']['output'];
  chainImage: Scalars['String']['output'];
  chainName: Scalars['String']['output'];
  tokens: Array<TokenV2>;
};

export type ChainInfo = {
  __typename?: 'ChainInfo';
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
};

export enum ChainType {
  Arb = 'ARB',
  Bsc = 'BSC',
  Evm = 'EVM',
  Polygon = 'POLYGON',
  Solana = 'SOLANA',
  Tron = 'TRON'
}

export type ChainsManagementResponse = {
  __typename?: 'ChainsManagementResponse';
  data: Array<ChainInfo>;
  total: Scalars['Int']['output'];
};

export type CheckApprovalRequest = {
  requestId: Scalars['String']['input'];
  txHash: Scalars['String']['input'];
};

export type CheckApprovalResponse = {
  __typename?: 'CheckApprovalResponse';
  currentApprovedAmount: Scalars['String']['output'];
  isApproved: Scalars['Boolean']['output'];
  requiredApprovedAmount: Scalars['String']['output'];
  txStatus: Scalars['String']['output'];
};

export type CheckStatusRequest = {
  requestId: Scalars['String']['input'];
  step: Scalars['Int']['input'];
  txHash: Scalars['String']['input'];
};

export type CheckStatusResponse = {
  __typename?: 'CheckStatusResponse';
  bridgeExtra: BridgeExtra;
  diagnosisUrl?: Maybe<Scalars['String']['output']>;
  error?: Maybe<Scalars['String']['output']>;
  errorCode?: Maybe<Scalars['Int']['output']>;
  explorerUrl?: Maybe<Array<Maybe<ExplorerInfo>>>;
  extraMessage?: Maybe<Scalars['String']['output']>;
  failedType?: Maybe<Scalars['String']['output']>;
  newTx?: Maybe<CheckStatusTx>;
  outputAmount: Scalars['String']['output'];
  outputToken: OutputToken;
  outputType: Scalars['String']['output'];
  referrals?: Maybe<Array<Maybe<Referral>>>;
  status: Scalars['String']['output'];
  steps?: Maybe<Scalars['JSON']['output']>;
  timestamp: Scalars['Int']['output'];
  traceId?: Maybe<Scalars['Int']['output']>;
};

export type CheckStatusTx = {
  __typename?: 'CheckStatusTx';
  data: Scalars['String']['output'];
  gasLimit: Scalars['String']['output'];
  gasPrice: Scalars['String']['output'];
  nonce: Scalars['String']['output'];
  to: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type ConfirmRouteRequest = {
  destination: Scalars['String']['input'];
  requestId: Scalars['String']['input'];
  selectedWallets: Array<SelectedWallet>;
};

export type ConfirmRouteResponse = {
  __typename?: 'ConfirmRouteResponse';
  requestId: Scalars['String']['output'];
  routeErr?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
};

export type CreateAlertSymbolSettingRequest = {
  isReminderOnce: Scalars['Boolean']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  symbol: Scalars['String']['input'];
  type: NotificationTypeEnum;
  value: Scalars['Float']['input'];
};

export type CreateAlertSymbolSettingResponse = {
  __typename?: 'CreateAlertSymbolSettingResponse';
  error?: Maybe<Scalars['String']['output']>;
  settingId: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type CreateTxRequest = {
  requestId: Scalars['String']['input'];
  step: Scalars['Int']['input'];
  userSettings: UserSettingsRequest;
  validations: ValidationsRequest;
};

export type CreateTxResponse = {
  __typename?: 'CreateTxResponse';
  error?: Maybe<Scalars['String']['output']>;
  errorCode: Scalars['Int']['output'];
  ok: Scalars['Boolean']['output'];
  signUserTransactionEvm: SignUserTransactionEvmResponse;
  traceId: Scalars['Int']['output'];
  transaction?: Maybe<Transaction>;
};

export type DeleteAlertSymbolSettingRequest = {
  settingIds: Array<Scalars['String']['input']>;
};

export type DeleteAlertSymbolSettingResponse = {
  __typename?: 'DeleteAlertSymbolSettingResponse';
  error?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
};

export enum DisplaySetting {
  All = 'ALL',
  Meme = 'MEME',
  Perp = 'PERP',
  Spot = 'SPOT',
  Xstocks = 'XSTOCKS'
}

export type Eip712TypeField = {
  __typename?: 'Eip712TypeField';
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type Eip712Types = {
  __typename?: 'Eip712Types';
  hyperliquidTransactionSendAsset: Array<Eip712TypeField>;
};

export type ExchangeMetaResponse = {
  __typename?: 'ExchangeMetaResponse';
  chains: Array<Chain>;
};

export type ExplorerInfo = {
  __typename?: 'ExplorerInfo';
  description: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type FavoriteSymbolsResponse = {
  __typename?: 'FavoriteSymbolsResponse';
  list: Array<Maybe<Symbol>>;
};

export type Fee = {
  __typename?: 'Fee';
  amount: Scalars['String']['output'];
  asset: Asset;
  expenseType: Scalars['String']['output'];
  meta?: Maybe<Meta>;
  name: Scalars['String']['output'];
  price: Scalars['Float']['output'];
};

export type FeeConfigItem = {
  __typename?: 'FeeConfigItem';
  feeBps: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type FeeRateConfigResponse = {
  __typename?: 'FeeRateConfigResponse';
  data: Array<FeeConfigItem>;
  total: Scalars['Int']['output'];
};

export type FromTo = {
  __typename?: 'FromTo';
  address: Scalars['String']['output'];
  blockchain: Scalars['String']['output'];
  symbol: Scalars['String']['output'];
};

export type GenerateCloidInput = {
  count?: InputMaybe<Scalars['Int']['input']>;
};

export type GenerateCloidResponse = {
  __typename?: 'GenerateCloidResponse';
  cloids: Array<Scalars['String']['output']>;
  count: Scalars['Int']['output'];
};

export type GetAlertSymbolSettingResponse = {
  __typename?: 'GetAlertSymbolSettingResponse';
  settings: Array<Maybe<AlertSymbolSetting>>;
};

export type GetAllPossibleRoutesRequest = {
  amount: Scalars['String']['input'];
  fromBlockchain: Scalars['String']['input'];
  fromSymbol: Scalars['String']['input'];
  fromTokenAddress?: InputMaybe<Scalars['String']['input']>;
  slippage: Scalars['String']['input'];
  toBlockchain: Scalars['String']['input'];
  toSymbol: Scalars['String']['input'];
  toTokenAddress?: InputMaybe<Scalars['String']['input']>;
};

export type GetAllPossibleRoutesResponse = {
  __typename?: 'GetAllPossibleRoutesResponse';
  diagnosisMessages: Array<Scalars['String']['output']>;
  error?: Maybe<Scalars['String']['output']>;
  errorCode: Scalars['Int']['output'];
  from: FromTo;
  requestAmount: Scalars['String']['output'];
  results: Array<Result>;
  routeId: Scalars['String']['output'];
  to: FromTo;
  traceId: Scalars['Int']['output'];
};

export type GetBannerInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  platform?: InputMaybe<Platform>;
};

export type GetBestRouteRequest = {
  amount: Scalars['String']['input'];
  fromAddress: Scalars['String']['input'];
  fromBlockChain: Scalars['String']['input'];
  fromSymbol: Scalars['String']['input'];
  fromTokenAddress?: InputMaybe<Scalars['String']['input']>;
  toAddress: Scalars['String']['input'];
  toBlockChain: Scalars['String']['input'];
  toSymbol: Scalars['String']['input'];
  toTokenAddress?: InputMaybe<Scalars['String']['input']>;
};

export type GetBestRouteResponse = {
  __typename?: 'GetBestRouteResponse';
  diagnosisMessages: Array<Scalars['String']['output']>;
  error?: Maybe<Scalars['String']['output']>;
  errorCode?: Maybe<Scalars['String']['output']>;
  from: FromTo;
  missingBlockchains: Array<Scalars['String']['output']>;
  requestAmount: Scalars['String']['output'];
  requestId: Scalars['String']['output'];
  result: Result;
  to: FromTo;
  traceId?: Maybe<Scalars['String']['output']>;
  validationStatus: Scalars['String']['output'];
  walletNotSupportingFromBlockchain: Scalars['Boolean']['output'];
};

export type GetRelayConfigResponse = {
  __typename?: 'GetRelayConfigResponse';
  enabled: Scalars['Boolean']['output'];
  fee: Scalars['String']['output'];
  solver: SolverConfig;
  supportsExternalLiquidity: Scalars['Boolean']['output'];
  user: UserConfig;
};

export enum Grouping {
  Na = 'na',
  NormalTpsl = 'normalTpsl',
  PositionTpsl = 'positionTpsl'
}

export type History = {
  __typename?: 'History';
  diagnosisMessages?: Maybe<Scalars['String']['output']>;
  failReason?: Maybe<Scalars['String']['output']>;
  fromAddress: Scalars['String']['output'];
  fromBlockchain: Scalars['String']['output'];
  fromSymbol: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  missingBlockchains?: Maybe<Scalars['String']['output']>;
  outputAmount: Scalars['String']['output'];
  requestAmount: Scalars['String']['output'];
  requestId: Scalars['String']['output'];
  resultType: Scalars['String']['output'];
  status: Scalars['String']['output'];
  step: Scalars['Int']['output'];
  swaps?: Maybe<Array<RangoSwaps>>;
  toAddress: Scalars['String']['output'];
  toBlockchain: Scalars['String']['output'];
  toSymbol: Scalars['String']['output'];
  userAddress: Scalars['String']['output'];
  validationStatus: Scalars['String']['output'];
  walletNotSupportingFromBlockchain: Scalars['Boolean']['output'];
};

export type HistoryRequest = {
  address: Scalars['String']['input'];
  blockchain: Scalars['String']['input'];
  endTime?: InputMaybe<Scalars['Int']['input']>;
  page: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
  startTime?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type HistoryResponse = {
  __typename?: 'HistoryResponse';
  list: Array<History>;
  total: Scalars['Int']['output'];
};

export type HotSearch = {
  __typename?: 'HotSearch';
  board: HotSearchBoard;
  chainId?: Maybe<Scalars['String']['output']>;
  displayText: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  mode: HotSearchMode;
  operator?: Maybe<Scalars['String']['output']>;
  showFlame: Scalars['Boolean']['output'];
  status: HotSearchStatus;
  symbol?: Maybe<Scalars['String']['output']>;
  tokenContract?: Maybe<Scalars['String']['output']>;
  tokenName?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['String']['output'];
};

export enum HotSearchBoard {
  Contract = 'CONTRACT',
  Meme = 'MEME',
  Ustock = 'USTOCK'
}

export type HotSearchFilter = {
  board?: InputMaybe<HotSearchBoard>;
  chainId?: InputMaybe<Scalars['String']['input']>;
};

export type HotSearchListResponse = {
  __typename?: 'HotSearchListResponse';
  data: Array<HotSearch>;
  message?: Maybe<Scalars['String']['output']>;
};

export enum HotSearchMode {
  Custom = 'CUSTOM',
  DefaultText = 'DEFAULT_TEXT',
  SystemAuto = 'SYSTEM_AUTO'
}

export enum HotSearchStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE'
}

export type Instruction = {
  __typename?: 'Instruction';
  data: Scalars['String']['output'];
  keys: Array<InstructionKey>;
  programId: Scalars['String']['output'];
};

export type InstructionKey = {
  __typename?: 'InstructionKey';
  isSigner: Scalars['Boolean']['output'];
  isWritable: Scalars['Boolean']['output'];
  pubkey: Scalars['String']['output'];
};

export type InternalSwaps = {
  __typename?: 'InternalSwaps';
  estimatedTimeInSeconds: Scalars['Int']['output'];
  fee: Array<Fee>;
  from: TokenInfo;
  fromAmount: Scalars['String']['output'];
  fromAmountMaxValue?: Maybe<Scalars['String']['output']>;
  fromAmountMinValue?: Maybe<Scalars['String']['output']>;
  fromAmountPrecision: Scalars['String']['output'];
  fromAmountRestrictionType?: Maybe<Scalars['String']['output']>;
  includesDestinationTx: Scalars['Boolean']['output'];
  internalSwaps: Array<InternalSwaps>;
  maxRequiredSign: Scalars['Int']['output'];
  recommendedSlippage: Scalars['String']['output'];
  routes: Array<Route>;
  swapChainType: Scalars['String']['output'];
  swapperId: Scalars['String']['output'];
  swapperLogo: Scalars['String']['output'];
  swapperType: Scalars['String']['output'];
  timeStat: Scalars['String']['output'];
  to: TokenInfo;
  toAmount: Scalars['String']['output'];
  warnings: Scalars['String']['output'];
};

export enum Language {
  En = 'EN',
  Hk = 'HK',
  Zh = 'ZH'
}

export type Leverage = {
  __typename?: 'Leverage';
  type: Scalars['String']['output'];
  value: Scalars['Int']['output'];
};

export type LogTransactionInput = {
  avgPx?: InputMaybe<Scalars['String']['input']>;
  baseCoin?: InputMaybe<Scalars['String']['input']>;
  cloid?: InputMaybe<Scalars['String']['input']>;
  created?: InputMaybe<Scalars['String']['input']>;
  grouping?: InputMaybe<Grouping>;
  oid?: InputMaybe<Scalars['String']['input']>;
  operation?: InputMaybe<Operation>;
  orderStatus?: InputMaybe<OrderStatus>;
  orderType?: InputMaybe<OrderType>;
  price?: InputMaybe<Scalars['String']['input']>;
  side?: InputMaybe<Side>;
  size?: InputMaybe<Scalars['String']['input']>;
  totalSz?: InputMaybe<Scalars['String']['input']>;
  walletAddress?: InputMaybe<Scalars['String']['input']>;
};

export type LogTransactionResponse = {
  __typename?: 'LogTransactionResponse';
  error?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
};

export type Meta = {
  __typename?: 'Meta';
  gasLimit: Scalars['String']['output'];
  gasPrice: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  callBack: CallBackResponse;
  confirmRoute: ConfirmRouteResponse;
  createAlertSymbolSetting: CreateAlertSymbolSettingResponse;
  createTx: CreateTxResponse;
  deleteAlertSymbolSetting: DeleteAlertSymbolSettingResponse;
  logTransaction: LogTransactionResponse;
  routeBanner: BannerResponse;
  signTx: SignTxResponse;
  storeTxInformation: StoreTxInformationResponse;
  updateAlertSymbolSetting: UpdateAlertSymbolSettingResponse;
  updateFavoriteSymbolOrder: UpdateFavoriteSymbolOrderResponse;
  updateUserSymbolPreference: UserSymbolPreferenceResponse;
  upsertFavoriteSymbol: UpsertFavoriteSymbolResponse;
};


export type MutationCallBackArgs = {
  input: CallBackRequest;
};


export type MutationConfirmRouteArgs = {
  input: ConfirmRouteRequest;
};


export type MutationCreateAlertSymbolSettingArgs = {
  input: CreateAlertSymbolSettingRequest;
};


export type MutationCreateTxArgs = {
  input: CreateTxRequest;
};


export type MutationDeleteAlertSymbolSettingArgs = {
  input: DeleteAlertSymbolSettingRequest;
};


export type MutationLogTransactionArgs = {
  input: Array<InputMaybe<LogTransactionInput>>;
};


export type MutationRouteBannerArgs = {
  input: RouteBannerInput;
};


export type MutationSignTxArgs = {
  input: CreateTxRequest;
};


export type MutationStoreTxInformationArgs = {
  input: StoreTxInformationRequest;
};


export type MutationUpdateAlertSymbolSettingArgs = {
  input: UpdateAlertSymbolSettingRequest;
};


export type MutationUpdateFavoriteSymbolOrderArgs = {
  input: UpdateFavoriteSymbolOrderRequest;
};


export type MutationUpdateUserSymbolPreferenceArgs = {
  input: UpdateUserSymbolPreferenceRequest;
};


export type MutationUpsertFavoriteSymbolArgs = {
  input: UpsertFavoriteSymbolRequest;
};

export type NewSymbolResponse = {
  __typename?: 'NewSymbolResponse';
  list: Array<Maybe<Scalars['String']['output']>>;
};

export type Node = {
  __typename?: 'Node';
  inputAmount: Scalars['String']['output'];
  marketId: Scalars['String']['output'];
  marketName: Scalars['String']['output'];
  outputAmount: Scalars['String']['output'];
  percent: Scalars['Float']['output'];
  pools: Array<Scalars['String']['output']>;
};

export type NodeTrades = {
  __typename?: 'NodeTrades';
  coin: Scalars['String']['output'];
  hash: Scalars['String']['output'];
  px: Scalars['String']['output'];
  side: Scalars['String']['output'];
  sideInfoTrade: Array<SideInfoTrade>;
  sz: Scalars['String']['output'];
  time: Scalars['String']['output'];
  tradeDirOverride: Scalars['String']['output'];
};

export type Nodes = {
  __typename?: 'Nodes';
  from: Scalars['String']['output'];
  fromAddress: Scalars['String']['output'];
  fromBlockchain: Scalars['String']['output'];
  fromLogo: Scalars['String']['output'];
  nodes: Array<Node>;
  to: Scalars['String']['output'];
  toAddress: Scalars['String']['output'];
  toBlockchain: Scalars['String']['output'];
  toLogo: Scalars['String']['output'];
};

export type NonceMapping = {
  __typename?: 'NonceMapping';
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export enum NotificationTypeEnum {
  Percent24hDecline = 'percent24hDecline',
  Percent24hIncrease = 'percent24hIncrease',
  PriceFell = 'priceFell',
  PriceRise = 'priceRise'
}

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
  ThreeMonths = 'THREE_MONTHS',
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

export type OpenOrder = {
  __typename?: 'OpenOrder';
  direction: Scalars['String']['output'];
  orderPx: Scalars['Float']['output'];
  originSize: Scalars['Float']['output'];
  reduceOnly: Scalars['Boolean']['output'];
  size: Scalars['Float']['output'];
  symbol: Scalars['String']['output'];
  time: Scalars['Int']['output'];
  triggerPx: Scalars['Float']['output'];
  type: Scalars['String']['output'];
};

export enum Operation {
  CancelOrder = 'cancelOrder',
  OpenOrder = 'openOrder'
}

export enum OrderStatus {
  Cancel = 'cancel',
  Filled = 'filled',
  Resting = 'resting'
}

export enum OrderType {
  Limit = 'limit',
  Market = 'market',
  SlMarket = 'sl_market',
  TpMarket = 'tp_market'
}

export type OutputToken = {
  __typename?: 'OutputToken';
  address: Scalars['String']['output'];
  blockchain: Scalars['String']['output'];
  coinSource?: Maybe<Scalars['String']['output']>;
  coinSourceUrl?: Maybe<Scalars['String']['output']>;
  decimals: Scalars['Int']['output'];
  image: Scalars['String']['output'];
  isPopular: Scalars['Boolean']['output'];
  isSecondaryCoin: Scalars['Boolean']['output'];
  name?: Maybe<Scalars['String']['output']>;
  supportedSwappers: Array<Scalars['String']['output']>;
  symbol: Scalars['String']['output'];
  usdPrice: Scalars['Float']['output'];
};

export enum PairType {
  Perpetual = 'Perpetual',
  Spot = 'Spot'
}

export enum Platform {
  All = 'ALL',
  App = 'APP',
  H5 = 'H5',
  Pc = 'PC'
}

export type PopularSymbolRequest = {
  number: Scalars['Int']['input'];
};

export type PopularSymbolResponse = {
  __typename?: 'PopularSymbolResponse';
  list: Array<Maybe<Symbol>>;
};

export type Position = {
  __typename?: 'Position';
  entryPx: Scalars['Float']['output'];
  fundingFee: Scalars['Float']['output'];
  leverage: Leverage;
  side: Scalars['Int']['output'];
  size: Scalars['Float']['output'];
  symbol: Scalars['String']['output'];
};

export type Post = {
  __typename?: 'Post';
  body: PostBody;
  endpoint: Scalars['String']['output'];
  method: Scalars['String']['output'];
};

export type PostBody = {
  __typename?: 'PostBody';
  id: Scalars['String']['output'];
  nonce: Scalars['Int']['output'];
  signatureChainId: Scalars['Int']['output'];
  type: Scalars['String']['output'];
  wallet: Scalars['String']['output'];
  walletChainId: Scalars['Int']['output'];
};

export type PriceRequest = {
  tokenId: Scalars['String']['input'];
};

export type PriceResponse = {
  __typename?: 'PriceResponse';
  price: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  callbackUserBalance: CallbackUserBalanceResponse;
  checkApproval: CheckApprovalResponse;
  checkStatus: CheckStatusResponse;
  checkStatusV2: CheckStatusResponse;
  generateCloid: GenerateCloidResponse;
  getAlertSymbolsSetting: GetAlertSymbolSettingResponse;
  getAllPossibleRoutes: GetAllPossibleRoutesResponse;
  getBanners: BannersResponse;
  getBestRoute: GetBestRouteResponse;
  getCategory: CategoryResponse;
  getChainsManagement: ChainsManagementResponse;
  getExchangeMeta: RangoMetaResponse;
  getExchangeMetaV2: ExchangeMetaResponse;
  getFavoriteSymbols: FavoriteSymbolsResponse;
  getFeeRateConfig: FeeRateConfigResponse;
  getHistories: RangoHistoryResponse;
  getHistoriesV2: HistoryResponse;
  getHotSearches: HotSearchListResponse;
  getNewSymbol: NewSymbolResponse;
  getOHLC: OhlcResponse;
  getPopularSymbol: PopularSymbolResponse;
  getQuoteV2: QuoteResponse;
  getRangoReferralConfig: RangoReferralConfigResponse;
  getRelayConfig: GetRelayConfigResponse;
  getRelayPrice: RelayPriceResponse;
  getSignals: SignalResponse;
  getStatus: StatusResponse;
  getSwapOverview: SwapOverviewResponse;
  getSwapRoutes: SwapRoutesResponse;
  getSymbolDetail: SymbolDetailResponse;
  getSymbolList: SymbolListResponse;
  getTokenRoutes: TokenRoutesResponse;
  getTokensManagement: TokensManagementResponse;
  getUserDetail: UserDetailResponse;
  getUserMiscEvents: UserMiscEventResponse;
  getUserNodeTrades: RespGetUserNodeTrades;
  getUserOpenOrder: UserOpenOrderResponse;
  getUserOrders: UserOrderStatusResponse;
  getUserPosition: UserPositionResponse;
  getUserPrevDayBalance: UserPrevDayBalanceResponse;
  getUserRanking: UserRankingResponse;
  getUserSymbolPreference: UserSymbolPreferenceResponse;
  getUserTradeHistory: UserTradeHistoryResponse;
  price: PriceResponse;
  quoteRelay: QuoteRelayResponse;
  relayCurrencies: RelayCurrenciesResponse;
  searchSymbol: SearchSymbolResponse;
};


export type QueryCallbackUserBalanceArgs = {
  input: CallbackUserBalanceRequest;
};


export type QueryCheckApprovalArgs = {
  input: CheckApprovalRequest;
};


export type QueryCheckStatusArgs = {
  input: CheckStatusRequest;
};


export type QueryCheckStatusV2Args = {
  input: CheckStatusRequest;
};


export type QueryGenerateCloidArgs = {
  input?: InputMaybe<GenerateCloidInput>;
};


export type QueryGetAllPossibleRoutesArgs = {
  input: GetAllPossibleRoutesRequest;
};


export type QueryGetBannersArgs = {
  input: GetBannerInput;
};


export type QueryGetBestRouteArgs = {
  input: GetBestRouteRequest;
};


export type QueryGetHistoriesArgs = {
  input: RangoHistoryRequest;
};


export type QueryGetHistoriesV2Args = {
  input: HistoryRequest;
};


export type QueryGetHotSearchesArgs = {
  input?: InputMaybe<HotSearchFilter>;
};


export type QueryGetOhlcArgs = {
  input: OhlcRequest;
};


export type QueryGetPopularSymbolArgs = {
  input: PopularSymbolRequest;
};


export type QueryGetQuoteV2Args = {
  input: QuoteRequest;
};


export type QueryGetRelayConfigArgs = {
  input: ReqRelayConfig;
};


export type QueryGetRelayPriceArgs = {
  input: ReqRelayPrice;
};


export type QueryGetSignalsArgs = {
  input: SignalRequest;
};


export type QueryGetStatusArgs = {
  input: ReqStatus;
};


export type QueryGetSymbolDetailArgs = {
  input: SymbolDetailRequest;
};


export type QueryGetSymbolListArgs = {
  input: SymbolListRequest;
};


export type QueryGetUserDetailArgs = {
  input: UserDetailRequest;
};


export type QueryGetUserMiscEventsArgs = {
  input: UserMiscEventRequest;
};


export type QueryGetUserNodeTradesArgs = {
  input: UserNodeTradesRequest;
};


export type QueryGetUserOpenOrderArgs = {
  input: UserOpenOrderRequest;
};


export type QueryGetUserOrdersArgs = {
  input: UserOrderStatusRequest;
};


export type QueryGetUserPositionArgs = {
  input: UserPositionRequest;
};


export type QueryGetUserPrevDayBalanceArgs = {
  input: UserPrevDayBalanceRequest;
};


export type QueryGetUserRankingArgs = {
  input: UserRankingRequest;
};


export type QueryGetUserSymbolPreferenceArgs = {
  input: UserSymbolPreferenceRequest;
};


export type QueryGetUserTradeHistoryArgs = {
  input: UserTradeHistoryRequest;
};


export type QueryPriceArgs = {
  input: PriceRequest;
};


export type QueryQuoteRelayArgs = {
  input: QuoteRelayRequest;
};


export type QuerySearchSymbolArgs = {
  input: SearchSymbolRequest;
};

export type QuoteRelayRequest = {
  amount: Scalars['String']['input'];
  destinationId: Scalars['String']['input'];
  needDepositAddress: Scalars['Boolean']['input'];
  originId: Scalars['String']['input'];
  recipient: Scalars['String']['input'];
  userAddr: Scalars['String']['input'];
  userBtcAddr: Scalars['String']['input'];
  userSolAddr: Scalars['String']['input'];
  userTronAddr: Scalars['String']['input'];
};

export type QuoteRelayResponse = {
  __typename?: 'QuoteRelayResponse';
  currencyOutAmountFormatted: Scalars['String']['output'];
  currencyOutAmountUsd: Scalars['String']['output'];
  depositAddress: Scalars['String']['output'];
  depositBtcAddress: Scalars['String']['output'];
  depositSolAddress: Scalars['String']['output'];
  depositTvmAddress: Scalars['String']['output'];
  maxBridgeAmount: Scalars['String']['output'];
  quote: Scalars['String']['output'];
  steps: Array<StepRelay>;
  timeEstimate: Scalars['String']['output'];
  totalImpactPercent: Scalars['String']['output'];
  totalImpactUsd: Scalars['String']['output'];
};

export type QuoteRequest = {
  amount: Scalars['String']['input'];
  destinationId: Scalars['String']['input'];
  originId: Scalars['String']['input'];
  recipient: Scalars['String']['input'];
  recipientNativeVolume: Scalars['String']['input'];
  requestId?: InputMaybe<Scalars['String']['input']>;
  type: Scalars['String']['input'];
  user: Scalars['String']['input'];
  userNativeVolume: Scalars['String']['input'];
};

export type QuoteResponse = {
  __typename?: 'QuoteResponse';
  description: Scalars['String']['output'];
  errorCode: Scalars['String']['output'];
  fromAmountMaxValueFormatted: Scalars['String']['output'];
  gasAmountFormatted: Scalars['String']['output'];
  gasTopupAmount: Scalars['String']['output'];
  gasTopupAmountFormatted: Scalars['String']['output'];
  gasTopupAmountUsd: Scalars['String']['output'];
  items: Array<StepItem>;
  outPutAmountFormatted: Scalars['String']['output'];
  platformFeeAmountFormat: Scalars['String']['output'];
  platformFeeSymbol: Scalars['String']['output'];
  requestId: Scalars['String']['output'];
  thresholdCapacity: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type RangoHistory = {
  __typename?: 'RangoHistory';
  diagnosisMessages?: Maybe<Scalars['String']['output']>;
  failReason?: Maybe<Scalars['String']['output']>;
  fromAddress: Scalars['String']['output'];
  fromBlockchain: Scalars['String']['output'];
  fromSymbol: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  missingBlockchains?: Maybe<Scalars['String']['output']>;
  outputAmount: Scalars['String']['output'];
  requestAmount: Scalars['String']['output'];
  requestId: Scalars['String']['output'];
  resultType: Scalars['String']['output'];
  status: Scalars['String']['output'];
  step: Scalars['Int']['output'];
  swaps?: Maybe<Array<RangoSwaps>>;
  toAddress: Scalars['String']['output'];
  toBlockchain: Scalars['String']['output'];
  toSymbol: Scalars['String']['output'];
  userAddress: Scalars['String']['output'];
  validationStatus: Scalars['String']['output'];
  walletNotSupportingFromBlockchain: Scalars['Boolean']['output'];
};

export type RangoHistoryRequest = {
  address: Scalars['String']['input'];
  blockchain: Scalars['String']['input'];
  endTime?: InputMaybe<Scalars['Int']['input']>;
  page: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
  startTime?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type RangoHistoryResponse = {
  __typename?: 'RangoHistoryResponse';
  list: Array<RangoHistory>;
  total: Scalars['Int']['output'];
};

export type RangoMetaChains = {
  __typename?: 'RangoMetaChains';
  addressPatterns?: Maybe<Scalars['String']['output']>;
  chainId?: Maybe<Scalars['String']['output']>;
  color?: Maybe<Scalars['String']['output']>;
  defaultDecimals?: Maybe<Scalars['Int']['output']>;
  displayName?: Maybe<Scalars['String']['output']>;
  enabled?: Maybe<Scalars['Boolean']['output']>;
  feeAssets?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  info?: Maybe<Scalars['String']['output']>;
  logo?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  shortName?: Maybe<Scalars['String']['output']>;
  sort?: Maybe<Scalars['Int']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

export type RangoMetaResponse = {
  __typename?: 'RangoMetaResponse';
  blockchains?: Maybe<Array<Maybe<RangoMetaChains>>>;
  popularTokens?: Maybe<Array<Maybe<RangoMetaTokens>>>;
  swappers?: Maybe<Array<Maybe<RangoMetaSwappers>>>;
  tokens?: Maybe<Array<Maybe<RangoMetaTokensWithChain>>>;
};

export type RangoMetaSwappers = {
  __typename?: 'RangoMetaSwappers';
  enabled?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  swapperGroup?: Maybe<Scalars['String']['output']>;
  swapperId: Scalars['String']['output'];
  title?: Maybe<Scalars['String']['output']>;
  types?: Maybe<Scalars['String']['output']>;
};

export type RangoMetaTokens = {
  __typename?: 'RangoMetaTokens';
  address: Scalars['String']['output'];
  blockChain: Scalars['String']['output'];
  coinSource?: Maybe<Scalars['String']['output']>;
  coinSourceUrl?: Maybe<Scalars['String']['output']>;
  decimals?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  isPopular?: Maybe<Scalars['Boolean']['output']>;
  isSecondaryCoin?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  supportedSwappers?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  symbol: Scalars['String']['output'];
  usdPrice?: Maybe<Scalars['Float']['output']>;
};

export type RangoMetaTokensWithChain = {
  __typename?: 'RangoMetaTokensWithChain';
  address: Scalars['String']['output'];
  blockChain: Scalars['String']['output'];
  chainDetail?: Maybe<RangoMetaChains>;
  coinSource?: Maybe<Scalars['String']['output']>;
  coinSourceUrl?: Maybe<Scalars['String']['output']>;
  decimals?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  isPopular?: Maybe<Scalars['Boolean']['output']>;
  isSecondaryCoin?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  supportedSwappers?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  symbol: Scalars['String']['output'];
  usdPrice?: Maybe<Scalars['Float']['output']>;
};

export type RangoReferralConfig = {
  __typename?: 'RangoReferralConfig';
  referralCode: Scalars['String']['output'];
};

export type RangoReferralConfigResponse = {
  __typename?: 'RangoReferralConfigResponse';
  config: RangoReferralConfig;
};

export type RangoSwaps = {
  __typename?: 'RangoSwaps';
  callData?: Maybe<Scalars['String']['output']>;
  callDataHash?: Maybe<Scalars['String']['output']>;
  estimatedTimeInSeconds: Scalars['Int']['output'];
  fee?: Maybe<Scalars['String']['output']>;
  fromAmount: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  maxRequiredSign: Scalars['Int']['output'];
  requestId: Scalars['String']['output'];
  step: Scalars['Int']['output'];
  swapChainType: Scalars['String']['output'];
  swapperId: Scalars['String']['output'];
  swapperLogo?: Maybe<Scalars['String']['output']>;
  swapperType: Scalars['String']['output'];
  toAmount: Scalars['String']['output'];
  txHash?: Maybe<Scalars['String']['output']>;
  userAddress: Scalars['String']['output'];
};

export type RangoTokenExtra = {
  __typename?: 'RangoTokenExtra';
  id: Scalars['String']['output'];
};

export type RecommendedSlippage = {
  __typename?: 'RecommendedSlippage';
  error: Scalars['Boolean']['output'];
  slippage: Scalars['String']['output'];
};

export type Referral = {
  __typename?: 'Referral';
  address?: Maybe<Scalars['String']['output']>;
  amount: Scalars['String']['output'];
  blockChain: Scalars['String']['output'];
  decimals: Scalars['Int']['output'];
  symbol: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type RelayChainBasic = {
  __typename?: 'RelayChainBasic';
  chainId: Scalars['String']['output'];
  chainImage: Scalars['String']['output'];
  chainName: Scalars['String']['output'];
  decimals?: Maybe<Scalars['Int']['output']>;
  tokenId?: Maybe<Scalars['String']['output']>;
  vmType: Scalars['String']['output'];
};

export type RelayCurrenciesResponse = {
  __typename?: 'RelayCurrenciesResponse';
  chains: Array<RelayChainBasic>;
  minBridgeUsd: Scalars['String']['output'];
  tokens: Array<RelayTokenChain>;
};

export type RelayPriceResponse = {
  __typename?: 'RelayPriceResponse';
  price: Scalars['String']['output'];
  tokenId: Scalars['String']['output'];
};

export type RelayTokenChain = {
  __typename?: 'RelayTokenChain';
  chainList: Array<RelayChainBasic>;
  image: Scalars['String']['output'];
  name: Scalars['String']['output'];
  symbol: Scalars['String']['output'];
  address: Scalars['String']['output'];
};

export type RelayTokenExtra = {
  __typename?: 'RelayTokenExtra';
  id: Scalars['String']['output'];
};

export type ReqRelayConfig = {
  tokenId: Scalars['String']['input'];
  userAddr: Scalars['String']['input'];
};

export type ReqRelayPrice = {
  tokenId: Scalars['String']['input'];
};

export type ReqStatus = {
  requestId: Scalars['String']['input'];
  step: Scalars['Int']['input'];
  txHash: Scalars['String']['input'];
};

export type RespGetUserNodeTrades = {
  __typename?: 'RespGetUserNodeTrades';
  orders: Array<NodeTrades>;
};

export type Result = {
  __typename?: 'Result';
  missingBlockchains: Array<Scalars['String']['output']>;
  outputAmount: Scalars['String']['output'];
  priceImpactUsd: Scalars['String']['output'];
  priceImpactUsdPercent: Scalars['String']['output'];
  requestId: Scalars['String']['output'];
  resultType: Scalars['String']['output'];
  scores: Array<Score>;
  swaps: Array<Swap>;
  tags: Array<Tag>;
  walletNotSupportingFromBlockchain: Scalars['Boolean']['output'];
};

export type Route = {
  __typename?: 'Route';
  nodes: Array<Nodes>;
};

export type RouteBannerInput = {
  id: Scalars['ID']['input'];
  user: Scalars['String']['input'];
};

export type RouteStats = {
  __typename?: 'RouteStats';
  id: Scalars['String']['output'];
  totalSwapUsd: Scalars['String']['output'];
  type: Scalars['String']['output'];
  usageCount: Scalars['Int']['output'];
};

export type Score = {
  __typename?: 'Score';
  preferenceType: Scalars['String']['output'];
  score: Scalars['Int']['output'];
};

export type SearchSymbolRequest = {
  filter: Scalars['String']['input'];
};

export type SearchSymbolResponse = {
  __typename?: 'SearchSymbolResponse';
  list: Array<Maybe<Symbol>>;
};

export type SelectedWallet = {
  address: Scalars['String']['input'];
  blockchain: Scalars['String']['input'];
};

export enum Side {
  Buy = 'buy',
  Sell = 'sell'
}

export type SideInfoTrade = {
  __typename?: 'SideInfoTrade';
  cloid?: Maybe<Scalars['String']['output']>;
  oid?: Maybe<Scalars['Int']['output']>;
  startPos: Scalars['String']['output'];
  twapId?: Maybe<Scalars['Int']['output']>;
  user: Scalars['String']['output'];
};

export type Sign = {
  __typename?: 'Sign';
  domain: SignDomain;
  primaryType: Scalars['String']['output'];
  signatureKind: Scalars['String']['output'];
  types: SignTypes;
  value: SignValue;
};

export type SignDomain = {
  __typename?: 'SignDomain';
  chainId: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  verifyingContract: Scalars['String']['output'];
  version: Scalars['String']['output'];
};

export type SignTxResponse = {
  __typename?: 'SignTxResponse';
  blockChain: Scalars['String']['output'];
  data: Scalars['String']['output'];
  from: Scalars['String']['output'];
  gasLimit: Scalars['String']['output'];
  gasPrice: Scalars['String']['output'];
  maxFeePerGas: Scalars['String']['output'];
  maxPriorityFeePerGas: Scalars['String']['output'];
  nonce: Scalars['String']['output'];
  signedTransaction: Scalars['String']['output'];
  to: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type SignTypes = {
  __typename?: 'SignTypes';
  nonceMapping: Array<NonceMapping>;
};

export type SignUserTransactionEvmResponse = {
  __typename?: 'SignUserTransactionEvmResponse';
  chain: ChainType;
  data: Scalars['String']['output'];
  from: Scalars['String']['output'];
  gasLimit?: Maybe<Scalars['String']['output']>;
  gasPrice?: Maybe<Scalars['String']['output']>;
  maxFeePerGas?: Maybe<Scalars['String']['output']>;
  maxPriorityFeePerGas?: Maybe<Scalars['String']['output']>;
  signed_transaction: Scalars['String']['output'];
  to: Scalars['String']['output'];
  user_id: Scalars['String']['output'];
  value?: Maybe<Scalars['String']['output']>;
};

export type SignValue = {
  __typename?: 'SignValue';
  chainId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  nonce: Scalars['Int']['output'];
  wallet: Scalars['String']['output'];
};

export type Signal = {
  __typename?: 'Signal';
  annualWinRate: Scalars['Float']['output'];
  confidence: Scalars['String']['output'];
  consecutiveWins: Scalars['Int']['output'];
  createdDate: Scalars['String']['output'];
  cumulativeIncome: Scalars['Float']['output'];
  evaluationStatus: Scalars['String']['output'];
  historicalWinRate: Scalars['Float']['output'];
  initialCapital: Scalars['Float']['output'];
  latestAssets: Scalars['Float']['output'];
  maxDrawdown7Days: Scalars['Float']['output'];
  monthlyAlpha: Scalars['Float']['output'];
  monthlyReturnRate: Scalars['Float']['output'];
  operationDirection: Scalars['String']['output'];
  profitLossCount: Scalars['Float']['output'];
  profitLossRatio: Scalars['Float']['output'];
  review: Scalars['String']['output'];
  runningStatus: Scalars['String']['output'];
  runningTime: Scalars['Float']['output'];
  sevenYield: Scalars['Float']['output'];
  sharpeRatio: Scalars['Float']['output'];
  signalName: Scalars['String']['output'];
  signalPnl: Scalars['Float']['output'];
  signalType: Scalars['String']['output'];
  subscribers: Scalars['Int']['output'];
  threeYield: Scalars['Float']['output'];
  underlyingAsset: Scalars['String']['output'];
  updatedDate: Scalars['String']['output'];
  userId: Scalars['Int']['output'];
  username: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
};

export type SignalRequest = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  user?: InputMaybe<Scalars['String']['input']>;
};

export type SignalResponse = {
  __typename?: 'SignalResponse';
  signals: Array<Maybe<Signal>>;
  total: Scalars['Int']['output'];
};

export type SolverConfig = {
  __typename?: 'SolverConfig';
  address: Scalars['String']['output'];
  balance: Scalars['String']['output'];
  capacityPerRequest: Scalars['String']['output'];
};

export type StatusResponse = {
  __typename?: 'StatusResponse';
  destinationChainId: Scalars['Int']['output'];
  inTxHashes?: Maybe<Array<Scalars['String']['output']>>;
  originChainId: Scalars['Int']['output'];
  status: Scalars['String']['output'];
  time: Scalars['Int']['output'];
  txHashes?: Maybe<Array<Scalars['String']['output']>>;
};

export type StepItem = {
  __typename?: 'StepItem';
  blockHash: Scalars['String']['output'];
  chainId: Scalars['String']['output'];
  data: Scalars['String']['output'];
  estimatedTimeInSeconds: Scalars['Int']['output'];
  from: Scalars['String']['output'];
  gas: Scalars['String']['output'];
  gasAmountFormatted: Scalars['String']['output'];
  gasAmountUsd: Scalars['String']['output'];
  instructions?: Maybe<Array<Instruction>>;
  isApprovalTx: Scalars['Boolean']['output'];
  maxFeePerGas: Scalars['String']['output'];
  maxPriorityFeePerGas: Scalars['String']['output'];
  nonce: Scalars['String']['output'];
  serializedMessage?: Maybe<Array<Scalars['Int']['output']>>;
  to: Scalars['String']['output'];
  transactionType: Scalars['String']['output'];
  value: Scalars['String']['output'];
  valueAmountFormatted: Scalars['String']['output'];
  valueAmountUsd: Scalars['String']['output'];
};

export type StepRelay = {
  __typename?: 'StepRelay';
  id: Scalars['String']['output'];
  items: Array<StepRelayItem>;
  kind: Scalars['String']['output'];
  requestId: Scalars['String']['output'];
};

export type StepRelayItem = {
  __typename?: 'StepRelayItem';
  action?: Maybe<Action>;
  chainId: Scalars['String']['output'];
  data: Scalars['String']['output'];
  eip712PrimaryType?: Maybe<Scalars['String']['output']>;
  eip712Types?: Maybe<Eip712Types>;
  from: Scalars['String']['output'];
  gas: Scalars['String']['output'];
  instructions?: Maybe<Array<Instruction>>;
  isApprovalTx: Scalars['Boolean']['output'];
  maxFeePerGas: Scalars['String']['output'];
  maxPriorityFeePerGas: Scalars['String']['output'];
  nonce?: Maybe<Scalars['Int']['output']>;
  post?: Maybe<Post>;
  serializedMessage?: Maybe<Array<Scalars['Int']['output']>>;
  sign?: Maybe<Sign>;
  to: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type StoreTxInformationRequest = {
  avgPx?: InputMaybe<Scalars['Float']['input']>;
  direction: Scalars['String']['input'];
  expiresAfter?: InputMaybe<Scalars['Int']['input']>;
  isBuy: Scalars['Boolean']['input'];
  nonce: Scalars['Int']['input'];
  oid: Scalars['String']['input'];
  orderType: Scalars['String']['input'];
  price: Scalars['Float']['input'];
  reduceOnly: Scalars['Boolean']['input'];
  size: Scalars['Float']['input'];
  status: Scalars['String']['input'];
  symbol: Scalars['String']['input'];
  txType: Scalars['String']['input'];
  vaultAddress?: InputMaybe<Scalars['String']['input']>;
};

export type StoreTxInformationResponse = {
  __typename?: 'StoreTxInformationResponse';
  error?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
};

export type Swap = {
  __typename?: 'Swap';
  estimatedTimeInSeconds: Scalars['Int']['output'];
  fee: Array<Fee>;
  from: TokenInfo;
  fromAmount: Scalars['String']['output'];
  fromAmountMaxValue?: Maybe<Scalars['String']['output']>;
  fromAmountMinValue?: Maybe<Scalars['String']['output']>;
  fromAmountPrecision: Scalars['String']['output'];
  fromAmountRestrictionType?: Maybe<Scalars['String']['output']>;
  includesDestinationTx: Scalars['Boolean']['output'];
  internalSwaps: Array<InternalSwaps>;
  maxRequiredSign: Scalars['Int']['output'];
  recommendedSlippage: RecommendedSlippage;
  routes: Array<Route>;
  swapChainType: Scalars['String']['output'];
  swapperId: Scalars['String']['output'];
  swapperLogo: Scalars['String']['output'];
  swapperType: Scalars['String']['output'];
  timeStat: TimeStat;
  to: TokenInfo;
  toAmount: Scalars['String']['output'];
  warnings: Array<Scalars['String']['output']>;
};

export type SwapOverviewItem = {
  __typename?: 'SwapOverviewItem';
  chain?: Maybe<Scalars['String']['output']>;
  feeUsd: Scalars['Float']['output'];
  id: Scalars['String']['output'];
  token: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type SwapOverviewResponse = {
  __typename?: 'SwapOverviewResponse';
  data: Array<SwapOverviewItem>;
  summary: SwapSummary;
  total: Scalars['Int']['output'];
};

export type SwapRoutesResponse = {
  __typename?: 'SwapRoutesResponse';
  data: Array<RouteStats>;
  total: Scalars['Int']['output'];
};

export type SwapSummary = {
  __typename?: 'SwapSummary';
  totalFeeUsd: Scalars['Float']['output'];
  totalSwaps: Scalars['Int']['output'];
};

export type Symbol = {
  __typename?: 'Symbol';
  changPxPercent: Scalars['Float']['output'];
  currentPrice: Scalars['Float']['output'];
  marketCap: Scalars['Float']['output'];
  maxLeverage: Scalars['Int']['output'];
  openInterest: Scalars['Float']['output'];
  symbol: Scalars['String']['output'];
  volume: Scalars['Float']['output'];
};

export enum SymbolConditionEnum {
  Category = 'category',
  Gainer = 'gainer',
  Loser = 'loser',
  MarketCap = 'marketCap',
  OpenInterest = 'openInterest',
  Trend = 'trend',
  Volume = 'volume'
}

export type SymbolDetailRequest = {
  symbol: Scalars['String']['input'];
};

export type SymbolDetailResponse = {
  __typename?: 'SymbolDetailResponse';
  changPxPercent: Scalars['Float']['output'];
  currentPrice: Scalars['Float']['output'];
  high: Scalars['Float']['output'];
  low: Scalars['Float']['output'];
  marginTableID: Scalars['Int']['output'];
  marketCap: Scalars['Float']['output'];
  maxLeverage: Scalars['Int']['output'];
  onlyIsolated: Scalars['Boolean']['output'];
  sizeDecimals: Scalars['Int']['output'];
  symbol: Scalars['String']['output'];
  volume: Scalars['Float']['output'];
};

export type SymbolListRequest = {
  category?: InputMaybe<Scalars['String']['input']>;
  condition: SymbolConditionEnum;
};

export type SymbolListResponse = {
  __typename?: 'SymbolListResponse';
  list: Array<Maybe<SymbolWithPair>>;
};

export type SymbolWithPair = {
  __typename?: 'SymbolWithPair';
  aliasName?: Maybe<Scalars['String']['output']>;
  changPxPercent: Scalars['Float']['output'];
  currentPrice: Scalars['Float']['output'];
  marketCap: Scalars['Float']['output'];
  maxLeverage: Scalars['Int']['output'];
  openInterest: Scalars['Float']['output'];
  quoteSymbol?: Maybe<Scalars['String']['output']>;
  symbol: Scalars['String']['output'];
  type?: Maybe<PairType>;
  volume: Scalars['Float']['output'];
};

export type Tag = {
  __typename?: 'Tag';
  label: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type TimeStat = {
  __typename?: 'TimeStat';
  avg: Scalars['Int']['output'];
  max: Scalars['Int']['output'];
  min: Scalars['Int']['output'];
};

export type Token = {
  __typename?: 'Token';
  address: Scalars['String']['output'];
  blockChain: Scalars['String']['output'];
  coinSource?: Maybe<Scalars['String']['output']>;
  coinSourceUrl?: Maybe<Scalars['String']['output']>;
  decimals?: Maybe<Scalars['Int']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  isPopular?: Maybe<Scalars['Boolean']['output']>;
  isSecondaryCoin?: Maybe<Scalars['Boolean']['output']>;
  name: Scalars['String']['output'];
  supportedSwappers?: Maybe<Array<Scalars['String']['output']>>;
  symbol: Scalars['String']['output'];
  usdPrice?: Maybe<Scalars['Float']['output']>;
};

export type TokenInfo = {
  __typename?: 'TokenInfo';
  address: Scalars['String']['output'];
  blockchain: Scalars['String']['output'];
  blockchainLogo: Scalars['String']['output'];
  decimals: Scalars['Int']['output'];
  logo: Scalars['String']['output'];
  symbol: Scalars['String']['output'];
  usdPrice: Scalars['Float']['output'];
};

export type TokenManagementInfo = {
  __typename?: 'TokenManagementInfo';
  address: Scalars['String']['output'];
  chainId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  symbol: Scalars['String']['output'];
};

export type TokenRoute = {
  __typename?: 'TokenRoute';
  fromChain: Scalars['String']['output'];
  fromSymbol: Scalars['String']['output'];
  id: Scalars['String']['output'];
  platform: Scalars['String']['output'];
  toChain: Scalars['String']['output'];
  toSymbol: Scalars['String']['output'];
  totalSwapUsd: Scalars['String']['output'];
  usageCount: Scalars['Int']['output'];
};

export type TokenRoutesResponse = {
  __typename?: 'TokenRoutesResponse';
  data: Array<TokenRoute>;
  total: Scalars['Int']['output'];
};

export type TokenV2 = {
  __typename?: 'TokenV2';
  address: Scalars['String']['output'];
  decimals: Scalars['Int']['output'];
  image: Scalars['String']['output'];
  name: Scalars['String']['output'];
  rangoExtra?: Maybe<RangoTokenExtra>;
  relayExtra?: Maybe<RelayTokenExtra>;
  symbol: Scalars['String']['output'];
  usdPrice: Scalars['Float']['output'];
};

export type TokensManagementResponse = {
  __typename?: 'TokensManagementResponse';
  data: Array<TokenManagementInfo>;
  total: Scalars['Int']['output'];
};

export type TradeHistory = {
  __typename?: 'TradeHistory';
  dir: Scalars['String']['output'];
  fee: Scalars['Float']['output'];
  feeToken: Scalars['String']['output'];
  hash: Scalars['String']['output'];
  oid: Scalars['Int']['output'];
  pnl: Scalars['Float']['output'];
  pnlPercent: Scalars['Float']['output'];
  px: Scalars['Float']['output'];
  startPosition: Scalars['String']['output'];
  symbol: Scalars['String']['output'];
  sz: Scalars['Float']['output'];
  tid: Scalars['Int']['output'];
  time: Scalars['Int']['output'];
};

export type Transaction = {
  __typename?: 'Transaction';
  blockChain: Scalars['String']['output'];
  data: Scalars['String']['output'];
  from: Scalars['String']['output'];
  gasLimit: Scalars['String']['output'];
  gasPrice: Scalars['String']['output'];
  identifier: Scalars['String']['output'];
  instructions: Array<Scalars['String']['output']>;
  isApprovalTx: Scalars['Boolean']['output'];
  maxFeePerGas: Scalars['String']['output'];
  maxPriorityFeePerGas: Scalars['String']['output'];
  nonce: Scalars['String']['output'];
  recentBlockhash: Scalars['String']['output'];
  serializedMessage: Array<Scalars['Int']['output']>;
  signatures: Array<Scalars['String']['output']>;
  spender: Scalars['String']['output'];
  to: Scalars['String']['output'];
  txType: Scalars['String']['output'];
  type: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type UpdateAlertSymbolSettingRequest = {
  isActivated: Scalars['Boolean']['input'];
  settingId: Scalars['String']['input'];
};

export type UpdateAlertSymbolSettingResponse = {
  __typename?: 'UpdateAlertSymbolSettingResponse';
  error?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
};

export type UpdateFavoriteSymbolOrderRequest = {
  symbols: Array<Scalars['String']['input']>;
};

export type UpdateFavoriteSymbolOrderResponse = {
  __typename?: 'UpdateFavoriteSymbolOrderResponse';
  message?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
};

export type UpdateUserSymbolPreferenceRequest = {
  isCross?: InputMaybe<Scalars['Boolean']['input']>;
  leverage?: InputMaybe<Scalars['Int']['input']>;
  orderUnitInBase?: InputMaybe<Scalars['Boolean']['input']>;
  symbol: Scalars['String']['input'];
  tpslUnit?: InputMaybe<Scalars['String']['input']>;
};

export type UpsertFavoriteSymbolRequest = {
  isFavorite: Scalars['Boolean']['input'];
  symbol: Array<Scalars['String']['input']>;
};

export type UpsertFavoriteSymbolResponse = {
  __typename?: 'UpsertFavoriteSymbolResponse';
  error?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
};

export type UserConfig = {
  __typename?: 'UserConfig';
  balance: Scalars['String']['output'];
  maxBridgeAmount: Scalars['String']['output'];
};

export type UserDetailRequest = {
  address: Scalars['String']['input'];
  page: Scalars['Int']['input'];
  size: Scalars['Int']['input'];
};

export type UserDetailResponse = {
  __typename?: 'UserDetailResponse';
  data: Array<UserSwapHistory>;
  total: Scalars['Int']['output'];
};

export type UserMiscEvent = {
  __typename?: 'UserMiscEvent';
  amount?: Maybe<Scalars['String']['output']>;
  cDepositAmount?: Maybe<Scalars['String']['output']>;
  cDepositUser?: Maybe<Scalars['String']['output']>;
  cWithdrawalAmount?: Maybe<Scalars['String']['output']>;
  cWithdrawalIsFinalized?: Maybe<Scalars['Boolean']['output']>;
  cWithdrawalUser?: Maybe<Scalars['String']['output']>;
  destination?: Maybe<Scalars['String']['output']>;
  fee?: Maybe<Scalars['String']['output']>;
  hash?: Maybe<Scalars['String']['output']>;
  nativeTokenFee?: Maybe<Scalars['String']['output']>;
  nonce?: Maybe<Scalars['Int']['output']>;
  time?: Maybe<Scalars['String']['output']>;
  toPerp?: Maybe<Scalars['Boolean']['output']>;
  token?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  usdc?: Maybe<Scalars['String']['output']>;
  usdcValue?: Maybe<Scalars['String']['output']>;
  user?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
  users?: Maybe<Scalars['String']['output']>;
};

export type UserMiscEventRequest = {
  lastID: Scalars['String']['input'];
  limit: Scalars['Int']['input'];
};

export type UserMiscEventResponse = {
  __typename?: 'UserMiscEventResponse';
  events: Array<Maybe<UserMiscEvent>>;
};

export type UserNodeTradesRequest = {
  lastID: Scalars['String']['input'];
  limit: Scalars['Int']['input'];
};

export type UserOpenOrderRequest = {
  lastID: Scalars['String']['input'];
  limit: Scalars['Int']['input'];
};

export type UserOpenOrderResponse = {
  __typename?: 'UserOpenOrderResponse';
  openOrders: Array<Maybe<OpenOrder>>;
};

export type UserOrderStatus = {
  __typename?: 'UserOrderStatus';
  children?: Maybe<Scalars['String']['output']>;
  cloid?: Maybe<Scalars['String']['output']>;
  coin?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  isPositionTpsl?: Maybe<Scalars['Boolean']['output']>;
  isTrigger?: Maybe<Scalars['Boolean']['output']>;
  limitPx?: Maybe<Scalars['String']['output']>;
  oid?: Maybe<Scalars['Int']['output']>;
  orderType?: Maybe<Scalars['String']['output']>;
  origSz?: Maybe<Scalars['String']['output']>;
  reduceOnly?: Maybe<Scalars['Boolean']['output']>;
  side?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  sz?: Maybe<Scalars['String']['output']>;
  tif?: Maybe<Scalars['String']['output']>;
  time?: Maybe<Scalars['String']['output']>;
  timestamp?: Maybe<Scalars['Int']['output']>;
  triggerCondition?: Maybe<Scalars['String']['output']>;
  triggerPx?: Maybe<Scalars['String']['output']>;
  user?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type UserOrderStatusRequest = {
  lastID: Scalars['String']['input'];
  limit: Scalars['Int']['input'];
};

export type UserOrderStatusResponse = {
  __typename?: 'UserOrderStatusResponse';
  statuses: Array<Maybe<UserOrderStatus>>;
};

export type UserPositionRequest = {
  walletAddress: Scalars['String']['input'];
};

export type UserPositionResponse = {
  __typename?: 'UserPositionResponse';
  positions: Array<Maybe<Position>>;
  rawUSD: Scalars['Float']['output'];
};

export type UserPrevDayBalanceRequest = {
  walletAddress: Scalars['String']['input'];
};

export type UserPrevDayBalanceResponse = {
  __typename?: 'UserPrevDayBalanceResponse';
  Balance: Scalars['Float']['output'];
};

export type UserRankingItem = {
  __typename?: 'UserRankingItem';
  address: Scalars['String']['output'];
  id: Scalars['String']['output'];
  swaps: Scalars['Int']['output'];
  totalUsd: Scalars['String']['output'];
};

export type UserRankingRequest = {
  metric: Scalars['String']['input'];
};

export type UserRankingResponse = {
  __typename?: 'UserRankingResponse';
  data: Array<UserRankingItem>;
  total: Scalars['Int']['output'];
};

export type UserSettingsRequest = {
  infiniteApprove: Scalars['Boolean']['input'];
  slippage: Scalars['Float']['input'];
};

export type UserSwapHistory = {
  __typename?: 'UserSwapHistory';
  extraData: Scalars['String']['output'];
  failReason: Scalars['String']['output'];
  fromChainId?: Maybe<Scalars['String']['output']>;
  fromTokenAddress: Scalars['String']['output'];
  fromTokenSymbol: Scalars['String']['output'];
  id: Scalars['String']['output'];
  outputAmount: Scalars['String']['output'];
  requestAmount: Scalars['String']['output'];
  requestId: Scalars['String']['output'];
  status: Scalars['String']['output'];
  step: Scalars['Int']['output'];
  toChainId: Scalars['String']['output'];
  toTokenAddress: Scalars['String']['output'];
  toTokenSymbol: Scalars['String']['output'];
  userAddress: Scalars['String']['output'];
};

export type UserSymbolPreferenceRequest = {
  symbol: Scalars['String']['input'];
};

export type UserSymbolPreferenceResponse = {
  __typename?: 'UserSymbolPreferenceResponse';
  isCross: Scalars['Boolean']['output'];
  isFavorite: Scalars['Boolean']['output'];
  leverage: Scalars['Int']['output'];
  orderUnitInBase: Scalars['Boolean']['output'];
  tpslUnit: Scalars['String']['output'];
};

export type UserTradeHistoryRequest = {
  walletAddress: Scalars['String']['input'];
};

export type UserTradeHistoryResponse = {
  __typename?: 'UserTradeHistoryResponse';
  histories: Array<TradeHistory>;
};

export type ValidationsRequest = {
  approve: Scalars['Boolean']['input'];
  balance: Scalars['Boolean']['input'];
  fee: Scalars['Boolean']['input'];
};
