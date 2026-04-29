import { Season } from "@/hooks/useLoyalty"

export const getCurrentSeasonStatus = (seasons: Season[]) => {
  if (!seasons?.length) {
    return { hasActiveSeason: false, isEnded: false, season: null }
  }

  const now = Date.now()

  // Find active season
  const activeSeason = seasons.find((season) => {
    const startTime = new Date(season.startTime).getTime()
    const endTime = new Date(season.endTime).getTime()
    return now >= startTime && now <= endTime
  })

  if (activeSeason) {
    return {
      hasActiveSeason: true,
      isEnded: false,
      season: activeSeason,
    }
  }

  // Find latest ended season
  const latestEndedSeason = seasons
    .filter((season) => new Date(season.endTime).getTime() < now)
    .sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime())[0]

  if (latestEndedSeason) {
    return {
      hasActiveSeason: false,
      isEnded: true,
      season: latestEndedSeason,
    }
  }

  return { hasActiveSeason: false, isEnded: false, season: null }
}

// Helper to extract year from season time
export const getSeasonYear = (season: Season): number => {
  return new Date(season.startTime).getFullYear()
}

// Rest remains the same...
export const isSeasonActive = (season: Season): boolean => {
  const now = Date.now()
  const startTime = new Date(season.startTime).getTime()
  const endTime = new Date(season.endTime).getTime()
  return now >= startTime && now <= endTime
}

export const isSeasonEnded = (season: Season): boolean => {
  const now = Date.now()
  const endTime = new Date(season.endTime).getTime()
  return now > endTime
}

export const getTimeUntilSeasonEnd = (season: Season): number => {
  const now = Date.now()
  const endTime = new Date(season.endTime).getTime()
  return Math.max(0, endTime - now)
}