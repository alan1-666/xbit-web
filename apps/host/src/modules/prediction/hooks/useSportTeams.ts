import { useQuery, useQueries } from '@tanstack/react-query'
import { sportsService } from '@/modules/prediction/services/sports.service.ts'
import { EventModel } from '@/modules/prediction/models/EventModel.ts'
import React from 'react'

export interface UseSportTeamsOptions {
  league?: string[]
  abbreviation?: string[]
  name?: string[]
  enabled?: boolean
}

export const getSportTeamsQueryOptions = (options: UseSportTeamsOptions) => {
  return {
    queryKey: ['prediction', 'sports', 'teams', options],
    queryFn: async () => {
      return sportsService.getTeams({
        filter: {
          leagues: options.league,
          abbreviations: options.abbreviation,
          names: options.name,
        }
      })
    },
  }
}

export const useSportTeams = (
  options: UseSportTeamsOptions,
  queryOptions?: { staleTime?: number; enabled?: boolean },
) => {
  const { queryKey, queryFn } = getSportTeamsQueryOptions(options)
  return useQuery({
    queryKey,
    queryFn,
    ...queryOptions,
    enabled: options.enabled,
  })
}

export const useSportTeamsByEvents = (events: EventModel[] | undefined, leagueProp?: string) => {
  const queries = React.useMemo(() => {
    // If leagueProp is provided, fetch all teams for that league without filtering by abbreviations
    if (leagueProp) {
      return [
        {
          ...getSportTeamsQueryOptions({ league: [leagueProp] }),
          enabled: !!leagueProp,
        },
      ]
    }

    if (!events) return []

    // Extract unique abbreviations grouped by league from event slugs
    const groups: Record<string, Set<string>> = {}

    events.forEach((event) => {
      if (!event.slug) return
      const parts = event.slug.split('-')
      // Format: league-team1-team2-date
      if (parts.length >= 3) {
        const league = parts[0]
        if (!groups[league]) {
          groups[league] = new Set()
        }

        if (isNaN(Number(parts[1]))) groups[league].add(parts[1])
        if (isNaN(Number(parts[2]))) groups[league].add(parts[2])
      }
    })

    return Object.entries(groups).map(([league, set]) => ({
      ...getSportTeamsQueryOptions({ league: [league], abbreviation: Array.from(set) }),
      enabled: set.size > 0,
    }))
  }, [events, leagueProp])

  const queryResults = useQueries({ queries })

  const teams = React.useMemo(() => {
    return queryResults.flatMap((result) => result.data || [])
  }, [queryResults])

  return { teams, isLoading: queryResults.some((q) => q.isLoading) }
}
