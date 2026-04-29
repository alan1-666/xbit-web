import { eventsService } from '@/modules/prediction/services/events.service.ts'
import { useQuery } from '@tanstack/react-query'

interface UseEarningsEventsParams {
  weekOffsets: number[]
}

const DAYS_PER_WEEK = 7
const FRIDAY_OFFSET = 4
const MONDAY_DAY = 1
const SATURDAY = 6
const SUNDAY = 0

const CACHE_TIME = {
  STALE: 5 * 60 * 1000,
  GC: 10 * 60 * 1000,
} as const

const getNextMondayOffset = (dayOfWeek: number): number => {
  if (dayOfWeek === SUNDAY) return 1
  if (dayOfWeek === SATURDAY) return 2
  return MONDAY_DAY - dayOfWeek
}

export const useEarningsEvents = ({ weekOffsets }: UseEarningsEventsParams) => {
  return useQuery({
    queryKey: ['prediction', 'earnings', 'weeks', weekOffsets],
    queryFn: async () => {
      const today = new Date()
      const dayOfWeek = today.getDay()
      const currentWeekStart = new Date(today)
      currentWeekStart.setDate(today.getDate() + getNextMondayOffset(dayOfWeek))
      currentWeekStart.setHours(0, 0, 0, 0)

      const minOffset = Math.min(...weekOffsets)
      const maxOffset = Math.max(...weekOffsets)

      const startDate = new Date(currentWeekStart)
      startDate.setDate(currentWeekStart.getDate() + minOffset * DAYS_PER_WEEK)

      const endDate = new Date(currentWeekStart)
      endDate.setDate(currentWeekStart.getDate() + maxOffset * DAYS_PER_WEEK + FRIDAY_OFFSET)
      endDate.setHours(23, 59, 59, 999)

      const response = await eventsService.getEventsByCategory({
        offset: 0,
        limit: 1000,
        filter: {
          tagSlug: 'earnings',
          endDateFrom: startDate.toISOString(),
          endDateTo: endDate.toISOString(),
        },
      })

      return response
    },
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  })
}
