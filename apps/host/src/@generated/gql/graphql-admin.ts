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
  JSON: { input: any; output: any; }
};

export type AmountRange = {
  __typename?: 'AmountRange';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  maxAmount: Scalars['String']['output'];
  minAmount: Scalars['String']['output'];
  redPacketType: RedPacketType;
  skewFactor?: Maybe<Scalars['Float']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type AnnouncementPopup = {
  __typename?: 'AnnouncementPopup';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  data?: Maybe<Array<AnnouncementPopupLanguageData>>;
  endTime?: Maybe<Scalars['DateTime']['output']>;
  frequency?: Maybe<AnnouncementPopupFrequency>;
  id: Scalars['String']['output'];
  internalName?: Maybe<Scalars['String']['output']>;
  priority?: Maybe<Scalars['Float']['output']>;
  startTime?: Maybe<Scalars['DateTime']['output']>;
  status?: Maybe<AnnouncementPopupStatus>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type AnnouncementPopupData = {
  __typename?: 'AnnouncementPopupData';
  buttonLink?: Maybe<Scalars['String']['output']>;
  buttonText?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  fileType?: Maybe<Scalars['String']['output']>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export enum AnnouncementPopupFrequency {
  Daily = 'DAILY',
  Everytime = 'EVERYTIME',
  Once = 'ONCE'
}

export type AnnouncementPopupLanguageData = {
  __typename?: 'AnnouncementPopupLanguageData';
  contents?: Maybe<Array<AnnouncementPopupData>>;
  language: Scalars['String']['output'];
};

export enum AnnouncementPopupStatus {
  Expired = 'EXPIRED',
  Offline = 'OFFLINE',
  Online = 'ONLINE',
  Pending = 'PENDING'
}

export type BatchDesignatedRedPacketInput = {
  designatedAmount: Scalars['String']['input'];
  expiresAt?: InputMaybe<Scalars['String']['input']>;
  walletAddress: Scalars['String']['input'];
};

export type BatchDesignatedRedPacketResult = {
  __typename?: 'BatchDesignatedRedPacketResult';
  createdCount: Scalars['Int']['output'];
  designatedRedPackets: Array<DesignatedRedPacket>;
  errorMessage?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
  totalAmountReserved: Scalars['String']['output'];
};

export type BulkUpdateFeatureFlagsInput = {
  claimEnabledH5?: InputMaybe<Scalars['Boolean']['input']>;
  claimEnabledMobile?: InputMaybe<Scalars['Boolean']['input']>;
  claimEnabledWeb?: InputMaybe<Scalars['Boolean']['input']>;
  leaderboardEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  luckyLottoEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  overlayEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  v2Enabled?: InputMaybe<Scalars['Boolean']['input']>;
  withdrawalEnabledH5?: InputMaybe<Scalars['Boolean']['input']>;
  withdrawalEnabledMobile?: InputMaybe<Scalars['Boolean']['input']>;
  withdrawalEnabledWeb?: InputMaybe<Scalars['Boolean']['input']>;
};

export type CampaignStatus = {
  __typename?: 'CampaignStatus';
  endDate?: Maybe<Scalars['String']['output']>;
  endTimestamp?: Maybe<Scalars['Int']['output']>;
  isActive: Scalars['Boolean']['output'];
  startDate?: Maybe<Scalars['String']['output']>;
  startTimestamp?: Maybe<Scalars['Int']['output']>;
  statusMessage: Scalars['String']['output'];
};

export type CleanupRun = {
  __typename?: 'CleanupRun';
  autoClaimAmount: Scalars['String']['output'];
  autoClaimFailedCount: Scalars['Int']['output'];
  autoClaimUsersCount: Scalars['Int']['output'];
  completedAt?: Maybe<Scalars['String']['output']>;
  criticalHitPoolRecovered: Scalars['String']['output'];
  cutoffTime: Scalars['String']['output'];
  designatedPoolRecovered: Scalars['String']['output'];
  errorMessage?: Maybe<Scalars['String']['output']>;
  expiredPacketsAmount: Scalars['String']['output'];
  expiredPacketsCount: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  sharedPoolRecovered: Scalars['String']['output'];
  smallBalanceRecoveredAmount: Scalars['String']['output'];
  smallBalanceUsersCount: Scalars['Int']['output'];
  startedAt: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type CreateAmountRangeInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  maxAmount: Scalars['String']['input'];
  minAmount: Scalars['String']['input'];
  redPacketType: RedPacketType;
  skewFactor?: InputMaybe<Scalars['Float']['input']>;
};

export type CreateCriticalHitTierInput = {
  amount: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  probability: Scalars['Float']['input'];
  sortOrder: Scalars['Int']['input'];
};

export type CreateDailyPrizePoolConfigInput = {
  dailyBudget: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  poolType: PoolType;
  resetHourUTC: Scalars['Int']['input'];
};

export type CreateDesignatedRedPacketInput = {
  designatedAmount: Scalars['String']['input'];
  expiresAt?: InputMaybe<Scalars['String']['input']>;
  walletAddress: Scalars['String']['input'];
};

export type CreateLeaderboardCycleInput = {
  endTime: Scalars['String']['input'];
  startTime: Scalars['String']['input'];
};

export type CreateLottoDrawConfigInput = {
  drawTimeUtc: Scalars['String']['input'];
  eligibilityThreshold: Scalars['Int']['input'];
  fundPoolAddress: Scalars['String']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  prizeAmount: Scalars['String']['input'];
  totalBudget: Scalars['String']['input'];
};

export type CreateRedPacketConfigInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  maxValue?: InputMaybe<Scalars['String']['input']>;
  minValue?: InputMaybe<Scalars['String']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

export type CreateThresholdTierInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  packetsEarned: Scalars['Int']['input'];
  sortOrder: Scalars['Int']['input'];
  thresholdAmount: Scalars['String']['input'];
  tierType: ThresholdTierType;
};

export type CriticalHitBudgetStats = {
  __typename?: 'CriticalHitBudgetStats';
  distributedCount: Scalars['Int']['output'];
  isActive: Scalars['Boolean']['output'];
  remainingBudget: Scalars['String']['output'];
  spentAmount: Scalars['String']['output'];
  totalBudget: Scalars['String']['output'];
};

export type CriticalHitTier = {
  __typename?: 'CriticalHitTier';
  amount: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  probability: Scalars['Float']['output'];
  sortOrder: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export enum CycleStatus {
  Active = 'ACTIVE',
  Completed = 'COMPLETED',
  Upcoming = 'UPCOMING'
}

export type CycleTopUser = {
  __typename?: 'CycleTopUser';
  firstTradeAt?: Maybe<Scalars['Float']['output']>;
  lastTradeAt?: Maybe<Scalars['Float']['output']>;
  rank: Scalars['Int']['output'];
  tradingVolume: Scalars['String']['output'];
  userId: Scalars['String']['output'];
  walletAddress: Scalars['String']['output'];
};

export type CycleTopUsersResult = {
  __typename?: 'CycleTopUsersResult';
  cycle: LeaderboardCycle;
  totalCount: Scalars['Int']['output'];
  users: Array<CycleTopUser>;
};

export type DailyPrizePoolConfig = {
  __typename?: 'DailyPrizePoolConfig';
  createdAt: Scalars['Float']['output'];
  dailyBudget: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  poolType: PoolType;
  resetHourUTC: Scalars['Int']['output'];
  updatedAt: Scalars['Float']['output'];
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type DailyPrizePoolConfigAudit = {
  __typename?: 'DailyPrizePoolConfigAudit';
  changeReason?: Maybe<Scalars['String']['output']>;
  changedBy?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Float']['output'];
  id: Scalars['String']['output'];
  newBudget: Scalars['String']['output'];
  oldBudget?: Maybe<Scalars['String']['output']>;
  poolType: PoolType;
};

export type DailyPrizePoolConfigAuditFilter = {
  poolType?: InputMaybe<PoolType>;
};

export type DailyPrizePoolStatus = {
  __typename?: 'DailyPrizePoolStatus';
  consumptionRate: Scalars['String']['output'];
  createdAt: Scalars['Float']['output'];
  date: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isAvailable: Scalars['Boolean']['output'];
  packetsClaimed: Scalars['Int']['output'];
  packetsIssued: Scalars['Int']['output'];
  poolType: PoolType;
  remainingAmount: Scalars['String']['output'];
  reservedAmount: Scalars['String']['output'];
  spentAmount: Scalars['String']['output'];
  totalBudget: Scalars['String']['output'];
  updatedAt: Scalars['Float']['output'];
};

export type DailyPrizePoolStatusRangeFilter = {
  endDate?: InputMaybe<Scalars['String']['input']>;
  poolType?: InputMaybe<PoolType>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};

export type DailyPrizePoolSummary = {
  __typename?: 'DailyPrizePoolSummary';
  criticalHitDesignatedPoolConfig?: Maybe<DailyPrizePoolConfig>;
  criticalHitDesignatedPoolStatus?: Maybe<DailyPrizePoolStatus>;
  criticalHitPoolConfig?: Maybe<DailyPrizePoolConfig>;
  criticalHitPoolStatus?: Maybe<DailyPrizePoolStatus>;
  depletionMessage?: Maybe<Scalars['String']['output']>;
  isAnyPoolDepleted: Scalars['Boolean']['output'];
  sharedPoolConfig?: Maybe<DailyPrizePoolConfig>;
  sharedPoolStatus?: Maybe<DailyPrizePoolStatus>;
};

export type DashboardStats = {
  __typename?: 'DashboardStats';
  criticalHitDesignatedPool: PoolInfo;
  criticalHitDesignatedStats: RedPacketTypeStats;
  criticalHitPool: PoolInfo;
  criticalHitStats: RedPacketTypeStats;
  depositStats: RedPacketTypeStats;
  sharedPool: PoolInfo;
  tradingStats: RedPacketTypeStats;
  twitterBindingStats: RedPacketTypeStats;
  twitterFollowStats: RedPacketTypeStats;
};

export type DepositTimeSeriesResponse = {
  __typename?: 'DepositTimeSeriesResponse';
  daily: Array<DepositTimeSeriesStatItem>;
};

export type DepositTimeSeriesStatItem = {
  __typename?: 'DepositTimeSeriesStatItem';
  cumulativeDepositAmount: Scalars['String']['output'];
  date: Scalars['String']['output'];
  depositAmount: Scalars['String']['output'];
};

export type DesignatedRedPacket = {
  __typename?: 'DesignatedRedPacket';
  createdAt: Scalars['String']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  designatedAmount: Scalars['String']['output'];
  expiresAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  redPacketId?: Maybe<Scalars['String']['output']>;
  status: DesignatedRedPacketStatus;
  triggeredAt?: Maybe<Scalars['String']['output']>;
  triggeredBy?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['String']['output'];
  walletAddress: Scalars['String']['output'];
};

export type DesignatedRedPacketFilter = {
  createdFrom?: InputMaybe<Scalars['String']['input']>;
  createdTo?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<DesignatedRedPacketStatus>;
  walletAddress?: InputMaybe<Scalars['String']['input']>;
};

export enum DesignatedRedPacketStatus {
  Cancelled = 'CANCELLED',
  Expired = 'EXPIRED',
  Pending = 'PENDING',
  Triggered = 'TRIGGERED'
}

export type FeatureFlag = {
  __typename?: 'FeatureFlag';
  createdAt: Scalars['Float']['output'];
  description?: Maybe<Scalars['String']['output']>;
  enabled: Scalars['Boolean']['output'];
  flagKey: FeatureFlagKey;
  id: Scalars['String']['output'];
  updatedAt: Scalars['Float']['output'];
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export enum FeatureFlagKey {
  ClaimEnabledH5 = 'CLAIM_ENABLED_H5',
  ClaimEnabledMobile = 'CLAIM_ENABLED_MOBILE',
  ClaimEnabledWeb = 'CLAIM_ENABLED_WEB',
  LeaderboardEnabled = 'LEADERBOARD_ENABLED',
  LuckyLottoEnabled = 'LUCKY_LOTTO_ENABLED',
  OverlayEnabled = 'OVERLAY_ENABLED',
  V2Enabled = 'V2_ENABLED',
  WithdrawalEnabledH5 = 'WITHDRAWAL_ENABLED_H5',
  WithdrawalEnabledMobile = 'WITHDRAWAL_ENABLED_MOBILE',
  WithdrawalEnabledWeb = 'WITHDRAWAL_ENABLED_WEB'
}

export type FeatureFlags = {
  __typename?: 'FeatureFlags';
  claimEnabledH5: Scalars['Boolean']['output'];
  claimEnabledMobile: Scalars['Boolean']['output'];
  claimEnabledWeb: Scalars['Boolean']['output'];
  envDefaults: FeatureFlagsEnvDefaults;
  leaderboardEnabled: Scalars['Boolean']['output'];
  luckyLottoEnabled: Scalars['Boolean']['output'];
  overlayEnabled: Scalars['Boolean']['output'];
  v2Enabled: Scalars['Boolean']['output'];
  withdrawalEnabledH5: Scalars['Boolean']['output'];
  withdrawalEnabledMobile: Scalars['Boolean']['output'];
  withdrawalEnabledWeb: Scalars['Boolean']['output'];
};

export type FeatureFlagsEnvDefaults = {
  __typename?: 'FeatureFlagsEnvDefaults';
  claimEnabledH5: Scalars['Boolean']['output'];
  claimEnabledMobile: Scalars['Boolean']['output'];
  claimEnabledWeb: Scalars['Boolean']['output'];
  leaderboardEnabled: Scalars['Boolean']['output'];
  luckyLottoEnabled: Scalars['Boolean']['output'];
  overlayEnabled: Scalars['Boolean']['output'];
  v2Enabled: Scalars['Boolean']['output'];
  withdrawalEnabledH5: Scalars['Boolean']['output'];
  withdrawalEnabledMobile: Scalars['Boolean']['output'];
  withdrawalEnabledWeb: Scalars['Boolean']['output'];
};

export type GetAdminLuckyLottoHistoryResponse = {
  __typename?: 'GetAdminLuckyLottoHistoryResponse';
  records: Array<LuckyLottoDrawRecord>;
  totalCount: Scalars['Int']['output'];
};

export type GetDailyPrizePoolConfigAuditHistoryResponse = {
  __typename?: 'GetDailyPrizePoolConfigAuditHistoryResponse';
  records: Array<DailyPrizePoolConfigAudit>;
  totalCount: Scalars['Int']['output'];
};

export type GetDailyPrizePoolStatusRangeResponse = {
  __typename?: 'GetDailyPrizePoolStatusRangeResponse';
  records: Array<DailyPrizePoolStatus>;
  totalCount: Scalars['Int']['output'];
};

export type GetDesignatedRedPacketsResponse = {
  __typename?: 'GetDesignatedRedPacketsResponse';
  records: Array<DesignatedRedPacket>;
  totalCount: Scalars['Int']['output'];
};

export type GetFeatureFlagsResponse = {
  __typename?: 'GetFeatureFlagsResponse';
  flags: Array<FeatureFlag>;
  status: FeatureFlags;
};

export type GetRedPacketRecordsResponse = {
  __typename?: 'GetRedPacketRecordsResponse';
  records: Array<RedPacketRecord>;
  totalCount: Scalars['Int']['output'];
};

export type GrantRedPacketInput = {
  amount: Scalars['String']['input'];
  reason: Scalars['String']['input'];
  type: RedPacketType;
  walletAddress: Scalars['String']['input'];
};

export type GrantRedPacketResponse = {
  __typename?: 'GrantRedPacketResponse';
  amount: Scalars['String']['output'];
  claimedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  status: Scalars['String']['output'];
  type: RedPacketType;
  userId: Scalars['String']['output'];
};

export type LeaderboardCycle = {
  __typename?: 'LeaderboardCycle';
  createdAt: Scalars['Float']['output'];
  cycleNumber: Scalars['Int']['output'];
  endTime: Scalars['String']['output'];
  id: Scalars['String']['output'];
  startTime: Scalars['String']['output'];
  status: CycleStatus;
  updatedAt: Scalars['Float']['output'];
};

export type LeaderboardCycleConnection = {
  __typename?: 'LeaderboardCycleConnection';
  cycles: Array<LeaderboardCycle>;
  totalCount: Scalars['Int']['output'];
};

export type LeaderboardCycleFilter = {
  status?: InputMaybe<CycleStatus>;
};

export type LeaderboardCycleStats = {
  __typename?: 'LeaderboardCycleStats';
  cycleId: Scalars['String']['output'];
  totalParticipants: Scalars['Int']['output'];
  totalVolume: Scalars['String']['output'];
};

export type LinkConfig = {
  __typename?: 'LinkConfig';
  id: Scalars['String']['output'];
  key: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  value: Scalars['String']['output'];
};

export type LottoDrawConfig = {
  __typename?: 'LottoDrawConfig';
  createdAt: Scalars['Float']['output'];
  drawTimeUtc: Scalars['String']['output'];
  eligibilityThreshold: Scalars['Int']['output'];
  fundPoolAddress: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  prizeAmount: Scalars['String']['output'];
  remainingBudget: Scalars['String']['output'];
  totalBudget: Scalars['String']['output'];
  updatedAt: Scalars['Float']['output'];
};

export type LuckyLottoDrawRecord = {
  __typename?: 'LuckyLottoDrawRecord';
  createdAt: Scalars['String']['output'];
  distributedAt?: Maybe<Scalars['String']['output']>;
  drawDate: Scalars['String']['output'];
  drawId: Scalars['String']['output'];
  drawTime: Scalars['String']['output'];
  luckyNumbers: Array<Scalars['Int']['output']>;
  participantCount: Scalars['Int']['output'];
  prizeDistributed: Scalars['Boolean']['output'];
  prizePerWinner: Scalars['String']['output'];
  totalPrizeAmount: Scalars['String']['output'];
  transactionHashes: Array<Scalars['String']['output']>;
  winnerCount: Scalars['Int']['output'];
  winners: Array<LuckyLottoWinner>;
};

export type LuckyLottoWinner = {
  __typename?: 'LuckyLottoWinner';
  drawTime: Scalars['String']['output'];
  prizeAmount: Scalars['String']['output'];
  randomNumber: Scalars['Int']['output'];
  rank: Scalars['Int']['output'];
  tradingVolume: Scalars['String']['output'];
  userId: Scalars['String']['output'];
  walletAddress: Scalars['String']['output'];
};

export type MaintenanceModel = {
  __typename?: 'MaintenanceModel';
  created_at: Scalars['DateTime']['output'];
  from?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  isMaintainSchedule: Scalars['Boolean']['output'];
  to?: Maybe<Scalars['DateTime']['output']>;
  updated_at?: Maybe<Scalars['DateTime']['output']>;
  warningAt?: Maybe<Scalars['DateTime']['output']>;
};

export type MaintenanceStatusModel = {
  __typename?: 'MaintenanceStatusModel';
  from?: Maybe<Scalars['DateTime']['output']>;
  isActive: Scalars['Boolean']['output'];
  isMaintainSchedule: Scalars['Boolean']['output'];
  message?: Maybe<Scalars['String']['output']>;
  to?: Maybe<Scalars['DateTime']['output']>;
  warningAt?: Maybe<Scalars['DateTime']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  adminResetDailyTasks: Scalars['JSON']['output'];
  adminResetMonthlyTasks: Scalars['JSON']['output'];
  adminResetWeeklyTasks: Scalars['JSON']['output'];
  adminSeedInitialTasks: Scalars['JSON']['output'];
  bulkUpdateFeatureFlags: FeatureFlags;
  clearCampaignDates: CampaignStatus;
  createAccumulatedMEMETradingVolumeTask: Scalars['JSON']['output'];
  createAmountRange: AmountRange;
  createBatchDesignatedRedPackets: BatchDesignatedRedPacketResult;
  createConsecutiveCheckinTask: Scalars['JSON']['output'];
  createCriticalHitTier: CriticalHitTier;
  createDailyPrizePoolConfig: DailyPrizePoolConfig;
  createDesignatedRedPacket: DesignatedRedPacket;
  createLeaderboardCycle: LeaderboardCycle;
  createLottoDrawConfig: LottoDrawConfig;
  createRedPacketConfig: RedPacketConfig;
  createTask: Scalars['JSON']['output'];
  createTaskCategory: Scalars['JSON']['output'];
  createThresholdTier: ThresholdTier;
  createTierBenefit: Scalars['JSON']['output'];
  deleteCriticalHitTier: Scalars['Boolean']['output'];
  deleteDesignatedRedPacket: Scalars['Boolean']['output'];
  deleteLeaderboardCycle: Scalars['Boolean']['output'];
  deleteTask: Scalars['JSON']['output'];
  deleteTaskCategory: Scalars['JSON']['output'];
  deleteThresholdTier: Scalars['Boolean']['output'];
  deleteTierBenefit: Scalars['JSON']['output'];
  grantRedPacket: GrantRedPacketResponse;
  setCampaignDates: CampaignStatus;
  setOverlayConfig: OverlayStatus;
  setRewardPoolBudget: RewardPoolBalance;
  toggleSwapStatus: Scalars['JSON']['output'];
  updateAmountRange: AmountRange;
  updateCriticalHitTier: CriticalHitTier;
  updateDailyPrizePoolConfig: DailyPrizePoolConfig;
  updateDesignatedRedPacket: DesignatedRedPacket;
  updateFeatureFlag: FeatureFlag;
  updateLeaderboardCycle: LeaderboardCycle;
  updateLottoDrawConfig: LottoDrawConfig;
  updateRedPacketConfig: RedPacketConfig;
  updateSwapFeeConfig: Scalars['JSON']['output'];
  updateSwapRangoConfig: Scalars['JSON']['output'];
  updateTask: Scalars['JSON']['output'];
  updateTaskCategory: Scalars['JSON']['output'];
  updateThresholdTier: ThresholdTier;
  updateTierBenefit: Scalars['JSON']['output'];
};


export type MutationBulkUpdateFeatureFlagsArgs = {
  input: BulkUpdateFeatureFlagsInput;
};


export type MutationClearCampaignDatesArgs = {
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateAmountRangeArgs = {
  input: CreateAmountRangeInput;
};


export type MutationCreateBatchDesignatedRedPacketsArgs = {
  inputs: Array<BatchDesignatedRedPacketInput>;
};


export type MutationCreateCriticalHitTierArgs = {
  input: CreateCriticalHitTierInput;
};


export type MutationCreateDailyPrizePoolConfigArgs = {
  input: CreateDailyPrizePoolConfigInput;
};


export type MutationCreateDesignatedRedPacketArgs = {
  input: CreateDesignatedRedPacketInput;
};


export type MutationCreateLeaderboardCycleArgs = {
  input: CreateLeaderboardCycleInput;
};


export type MutationCreateLottoDrawConfigArgs = {
  input: CreateLottoDrawConfigInput;
};


export type MutationCreateRedPacketConfigArgs = {
  input: CreateRedPacketConfigInput;
};


export type MutationCreateThresholdTierArgs = {
  input: CreateThresholdTierInput;
};


export type MutationDeleteCriticalHitTierArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteDesignatedRedPacketArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteLeaderboardCycleArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteThresholdTierArgs = {
  id: Scalars['String']['input'];
};


export type MutationGrantRedPacketArgs = {
  input: GrantRedPacketInput;
};


export type MutationSetCampaignDatesArgs = {
  input: SetCampaignDatesInput;
};


export type MutationSetOverlayConfigArgs = {
  input: SetOverlayConfigInput;
};


export type MutationSetRewardPoolBudgetArgs = {
  input: SetRewardPoolBudgetInput;
};


export type MutationToggleSwapStatusArgs = {
  input: Scalars['JSON']['input'];
};


export type MutationUpdateAmountRangeArgs = {
  input: UpdateAmountRangeInput;
};


export type MutationUpdateCriticalHitTierArgs = {
  input: UpdateCriticalHitTierInput;
};


export type MutationUpdateDailyPrizePoolConfigArgs = {
  input: UpdateDailyPrizePoolConfigInput;
};


export type MutationUpdateDesignatedRedPacketArgs = {
  input: UpdateDesignatedRedPacketInput;
};


export type MutationUpdateFeatureFlagArgs = {
  input: UpdateFeatureFlagInput;
};


export type MutationUpdateLeaderboardCycleArgs = {
  input: UpdateLeaderboardCycleInput;
};


export type MutationUpdateLottoDrawConfigArgs = {
  input: UpdateLottoDrawConfigInput;
};


export type MutationUpdateRedPacketConfigArgs = {
  input: UpdateRedPacketConfigInput;
};


export type MutationUpdateSwapFeeConfigArgs = {
  input: Scalars['JSON']['input'];
};


export type MutationUpdateSwapRangoConfigArgs = {
  input: Scalars['JSON']['input'];
};


export type MutationUpdateThresholdTierArgs = {
  input: UpdateThresholdTierInput;
};

export type OverlayStatus = {
  __typename?: 'OverlayStatus';
  countdownSeconds?: Maybe<Scalars['Int']['output']>;
  enabled: Scalars['Boolean']['output'];
  isCurrentlyShowing: Scalars['Boolean']['output'];
  overlayType?: Maybe<Scalars['String']['output']>;
  removalTime?: Maybe<Scalars['String']['output']>;
};

export type PaginationInput = {
  limit: Scalars['Int']['input'];
  offset: Scalars['Int']['input'];
};

export type PoolInfo = {
  __typename?: 'PoolInfo';
  availableBalance: Scalars['String']['output'];
  frozenBalance: Scalars['String']['output'];
  id: Scalars['String']['output'];
  poolType: Scalars['String']['output'];
  remainingPercentage: Scalars['String']['output'];
  spentBalance: Scalars['String']['output'];
  spentPercentage: Scalars['String']['output'];
  totalBudget: Scalars['String']['output'];
  updatedAt: Scalars['Float']['output'];
};

export enum PoolType {
  CriticalHit = 'CRITICAL_HIT',
  CriticalHitDesignated = 'CRITICAL_HIT_DESIGNATED',
  Shared = 'SHARED'
}

export type PostCampaignCleanupStats = {
  __typename?: 'PostCampaignCleanupStats';
  cleanupTriggered: Scalars['Boolean']['output'];
  cutoffTime?: Maybe<Scalars['String']['output']>;
  latestRun?: Maybe<CleanupRun>;
};

export type Query = {
  __typename?: 'Query';
  GetChainsManagement: Scalars['JSON']['output'];
  adminGetAllTaskCategories: Scalars['JSON']['output'];
  adminGetAllTasks: Scalars['JSON']['output'];
  adminGetAllTierBenefits: Scalars['JSON']['output'];
  adminGetTaskCompletionStats: Scalars['JSON']['output'];
  adminGetTierDistribution: Scalars['JSON']['output'];
  adminGetTopUsers: Scalars['JSON']['output'];
  adminGetUserActivityStats: Scalars['JSON']['output'];
  adminUserActivityCashbackSummary: Scalars['JSON']['output'];
  adminUserCashbackDashboard: Scalars['JSON']['output'];
  /** Get all announcement popups */
  announcementPopups: Array<AnnouncementPopup>;
  getActiveLottoDrawConfig?: Maybe<LottoDrawConfig>;
  getAdminLuckyLottoHistory: GetAdminLuckyLottoHistoryResponse;
  getAllUserRedPackets: Array<UserRedPacket>;
  getAmountRanges: Array<AmountRange>;
  getCampaignStatus: CampaignStatus;
  getCriticalHitTiers: Array<CriticalHitTier>;
  getDailyPrizePoolConfigAuditHistory: GetDailyPrizePoolConfigAuditHistoryResponse;
  getDailyPrizePoolStatusRange: GetDailyPrizePoolStatusRangeResponse;
  getDailyPrizePoolSummary: DailyPrizePoolSummary;
  getDashboardStats: DashboardStats;
  getDepositTimeSeriesStats: DepositTimeSeriesResponse;
  getDesignatedRedPacket: DesignatedRedPacket;
  getDesignatedRedPackets: GetDesignatedRedPacketsResponse;
  getFeatureFlags: GetFeatureFlagsResponse;
  getLeaderboardCycleStats: LeaderboardCycleStats;
  getLeaderboardCycleTopUsers: CycleTopUsersResult;
  getLeaderboardCycles: LeaderboardCycleConnection;
  getLottoDrawConfigs: Array<LottoDrawConfig>;
  getOverlayStatus: OverlayStatus;
  getPostCampaignCleanupStats: PostCampaignCleanupStats;
  getRedPacketConfigs: Array<RedPacketConfig>;
  getRedPacketRecords: GetRedPacketRecordsResponse;
  getRedPacketStats: RedPacketStats;
  getRedPacketTimeSeriesStats: Array<RedPacketTimeSeriesStats>;
  getRewardPoolBalances: Array<RewardPoolBalance>;
  getSystemMaintenanceSchedule?: Maybe<MaintenanceStatusModel>;
  getThresholdTiers: Array<ThresholdTier>;
  getTradingTimeSeriesStats: TradingTimeSeriesResponse;
  /** Get all link configs */
  linkConfigs: Array<LinkConfig>;
  maintenance?: Maybe<MaintenanceModel>;
  rpcConfig: Array<RpcGroupedByTypeModel>;
  rpcConfigs: Array<RpcGroupedByTypeModel>;
  swapFeeConfig: Scalars['JSON']['output'];
  swapOverview: Scalars['JSON']['output'];
  swapRangoConfig: Scalars['JSON']['output'];
  swapRouteStats: Scalars['JSON']['output'];
  swapTokenRouteStats: Scalars['JSON']['output'];
  swapTokens: Scalars['JSON']['output'];
  swapUserHistory: Scalars['JSON']['output'];
  swapUserRanking: Scalars['JSON']['output'];
  taskCenter: Scalars['JSON']['output'];
  tasksByIds: Scalars['JSON']['output'];
  userTaskCompletionHistory: Scalars['JSON']['output'];
};


export type QueryGetAdminLuckyLottoHistoryArgs = {
  drawDate?: InputMaybe<Scalars['String']['input']>;
  limit: Scalars['Int']['input'];
  offset: Scalars['Int']['input'];
};


export type QueryGetAllUserRedPacketsArgs = {
  limit: Scalars['Int']['input'];
  offset: Scalars['Int']['input'];
};


export type QueryGetAmountRangesArgs = {
  redPacketType: RedPacketType;
};


export type QueryGetDailyPrizePoolConfigAuditHistoryArgs = {
  filter?: InputMaybe<DailyPrizePoolConfigAuditFilter>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryGetDailyPrizePoolStatusRangeArgs = {
  filter?: InputMaybe<DailyPrizePoolStatusRangeFilter>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryGetDepositTimeSeriesStatsArgs = {
  input?: InputMaybe<TimeSeriesInput>;
};


export type QueryGetDesignatedRedPacketArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetDesignatedRedPacketsArgs = {
  filter?: InputMaybe<DesignatedRedPacketFilter>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryGetFeatureFlagsArgs = {
  flagKey?: InputMaybe<FeatureFlagKey>;
};


export type QueryGetLeaderboardCycleStatsArgs = {
  cycleId: Scalars['String']['input'];
};


export type QueryGetLeaderboardCycleTopUsersArgs = {
  cycleId?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetLeaderboardCyclesArgs = {
  filter?: InputMaybe<LeaderboardCycleFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetLottoDrawConfigsArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetRedPacketRecordsArgs = {
  filter?: InputMaybe<RedPacketRecordFilter>;
  pagination?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<RedPacketRecordSort>;
};


export type QueryGetRedPacketTimeSeriesStatsArgs = {
  input: RedPacketTimeSeriesStatsInput;
};


export type QueryGetThresholdTiersArgs = {
  tierType: ThresholdTierType;
};


export type QueryGetTradingTimeSeriesStatsArgs = {
  input?: InputMaybe<TimeSeriesInput>;
};


export type QueryRpcConfigArgs = {
  chainId?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySwapUserHistoryArgs = {
  input: Scalars['JSON']['input'];
};


export type QuerySwapUserRankingArgs = {
  input: Scalars['JSON']['input'];
};

export type RedPacketConfig = {
  __typename?: 'RedPacketConfig';
  configKey?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  maxValue?: Maybe<Scalars['String']['output']>;
  minValue?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  updatedBy?: Maybe<Scalars['String']['output']>;
  value: Scalars['String']['output'];
};

export type RedPacketRecord = {
  __typename?: 'RedPacketRecord';
  amount: Scalars['String']['output'];
  claimedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  metadata?: Maybe<Scalars['String']['output']>;
  status: RedPacketStatus;
  type: RedPacketType;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['String']['output'];
  walletAddress: Scalars['String']['output'];
};

export type RedPacketRecordFilter = {
  claimedFrom?: InputMaybe<Scalars['String']['input']>;
  claimedTo?: InputMaybe<Scalars['String']['input']>;
  createdFrom?: InputMaybe<Scalars['String']['input']>;
  createdTo?: InputMaybe<Scalars['String']['input']>;
  statuses?: InputMaybe<Array<RedPacketStatus>>;
  types?: InputMaybe<Array<RedPacketType>>;
  userId?: InputMaybe<Scalars['String']['input']>;
  walletAddress?: InputMaybe<Scalars['String']['input']>;
};

export type RedPacketRecordSort = {
  direction: SortDirection;
  field: RedPacketRecordSortField;
};

export enum RedPacketRecordSortField {
  Amount = 'AMOUNT',
  ClaimedAt = 'CLAIMED_AT',
  CreatedAt = 'CREATED_AT'
}

export type RedPacketStats = {
  __typename?: 'RedPacketStats';
  activeUsers: Scalars['Int']['output'];
  criticalHitBudgetStats: CriticalHitBudgetStats;
  criticalHitConsumptionRate: Scalars['String']['output'];
  criticalHitDistributedAmount: Scalars['String']['output'];
  criticalHitRedPackets: Scalars['Int']['output'];
  depositConsumptionRate: Scalars['String']['output'];
  depositDistributedAmount: Scalars['String']['output'];
  depositRedPackets: Scalars['Int']['output'];
  pendingWithdrawals: Scalars['Int']['output'];
  totalDistributed: Scalars['String']['output'];
  totalWithdrawn: Scalars['String']['output'];
  tradingConsumptionRate: Scalars['String']['output'];
  tradingDistributedAmount: Scalars['String']['output'];
  tradingRedPackets: Scalars['Int']['output'];
  twitterBindingConsumptionRate: Scalars['String']['output'];
  twitterBindingDistributedAmount: Scalars['String']['output'];
  twitterBindingRedPackets: Scalars['Int']['output'];
  twitterFollowConsumptionRate: Scalars['String']['output'];
  twitterFollowDistributedAmount: Scalars['String']['output'];
  twitterFollowRedPackets: Scalars['Int']['output'];
  unopenedCriticalHitAmount: Scalars['Int']['output'];
  unopenedCriticalHitCount: Scalars['Int']['output'];
  unopenedDepositAmount: Scalars['Int']['output'];
  unopenedDepositCount: Scalars['Int']['output'];
  unopenedTradingAmount: Scalars['Int']['output'];
  unopenedTradingCount: Scalars['Int']['output'];
  unopenedTwitterBindingAmount: Scalars['Int']['output'];
  unopenedTwitterBindingCount: Scalars['Int']['output'];
  unopenedTwitterFollowAmount: Scalars['Int']['output'];
  unopenedTwitterFollowCount: Scalars['Int']['output'];
};

export enum RedPacketStatus {
  Claimed = 'CLAIMED',
  Expired = 'EXPIRED',
  Pending = 'PENDING'
}

export type RedPacketTimeSeriesStats = {
  __typename?: 'RedPacketTimeSeriesStats';
  cumulative: TimeSeriesStatItem;
  daily: TimeSeriesStatItem;
};

export type RedPacketTimeSeriesStatsInput = {
  endDate: Scalars['String']['input'];
  startDate: Scalars['String']['input'];
};

export enum RedPacketType {
  CriticalHit = 'CRITICAL_HIT',
  CriticalHitDesignated = 'CRITICAL_HIT_DESIGNATED',
  Deposit = 'DEPOSIT',
  Trading = 'TRADING',
  TwitterBinding = 'TWITTER_BINDING',
  TwitterFollow = 'TWITTER_FOLLOW'
}

export type RedPacketTypeStats = {
  __typename?: 'RedPacketTypeStats';
  claimedAmount: Scalars['String']['output'];
  claimedCount: Scalars['Int']['output'];
  consumptionRate: Scalars['String']['output'];
  issuedAmount: Scalars['String']['output'];
  issuedCount: Scalars['Int']['output'];
  redPacketType: RedPacketType;
  unopenedAmount: Scalars['String']['output'];
  unopenedCount: Scalars['Int']['output'];
};

export type RewardPoolBalance = {
  __typename?: 'RewardPoolBalance';
  availableBalance: Scalars['String']['output'];
  frozenBalance: Scalars['String']['output'];
  id: Scalars['String']['output'];
  poolType: PoolType;
  remainingPercentage: Scalars['String']['output'];
  spentBalance: Scalars['String']['output'];
  spentPercentage: Scalars['String']['output'];
  totalBudget: Scalars['String']['output'];
  updatedAt: Scalars['Float']['output'];
};

export type RpcChainGroupModel = {
  __typename?: 'RpcChainGroupModel';
  chainId: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  rpcs: Array<RpcConfigItemModel>;
};

export type RpcConfigItemModel = {
  __typename?: 'RpcConfigItemModel';
  type?: Maybe<Scalars['String']['output']>;
  uri: Scalars['String']['output'];
  weight: Scalars['Int']['output'];
};

export type RpcGroupedByTypeModel = {
  __typename?: 'RpcGroupedByTypeModel';
  chains: Array<RpcChainGroupModel>;
  type: Scalars['String']['output'];
};

export type SetCampaignDatesInput = {
  endDate?: InputMaybe<Scalars['String']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};

export type SetOverlayConfigInput = {
  enabled: Scalars['Boolean']['input'];
  overlayType?: InputMaybe<Scalars['String']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  removalTime?: InputMaybe<Scalars['String']['input']>;
};

export type SetRewardPoolBudgetInput = {
  poolType: PoolType;
  totalBudget: Scalars['String']['input'];
};

export enum SortDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type ThresholdTier = {
  __typename?: 'ThresholdTier';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  packetsEarned: Scalars['Int']['output'];
  sortOrder: Scalars['Int']['output'];
  thresholdAmount: Scalars['String']['output'];
  tierType: ThresholdTierType;
  updatedAt: Scalars['DateTime']['output'];
};

export enum ThresholdTierType {
  Deposit = 'DEPOSIT',
  Trading = 'TRADING'
}

export type TimeSeriesInput = {
  endDate: Scalars['String']['input'];
  startDate: Scalars['String']['input'];
};

export type TimeSeriesStatItem = {
  __typename?: 'TimeSeriesStatItem';
  claimedAmount: Scalars['String']['output'];
  claimedCount: Scalars['Int']['output'];
  createdAmount: Scalars['String']['output'];
  createdCount: Scalars['Int']['output'];
  date: Scalars['String']['output'];
  type: RedPacketType;
};

export type TradingTimeSeriesResponse = {
  __typename?: 'TradingTimeSeriesResponse';
  daily: Array<TradingTimeSeriesStatItem>;
};

export type TradingTimeSeriesStatItem = {
  __typename?: 'TradingTimeSeriesStatItem';
  cumulativeTradingAmount: Scalars['String']['output'];
  date: Scalars['String']['output'];
  tradingAmount: Scalars['String']['output'];
};

export type UpdateAmountRangeInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  maxAmount?: InputMaybe<Scalars['String']['input']>;
  minAmount?: InputMaybe<Scalars['String']['input']>;
  skewFactor?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateCriticalHitTierInput = {
  amount?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  probability?: InputMaybe<Scalars['Float']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateDailyPrizePoolConfigInput = {
  changeReason?: InputMaybe<Scalars['String']['input']>;
  dailyBudget?: InputMaybe<Scalars['String']['input']>;
  poolType: PoolType;
};

export type UpdateDesignatedRedPacketInput = {
  designatedAmount?: InputMaybe<Scalars['String']['input']>;
  expiresAt?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  status?: InputMaybe<DesignatedRedPacketStatus>;
};

export type UpdateFeatureFlagInput = {
  enabled: Scalars['Boolean']['input'];
  flagKey: FeatureFlagKey;
  reason?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateLeaderboardCycleInput = {
  endTime?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  startTime?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateLottoDrawConfigInput = {
  drawTimeUtc?: InputMaybe<Scalars['String']['input']>;
  eligibilityThreshold?: InputMaybe<Scalars['Int']['input']>;
  fundPoolAddress?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  prizeAmount?: InputMaybe<Scalars['String']['input']>;
  remainingBudget?: InputMaybe<Scalars['String']['input']>;
  totalBudget?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateRedPacketConfigInput = {
  reason?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateThresholdTierInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  packetsEarned?: InputMaybe<Scalars['Int']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
  thresholdAmount?: InputMaybe<Scalars['String']['input']>;
};

export type UserRedPacket = {
  __typename?: 'UserRedPacket';
  availableBalance: Scalars['String']['output'];
  criticalHitRedPacket: Scalars['String']['output'];
  depositRedPacket: Scalars['String']['output'];
  lastActivityAt?: Maybe<Scalars['DateTime']['output']>;
  totalEarned: Scalars['String']['output'];
  totalWithdrawn: Scalars['String']['output'];
  tradingRedPacket: Scalars['String']['output'];
  twitterBindingRedPacket: Scalars['String']['output'];
  twitterFollowRedPacket: Scalars['String']['output'];
  userId: Scalars['String']['output'];
  userName?: Maybe<Scalars['String']['output']>;
};
