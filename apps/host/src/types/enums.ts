import { ChainType } from '@/@generated/gql/graphql-user'

export enum ChainIds {
  Ethereum = 1,
  Bsc = 56,
  BscTest = 97,
  Avalanche = 43114,
  FantomOpera = 250,
  Optimism = 10,
  Arbitrum = 42161,
  Polygon = 137,
  Pulse = 369,
  Bitrock = 7171,
  Shibarium = 109,
  Cybria = 6661,
  Base = 8453,
  Solana = 501424,
  BTC = 1800,
  TON = 1100,
  TRX = 100,
  HyperEVM = 999,
  Hyperliquid = 1337,
  Mon = 143,
  Lighter = 3586256,
  Monad = 143,
}

export const BaseTokenAddress: Record<ChainIds, Record<string, string>> = {
  [ChainIds.Solana]: {
    wrapped: 'So11111111111111111111111111111111111111111',
  },
  [ChainIds.Ethereum]: {
    wrapped: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  },
  [ChainIds.Bsc]: {
    wrapped: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
  },
  [ChainIds.Mon]: {
    wrapped: '0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A',
  },
  [ChainIds.BscTest]: {
    wrapped: '',
  },
  [ChainIds.Avalanche]: {
    wrapped: '',
  },
  [ChainIds.FantomOpera]: {
    wrapped: '',
  },
  [ChainIds.Arbitrum]: {
    wrapped: '',
  },
  [ChainIds.Polygon]: {
    wrapped: '',
  },
  [ChainIds.Pulse]: {
    wrapped: '',
  },
  [ChainIds.Bitrock]: {
    wrapped: '',
  },
  [ChainIds.Shibarium]: {
    wrapped: '',
  },
  [ChainIds.Cybria]: {
    wrapped: '',
  },
  [ChainIds.Base]: {
    wrapped: '',
  },
  [ChainIds.TON]: {
    wrapped: '',
  },
  [ChainIds.BTC]: {
    wrapped: '',
  },
  [ChainIds.TRX]: {
    wrapped: '',
  },
  [ChainIds.HyperEVM]: {
    wrapped: '',
  },
}

export enum TokenDetailColumnKeys {
  TIME = 'timestamp',
  TYPE = 'type',
  TRANSACTION_AMOUNT = 'transactionAmount',
  SOLD_PRICE = 'soldPrice',
  VOLUME = 'volume',
  WALLET = 'wallet',
  FUND_POOL = 'dex',
  ACTION = 'action',
  DEX = 'dex',
}

export enum LatestFollowedColumnKeys {
  HOLDERS = 'holders',
  TIME = 'timestamp',
  TYPE = 'type',
  TOTAL = 'total',
  PRICE = 'price',
  VOLUME = 'volume',
  WALLET = 'wallet',
}

export enum FollowedHolderColumnKeys {
  INDEX = '#',
  WALLET = 'wallet',
  POSITION_PERCENTAGE = 'positionPercentage',
  TOTAL_BUY = 'totalBuy',
  TOTAL_SELL = 'totalSell',
  REALIZED = 'realized',
  UNREALIZED = 'unrealized',
  TOTAL_PROFIT = 'totalProfit',
  SOL_BALANCE = 'solBalance',
  FUND_SOURCE = 'fundSource',
  HOLDING_LENGTH = 'holdingLength',
  AVG_BUY_SELL = 'avgBuySell',
  TRANSACTION_COUNT = 'transactionCount',
  LAST_ACTIVE = 'lastActive',
  TOKEN_SOURCE = 'tokenSource',
  NET_FLOW = 'netFlow',
}

export enum PoolColumnKeys {
  TIME = 'time',
  TYPE = 'type',
  LIQUIDITY = 'liquidity',
  VOLUME = 'volume',
  FEE = 'fee',
  ACTION = 'action',
  QUANTITY = 'quantity',
  TOTAL_VALUE = 'totalValue',
  ADDRESS = 'address',
  FUND_POOL = 'fundPool',
  TOTAL_ADDED = 'totalAdded',
}

export enum TimeKey {
  YEAR = 'year',
  MONTH = 'month',
  DAY = 'day',
  HOUR = 'hour',
  MINUTE = 'minute',
}

export enum DateSelectedType {
  START = 'start',
  END = 'end',
  NOT_FOCUS = 'notFocus',
}

export enum SortByCreateAtType {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum FilterTransactionAmountType {
  USDT,
  SOL,
  ETH,
  BNB,
  MON,
}

export enum TransactionType {
  All = 'all',
  Buy = 'buy',
  Sell = 'sell',
  AddLiquidity = 'add',
  RemoveLiquidity = 'remove',
}

export enum TransactionClassification {
  All = 'All',
  Followed = 'Followed',
  SmartMoney = 'SmartMoney',
  Whale = 'Whale',
  Sniper = 'Sniper',
  ProjectParty = 'ProjectParty',
  Insider = 'Insider',
  Fresh = 'Fresh',
  KOL = 'KOL',
  Bundlers = 'Bundlers',
}

//"https://solana-rpc.publicnode.com"
export enum DisplayPriceType {
  PRICE,
  MC,
}

export enum PoolTransactionType {
  All = 'All',
  Trading = 'Trading',
  Liquidity = 'Liquidity',
  Buy = 'Buy',
  Sell = 'Sell',
  AddLiquidity = 'AddLiquidity',
  RemoveLiquidity = 'RemoveLiquidity',
  Add = 'Add',
  Remove = 'Remove',
  SingleSideLiquidity = 'SingleSideLiquidity',
}

export enum PlatformType {
  All = 'All',
  MeteoraAMM = 'MeteoraAMM',
  MeteoraDLMM = 'MeteoraDLMM',
  RaydiumAMM = 'RaydiumAMM',
  RaydiumCLMM = 'RaydiumCLMM',
  RaydiumCPMM = 'RaydiumCPMM',
  PumpAMM = 'PumpAMM',
  OrcaWhirlpools = 'OrcaWhirlpools',
  Others = 'Others',
}

export enum TransferType {
  Deposit = 'DEPOSIT',
  Withdraw = 'WITHDRAW',
  Swap = 'SWAP',
  DepositFuture = 'DEPOSIT_FUTURE',
  WithdrawFuture = 'WITHDRAW_FUTURE',
  WithdrawFutureExternal = 'WITHDRAW_FUTURE_EXTERNAL',
  DepositFutureExternal = 'DEPOSIT_FUTURE_EXTERNAL',
  Other = 'OTHER',
  PredictionDepositExternal = 'DEPOSIT_PREDICT_EXTERNAL',
  PredictionWithdrawExternal = 'WITHDRAW_PREDICT_EXTERNAL',
}

export enum FundingType {
  Deposit = 'Deposit',
  Withdraw = 'Withdraw',
  Swap = 'Swap',
  WithdrawFuture = 'WithdrawFuture',
  DepositFuture = 'DepositFuture',
  WithdrawFutureExternal = 'WithdrawFutureExternal',
  DepositFutureExternal = 'DepositFutureExternal',
  DepositPredictExternal = 'DepositPredictExternal',
  WithdrawPredictExternal = 'WithdrawPredictExternal',
}

export enum TransferStatus {
  Success = 'Success',
  Failed = 'Failed',
  Pending = 'Pending',
  Processing = 'Processing',
  Processed = 'Processed',
  Confirmed = 'Confirmed',
}

export const EVM_CHAIN_TYPES = [ChainType.Arb, ChainType.Bsc, ChainType.Evm]

export enum TransferErrorCode {
  TRANSACTION_SIGN_FAILED = 'TRANSACTION_SIGN_FAILED',
  BALANCE_INSUFFICIENT = 'BALANCE_INSUFFICIENT',
  RPC_ERROR = 'RPC_ERROR',
  RPC_RATE_LIMITED = 'RPC_RATE_LIMITED',
  UNCONFIRMED_TRANSACTION = 'UNCONFIRMED_TRANSACTION',
  FEE_BUDGET = 'FEE_BUDGET',
  Unknown = 'Unknown',
}

export enum ActionAliasType {
  Edit,
  Refetch,
}

export enum EditAliasFrom {
  POOL = 'POOL',
  HOLDER = 'HOLDER',
  LATEST = 'LATEST',
  TRADES = 'TRADES',
}
