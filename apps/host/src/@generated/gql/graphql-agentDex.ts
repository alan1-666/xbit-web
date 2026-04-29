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
  Int64: { input: any; output: any; }
  LevelId: { input: any; output: any; }
  Time: { input: any; output: any; }
};

export type ActivityCashbackClaim = {
  __typename?: 'ActivityCashbackClaim';
  claimType: ClaimType;
  claimedAt: Scalars['Time']['output'];
  createdAt: Scalars['Time']['output'];
  id: Scalars['ID']['output'];
  metadata?: Maybe<Scalars['String']['output']>;
  processedAt?: Maybe<Scalars['Time']['output']>;
  status: ClaimStatus;
  totalAmountSol: Scalars['Float']['output'];
  totalAmountUsd: Scalars['Float']['output'];
  transactionHash?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['Time']['output'];
  userId: Scalars['ID']['output'];
};

export type ActivityCashbackSummary = {
  __typename?: 'ActivityCashbackSummary';
  accumulatedCashbackUsd: Scalars['Float']['output'];
  accumulatedTradingVolumeUsd: Scalars['Float']['output'];
  activeLogonDays: Scalars['Int']['output'];
  claimableCashbackUsd: Scalars['Float']['output'];
  claimedCashbackUsd: Scalars['Float']['output'];
  currentLevel: Scalars['Int']['output'];
  currentLevelName: Scalars['String']['output'];
  currentScore: Scalars['Int']['output'];
  currentTierColor?: Maybe<Scalars['String']['output']>;
  currentTierIcon?: Maybe<Scalars['String']['output']>;
  nextLevel?: Maybe<Scalars['Int']['output']>;
  nextLevelName?: Maybe<Scalars['String']['output']>;
  nextTierColor?: Maybe<Scalars['String']['output']>;
  nextTierIcon?: Maybe<Scalars['String']['output']>;
  progressPercentage: Scalars['Float']['output'];
  scoreRequiredToUpgrade?: Maybe<Scalars['Int']['output']>;
  totalScoreForNextLevel?: Maybe<Scalars['Int']['output']>;
};

export type ActivityCashbackSummaryResponse = {
  __typename?: 'ActivityCashbackSummaryResponse';
  data?: Maybe<ActivityCashbackSummary>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export enum ActivityCashbackType {
  All = 'ALL',
  Meme = 'MEME',
  Perpetual = 'PERPETUAL'
}

export type ActivityTask = {
  __typename?: 'ActivityTask';
  actionTarget?: Maybe<Scalars['String']['output']>;
  buttonText?: Maybe<Scalars['String']['output']>;
  categoryId: Scalars['ID']['output'];
  conditions?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Time']['output'];
  description?: Maybe<Scalars['String']['output']>;
  endDate?: Maybe<Scalars['Int64']['output']>;
  externalLink?: Maybe<Scalars['String']['output']>;
  frequency: TaskFrequency;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  maxCompletions?: Maybe<Scalars['Int']['output']>;
  name: MultilingualName;
  points: Scalars['Int']['output'];
  resetPeriod?: Maybe<Scalars['String']['output']>;
  sortOrder: Scalars['Int']['output'];
  startDate?: Maybe<Scalars['Int64']['output']>;
  taskIcon?: Maybe<Scalars['String']['output']>;
  taskIdentifier?: Maybe<TaskIdentifier>;
  updatedAt: Scalars['Time']['output'];
  verificationMethod?: Maybe<Scalars['String']['output']>;
};

export type AgentLevel = {
  __typename?: 'AgentLevel';
  contractVolumeThreshold: Scalars['Float']['output'];
  directCommissionRate: Scalars['Float']['output'];
  extendedCommissionRate: Scalars['Float']['output'];
  id: Scalars['Int']['output'];
  indirectCommissionRate: Scalars['Float']['output'];
  makerFeeRate: Scalars['Float']['output'];
  memeFeeRate: Scalars['Float']['output'];
  memeFeeRebate: Scalars['Float']['output'];
  memeVolumeThreshold: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  takerFeeRate: Scalars['Float']['output'];
};

export type CashbackClaimResponse = {
  __typename?: 'CashbackClaimResponse';
  amountSol: Scalars['Float']['output'];
  amountUsd: Scalars['Float']['output'];
  claimId: Scalars['ID']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type CheckInvitationCodeInput = {
  invitationCode: Scalars['String']['input'];
};

export type CheckInvitationCodeResponse = {
  __typename?: 'CheckInvitationCodeResponse';
  exists: Scalars['Boolean']['output'];
};

export type ClaimActivityCashbackInput = {
  /** Address of the user to claim the cashback */
  claimAddress: Scalars['String']['input'];
  /** Type of cashback to claim (MEME, PERPETUAL, or ALL). Defaults to MEME if not specified. */
  type?: InputMaybe<ActivityCashbackType>;
};

export type ClaimAgentReferralInput = {
  claimAddress?: InputMaybe<Scalars['String']['input']>;
  rewardType: RewardType;
};

export type ClaimCashbackInput = {
  amountUsd: Scalars['Float']['input'];
};

export type ClaimResultResponse = {
  __typename?: 'ClaimResultResponse';
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type ClaimRewardResponse = {
  __typename?: 'ClaimRewardResponse';
  claimActivityCashback: Scalars['String']['output'];
  claimAgentReferral: Scalars['String']['output'];
  claimMemeReferral: Scalars['String']['output'];
  claimPerpetualCashback: Scalars['String']['output'];
  totalClaimedReferralUsd: Scalars['String']['output'];
  totalClaimedUsd: Scalars['String']['output'];
};

export enum ClaimStatus {
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  Pending = 'PENDING',
  Processing = 'PROCESSING'
}

export enum ClaimType {
  ReferralBonus = 'REFERRAL_BONUS',
  TaskReward = 'TASK_REWARD',
  TierBonus = 'TIER_BONUS',
  TradingCashback = 'TRADING_CASHBACK'
}

export type CompleteTaskInput = {
  taskId: Scalars['ID']['input'];
  verificationData?: InputMaybe<Scalars['String']['input']>;
};

export type CreateInfiniteAgentCommissionResponse = {
  __typename?: 'CreateInfiniteAgentCommissionResponse';
  calculationDate: Scalars['String']['output'];
  errorCount: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  processedCount: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  totalInfiniteAgents: Scalars['Int']['output'];
};

export type CreateInfiniteAgentConfigInput = {
  commissionRateN: Scalars['Float']['input'];
  status: StatusType;
  userID: Scalars['ID']['input'];
};

export type CreateInfiniteAgentConfigResponse = {
  __typename?: 'CreateInfiniteAgentConfigResponse';
  infiniteAgentConfig?: Maybe<InfiniteAgentConfig>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type CreateInfiniteAgentReferralTreeResponse = {
  __typename?: 'CreateInfiniteAgentReferralTreeResponse';
  errorCount: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  processedCount: Scalars['Int']['output'];
  snapshotDate: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
  totalInfiniteAgents: Scalars['Int']['output'];
};

export type CreateReferralRelationInput = {
  referrerId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};

export type CreateReferralRelationResponse = {
  __typename?: 'CreateReferralRelationResponse';
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type CreateReferralTreeSnapshotResponse = {
  __typename?: 'CreateReferralTreeSnapshotResponse';
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type CreateTaskInput = {
  actionTarget?: InputMaybe<Scalars['String']['input']>;
  categoryId: Scalars['ID']['input'];
  conditions?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['Int64']['input']>;
  externalLink?: InputMaybe<Scalars['String']['input']>;
  frequency: TaskFrequency;
  maxCompletions?: InputMaybe<Scalars['Int']['input']>;
  name: MultilingualNameInput;
  points: Scalars['Int']['input'];
  resetPeriod?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
  startDate?: InputMaybe<Scalars['Int64']['input']>;
  taskIdentifier?: InputMaybe<TaskIdentifier>;
  verificationMethod?: InputMaybe<Scalars['String']['input']>;
};

export type CreateTierBenefitInput = {
  benefitsDescription?: InputMaybe<Scalars['String']['input']>;
  cashbackPercentage: Scalars['Float']['input'];
  minPoints: Scalars['Int']['input'];
  netFee: Scalars['Float']['input'];
  tierColor?: InputMaybe<Scalars['String']['input']>;
  tierIcon?: InputMaybe<Scalars['String']['input']>;
  tierLevel: Scalars['Int']['input'];
  tierName: Scalars['String']['input'];
};

export type CreateUserInput = {
  email: Scalars['String']['input'];
  invitationCode?: InputMaybe<Scalars['String']['input']>;
  referrerCode?: InputMaybe<Scalars['String']['input']>;
};

export type CreateUserInvitationCodeInput = {
  chain?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  invitationCode: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  walletAccountId?: InputMaybe<Scalars['ID']['input']>;
  walletAddress?: InputMaybe<Scalars['String']['input']>;
  walletId?: InputMaybe<Scalars['ID']['input']>;
  walletType: WalletType;
};

export type CreateUserResponse = {
  __typename?: 'CreateUserResponse';
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
  user: User;
};

export type CreateUserWithReferralInput = {
  invitationCode: Scalars['String']['input'];
};

export type DataOverviewInput = {
  timeRange: DataOverviewTimeRange;
};

export enum DataOverviewTimeRange {
  AllTime = 'ALL_TIME',
  Last_30Days = 'LAST_30_DAYS',
  Last_60Days = 'LAST_60_DAYS',
  Today = 'TODAY'
}

export type InfiniteAgentConfig = {
  __typename?: 'InfiniteAgentConfig';
  Status: Scalars['String']['output'];
  commissionRateN: Scalars['Float']['output'];
  createdAt: Scalars['Time']['output'];
  id: Scalars['ID']['output'];
  updatedAt: Scalars['Time']['output'];
  user?: Maybe<User>;
  userID: Scalars['ID']['output'];
};

export type InfiniteAgentConfigResponse = {
  __typename?: 'InfiniteAgentConfigResponse';
  infiniteAgentConfig?: Maybe<InfiniteAgentConfig>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type InfiniteAgentConfigsResponse = {
  __typename?: 'InfiniteAgentConfigsResponse';
  infiniteAgentConfigs: Array<InfiniteAgentConfig>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type InfiniteAgentReferralTree = {
  __typename?: 'InfiniteAgentReferralTree';
  activeUsers: Scalars['Int']['output'];
  commissionRateN: Scalars['Float']['output'];
  createdAt: Scalars['Time']['output'];
  description?: Maybe<Scalars['String']['output']>;
  directCount: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  infiniteAgentConfig: InfiniteAgentConfig;
  infiniteAgentUser: User;
  infiniteAgentUserId: Scalars['ID']['output'];
  maxDepth: Scalars['Int']['output'];
  rootUser: User;
  rootUserId: Scalars['ID']['output'];
  snapshotDate: Scalars['Time']['output'];
  status: Scalars['String']['output'];
  totalCommissionEarned: Scalars['Float']['output'];
  totalNodes: Scalars['Int']['output'];
  totalVolumeUsd: Scalars['Float']['output'];
  tradingUsers: Scalars['Int']['output'];
  treeNodes: Array<InfiniteAgentTreeNode>;
};

export type InfiniteAgentReferralTreeResponse = {
  __typename?: 'InfiniteAgentReferralTreeResponse';
  infiniteAgentReferralTree?: Maybe<InfiniteAgentReferralTree>;
  infiniteAgentTreeNodes: Array<InfiniteAgentTreeNode>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type InfiniteAgentReferralTreesResponse = {
  __typename?: 'InfiniteAgentReferralTreesResponse';
  infiniteAgentReferralTrees: Array<InfiniteAgentReferralTree>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type InfiniteAgentTreeNode = {
  __typename?: 'InfiniteAgentTreeNode';
  agentLevel: AgentLevel;
  agentLevelID: Scalars['Int']['output'];
  commissionEarned: Scalars['Float']['output'];
  createdAt: Scalars['Time']['output'];
  depth: Scalars['Int']['output'];
  feeVolumeUsd: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isTrading: Scalars['Boolean']['output'];
  level: Scalars['Int']['output'];
  parentUser?: Maybe<User>;
  parentUserID?: Maybe<Scalars['ID']['output']>;
  position: Scalars['Int']['output'];
  referrer?: Maybe<User>;
  referrerID?: Maybe<Scalars['ID']['output']>;
  tree: InfiniteAgentReferralTree;
  treeID: Scalars['ID']['output'];
  user: User;
  userID: Scalars['ID']['output'];
  volumeUsd: Scalars['Float']['output'];
};

export type InvitationCountChartDataPoint = {
  __typename?: 'InvitationCountChartDataPoint';
  period: Scalars['String']['output'];
  timestamp: Scalars['Time']['output'];
  value: Scalars['String']['output'];
};

export type InvitationCountChartResponse = {
  __typename?: 'InvitationCountChartResponse';
  all: Array<InvitationCountChartDataPoint>;
  currentValues: InvitationCountCurrentValues;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type InvitationCountCurrentValues = {
  __typename?: 'InvitationCountCurrentValues';
  all: Scalars['String']['output'];
};

export type InvitationListItem = {
  __typename?: 'InvitationListItem';
  accumulatedCommission: Scalars['Float']['output'];
  date: Scalars['String']['output'];
  invitationTime: Scalars['Time']['output'];
  transactionAmount: Scalars['Float']['output'];
  transactionType: Scalars['String']['output'];
  userAddress: Scalars['String']['output'];
};

export type InvitationListRequest = {
  page: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
  transactionType: TransactionType;
};

export type InvitationListResponse = {
  __typename?: 'InvitationListResponse';
  data: Array<InvitationListItem>;
  message?: Maybe<Scalars['String']['output']>;
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  total: Scalars['Int']['output'];
};

export type InvitationRecord = {
  __typename?: 'InvitationRecord';
  address: Scalars['String']['output'];
  chainId: Scalars['Int']['output'];
  date: Scalars['String']['output'];
  invitedWithdrawal: Scalars['String']['output'];
  token: Scalars['String']['output'];
  transactionVolume: Scalars['String']['output'];
};

export type InvitationRecordRequest = {
  page: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
};

export type InvitationRecordResponse = {
  __typename?: 'InvitationRecordResponse';
  data: Array<InvitationRecord>;
  message: Scalars['String']['output'];
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  total: Scalars['Int']['output'];
};

export type InvitationSummary = {
  __typename?: 'InvitationSummary';
  invitedUserCount: Scalars['Int']['output'];
  tradingUserCount: Scalars['Int']['output'];
};

export type InvitationSummaryResponse = {
  __typename?: 'InvitationSummaryResponse';
  data?: Maybe<InvitationSummary>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type MultilingualName = {
  __typename?: 'MultilingualName';
  en: Scalars['String']['output'];
  hi?: Maybe<Scalars['String']['output']>;
  hk?: Maybe<Scalars['String']['output']>;
  ja?: Maybe<Scalars['String']['output']>;
  vi?: Maybe<Scalars['String']['output']>;
  zh?: Maybe<Scalars['String']['output']>;
};

export type MultilingualNameInput = {
  en: Scalars['String']['input'];
  hi?: InputMaybe<Scalars['String']['input']>;
  hk?: InputMaybe<Scalars['String']['input']>;
  ja?: InputMaybe<Scalars['String']['input']>;
  vi?: InputMaybe<Scalars['String']['input']>;
  zh?: InputMaybe<Scalars['String']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  claimActivityCashback: ClaimResultResponse;
  claimAgentReferral: ClaimResultResponse;
  claimCashback: CashbackClaimResponse;
  completeTask: TaskCompletionResponse;
  createInfiniteAgentCommission: CreateInfiniteAgentCommissionResponse;
  createInfiniteAgentConfig: CreateInfiniteAgentConfigResponse;
  createInfiniteAgentReferralTrees: CreateInfiniteAgentReferralTreeResponse;
  createReferralRelation: CreateReferralRelationResponse;
  createReferralTreeSnapshot: CreateReferralTreeSnapshotResponse;
  createUserInvitationCode: CreateUserResponse;
  createUserWithReferral: CreateUserResponse;
  refreshTaskList: Scalars['Boolean']['output'];
  triggerTierUpgradeCheck: TaskCompletionResponse;
  updateInfiniteAgentConfig: UpdateInfiniteAgentConfigResponse;
  updateLevelCommission: UpdateLevelCommissionResponse;
};


export type MutationClaimActivityCashbackArgs = {
  input: ClaimActivityCashbackInput;
};


export type MutationClaimAgentReferralArgs = {
  input: ClaimAgentReferralInput;
};


export type MutationClaimCashbackArgs = {
  input: ClaimCashbackInput;
};


export type MutationCompleteTaskArgs = {
  input: CompleteTaskInput;
};


export type MutationCreateInfiniteAgentConfigArgs = {
  input: CreateInfiniteAgentConfigInput;
};


export type MutationCreateReferralRelationArgs = {
  input: CreateReferralRelationInput;
};


export type MutationCreateUserInvitationCodeArgs = {
  input: CreateUserInvitationCodeInput;
};


export type MutationCreateUserWithReferralArgs = {
  input: CreateUserWithReferralInput;
};


export type MutationUpdateInfiniteAgentConfigArgs = {
  input: UpdateInfiniteAgentConfigInput;
};


export type MutationUpdateLevelCommissionArgs = {
  input: UpdateLevelCommissionInput;
};

export type Query = {
  __typename?: 'Query';
  activityCashbackDashboard: UserDashboardResponse;
  activityCashbackSummary: ActivityCashbackSummaryResponse;
  agentLevel?: Maybe<AgentLevel>;
  agentLevels: Array<AgentLevel>;
  checkInvitationCode: CheckInvitationCodeResponse;
  getClaimReward: ClaimRewardResponse;
  getReferralReward: ReferralRewardResponse;
  infiniteAgentConfig: InfiniteAgentConfigResponse;
  infiniteAgentConfigs: InfiniteAgentConfigsResponse;
  infiniteAgentReferralTree: InfiniteAgentReferralTreeResponse;
  infiniteAgentReferralTrees: InfiniteAgentReferralTreesResponse;
  invitationCountChart: InvitationCountChartResponse;
  invitationList: InvitationListResponse;
  invitationRecords: InvitationRecordResponse;
  invitationSummary: InvitationSummaryResponse;
  rebateAmountChart: RebateAmountChartResponse;
  referralSnapshot?: Maybe<ReferralSnapshot>;
  referralTreeSnapshot: ReferralTreeSnapshotResponse;
  referralTreeSnapshots: ReferralTreeSnapshotsResponse;
  rewardClaimHistory: RewardClaimHistoryResponse;
  taskCategories: Array<TaskCategory>;
  taskCenter: TaskCenterResponse;
  taskCompletionHistory: TaskCompletionHistoryResponse;
  tasksByCategory: Array<ActivityTask>;
  tierBenefits: TierBenefitsResponse;
  transactionData: TransactionDataResponse;
  transactionVolumeChart: TransactionVolumeChartResponse;
  userByInvitationCode?: Maybe<User>;
  userIdByWalletAddress: UserIdByWalletAddressResponse;
  userLevelInfo: UserLevelInfoResponse;
  userTaskListByCategory: UserTaskListByCategoryResponse;
  userTaskProgress: UserTaskProgressResponse;
  userTierInfo?: Maybe<UserTierInfo>;
  verifyInvitationCode: VerifyInvitationCodeResponse;
  withdrawalRecords: WithdrawalRecordResponse;
};


export type QueryAgentLevelArgs = {
  id: Scalars['Int']['input'];
};


export type QueryCheckInvitationCodeArgs = {
  input: CheckInvitationCodeInput;
};


export type QueryInfiniteAgentConfigArgs = {
  id: Scalars['ID']['input'];
};


export type QueryInfiniteAgentReferralTreeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryInvitationCountChartArgs = {
  input: DataOverviewInput;
};


export type QueryInvitationListArgs = {
  input: InvitationListRequest;
};


export type QueryInvitationRecordsArgs = {
  input: InvitationRecordRequest;
};


export type QueryRebateAmountChartArgs = {
  input: DataOverviewInput;
};


export type QueryReferralTreeSnapshotArgs = {
  id: Scalars['ID']['input'];
};


export type QueryRewardClaimHistoryArgs = {
  input: RewardClaimHistoryRequest;
};


export type QueryTaskCompletionHistoryArgs = {
  input?: InputMaybe<TaskCompletionHistoryInput>;
};


export type QueryTasksByCategoryArgs = {
  categoryName: TaskCategoryName;
};


export type QueryTransactionDataArgs = {
  input: TransactionDataInput;
};


export type QueryTransactionVolumeChartArgs = {
  input: DataOverviewInput;
};


export type QueryUserByInvitationCodeArgs = {
  invitationCode: Scalars['String']['input'];
};


export type QueryUserIdByWalletAddressArgs = {
  walletAddress: Scalars['String']['input'];
};


export type QueryUserTaskListByCategoryArgs = {
  input: UserTaskListByCategoryInput;
};


export type QueryVerifyInvitationCodeArgs = {
  input: VerifyInvitationCodeInput;
};


export type QueryWithdrawalRecordsArgs = {
  input: WithdrawalRecordRequest;
};

export type RebateAmountChartDataPoint = {
  __typename?: 'RebateAmountChartDataPoint';
  all: Scalars['String']['output'];
  contract: Scalars['String']['output'];
  meme: Scalars['String']['output'];
  period: Scalars['String']['output'];
  timestamp: Scalars['Time']['output'];
};

export type RebateAmountChartResponse = {
  __typename?: 'RebateAmountChartResponse';
  currentValues: RebateAmountCurrentValues;
  data: Array<RebateAmountChartDataPoint>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type RebateAmountCurrentValues = {
  __typename?: 'RebateAmountCurrentValues';
  all: Scalars['String']['output'];
  contract: Scalars['String']['output'];
  meme: Scalars['String']['output'];
};

export type Referral = {
  __typename?: 'Referral';
  createdAt: Scalars['String']['output'];
  depth: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  referrer?: Maybe<User>;
  referrerId?: Maybe<Scalars['ID']['output']>;
  user: User;
  userId: Scalars['ID']['output'];
};

export type ReferralRewardResponse = {
  __typename?: 'ReferralRewardResponse';
  claimAgentReferral: Scalars['String']['output'];
  claimMemeReferral: Scalars['String']['output'];
  totalAccumulatedUSD: Scalars['String']['output'];
};

export type ReferralSnapshot = {
  __typename?: 'ReferralSnapshot';
  directCount: Scalars['Int']['output'];
  l1Upline?: Maybe<User>;
  l1UplineId?: Maybe<Scalars['ID']['output']>;
  l2Upline?: Maybe<User>;
  l2UplineId?: Maybe<Scalars['ID']['output']>;
  l3Upline?: Maybe<User>;
  l3UplineId?: Maybe<Scalars['ID']['output']>;
  totalDownlineCount: Scalars['Int']['output'];
  totalRewardsDistributed: Scalars['Float']['output'];
  totalVolumeUsd: Scalars['Float']['output'];
  user: User;
  userId: Scalars['ID']['output'];
};

export type ReferralTreeNode = {
  __typename?: 'ReferralTreeNode';
  agentLevel: AgentLevel;
  agentLevelID: Scalars['Int']['output'];
  createdAt: Scalars['Time']['output'];
  depth: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isTrading: Scalars['Boolean']['output'];
  level: Scalars['Int']['output'];
  parentUser?: Maybe<User>;
  parentUserID?: Maybe<Scalars['ID']['output']>;
  position: Scalars['Int']['output'];
  referrer?: Maybe<User>;
  referrerID?: Maybe<Scalars['ID']['output']>;
  treeSnapshot: ReferralTreeSnapshot;
  treeSnapshotID: Scalars['ID']['output'];
  user: User;
  userID: Scalars['ID']['output'];
};

export type ReferralTreeSnapshot = {
  __typename?: 'ReferralTreeSnapshot';
  activeUsers: Scalars['Int']['output'];
  createdAt: Scalars['Time']['output'];
  description?: Maybe<Scalars['String']['output']>;
  directCount: Scalars['Int']['output'];
  hasInfiniteAgent: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  infiniteAgentConfig?: Maybe<InfiniteAgentConfig>;
  infiniteAgentUser?: Maybe<User>;
  infiniteAgentUserId?: Maybe<Scalars['ID']['output']>;
  isValid: Scalars['Boolean']['output'];
  maxDepth: Scalars['Int']['output'];
  rootUser: User;
  rootUserId: Scalars['ID']['output'];
  snapshotDate: Scalars['Time']['output'];
  totalNodes: Scalars['Int']['output'];
  tradingUsers: Scalars['Int']['output'];
};

export type ReferralTreeSnapshotResponse = {
  __typename?: 'ReferralTreeSnapshotResponse';
  message: Scalars['String']['output'];
  referralTreeNodes: Array<ReferralTreeNode>;
  referralTreeSnapshot?: Maybe<ReferralTreeSnapshot>;
  success: Scalars['Boolean']['output'];
};

export type ReferralTreeSnapshotsResponse = {
  __typename?: 'ReferralTreeSnapshotsResponse';
  message: Scalars['String']['output'];
  referralTreeSnapshots: Array<ReferralTreeSnapshot>;
  success: Scalars['Boolean']['output'];
};

export type RewardClaimHistoryRecord = {
  __typename?: 'RewardClaimHistoryRecord';
  address: Scalars['String']['output'];
  amount: Scalars['String']['output'];
  amountUsd: Scalars['String']['output'];
  chainId: Scalars['Int']['output'];
  createdAt: Scalars['String']['output'];
  errorCode?: Maybe<Scalars['String']['output']>;
  errorMessage?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  onchainTimestamp?: Maybe<Scalars['String']['output']>;
  processedAt?: Maybe<Scalars['String']['output']>;
  result: Scalars['String']['output'];
  token: Scalars['String']['output'];
  transactionHash?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  userId: Scalars['ID']['output'];
};

export type RewardClaimHistoryRequest = {
  isCashback?: InputMaybe<Scalars['Boolean']['input']>;
  page: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
  result?: InputMaybe<RewardClaimHistoryResultEnum>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type RewardClaimHistoryResponse = {
  __typename?: 'RewardClaimHistoryResponse';
  data: Array<RewardClaimHistoryRecord>;
  message?: Maybe<Scalars['String']['output']>;
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  total: Scalars['Int']['output'];
};

export enum RewardClaimHistoryResultEnum {
  Failed = 'failed',
  Pending = 'pending',
  Processing = 'processing',
  Success = 'success'
}

export enum RewardType {
  All = 'ALL',
  Contract = 'CONTRACT',
  Meme = 'MEME'
}

export enum StatusType {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE'
}

export type TaskCategory = {
  __typename?: 'TaskCategory';
  createdAt: Scalars['Time']['output'];
  description?: Maybe<Scalars['String']['output']>;
  displayName: Scalars['String']['output'];
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: TaskCategoryName;
  sortOrder: Scalars['Int']['output'];
  updatedAt: Scalars['Time']['output'];
};

export enum TaskCategoryName {
  Community = 'COMMUNITY',
  Daily = 'DAILY',
  Trading = 'TRADING'
}

export type TaskCategoryWithTasks = {
  __typename?: 'TaskCategoryWithTasks';
  category: TaskCategory;
  tasks: Array<TaskWithProgress>;
};

export type TaskCenter = {
  __typename?: 'TaskCenter';
  categories: Array<TaskCategoryWithTasks>;
  completedToday: Scalars['Int']['output'];
  pointsEarnedToday: Scalars['Int']['output'];
  streakTasks: Array<UserTaskProgress>;
  userProgress: Array<UserTaskProgress>;
};

export type TaskCenterResponse = {
  __typename?: 'TaskCenterResponse';
  data?: Maybe<TaskCenter>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type TaskCompletionHistory = {
  __typename?: 'TaskCompletionHistory';
  completionDate: Scalars['Time']['output'];
  createdAt: Scalars['Time']['output'];
  id: Scalars['ID']['output'];
  pointsAwarded: Scalars['Int']['output'];
  task?: Maybe<ActivityTask>;
  taskId: Scalars['ID']['output'];
  userId: Scalars['ID']['output'];
  verificationData?: Maybe<Scalars['String']['output']>;
};

export type TaskCompletionHistoryInput = {
  endDate?: InputMaybe<Scalars['Time']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  startDate?: InputMaybe<Scalars['Time']['input']>;
  taskId?: InputMaybe<Scalars['ID']['input']>;
};

export type TaskCompletionHistoryResponse = {
  __typename?: 'TaskCompletionHistoryResponse';
  data: Array<TaskCompletionHistory>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
  total: Scalars['Int']['output'];
};

export type TaskCompletionResponse = {
  __typename?: 'TaskCompletionResponse';
  completionTime?: Maybe<Scalars['Time']['output']>;
  isPending: Scalars['Boolean']['output'];
  message: Scalars['String']['output'];
  newTierLevel?: Maybe<Scalars['Int']['output']>;
  pointsAwarded: Scalars['Int']['output'];
  remainingWaitTimeSeconds?: Maybe<Scalars['Int']['output']>;
  success: Scalars['Boolean']['output'];
  tierUpgraded: Scalars['Boolean']['output'];
};

export enum TaskFrequency {
  Daily = 'DAILY',
  Manual = 'MANUAL',
  OneTime = 'ONE_TIME',
  Progressive = 'PROGRESSIVE',
  Unlimited = 'UNLIMITED'
}

export enum TaskIdentifier {
  CheckMarketTrends = 'CHECK_MARKET_TRENDS',
  DailyCheckin = 'DAILY_CHECKIN',
  InviteFriends = 'INVITE_FRIENDS',
  MarketPageView = 'MARKET_PAGE_VIEW',
  MemeTradeDaily = 'MEME_TRADE_DAILY',
  PerpetualTradeDaily = 'PERPETUAL_TRADE_DAILY',
  ShareEarningsChart = 'SHARE_EARNINGS_CHART',
  ShareReferral = 'SHARE_REFERRAL',
  TelegramJoin = 'TELEGRAM_JOIN',
  TradingPoints = 'TRADING_POINTS',
  TwitterFollow = 'TWITTER_FOLLOW',
  TwitterLike = 'TWITTER_LIKE',
  TwitterRetweet = 'TWITTER_RETWEET'
}

export enum TaskStatus {
  Claimed = 'CLAIMED',
  Completed = 'COMPLETED',
  Expired = 'EXPIRED',
  InProgress = 'IN_PROGRESS',
  NotStarted = 'NOT_STARTED'
}

export type TaskWithProgress = {
  __typename?: 'TaskWithProgress';
  progress?: Maybe<UserTaskProgress>;
  task: ActivityTask;
};

export type TierBenefit = {
  __typename?: 'TierBenefit';
  benefitsDescription?: Maybe<Scalars['String']['output']>;
  cashbackPercentage: Scalars['Float']['output'];
  createdAt: Scalars['Time']['output'];
  futureCashbackPercentage: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  minPoints: Scalars['Int']['output'];
  netFee: Scalars['Float']['output'];
  referredIncentivePercentage: Scalars['Float']['output'];
  tierColor?: Maybe<Scalars['String']['output']>;
  tierIcon?: Maybe<Scalars['String']['output']>;
  tierLevel: Scalars['Int']['output'];
  tierName: Scalars['String']['output'];
  updatedAt: Scalars['Time']['output'];
};

export type TierBenefitResponse = {
  __typename?: 'TierBenefitResponse';
  data?: Maybe<TierBenefit>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type TierBenefitsResponse = {
  __typename?: 'TierBenefitsResponse';
  data: Array<TierBenefit>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export enum TimeRangeType {
  AllTime = 'ALL_TIME',
  Last_30Days = 'LAST_30_DAYS',
  Last_60Days = 'LAST_60_DAYS',
  Today = 'TODAY'
}

export type TransactionData = {
  __typename?: 'TransactionData';
  claimedUsd: Scalars['String']['output'];
  contractVolumeUsd: Scalars['String']['output'];
  invitationCount: Scalars['Int']['output'];
  memeVolumeUsd: Scalars['String']['output'];
  pendingClaimUsd: Scalars['String']['output'];
  transactingUserCount: Scalars['Int']['output'];
  transactionAmountUsd: Scalars['String']['output'];
};

export type TransactionDataInput = {
  dataType: TransactionDataType;
  timeRange: TimeRangeType;
};

export type TransactionDataResponse = {
  __typename?: 'TransactionDataResponse';
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
  transactionData: Array<TransactionData>;
};

export enum TransactionDataType {
  All = 'ALL',
  Contract = 'CONTRACT',
  Meme = 'MEME'
}

export enum TransactionType {
  All = 'ALL',
  Contract = 'CONTRACT',
  Meme = 'MEME',
  Spot = 'SPOT'
}

export type TransactionVolumeChartDataPoint = {
  __typename?: 'TransactionVolumeChartDataPoint';
  all: Scalars['String']['output'];
  contract: Scalars['String']['output'];
  meme: Scalars['String']['output'];
  period: Scalars['String']['output'];
  timestamp: Scalars['Time']['output'];
};

export type TransactionVolumeChartResponse = {
  __typename?: 'TransactionVolumeChartResponse';
  currentValues: TransactionVolumeCurrentValues;
  data: Array<TransactionVolumeChartDataPoint>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type TransactionVolumeCurrentValues = {
  __typename?: 'TransactionVolumeCurrentValues';
  all: Scalars['String']['output'];
  contract: Scalars['String']['output'];
  meme: Scalars['String']['output'];
};

export type UpdateInfiniteAgentConfigInput = {
  commissionRateN?: InputMaybe<Scalars['Float']['input']>;
  id: Scalars['ID']['input'];
  status?: InputMaybe<StatusType>;
  userID: Scalars['ID']['input'];
};

export type UpdateInfiniteAgentConfigResponse = {
  __typename?: 'UpdateInfiniteAgentConfigResponse';
  infiniteAgentConfig?: Maybe<InfiniteAgentConfig>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type UpdateLevelCommissionInput = {
  directCommissionRate: Scalars['Float']['input'];
  extendedCommissionRate: Scalars['Float']['input'];
  indirectCommissionRate: Scalars['Float']['input'];
  levelId: Scalars['LevelId']['input'];
  memeFeeRebate: Scalars['Float']['input'];
};

export type UpdateLevelCommissionResponse = {
  __typename?: 'UpdateLevelCommissionResponse';
  level?: Maybe<AgentLevel>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type UpdateTaskInput = {
  actionTarget?: InputMaybe<Scalars['String']['input']>;
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  conditions?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['Int64']['input']>;
  externalLink?: InputMaybe<Scalars['String']['input']>;
  frequency?: InputMaybe<TaskFrequency>;
  id: Scalars['ID']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  maxCompletions?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<MultilingualNameInput>;
  points?: InputMaybe<Scalars['Int']['input']>;
  resetPeriod?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
  startDate?: InputMaybe<Scalars['Int64']['input']>;
  verificationMethod?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTierBenefitInput = {
  benefitsDescription?: InputMaybe<Scalars['String']['input']>;
  cashbackPercentage?: InputMaybe<Scalars['Float']['input']>;
  id: Scalars['ID']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  minPoints?: InputMaybe<Scalars['Int']['input']>;
  netFee?: InputMaybe<Scalars['Float']['input']>;
  tierColor?: InputMaybe<Scalars['String']['input']>;
  tierIcon?: InputMaybe<Scalars['String']['input']>;
  tierLevel?: InputMaybe<Scalars['Int']['input']>;
  tierName?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  agentLevel: AgentLevel;
  agentLevelId: Scalars['Int']['output'];
  createdAt: Scalars['String']['output'];
  deletedAt?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  firstTransactionAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  invitationCode?: Maybe<Scalars['String']['output']>;
  levelGracePeriodStartedAt?: Maybe<Scalars['String']['output']>;
  levelUpgradedAt?: Maybe<Scalars['String']['output']>;
  referralSnapshot?: Maybe<ReferralSnapshot>;
  referrals: Array<Referral>;
  referredUsers: Array<Referral>;
  updatedAt: Scalars['String']['output'];
};

export type UserDashboard = {
  __typename?: 'UserDashboard';
  claimableCashback: Scalars['Float']['output'];
  nextTier?: Maybe<TierBenefit>;
  pointsToNextTier: Scalars['Int']['output'];
  recentClaims: Array<ActivityCashbackClaim>;
  tierBenefit: TierBenefit;
  userRank: Scalars['Int']['output'];
  userTierInfo: UserTierInfo;
};

export type UserDashboardResponse = {
  __typename?: 'UserDashboardResponse';
  data?: Maybe<UserDashboard>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type UserIdByWalletAddressResponse = {
  __typename?: 'UserIDByWalletAddressResponse';
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
  userId?: Maybe<Scalars['ID']['output']>;
};

export type UserLevelInfo = {
  __typename?: 'UserLevelInfo';
  contractVolume: Scalars['String']['output'];
  currentLevel: AgentLevel;
  memeVolume: Scalars['String']['output'];
  totalVolume: Scalars['String']['output'];
};

export type UserLevelInfoResponse = {
  __typename?: 'UserLevelInfoResponse';
  data?: Maybe<UserLevelInfo>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type UserTaskListByCategoryInput = {
  categoryName: TaskCategoryName;
};

export type UserTaskListByCategoryResponse = {
  __typename?: 'UserTaskListByCategoryResponse';
  data: Array<TaskWithProgress>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type UserTaskProgress = {
  __typename?: 'UserTaskProgress';
  canBeClaimed: Scalars['Boolean']['output'];
  completionCount: Scalars['Int']['output'];
  createdAt: Scalars['Time']['output'];
  id: Scalars['ID']['output'];
  lastCompletedAt?: Maybe<Scalars['Time']['output']>;
  lastResetAt?: Maybe<Scalars['Time']['output']>;
  metadata?: Maybe<Scalars['String']['output']>;
  pointsEarned: Scalars['Int']['output'];
  progressPercentage: Scalars['Float']['output'];
  progressValue: Scalars['Int']['output'];
  status: TaskStatus;
  streakCount: Scalars['Int']['output'];
  targetValue?: Maybe<Scalars['Int']['output']>;
  taskId: Scalars['ID']['output'];
  updatedAt: Scalars['Time']['output'];
  userId: Scalars['ID']['output'];
};

export type UserTaskProgressResponse = {
  __typename?: 'UserTaskProgressResponse';
  data: Array<UserTaskProgress>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type UserTierInfo = {
  __typename?: 'UserTierInfo';
  activeDaysThisMonth: Scalars['Int']['output'];
  claimableCashbackUsd: Scalars['Float']['output'];
  claimedCashbackUsd: Scalars['Float']['output'];
  createdAt: Scalars['Time']['output'];
  cumulativeCashbackUsd: Scalars['Float']['output'];
  currentTier: Scalars['Int']['output'];
  lastActivityDate?: Maybe<Scalars['Time']['output']>;
  monthlyResetAt?: Maybe<Scalars['Time']['output']>;
  pointsThisMonth: Scalars['Int']['output'];
  tierBenefit?: Maybe<TierBenefit>;
  tierUpgradedAt?: Maybe<Scalars['Time']['output']>;
  totalPoints: Scalars['Int']['output'];
  tradingVolumeUsd: Scalars['Float']['output'];
  updatedAt: Scalars['Time']['output'];
  userId: Scalars['ID']['output'];
  userRank?: Maybe<Scalars['Int']['output']>;
};

export type VerifyInvitationCodeInput = {
  invitationCode: Scalars['String']['input'];
};

export type VerifyInvitationCodeResponse = {
  __typename?: 'VerifyInvitationCodeResponse';
  isValid: Scalars['Boolean']['output'];
  message: Scalars['String']['output'];
};

export enum WalletType {
  Embedded = 'EMBEDDED',
  Managed = 'MANAGED'
}

export type WithdrawalRecord = {
  __typename?: 'WithdrawalRecord';
  date: Scalars['String']['output'];
  hash: Scalars['String']['output'];
  type: Scalars['String']['output'];
  withdrawalReward: Scalars['String']['output'];
};

export type WithdrawalRecordRequest = {
  page: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
};

export type WithdrawalRecordResponse = {
  __typename?: 'WithdrawalRecordResponse';
  data: Array<WithdrawalRecord>;
  message?: Maybe<Scalars['String']['output']>;
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  total: Scalars['Int']['output'];
};

export enum WithdrawalStatus {
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  Pending = 'PENDING'
}
