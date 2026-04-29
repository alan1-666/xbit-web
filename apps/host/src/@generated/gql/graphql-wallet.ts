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

export type AddUserWalletWhitelistInput = {
  google2FA: Scalars['String']['input'];
  wallets: Array<InputMaybe<WalletItemInput>>;
};

export type CreateFuturesTransactionInput = {
  /** Amount of token that input to swap */
  amount: Scalars['Decimal']['input'];
  /** Chain ID of the origin wallet, 999 for HyperEvm, 42161 for ARB, 501424 for SOLANA  */
  chainId: Scalars['Int']['input'];
  /** Error code of the transaction if any */
  errorCode?: InputMaybe<Scalars['String']['input']>;
  /** Error message of the transaction if any */
  errorMessage?: InputMaybe<Scalars['String']['input']>;
  /** Fee of swap transaction, nullable */
  fee?: InputMaybe<Scalars['Decimal']['input']>;
  /** Address of the origin wallet */
  fromAddress: Scalars['String']['input'];
  /** Memo of the transaction, in-case cross-chain deposit */
  memo?: InputMaybe<Scalars['String']['input']>;
  /** Nonce of the transaction */
  nonce?: InputMaybe<Scalars['Float']['input']>;
  /** Confirmation state or result of transaction: 'Failed' or 'Success' */
  status: TransactionStatus;
  /** Address of the destination wallet */
  toAddress: Scalars['String']['input'];
  /** Chain ID of the destination wallet, e.g. 999 for HyperEvm, 42161 for ARB, 501424 for SOLANA  */
  toChainId: Scalars['Int']['input'];
  /** Address of token that input to swap */
  token: Scalars['String']['input'];
  /** Hash of swap transaction */
  txHash: Scalars['String']['input'];
  /** Transaction type */
  type: FuturesTransactionType;
};

export enum FundingSwapRoute {
  Rango = 'Rango',
  Relay = 'Relay'
}

export type FundingSwapTransaction = {
  __typename?: 'FundingSwapTransaction';
  amount: Scalars['Decimal']['output'];
  chainId: Scalars['Int']['output'];
  createdAt?: Maybe<Scalars['Time']['output']>;
  crossChainFee?: Maybe<Scalars['Decimal']['output']>;
  crossChainFeeUnit?: Maybe<Scalars['String']['output']>;
  estimationTime?: Maybe<Scalars['Int']['output']>;
  fee?: Maybe<Scalars['Decimal']['output']>;
  fromAddress: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  route?: Maybe<FundingSwapRoute>;
  toAddress: Scalars['String']['output'];
  toAmount?: Maybe<Scalars['Decimal']['output']>;
  toChainId: Scalars['Int']['output'];
  toToken: Scalars['String']['output'];
  token: Scalars['String']['output'];
};

export type FundingSwapTransactionInput = {
  /** Amount of token that input to swap */
  amount: Scalars['Decimal']['input'];
  /** Chain ID of the origin wallet, 1 for Ethereum, 42161 for ARB, 501424 for SOLANA  */
  chainId: Scalars['Int']['input'];
  /** Fee of swap transaction for cross chain, nullable */
  crossChainFee?: InputMaybe<Scalars['Decimal']['input']>;
  /** Unit fee of swap transaction for cross chain, nullable */
  crossChainFeeUnit?: InputMaybe<Scalars['String']['input']>;
  /** Error code of the transaction if any */
  errorCode?: InputMaybe<Scalars['String']['input']>;
  /** Error message of the transaction if any */
  errorMessage?: InputMaybe<Scalars['String']['input']>;
  /** Request id of swap transaction */
  estimationTime?: InputMaybe<Scalars['String']['input']>;
  /** Fee of swap transaction, nullable */
  fee?: InputMaybe<Scalars['Decimal']['input']>;
  /** Address of the origin wallet */
  fromAddress: Scalars['String']['input'];
  /** Request id of swap transaction */
  memo?: InputMaybe<Scalars['String']['input']>;
  /** Route of swap */
  route?: InputMaybe<FundingSwapRoute>;
  /** Confirmation state or result of transaction: 'Failed' or 'Success' */
  status: TransactionStatus;
  /** Address of the destination wallet */
  toAddress: Scalars['String']['input'];
  /** Amount of token that output from swap */
  toAmount?: InputMaybe<Scalars['Decimal']['input']>;
  /** Chain ID of the destination wallet, e.g. 1 for Ethereum, 42161 for ARB, 501424 for SOLANA  */
  toChainId: Scalars['Int']['input'];
  /** Address of token that output from swap */
  toToken: Scalars['String']['input'];
  /** Address of token that input to swap */
  token: Scalars['String']['input'];
  /** Hash of swap transaction */
  txHash: Scalars['String']['input'];
};

export type FuturesTransaction = {
  __typename?: 'FuturesTransaction';
  /** Amount of token that input to swap */
  amount: Scalars['Decimal']['output'];
  /** Chain ID of the origin wallet, 999 for HyperEvm, 42161 for ARB, 501424 for SOLANA  */
  chainId: Scalars['Int']['output'];
  createdAt: Scalars['Time']['output'];
  /** Error code of the transaction if any */
  errorCode?: Maybe<Scalars['String']['output']>;
  /** Error message of the transaction if any */
  errorMessage?: Maybe<Scalars['String']['output']>;
  /** Fee of swap transaction, nullable */
  fee?: Maybe<Scalars['Decimal']['output']>;
  /** Address of the origin wallet */
  fromAddress: Scalars['String']['output'];
  /** Nonce of the transaction */
  nonce?: Maybe<Scalars['Float']['output']>;
  /** Confirmation state or result of transaction: 'Failed' or 'Success' */
  status: TransactionStatus;
  /** Address of the destination wallet */
  toAddress: Scalars['String']['output'];
  /** Chain ID of the destination wallet, e.g. 999 for HyperEvm, 42161 for ARB, 501424 for SOLANA  */
  toChainId: Scalars['Int']['output'];
  /** Address of token that input to swap */
  token: Scalars['String']['output'];
  /** Hash of swap transaction */
  txHash: Scalars['String']['output'];
  /** Transaction type */
  type: FuturesTransactionType;
};

export enum FuturesTransactionType {
  /** Deposit to futures wallet */
  FuturesDeposit = 'FuturesDeposit',
  /** Withdraw from futures wallet */
  FuturesWithdraw = 'FuturesWithdraw'
}

export type Mutation = {
  __typename?: 'Mutation';
  addWalletWhitelist: UserWalletWhitelist;
  /** Record swap transaction for funding wallet */
  createFundingSwap: FundingSwapTransaction;
  /** Record deposit - withdrawal transaction for futures wallet */
  createFutureTransaction: FuturesTransaction;
  modifyWalletWhitelist: UserWalletWhitelist;
  submitPermitDeposit: PermitDeposit;
  /**
   * Withdraw one token from wallet A to B
   * @deprecated use withdrawTurnkey instead of withdraw
   */
  withdraw: WithdrawRecord;
  /** Withdraw one token from turnkey wallet A to B */
  withdrawTurnkey: WithdrawRecord;
};


export type MutationAddWalletWhitelistArgs = {
  input: AddUserWalletWhitelistInput;
};


export type MutationCreateFundingSwapArgs = {
  input: FundingSwapTransactionInput;
};


export type MutationCreateFutureTransactionArgs = {
  input: CreateFuturesTransactionInput;
};


export type MutationModifyWalletWhitelistArgs = {
  input: AddUserWalletWhitelistInput;
};


export type MutationSubmitPermitDepositArgs = {
  input: PermitDepositInput;
};


export type MutationWithdrawArgs = {
  input: WithdrawInput;
};


export type MutationWithdrawTurnkeyArgs = {
  input: WithdrawTurnkeyInput;
};

export enum OnchainNetwork {
  Arb = 'ARB',
  Bsc = 'BSC',
  Evm = 'EVM',
  Solana = 'SOLANA',
  Tron = 'TRON'
}

export type PermitDeposit = {
  __typename?: 'PermitDeposit';
  address: Scalars['String']['output'];
  amount: Scalars['Decimal']['output'];
  chainId: Scalars['Int']['output'];
  createdAt: Scalars['Time']['output'];
  deadline: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  nonce: Scalars['Float']['output'];
  signature: Scalars['String']['output'];
  status: WithdrawStatus;
  tokenAddress: Scalars['String']['output'];
  tokenDecimal: Scalars['Int']['output'];
  tokenName: Scalars['String']['output'];
  updatedAt: Scalars['Time']['output'];
  userId: Scalars['String']['output'];
};

export type PermitDepositInput = {
  address: Scalars['String']['input'];
  amount: Scalars['Decimal']['input'];
  chainId: Scalars['Int']['input'];
  deadline: Scalars['Float']['input'];
  memo?: InputMaybe<Scalars['String']['input']>;
  nonce: Scalars['Float']['input'];
  signature: Scalars['String']['input'];
  tokenAddress: Scalars['String']['input'];
  tokenDecimal: Scalars['Int']['input'];
  tokenName: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  getWalletWhitelist: UserWalletWhitelist;
  /** Get user's wallet withdraw history */
  getWithdrawFee: WithdrawFeeResp;
  getWithdrawHistory: Array<Maybe<WithdrawRecord>>;
  getWithdrawStatistics: WithdrawStatistics;
};


export type QueryGetWithdrawFeeArgs = {
  input: WithdrawInput;
};


export type QueryGetWithdrawHistoryArgs = {
  input: SearchWithdrawHistoryInput;
};


export type QueryGetWithdrawStatisticsArgs = {
  input: WithdrawStatisticsInput;
};

export type SearchWalletWhitelistInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type SearchWithdrawHistoryInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<WithdrawStatus>;
  walletAddress: Scalars['String']['input'];
};

export enum TransactionStatus {
  Failed = 'Failed',
  Processing = 'Processing',
  Success = 'Success'
}

export type UserWalletWhitelist = {
  __typename?: 'UserWalletWhitelist';
  createdAt: Scalars['Time']['output'];
  id: Scalars['ID']['output'];
  updatedAt: Scalars['Time']['output'];
  userId: Scalars['String']['output'];
  whitelist: Array<Maybe<WalletItem>>;
};

export type WalletItem = {
  __typename?: 'WalletItem';
  chainId: Scalars['String']['output'];
  walletAddress: Scalars['String']['output'];
};

export type WalletItemInput = {
  chainId: Scalars['String']['input'];
  walletAddress: Scalars['String']['input'];
};

export enum WalletType {
  Tele = 'Tele',
  Turnkey = 'Turnkey'
}

export type WithdrawFeeResp = {
  __typename?: 'WithdrawFeeResp';
  fee: Scalars['Decimal']['output'];
  gasLimit?: Maybe<Scalars['Int']['output']>;
  gasPrice?: Maybe<Scalars['Int']['output']>;
  network: OnchainNetwork;
  unit: Scalars['String']['output'];
};

export type WithdrawInput = {
  amount: Scalars['Decimal']['input'];
  chainId: Scalars['String']['input'];
  fromAddress: Scalars['String']['input'];
  toAddress: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type WithdrawRecord = {
  __typename?: 'WithdrawRecord';
  activityId?: Maybe<Scalars['String']['output']>;
  amount: Scalars['Decimal']['output'];
  blockNumber: Scalars['Int']['output'];
  chainId?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Time']['output'];
  decimals: Scalars['Int']['output'];
  errorCode?: Maybe<Scalars['String']['output']>;
  errorMessage?: Maybe<Scalars['String']['output']>;
  fee?: Maybe<Scalars['Decimal']['output']>;
  fromAddress: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isOkxWallet?: Maybe<Scalars['Boolean']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  meta?: Maybe<Scalars['String']['output']>;
  network: OnchainNetwork;
  oidcToken?: Maybe<Scalars['String']['output']>;
  otpCode?: Maybe<Scalars['String']['output']>;
  otpId?: Maybe<Scalars['String']['output']>;
  signature?: Maybe<Scalars['String']['output']>;
  status: WithdrawStatus;
  toAddress: Scalars['String']['output'];
  token: Scalars['String']['output'];
  txid?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['Time']['output'];
  userId: Scalars['String']['output'];
  walletType: WalletType;
};

export type WithdrawStatistics = {
  __typename?: 'WithdrawStatistics';
  processingItems: Array<WithdrawRecord>;
  totalProcessing: Scalars['Int']['output'];
  userId: Scalars['String']['output'];
  walletAddress: Scalars['String']['output'];
};

export type WithdrawStatisticsInput = {
  chainId: Scalars['String']['input'];
  walletAddress: Scalars['String']['input'];
};

export enum WithdrawStatus {
  /** The transaction is on-chain and has been confirmed by at least one subsequent block */
  Confirmed = 'Confirmed',
  /** The transaction failed */
  Failed = 'Failed',
  /** The transaction has been accepted by the system and is in the process of being sent to the blockchain */
  Pending = 'Pending',
  /** The transaction has been received by a validator but is not confirmed yet */
  Processed = 'Processed',
  /** The transaction was processed successfully */
  Success = 'Success'
}

export type WithdrawTurnkeyInput = {
  /** Turnkey activityId */
  activityId: Scalars['String']['input'];
  amount: Scalars['Decimal']['input'];
  chainId: Scalars['String']['input'];
  fromAddress: Scalars['String']['input'];
  /** Turnkey isOkxWallet */
  isOkxWallet?: InputMaybe<Scalars['Boolean']['input']>;
  /** Turnkey message */
  message?: InputMaybe<Scalars['String']['input']>;
  /** Turnkey oidcToken */
  oidcToken?: InputMaybe<Scalars['String']['input']>;
  /** Turnkey otpCode */
  otpCode?: InputMaybe<Scalars['String']['input']>;
  /** Turnkey otpId */
  otpId?: InputMaybe<Scalars['String']['input']>;
  /** Turnkey signature */
  signature?: InputMaybe<Scalars['String']['input']>;
  signedTx?: InputMaybe<Scalars['String']['input']>;
  toAddress: Scalars['String']['input'];
  token: Scalars['String']['input'];
};
