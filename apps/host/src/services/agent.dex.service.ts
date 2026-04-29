import { gql } from '@apollo/client'

export const GET_USER_REFERRALSNAPSHOT = gql`
  query ReferralSnapshot {
    referralSnapshot {
        userId
        directCount
        totalDownlineCount
        totalVolumeUsd
        totalRewardsDistributed
        user {
          id
          email
          invitationCode
        }
    }
}
`

export const CREATE_INVITE_CODE = gql`
  mutation createUserInvitationCode($input: CreateUserInvitationCodeInput!) {
    createUserInvitationCode(input: $input) {
        user {
            id
            email
            invitationCode
            createdAt
            updatedAt
        }
        success
        message
    }
}
`

export const USER_BIND_INVITE = gql`
  mutation CreateUserWithReferral($input: CreateUserWithReferralInput!) {
    createUserWithReferral(input: $input) {
        success
        message
        user {
            id
            email
            invitationCode
            createdAt
            updatedAt
        }
    }
}
`
// 受邀用户总览
export const GET_INVITATION_SUMMARY = gql`
  query InvitationSummary {
    invitationSummary {
        success
        message
        data {
            invitedUserCount
            tradingUserCount
        }
    }
}
`
// user invitation list
export const GET_USER_INVITATION_LIST = gql`
query InvitationList($transactionType: TransactionType!, $page: Int!, $pageSize: Int!) {
    invitationList(input: { transactionType: $transactionType, page: $page, pageSize: $pageSize }) {
        total
        page
        pageSize
        success
        message
        data {
            userAddress
            invitationTime
            transactionType
            transactionAmount
            accumulatedCommission
            date
        }
    }
}
`
// 获取邀请奖励数据
export const GET_AGENT_INVITATION_REWARD_DATA = gql`
  query UserLevelInfo {
    userLevelInfo {
        success
        message
        data {
            memeVolume
            contractVolume
            totalVolume
            hasReferrer
            currentLevel {
                id
                name
                memeVolumeThreshold
                contractVolumeThreshold
                memeFeeRate
                takerFeeRate
                makerFeeRate
                directCommissionRate
                indirectCommissionRate
                extendedCommissionRate
                memeFeeRebate
            }
        }
    }
}
`
// 获取代理交易数据
export const GET_AGENT_TRADE_DATA = gql`
 query GetTransactionData($input: TransactionDataInput!) {
  transactionData(input: $input) {
    transactionData {
        claimedUsd
        pendingClaimUsd
        contractVolumeUsd
        memeVolumeUsd
        invitationCount
        transactingUserCount
        transactionAmountUsd
    }
    success
    message
  }
}
`
// 数据总览
export const GER_REBATE_AMOUNT_CHART = gql`
query RebateAmountChart($timeRange: DataOverviewTimeRange!) {
    rebateAmountChart(input: { timeRange: $timeRange }) {
        success
        message
        data {
            timestamp
            period
            contract
            meme
            all
        }
        currentValues {
            all
            meme
            contract
        }
        
    }
}
`
export const GER_TRANSACTION_VOLUME_CHART = gql`
query TransactionVolumeChart($timeRange: DataOverviewTimeRange!) {
    transactionVolumeChart(input: { timeRange: $timeRange }) {
        success
        message
        currentValues {
            all
            meme
            contract
        }
        data {
            timestamp
            period
            contract
            meme
            all
        }
    }
}
`
export const GER_INVITATION_COUNT_CHART = gql`
query InvitationCountChart($timeRange: DataOverviewTimeRange!) {
    invitationCountChart(input: { timeRange: $timeRange }) {
        success
        message
        currentValues {
            all
        }
        all {
            timestamp
            period
            value
        }
    }
}

`
// 邀请奖励
export const GET_AGENT_INVITATION_REWARD = gql`
query InvitationRecords($page: Int!, $pageSize: Int!) {
    invitationRecords(input: { page: $page, pageSize: $pageSize }) {
        success
        message
        total
        page
        pageSize
        data {
            address
            transactionVolume
            invitedWithdrawal
            date
            chainId
            token
        }
    }
}
    
`
// 历史领取记录
export const GET_AGENT_INVITATION_WITHDRAWAL_RECORDS = gql`
  query WithdrawalRecords($page: Int!, $pageSize: Int!) {
    withdrawalRecords(input: { page: $page, pageSize: $pageSize }) {
        total
        page
        pageSize
        success
        message
        data {
            hash
            withdrawalReward
            date
        }
    }
}
`

// 交易奖励相关api
export const GET_ACTIVITY_CASHBACK_DASHBOARD = gql`
query ActivityCashbackDashboard {
  activityCashbackDashboard {
    success
    message
    data {
      userTierInfo {
        userId
        currentTier
        totalPoints
        pointsThisMonth
        tradingVolumeUsd
        activeDaysThisMonth
        cumulativeCashbackUsd
        claimableCashbackUsd
        claimedCashbackUsd
        lastActivityDate
        tierUpgradedAt
        monthlyResetAt
        userRank
        tierBenefit {
          id
          tierLevel
          tierName
          minPoints
          cashbackPercentage
          benefitsDescription
          tierColor
          tierIcon
          isActive
        }
      }
      tierBenefit {
        id
        tierLevel
        tierName
        minPoints
        cashbackPercentage
        benefitsDescription
        tierColor
        tierIcon
        isActive
      }
      nextTier {
        id
        tierLevel
        tierName
        minPoints
        cashbackPercentage
        benefitsDescription
        tierColor
        tierIcon
        isActive
      }
      pointsToNextTier
      claimableCashback
      userRank
      recentClaims {
        id
        userId
        claimType
        totalAmountUsd
        totalAmountSol
        transactionHash
        status
        claimedAt
        processedAt
        metadata
      }
    }
  }
}
`

// 任务类型
export const GET_TASK_CATEGORIES = gql`
query TaskCategories {
    taskCategories {
        id
        name
        displayName
        description
        icon
        sortOrder
        isActive
        createdAt
        updatedAt
    }
}
`
// 根据任务类型获取对应任务列表
export const GET_TASKS_BY_TYPE = gql`
query UserTaskListByCategory($categoryName: TaskCategoryName!) {
    userTaskListByCategory(input: { categoryName: $categoryName }) {
        success
        message
        data {
            task {
                id
                categoryId
                description
                frequency
                taskIdentifier
                points
                maxCompletions
                resetPeriod
                conditions
                actionTarget
                verificationMethod
                externalLink
                taskIcon
                buttonText
                isActive
                startDate
                endDate
                sortOrder
                createdAt
                updatedAt
                name {
                    en
                    zh
                    ja
                    hi
                    hk
                    vi
                }
            }
            progress {
                id
                userId
                taskId
                status
                progressValue
                targetValue
                completionCount
                pointsEarned
                lastCompletedAt
                lastResetAt
                streakCount
                metadata
                createdAt
                updatedAt
                progressPercentage
                canBeClaimed
            }
        }
   
    }
}
`

export const COMPLETE_TASK = gql`
mutation CompleteTask($taskId: ID!) {
    completeTask(
        input: {
            taskId: $taskId
        }
    ) {
        success
        message
        pointsAwarded
        newTierLevel
        tierUpgraded
        isPending
        remainingWaitTimeSeconds
        completionTime
    }
}
`

//  获取金额
export const CLAIM_CASHBACK_REWARD = gql`
query GetClaimReward {
    getClaimReward {
        claimActivityCashback
        claimPerpetualCashback
        totalClaimedUsd
    }
}
`

export const CLAIM_REWARD = gql`
    mutation ClaimActivityCashback($claimAddress: String!, $type: ActivityCashbackType!) {
        claimActivityCashback(input: { claimAddress: $claimAddress, type: $type }) {
            message
            success
        }
    }
`
// 领取记录
export const GET_CLAIM_RECORD = gql`
query RewardClaimHistory($page: Int!, $pageSize: Int!, $result: RewardClaimHistoryResultEnum!,$isCashback: Boolean!) {
    rewardClaimHistory(input: { page: $page, pageSize: $pageSize,result: $result,isCashback: $isCashback }) {
        data {
            id
            userId
            address
            amount
            amountUsd
            token
            chainId
            type
            result
            transactionHash
            onchainTimestamp
            errorMessage
            errorCode
            processedAt
            createdAt
            updatedAt
        }
        total
        page
        pageSize
        success
        message
    }
}

`

// 领取邀请奖励
export const CLAIM_AGENT_REFERRAL = gql`
mutation ClaimAgentReferral($rewardType: RewardType!, $claimAddress: String) {
    claimAgentReferral(input: {  rewardType: $rewardType ,claimAddress: $claimAddress}) {
        message
        success
    }
}
`
export const GET_CLAIM_AGENT_REFERRAL = gql`
query GetReferralReward {
    getReferralReward {
        claimMemeReferral
        claimAgentReferral
        totalAccumulatedUSD
    }
}
`
export const GET_TIER_BENEFITS = gql`
query TierBenefits {
    tierBenefits {
        success
        data {
            id
            tierLevel
            tierName
            minPoints
            cashbackPercentage
            referredIncentivePercentage
            netFee
            benefitsDescription
            tierColor
            tierIcon
            isActive
            createdAt
            updatedAt
            futureCashbackPercentage
        }
        message
    }
}
`

export const VERIFY_INVITATION_CODE = gql`
query VerifyInvitationCode ($invitationCode: String!) {
    verifyInvitationCode(input: { invitationCode: $invitationCode }) {
      isValid
      message
    }
  }
` 
export const CHECK_INVITATION_CODE = gql`
query CheckInvitationCode ($invitationCode: String!) { 
    checkInvitationCode(input: { invitationCode: $invitationCode }) { 
        exists
        }
    }
`