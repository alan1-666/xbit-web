import { Language, LoyaltyLeaderboardResp, LoyaltyStatusResp } from '@/@generated/gql/graphql-loyalty'
import { getCurrentSeasonStatus } from '@/lib/seasonLoyalty'
import { useActiveWallet } from '@hooks/useActiveWallet'
import {
  Season,
  useGetAllSeasons,
  useGetInviteCode,
  useGetLoyaltyLeaderboard,
  useGetLoyaltyStatus,
} from '@hooks/useLoyalty'
import { createContext, ReactNode, useContext, useMemo, useState, useEffect } from 'react'

interface SeasonStatus {
  hasActiveSeason: boolean
  isEnded: boolean
  season: Season | null
}

interface LoyaltyContextValue {
  // Seasons
  seasons: Season[]
  selectedSeason: Season | null
  setSelectedSeason: (season: Season) => void
  seasonStatus: SeasonStatus

  // Invite code
  inviteCode: string
  shareUrl: string
  setInviteCode: (code: string) => void

  // Loyalty data for selected season
  status: LoyaltyStatusResp | undefined
  leaderboard: LoyaltyLeaderboardResp | undefined

  // Loading states
  isLoading: boolean
  isLoadingLoyaltyData: boolean
  isLoadingInviteCode: boolean
  loadingLeaderboard: boolean

  // Debug mode
  debug: boolean
  setDebug: (debug: boolean) => void
}

const LoyaltyContext = createContext<LoyaltyContextValue | undefined>(undefined)

interface LoyaltyProviderProps {
  children: ReactNode
  lang?: Language
}

export const LoyaltyProvider = ({ children, lang }: LoyaltyProviderProps) => {
  const activeWallet = useActiveWallet()
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null)
  const [manualInviteCode, setManualInviteCode] = useState<string | null>(null)
  const [debug, setDebug] = useState<boolean>(false)

  // ALWAYS fetch all seasons, regardless of connection status
  const { data: seasonsData, isLoading: isLoadingSeasons } = useGetAllSeasons(lang, true)

  // Fetch invite code only when connected
  const { data: fetchedInviteCode = '--', isLoading: isLoadingInviteCode } = useGetInviteCode()

  const inviteCode = manualInviteCode || fetchedInviteCode

  const seasons = useMemo<Season[]>(() => {
    if (!seasonsData?.getAllSeason?.seasons) return []

    return seasonsData.getAllSeason.seasons.map((s) => ({
      name: s.name,
      season: s.season,
      year: s.year,
      description: s.description ?? '',
      startTime: s.startTime,
      endTime: s.endTime,
    }))
  }, [seasonsData])

  // Get current season status
  const seasonStatus = useMemo(() => {
    return getCurrentSeasonStatus(seasons)
  }, [seasons])

  // Auto-select first season or active season (initial load only)
  useMemo(() => {
    if (seasons.length && !selectedSeason) {
      const activeSeason = seasonStatus.hasActiveSeason ? seasonStatus.season : seasons[0]
      setSelectedSeason(activeSeason)
    }
  }, [seasons, selectedSeason, seasonStatus])

  // Update selectedSeason when seasons change (language change)
  useEffect(() => {
    if (seasons.length && selectedSeason) {
      // Find the matching season by season number and year (not by name)
      const matchingSeason = seasons.find(
        (s) => s.season === selectedSeason.season && s.year === selectedSeason.year
      )
      
      if (matchingSeason) {
        // Update to new season object with translated name
        setSelectedSeason(matchingSeason)
      } else {
        // If no match found, select first season
        const activeSeason = seasonStatus.hasActiveSeason ? seasonStatus.season : seasons[0]
        setSelectedSeason(activeSeason)
      }
    }
  }, [seasons, seasonStatus]) // Depend on seasons and seasonStatus

  // Extract season number and year for API calls
  const seasonNumber = selectedSeason?.season ?? null
  const seasonYear = selectedSeason?.year ?? null

  // Fetch loyalty data for selected season (only when connected and has wallet address)
  const { data: status, isLoading: loadingStatus } = useGetLoyaltyStatus(
    seasonNumber,
    seasonYear,
    debug,
    activeWallet.walletAddress // Pass wallet address to prevent cache collision
  )

  // ALWAYS fetch leaderboard, regardless of connection status
  const { data: leaderboard, isLoading: loadingLeaderboard } = useGetLoyaltyLeaderboard(
    seasonNumber,
    seasonYear,
    debug,
    true
  )

  // Generate share URL
  const shareUrl = useMemo(() => {
    const baseUrl = window.location.origin
    return inviteCode && inviteCode !== '--' ? `${baseUrl}/@${inviteCode}` : baseUrl
  }, [inviteCode])

  const handleSetInviteCode = (code: string) => {
    setManualInviteCode(code)
  }

  const value: LoyaltyContextValue = {
    seasons,
    selectedSeason,
    setSelectedSeason,
    seasonStatus,
    inviteCode: inviteCode?.toUpperCase(),
    shareUrl,
    setInviteCode: handleSetInviteCode,
    status,
    leaderboard,
    isLoading: isLoadingSeasons,
    isLoadingLoyaltyData: loadingStatus || loadingLeaderboard,
    isLoadingInviteCode,
    loadingLeaderboard,
    debug,
    setDebug,
  }

  return <LoyaltyContext.Provider value={value}>{children}</LoyaltyContext.Provider>
}

export const useLoyalty = () => {
  const context = useContext(LoyaltyContext)
  if (context === undefined) {
    throw new Error('useLoyalty must be used within a LoyaltyProvider')
  }
  return context
}