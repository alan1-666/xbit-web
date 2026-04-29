import { Language, LoyaltyStatusResp, Query, SeasonInfo } from '@/@generated/gql/graphql-loyalty'
import { agentDexClient, loyaltyClient } from '@/lib/gql/apollo-client.ts'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { GET_USER_REFERRALSNAPSHOT } from '@/services/agent.dex.service'
import { isEmail } from '@/utils/helpers'
import { GET_ALL_SEASON, GET_LOYALTY_LEADERBOARD, GET_LOYALTY_STATUS } from '@services/loyalty.service.ts'
import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'

// Use generated types directly
export type Season = SeasonInfo
export type LoyaltyStatus = LoyaltyStatusResp
export type LeaderboardUser = LoyaltyStatusResp

// Hook: Get all seasons
export const useGetAllSeasons = (lang?: Language, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['loyalty', 'seasons', lang],
    queryFn: async () => {
      const { data } = await loyaltyClient.query<Pick<Query, 'getAllSeason'>>({
        query: GET_ALL_SEASON,
        variables: { lang },
      })
      return data
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

// Hook: Get user loyalty status
export const useGetLoyaltyStatus = (
  seasonNumber: number | null,
  year: number | null,
  debug: boolean = false,
  walletAddress?: string
) => {
  return useQuery({
    queryKey: ['loyalty', 'status', seasonNumber, year, debug, walletAddress],
    queryFn: async () => {
      const { data } = await loyaltyClient.query({
        query: GET_LOYALTY_STATUS,
        variables: { req: { season: seasonNumber, year, debug } },
      })
      return data.getLoyaltyStatus
    },
    enabled: Boolean(walletAddress) && seasonNumber !== null && year !== null,
    staleTime: 60 * 1000,
  })
}

// Hook: Get leaderboard
export const useGetLoyaltyLeaderboard = (
  seasonNumber: number | null,
  year: number | null,
  debug: boolean = false,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['loyalty', 'leaderboard', seasonNumber, year, debug],
    queryFn: async () => {
      const { data } = await loyaltyClient.query({
        query: GET_LOYALTY_LEADERBOARD,
        variables: { req: { season: seasonNumber, year, debug } },
      })
      return data.getLoyaltyLeaderboard
    },
    enabled: enabled && seasonNumber !== null && year !== null,
    staleTime: 30 * 1000,
  })
}

export const useGetInviteCode = () => {
  const activeWallet = useSelector(_activeWallet)

  return useQuery({
    queryKey: ['inviteCode', activeWallet.walletAddress],
    queryFn: async () => {
      const { data } = await agentDexClient.query({
        query: GET_USER_REFERRALSNAPSHOT,
        variables: {},
      })

      return data?.referralSnapshot?.user?.invitationCode || ''
    },
    enabled: activeWallet.isConnected,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

// Composite hook
export const useGetLoyaltyData = (
  seasonNumber: number | null,
  year: number | null,
  lang?: Language,
  debug: boolean = false,
  enabled: boolean = true,
  walletAddress?: string
) => {
  const seasons = useGetAllSeasons(lang, enabled)
  const status = useGetLoyaltyStatus(seasonNumber, year, debug, walletAddress)
  const leaderboard = useGetLoyaltyLeaderboard(seasonNumber, year, debug, enabled)

  return {
    seasons,
    status,
    leaderboard,
    isLoading: seasons.isLoading || status.isLoading || leaderboard.isLoading,
    isError: seasons.isError || status.isError || leaderboard.isError,
  }
}

/**
 * Format address/email with ellipsis in the middle
 * @param text - The text to format (address or email)
 * @param startChars - Number of characters to show at start (default: 6)
 * @param endChars - Number of characters to show at end (default: 4)
 * @returns Formatted string with ellipsis
 */
export const formatTextWithEllipsis = (text: string, startChars: number = 6, endChars: number = 4): string => {
  if (!text) return '--'

  // If text is short enough, return as is
  if (text.length <= startChars + endChars + 3) {
    return text
  }

  // Check if it's an email
  if (text.includes('@')) {
    const [localPart, domain] = text.split('@')

    // For email, show first few chars of local part and domain
    if (localPart.length > startChars) {
      const startLocal = localPart.slice(0, startChars)
      const endDomain = domain.slice(-endChars)
      return `${startLocal}...${endDomain}`
    }
    return text
  }

  // For wallet address or other text
  const start = text.slice(0, startChars)
  const end = text.slice(-endChars)
  return `${start}...${end}`
}

/**
 * Format name for leaderboard display
 * @param name - User name (email or wallet address)
 * @returns Formatted name
 */
export const formatLeaderboardName = (name: string): string => {
  if (!name) return '--'

  // Check if it's an email
  if (isEmail(name)) {
    const [localPart, domain] = name.split('@')

    // Show more of local part for emails
    if (localPart.length <= 6) {
      // Short local part, show it all with shortened domain
      return `${localPart}@...${domain.split('.').pop()}`
    }

    // Long local part, shorten it
    const startLocal = localPart.slice(0, 5)
    const domainParts = domain.split('.')
    const topDomain = domainParts.pop() // .com, .io, etc

    return `${startLocal}...${topDomain}`
  }

  // For wallet address (like in the screenshot)
  // 466gN...aAsSu format
  return formatTextWithEllipsis(name, 5, 4)
}

export const truncateMiddle = (text: string, maxLength: number = 20) => {
  if (!text || text.length <= maxLength) return text
  
  const halfLength = Math.floor((maxLength - 3) / 2)
  const start = text.slice(0, halfLength)
  const end = text.slice(-halfLength)
  
  return `${start}...${end}`
}