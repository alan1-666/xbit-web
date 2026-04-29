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
  Int64: { input: any; output: any; }
  JSON: { input: any; output: any; }
  Time: { input: any; output: any; }
};

export type ActivityHistoryEntry = {
  __typename?: 'ActivityHistoryEntry';
  amount?: Maybe<Scalars['Decimal']['output']>;
  createdAt: Scalars['Time']['output'];
  id: Scalars['ID']['output'];
  isJackpot?: Maybe<Scalars['Boolean']['output']>;
  status: Scalars['String']['output'];
  type: ActivityType;
};

export type ActivityHistoryResponse = {
  __typename?: 'ActivityHistoryResponse';
  activities: Array<ActivityHistoryEntry>;
  hasMore: Scalars['Boolean']['output'];
  summary: ActivityHistorySummary;
};

export type ActivityHistorySummary = {
  __typename?: 'ActivityHistorySummary';
  totalPackets: Scalars['Int']['output'];
  totalWithdrawalFailed: Scalars['Int']['output'];
  totalWithdrawalSuccess: Scalars['Int']['output'];
  totalWithdrawals: Scalars['Int']['output'];
};

export enum ActivityType {
  Deposit = 'DEPOSIT',
  LuckyDraw = 'LUCKY_DRAW',
  Trade = 'TRADE',
  TwitterBinding = 'TWITTER_BINDING',
  TwitterFollow = 'TWITTER_FOLLOW',
  Withdrawal = 'WITHDRAWAL'
}

export type ClaimAllRedPacketsResponse = {
  __typename?: 'ClaimAllRedPacketsResponse';
  claimedPackets: Array<RedPacketDetail>;
  failedPackets: Array<FailedClaimDetail>;
  totalAmount: Scalars['Decimal']['output'];
  totalClaimed: Scalars['Int']['output'];
  totalFailed: Scalars['Int']['output'];
};

export type ClaimRedPacketInput = {
  redPacketId: Scalars['ID']['input'];
};

export type ClaimRedPacketsByTypeInput = {
  type: RedPacketType;
};

/** Daily budget availability status for user-facing display */
export type DailyBudgetAvailability = {
  __typename?: 'DailyBudgetAvailability';
  criticalHitPoolAvailable: Scalars['Boolean']['output'];
  /** Whether daily budget is still available for new red packets */
  isAvailable: Scalars['Boolean']['output'];
  /** User-friendly message explaining the status */
  message: Scalars['String']['output'];
  /** Next time when daily budget will reset (UTC) */
  nextResetTime: Scalars['Time']['output'];
  /** Breakdown by pool type (for detailed display) */
  sharedPoolAvailable: Scalars['Boolean']['output'];
};

export type FailedClaimDetail = {
  __typename?: 'FailedClaimDetail';
  reason: Scalars['String']['output'];
  redPacketId: Scalars['ID']['output'];
  type: RedPacketType;
};

export type LeaderboardEntry = {
  __typename?: 'LeaderboardEntry';
  achievedAt?: Maybe<Scalars['String']['output']>;
  isInternalAccount: Scalars['Boolean']['output'];
  rank: Scalars['Int']['output'];
  rewardAmount: Scalars['Float']['output'];
  tradingVolume: Scalars['Float']['output'];
  userId: Scalars['ID']['output'];
  username?: Maybe<Scalars['String']['output']>;
  walletAddress?: Maybe<Scalars['String']['output']>;
};

export type LottoWinner = {
  __typename?: 'LottoWinner';
  drawTime: Scalars['String']['output'];
  prizeAmount: Scalars['Float']['output'];
  randomNumber: Scalars['Int']['output'];
  rank: Scalars['Int']['output'];
  userId: Scalars['ID']['output'];
  username?: Maybe<Scalars['String']['output']>;
  walletAddress?: Maybe<Scalars['String']['output']>;
};

export type LuckyLottoDrawHistory = {
  __typename?: 'LuckyLottoDrawHistory';
  drawDate: Scalars['String']['output'];
  participantCount: Scalars['Int']['output'];
  prizeAmount: Scalars['Float']['output'];
  transactionHashes?: Maybe<Scalars['String']['output']>;
  winner?: Maybe<LottoWinner>;
};

export type LuckyLottoStatus = {
  __typename?: 'LuckyLottoStatus';
  currentRank?: Maybe<Scalars['Int']['output']>;
  eligibilityMessage?: Maybe<Scalars['String']['output']>;
  isEligible: Scalars['Boolean']['output'];
  todayYourNumber?: Maybe<Scalars['Int']['output']>;
  todayLuckyNumbers?: Maybe<Array<Scalars['Int']['output']>>;
  nextDrawTime: Scalars['String']['output'];
  remainingBudget: Scalars['Float']['output'];
  todayDrawCompleted: Scalars['Boolean']['output'];
  todayDrawTransactionHash?: Maybe<Scalars['String']['output']>;
  todayDrawTransactionHashes?: Maybe<Array<Scalars['String']['output']>>;
  todayWinner?: Maybe<LottoWinner>;
  todayWinners?: Maybe<Array<LottoWinner>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  claimAllRedPackets: ClaimAllRedPacketsResponse;
  claimRedPacket: RedPacketDetail;
  claimRedPacketsByType: ClaimAllRedPacketsResponse;
  verifyTwitterFollow: TwitterBindingStatus;
  withdrawRedPacket: WithdrawalResponse;
};


export type MutationClaimRedPacketArgs = {
  input: ClaimRedPacketInput;
};


export type MutationClaimRedPacketsByTypeArgs = {
  input: ClaimRedPacketsByTypeInput;
};

export type MyLeaderboardPosition = {
  __typename?: 'MyLeaderboardPosition';
  isEligibleForLotto: Scalars['Boolean']['output'];
  nextMilestone?: Maybe<TradingMilestone>;
  rank?: Maybe<Scalars['Int']['output']>;
  rewardAmount: Scalars['Float']['output'];
  tradingVolume: Scalars['Float']['output'];
};

export type MyLottoWin = {
  __typename?: 'MyLottoWin';
  createdAt: Scalars['String']['output'];
  drawDate: Scalars['String']['output'];
  myRank: Scalars['Int']['output'];
  prizeAmount: Scalars['Float']['output'];
  randomNumber: Scalars['Int']['output'];
};

export type Query = {
  __typename?: 'Query';
  checkDailyBudgetAvailability: DailyBudgetAvailability;
  getActivityHistory: ActivityHistoryResponse;
  getLuckyLottoHistory: Array<LuckyLottoDrawHistory>;
  getLuckyLottoStatus: LuckyLottoStatus;
  getMyLeaderboardPosition: MyLeaderboardPosition;
  getMyLottoWins: Array<MyLottoWin>;
  getRedPacketFeatures: RedPacketFeatures;
  getRedPacketStatus: UserRedPacketStatus;
  getRedPacketUnlockStatus: RedPacketUnlockStatus;
  getTradingLeaderboard: TradingLeaderboardResponse;
  getTwitterBindingStatus: TwitterBindingStatus;
  getWithdrawalHistory: Array<WithdrawalResponse>;
};


export type QueryGetActivityHistoryArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetLuckyLottoHistoryArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetTradingLeaderboardArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetWithdrawalHistoryArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type RedPacketConfig = {
  __typename?: 'RedPacketConfig';
  criticalHitBudget: Scalars['Float']['output'];
  leaderboardPrizePool: Scalars['Float']['output'];
  luckyLottoDailyPrize: Scalars['Float']['output'];
  withdrawalThreshold: Scalars['Float']['output'];
};

export type RedPacketDetail = {
  __typename?: 'RedPacketDetail';
  amount: Scalars['Decimal']['output'];
  claimedAt?: Maybe<Scalars['Time']['output']>;
  expiresAt?: Maybe<Scalars['Time']['output']>;
  id: Scalars['ID']['output'];
  status: RedPacketStatus;
  type: RedPacketType;
};

export type RedPacketFeatures = {
  __typename?: 'RedPacketFeatures';
  /**
   * Campaign end date as RFC3339 string (e.g., "2026-02-28T23:59:59Z")
   * Null if campaign has no end date configured
   */
  campaignEndDate?: Maybe<Scalars['String']['output']>;
  /**
   * Campaign start date as RFC3339 string (e.g., "2026-01-27T00:00:00Z")
   * Null if campaign has no start date configured
   */
  campaignStartDate?: Maybe<Scalars['String']['output']>;
  /** Human-readable message about campaign status (e.g., "Campaign starts in 2 days", "Campaign ended") */
  campaignStatusMessage?: Maybe<Scalars['String']['output']>;
  claimEnabledH5: Scalars['Boolean']['output'];
  claimEnabledMobile: Scalars['Boolean']['output'];
  claimEnabledWeb: Scalars['Boolean']['output'];
  comingSoonMessage?: Maybe<Scalars['String']['output']>;
  config: RedPacketConfig;
  /** Whether the campaign is currently active (current time is within start and end dates) */
  isCampaignActive: Scalars['Boolean']['output'];
  leaderboardEnabled: Scalars['Boolean']['output'];
  leaderboardTeaser?: Maybe<Scalars['String']['output']>;
  luckyLottoEnabled: Scalars['Boolean']['output'];
  /**
   * Seconds until the overlay is automatically removed
   * Null if overlay is not shown or no removal time is set
   */
  overlayCountdown?: Maybe<Scalars['Int']['output']>;
  /** Whether the countdown overlay feature is enabled by admin */
  overlayEnabled: Scalars['Boolean']['output'];
  /**
   * Time when overlay should be removed (RFC3339 format)
   * Null if no specific removal time is set
   */
  overlayRemovalTime?: Maybe<Scalars['String']['output']>;
  /** Overlay type: MANUAL or TIMED */
  overlayType?: Maybe<Scalars['String']['output']>;
  /**
   * Whether the overlay should currently be shown
   * True if overlayEnabled=true AND (overlayRemovalTime is null OR current time < overlayRemovalTime)
   */
  showOverlay: Scalars['Boolean']['output'];
  v2Enabled: Scalars['Boolean']['output'];
  withdrawalEnabledH5: Scalars['Boolean']['output'];
  withdrawalEnabledMobile: Scalars['Boolean']['output'];
  withdrawalEnabledWeb: Scalars['Boolean']['output'];
};

export enum RedPacketStatus {
  Claimed = 'CLAIMED',
  Expired = 'EXPIRED',
  Pending = 'PENDING'
}

export enum RedPacketType {
  CriticalHit = 'CRITICAL_HIT',
  Deposit = 'DEPOSIT',
  Trading = 'TRADING',
  TwitterBinding = 'TWITTER_BINDING',
  TwitterFollow = 'TWITTER_FOLLOW'
}

export type RedPacketUnlockProgress = {
  __typename?: 'RedPacketUnlockProgress';
  claimedPackets: Scalars['Int']['output'];
  cumulativeAmount: Scalars['Decimal']['output'];
  eligiblePackets: Scalars['Int']['output'];
  nextThreshold?: Maybe<Scalars['Decimal']['output']>;
  pendingPackets: Scalars['Int']['output'];
  tiers: Array<RedPacketUnlockTier>;
};

export type RedPacketUnlockStatus = {
  __typename?: 'RedPacketUnlockStatus';
  deposit: RedPacketUnlockProgress;
  trading: RedPacketUnlockProgress;
};

export type RedPacketUnlockTier = {
  __typename?: 'RedPacketUnlockTier';
  incrementalPackets: Scalars['Int']['output'];
  isReached: Scalars['Boolean']['output'];
  packetsEarned: Scalars['Int']['output'];
  thresholdAmount: Scalars['Decimal']['output'];
};

export type TradingLeaderboardResponse = {
  __typename?: 'TradingLeaderboardResponse';
  myRank?: Maybe<Scalars['Int']['output']>;
  prizePool: Scalars['Float']['output'];
  rankings: Array<LeaderboardEntry>;
  totalParticipants: Scalars['Int']['output'];
  updateTime: Scalars['String']['output'];
};

export type TradingMilestone = {
  __typename?: 'TradingMilestone';
  rankEstimate?: Maybe<Scalars['Int']['output']>;
  rewardAmount: Scalars['Float']['output'];
  volumeRequired: Scalars['Float']['output'];
};

export type TwitterBindingStatus = {
  __typename?: 'TwitterBindingStatus';
  boundAt?: Maybe<Scalars['Time']['output']>;
  followCheckedAt?: Maybe<Scalars['Time']['output']>;
  isBound: Scalars['Boolean']['output'];
  isFollowingOfficial: Scalars['Boolean']['output'];
  twitterUsername?: Maybe<Scalars['String']['output']>;
  verificationPending: Scalars['Boolean']['output'];
  verificationStatus: Scalars['String']['output'];
};

export type UserRedPacketStatus = {
  __typename?: 'UserRedPacketStatus';
  availableBalance: Scalars['Decimal']['output'];
  /** Available balance from CRITICAL_HIT pool red packets */
  availableCriticalHitBalance: Scalars['Decimal']['output'];
  /** Available balance from CRITICAL_HIT_DESIGNATED pool red packets */
  availableDesignatedCriticalHitBalance: Scalars['Decimal']['output'];
  /** Available balance from SHARED pool red packets */
  availableSharedBalance: Scalars['Decimal']['output'];
  canWithdraw: Scalars['Boolean']['output'];
  pendingWithdrawal: Scalars['Decimal']['output'];
  redPackets: Array<RedPacketDetail>;
  totalEarned: Scalars['Decimal']['output'];
  totalWithdrawn: Scalars['Decimal']['output'];
  userId: Scalars['ID']['output'];
};

export type WithdrawalResponse = {
  __typename?: 'WithdrawalResponse';
  amount: Scalars['Decimal']['output'];
  estimatedCompletionTime?: Maybe<Scalars['Time']['output']>;
  status: WithdrawalStatus;
  transactionHash?: Maybe<Scalars['String']['output']>;
  withdrawalId: Scalars['ID']['output'];
};

export enum WithdrawalStatus {
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  Pending = 'PENDING',
  Processing = 'PROCESSING'
}
