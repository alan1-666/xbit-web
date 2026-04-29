import { gql } from '@apollo/client'

export const GET_RED_PACKET_STATUS_FEATURES = gql`
   query GetRedPacketFeatures {
    getRedPacketFeatures {
        v2Enabled
        leaderboardEnabled
        luckyLottoEnabled
        claimEnabledH5
        claimEnabledWeb
        claimEnabledMobile
        withdrawalEnabledH5
        withdrawalEnabledWeb
        withdrawalEnabledMobile
        comingSoonMessage
        leaderboardTeaser
        campaignStartDate
        campaignEndDate
        isCampaignActive
        campaignStatusMessage
        overlayEnabled
        overlayType
        overlayRemovalTime
        showOverlay
        overlayCountdown
        config {
            withdrawalThreshold
            criticalHitBudget
            leaderboardPrizePool
            luckyLottoDailyPrize
        }
    }
}

`

export const GET_RED_PACKET_STATUS_QUERY = gql`
 query GetRedPacketStatus {
  getRedPacketStatus {
    userId
    totalEarned
    totalWithdrawn
    availableBalance
    pendingWithdrawal
    canWithdraw
    redPackets {
      id
      type
      amount
      status
      claimedAt
      expiresAt
    }
  }
}
`

export const GET_TWITTER_BINDING_STATUS = gql`
 query GetTwitterBindingStatus {
  getTwitterBindingStatus {
    isBound
    twitterUsername
    boundAt
    verificationStatus
    isFollowingOfficial
    followCheckedAt
  }
}
`

export const GET_WITHDRAWAL_HISTORY = gql`
 query GetWithdrawalHistory($limit: Int, $offset: Int) {
  getWithdrawalHistory(limit: $limit, offset: $offset) {
    withdrawalId
    amount
    status
    estimatedCompletionTime
    transactionHash
  }
}
`
export const GET_TRADING_LEADERBOARD = gql`
 query GetTradingLeaderboard($limit: Int) {
  getTradingLeaderboard(limit: $limit) {
    rankings {
      rank
      userId
      username
      tradingVolume
      rewardAmount
      isInternalAccount
      achievedAt
      walletAddress
    }
    leaderboardStatus
    myRank
    totalParticipants
    prizePool
    updateTime
  }
}
`

export const GET_MY_LEADERBOARD_POSITION = gql`
 query GetMyLeaderboardPosition {
  getMyLeaderboardPosition {
    rank
    tradingVolume
    rewardAmount
    isEligibleForLotto
    nextMilestone {
      volumeRequired
      rewardAmount
      rankEstimate
    }
  }
}
`

export const GET_LUCKY_LOTTO_STATUS = gql`
query GetLuckyLottoStatus {
  getLuckyLottoStatus {
      isEligible
      currentRank
      todayYourNumber
      todayLuckyNumbers
      nextDrawTime
      todayDrawCompleted
      todayDrawTransactionHashes
      eligibilityMessage
      remainingBudget
      todayWinners {
          userId
          walletAddress
          username
          prizeAmount
          randomNumber
          rank
          drawTime
      }
  }
}

`

export const GET_LUCKY_LOTTO_HISTORY = gql`
query GetLuckyLottoHistory($limit: Int) {
  getLuckyLottoHistory(limit: $limit) {
    drawDate
    winners {
      userId
      walletAddress
      username
      prizeAmount
      randomNumber
      rank
      drawTime
    }
    prizeAmount
    participantCount
    transactionHashes
  }
}
`

export const GET_MY_LOTTO_WINS = gql`
query GetMyLottoWins {
  getMyLottoWins {
    drawDate
    prizeAmount
    randomNumber
    myRank
    createdAt
  }
}
`





export const CLAIM_ALL_RED_PACKET_MUTATION = gql`
 mutation ClaimAllRedPackets {
    claimAllRedPackets {
        claimedPackets {
            id
            type
            amount
            status
            claimedAt
            expiresAt
        }
        failedPackets {
            redPacketId
            type
            reason
        }
        totalClaimed
        totalFailed
        totalAmount
    }
}
`


export const WITHDRAW_RED_PACKET_MUTATION = gql`
 mutation WithdrawRedPacket {
    withdrawRedPacket {
        withdrawalId
        amount
        status
        estimatedCompletionTime
        transactionHash
    }
}
`

export const GET_RED_PACKET_UNLOCK_STATUS = gql`
query GetRedPacketUnlockStatus2 {
    getRedPacketUnlockStatus {
        deposit {
            cumulativeAmount
            eligiblePackets
            claimedPackets
            pendingPackets
            nextThreshold
            tiers {
                thresholdAmount
                packetsEarned
                incrementalPackets
                isReached
            }
        }
        trading {
            cumulativeAmount
            eligiblePackets
            claimedPackets
            pendingPackets
            nextThreshold
            tiers {
                thresholdAmount
                packetsEarned
                incrementalPackets
                isReached
            }
        }
    }
}
`


export const GET_USER_ACTIVITY_HISTORY = gql`
query GetActivityHistory($limit: Int, $offset: Int) {
    getActivityHistory(limit: $limit, offset: $offset) {
        hasMore
        summary {
            totalPackets
            totalWithdrawals
            totalWithdrawalSuccess
            totalWithdrawalFailed
        }
        activities {
            id
            type
            amount
            status
            isJackpot
            createdAt
        }
    }
}
`

export const VERIFY_TWITTER_FOLLOW = gql`
mutation VerifyTwitterFollow {
    verifyTwitterFollow {
        isBound
        twitterUsername
        boundAt
        verificationStatus
        isFollowingOfficial
        followCheckedAt
        verificationPending
    }
}
`

export const CHECK_DAILY_BUDGET_AVAILABILITY = gql`
query CheckDailyBudgetAvailability {
    checkDailyBudgetAvailability {
        isAvailable
        message
        nextResetTime
        sharedPoolAvailable
        criticalHitPoolAvailable
    }
}

`

export const GET_SHARED_PRIZE_POOL_INFO = gql`
query GetSharedPrizePoolInfo {
    getSharedPrizePoolInfo {
        totalDailyBudget
        remainingAmount
        poolType
        isAvailable
    }
}
`


