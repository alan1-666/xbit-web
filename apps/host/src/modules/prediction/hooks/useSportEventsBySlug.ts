import { FuturesOutcome } from '@/modules/prediction/components/sports/FuturesMarketCard'
import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import { eventsService } from '@/modules/prediction/services/events.service.ts'
import { useInfiniteQueryWithLoadMore } from '@hooks/useInfiniteQueryWithLoadMore.ts'
import { useMemo } from 'react'
import { useCurrentSport } from './useCurrentSport'
import { useSportTeamsByEvents } from './useSportTeams'

const LIMIT = 6

export const useSportEventsBySlug = (tagSlug: string) => {
  return useInfiniteQueryWithLoadMore({
    queryKey: ['prediction', 'events', 'category', tagSlug],
    queryFn: async ({ pageParam }) => {
      const offset = (pageParam - 1) * LIMIT
      return eventsService.getEventsByCategory({
        offset,
        limit: LIMIT,
        filter: {
          tagSlug,
          active: true,
          closed: false,
          excludeTagId: ['100639'],
        },
      })
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length === LIMIT) {
        return allPages.length + 1
      }
      return undefined
    },
    select: (data) => data.pages.flat(),
  })
}

export const useSportsFutures = () => {
  const { slug } = useCurrentSport()
  const { data: events, isLoading: isEventsLoading } = useSportEventsBySlug(slug || 'nfl')
  const { teams } = useSportTeamsByEvents(events, slug?.toLowerCase())

  const processedEvents = useMemo(() => {
    if (!events) return []

    return events.map((event) => {
      const outcomes: FuturesOutcome[] =
        event.markets?.map((marketItem: unknown, marketIndex: number) => {
          const market = marketItem as MarketModel & { id?: string }
          const rawPrices = market.outcomePrices as unknown

          let prices: string[] = []
          if (Array.isArray(rawPrices)) {
            prices = rawPrices as string[]
          } else if (typeof rawPrices === 'string') {
            try {
              prices = JSON.parse(rawPrices)
            } catch {
              prices = []
            }
          }

          const name = market.groupItemTitle || market.question || `Option ${marketIndex + 1}`

          const team = teams?.find(
            (t) =>
              t.name.toLowerCase().includes(name.toLowerCase()) ||
              name.toLowerCase().includes(t.name.toLowerCase()) ||
              (t.alias && name.toLowerCase().includes(t.alias.toLowerCase())),
          )
          if (!team) {
            // console.log({ market, name, teams, team })
          }

          return {
            id: market.id || `${event.slug}-m-${marketIndex}`,
            name: name,
            probability: prices[0] ? Number(prices[0]) * 100 : 0,
            color: team?.color || '#3B82F6', // Use team color or default blue
            icon: team?.logo || market.icon || undefined,
          }
        }) || []

      outcomes.sort((a, b) => b.probability - a.probability)

      return {
        ...event,
        processedOutcomes: outcomes,
      }
    })
  }, [events, teams])

  return {
    events: processedEvents,
    isLoading: isEventsLoading,
  }
}
