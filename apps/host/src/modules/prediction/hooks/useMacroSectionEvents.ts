import { useQueries } from '@tanstack/react-query'
import { eventsService } from '@/modules/prediction/services/events.service'
import { EventSortField, SortDirection } from '@/@generated/gql/graphql-prediction'

const MACRO_TAB = 'macro'

const SECTION_CONFIGS = {
  dashboard: { tagSlug: 'macro-graph', limit: 1 },
  economy: { tagSlug: 'macro-single', limit: 3 },
  keyElections: { tagSlugs: ['macro-election-1', 'macro-election-2'], limitPerTag: 3 },
  geopolitics: { tagSlug: 'macro-geopolitics', limit: 3 },
} as const

export const useMacroSectionEvents = () => {
  const queries = useQueries({
    queries: [
      {
        queryKey: ['prediction', 'electionsPage', MACRO_TAB, SECTION_CONFIGS.dashboard.tagSlug, SECTION_CONFIGS.dashboard.limit],
        queryFn: async () => {
          return eventsService.getEventsByCategory({
            offset: 0,
            limit: SECTION_CONFIGS.dashboard.limit,
            filter: {
              tagSlug: SECTION_CONFIGS.dashboard.tagSlug,
              active: true,
              closed: false,
            },
            sort: {
              field: EventSortField.Volume_24H,
              direction: SortDirection.Desc,
            },
          })
        },
        staleTime: 60_000,
      },
      {
        queryKey: ['prediction', 'electionsPage', MACRO_TAB, SECTION_CONFIGS.economy.tagSlug, SECTION_CONFIGS.economy.limit],
        queryFn: async () => {
          return eventsService.getEventsByCategory({
            offset: 0,
            limit: SECTION_CONFIGS.economy.limit,
            filter: {
              tagSlug: SECTION_CONFIGS.economy.tagSlug,
              active: true,
              closed: false,
            },
            sort: {
              field: EventSortField.Volume_24H,
              direction: SortDirection.Desc,
            },
          })
        },
        staleTime: 60_000,
      },
      {
        queryKey: ['prediction', 'electionsPage', MACRO_TAB, 'key-elections', ...SECTION_CONFIGS.keyElections.tagSlugs],
        queryFn: async () => {
          const results = await Promise.all(
            SECTION_CONFIGS.keyElections.tagSlugs.map((tagSlug) =>
              eventsService.getEventsByCategory({
                offset: 0,
                limit: SECTION_CONFIGS.keyElections.limitPerTag,
                filter: {
                  tagSlug,
                  active: true,
                  closed: false,
                },
                sort: {
                  field: EventSortField.Volume_24H,
                  direction: SortDirection.Desc,
                },
              }),
            ),
          )
          return results.flat()
        },
        staleTime: 60_000,
      },
      {
        queryKey: ['prediction', 'electionsPage', MACRO_TAB, SECTION_CONFIGS.geopolitics.tagSlug, SECTION_CONFIGS.geopolitics.limit],
        queryFn: async () => {
          return eventsService.getEventsByCategory({
            offset: 0,
            limit: SECTION_CONFIGS.geopolitics.limit,
            filter: {
              tagSlug: SECTION_CONFIGS.geopolitics.tagSlug,
              active: true,
              closed: false,
            },
            sort: {
              field: EventSortField.Volume_24H,
              direction: SortDirection.Desc,
            },
          })
        },
        staleTime: 60_000,
      },
    ],
  })

  return {
    dashboard: queries[0],
    economy: queries[1],
    keyElections: queries[2],
    geopolitics: queries[3],
  }
}

