import { Event, MarketBase } from '@/@generated/gql/graphql-prediction'
import { safeParse } from '@/lib/utils'
import { TeamModel } from '@/modules/prediction/models/TeamModel.ts'
import { useMemo } from 'react'

interface UsePredictionMatchCardProps {
  event: Event | undefined
  teams?: TeamModel[]
}

interface MatchOdds {
  team1: { label: string; value: number }
  team2: { label: string; value: number }
  draw?: { label: string; value: number }
}

interface BasicTeam {
  name: string
  logo?: string
  color?: string
  record?: string
}

const getLeagueSlug = (slug?: string) => slug?.split('-')[0]

const getAbbreviations = (slug?: string) => {
  if (!slug) return []
  const parts = slug.split('-')
  if (parts.length < 3) return []
  // Heuristic: league-team1-team2-date
  // checks if parts 1 and 2 are NOT numbers (so they are team abbrs)
  if (isNaN(Number(parts[1])) && isNaN(Number(parts[2]))) {
    return [parts[1], parts[2]]
  }
  return []
}

const extractFromMultiMarket = (
  event: Event,
  markets: MarketBase[],
): { teams: [BasicTeam, BasicTeam]; odds: MatchOdds } => {
  const titleParts = event.title?.split(' vs. ') || []
  const team1Name = titleParts[0]
  const team2Name = titleParts[1]

  const m1 = markets.find((m) => m.groupItemTitle === team1Name)
  const m2 = markets.find((m) => m.groupItemTitle === team2Name)
  const mDraw = markets.find((m) => m.groupItemTitle?.includes('Draw'))

  const teams: [BasicTeam, BasicTeam] = [{ name: team1Name || 'Unknown 1' }, { name: team2Name || 'Unknown 2' }]

  const odds: MatchOdds = {
    team1: {
      label: team1Name?.toUpperCase().slice(0, 3) || 'T1',
      value: m1?.lastTradePrice ? Math.round(Number(m1.lastTradePrice) * 100) : 0,
    },
    team2: {
      label: team2Name?.toUpperCase().slice(0, 3) || 'T2',
      value: m2?.lastTradePrice ? Math.round(Number(m2.lastTradePrice) * 100) : 0,
    },
    draw: mDraw
      ? {
          label: 'DRAW',
          value: mDraw.lastTradePrice ? Math.round(Number(mDraw.lastTradePrice) * 100) : 0,
        }
      : undefined,
  }

  return { teams, odds }
}

const extractFromSingleMarket = (
  event: Event,
  market?: MarketBase,
): { teams: [BasicTeam, BasicTeam]; odds: MatchOdds } => {
  const defaultTeams: [BasicTeam, BasicTeam] = [{ name: 'Unknown 1' }, { name: 'Unknown 2' }]

  if (!market) {
    // Fallback to title
    const titleParts = event.title?.split(' vs. ') || []
    if (titleParts.length === 2) {
      return {
        teams: [{ name: titleParts[0] }, { name: titleParts[1] }],
        odds: { team1: { label: 'T1', value: 0 }, team2: { label: 'T2', value: 0 }, draw: undefined },
      }
    }
    return { teams: defaultTeams, odds: { team1: { label: 'T1', value: 0 }, team2: { label: 'T2', value: 0 } } }
  }

  const outcomes = safeParse(market.outcomes)
  const prices = safeParse(market.outcomePrices)

  let teams: [BasicTeam, BasicTeam] = [...defaultTeams]

  if (outcomes && outcomes.length >= 2) {
    teams = [{ name: outcomes[0] }, { name: outcomes[1] }]
  } else {
    const titleParts = event.title?.split(' vs. ') || []
    if (titleParts.length === 2) {
      teams = [{ name: titleParts[0] }, { name: titleParts[1] }]
    }
  }

  const team1Price = prices[0] ? Math.round(Number(prices[0]) * 100) : 0
  const team2Price = prices[1] ? Math.round(Number(prices[1]) * 100) : 0
  const drawPrice = prices[2] ? Math.round(Number(prices[2]) * 100) : undefined

  const odds: MatchOdds = {
    team1: { label: outcomes[0]?.toUpperCase().slice(0, 7) || 'T1', value: team1Price },
    team2: { label: outcomes[1]?.toUpperCase().slice(0, 7) || 'T2', value: team2Price },
    draw: drawPrice !== undefined && outcomes[2] ? { label: 'DRAW', value: drawPrice } : undefined,
  }

  return { teams, odds }
}

const enrichTeamsWithMetadata = (
  teams: [BasicTeam, BasicTeam],
  preFetchedTeams: TeamModel[] | undefined,
  abbreviations: string[],
  leagueSlug?: string,
): [BasicTeam, BasicTeam] => {
  if (!preFetchedTeams || abbreviations.length !== 2 || !leagueSlug) {
    return teams
  }

  const [team1Abbr, team2Abbr] = abbreviations
  const newTeams = [...teams] as [BasicTeam, BasicTeam]

  // Helper to find team data
  const findTeam = (abbr: string) =>
    preFetchedTeams.find(
      (t) => t.abbreviation.toLowerCase() === abbr.toLowerCase() && t.league.toLowerCase() === leagueSlug.toLowerCase(),
    )

  const team1Data = findTeam(team1Abbr)
  const team2Data = findTeam(team2Abbr)

  if (team1Data) {
    newTeams[0] = { ...newTeams[0], ...team1Data }
  }
  if (team2Data) {
    newTeams[1] = { ...newTeams[1], ...team2Data }
  }

  return newTeams
}

export const usePredictionMatchCard = ({ event, teams: preFetchedTeams }: UsePredictionMatchCardProps) => {
  const mainMarket = event?.markets?.[0]

  // 1. Extract Abbreviations & League
  const abbreviations = useMemo(() => getAbbreviations(event?.slug || ''), [event?.slug])
  const leagueSlug = useMemo(() => getLeagueSlug(event?.slug || ''), [event?.slug])

  const { teams, odds, foundModels } = useMemo(() => {
    if (!event) {
       return {
          teams: [{ name: 'Home' }, { name: 'Away' }] as [BasicTeam, BasicTeam],
          odds: { team1: { label: 'T1', value: 0 }, team2: { label: 'T2', value: 0 } },
          foundModels: []
       }
    }

    const moneylineMarkets = event.markets?.filter((m) => m.sportsMarketType === 'moneyline') || []

    // 2. Parse Basic Data (Teams & Odds)
    let basicData
    if (moneylineMarkets.length >= 3) {
      basicData = extractFromMultiMarket(event, moneylineMarkets as MarketBase[])
    } else {
      const targetMarket = moneylineMarkets.length === 1 ? moneylineMarkets[0] : mainMarket
      basicData = extractFromSingleMarket(event, targetMarket as MarketBase)
    }

    // 3. Enrich with pre-fetched Data
    const enrichedTeams = enrichTeamsWithMetadata(basicData.teams, preFetchedTeams, abbreviations, leagueSlug)

    // 4. Find matching models for external use
    let foundModels: TeamModel[] = []
    if (preFetchedTeams && abbreviations.length === 2 && leagueSlug) {
       foundModels = abbreviations.map(abbr => 
          preFetchedTeams.find(t => t.abbreviation.toLowerCase() === abbr.toLowerCase() && t.league.toLowerCase() === leagueSlug.toLowerCase())
       ).filter((t): t is TeamModel => !!t)
    }

    return { teams: enrichedTeams, odds: basicData.odds, foundModels }
  }, [event, mainMarket, abbreviations, preFetchedTeams, leagueSlug])

  return {
    matchCardProps: { teams, odds },
    mainMarket,
    foundTeams: foundModels,
    isLoading: false,
  }
}
