import { useMemo, useCallback } from 'react'
import { EventModel } from '@/modules/prediction/models/EventModel'
import { DayData } from '@/modules/prediction/types/earnings.types'
import { getWeekDate, transformEventToStockItem, isPreMarket } from '@/modules/prediction/utils/earnings.utils'
import { DAYS_PER_WEEK, DAY_NAMES, MONTH_NAMES } from '@/modules/prediction/constants/earnings.constants'

export const useWeekData = (events: EventModel[] = []) => {
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, EventModel[]> = {}
    
    events.forEach((event) => {
      if (!event.endDate) return
      
      const eventDate = new Date(event.endDate)
      eventDate.setHours(0, 0, 0, 0)
      const dateKey = eventDate.toISOString().split('T')[0]
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(event)
    })
    
    return grouped
  }, [events])

  const generateWeekData = useCallback(
    (offset: number) => {
      const weekStart = getWeekDate(offset)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const days: DayData[] = []
      for (let index = 0; index < DAYS_PER_WEEK; index++) {
        const dayDate = new Date(weekStart)
        dayDate.setDate(weekStart.getDate() + index)
        dayDate.setHours(0, 0, 0, 0)

        const dateLabel = `${DAY_NAMES[index]} ${dayDate.getDate()}`
        const dateKey = dayDate.toISOString().split('T')[0]

        const isToday = dayDate.getTime() === today.getTime()
        const isPast = dayDate.getTime() < today.getTime()

        const dayEvents = eventsByDate[dateKey] || []
        const preMarket = dayEvents.filter(isPreMarket).map(transformEventToStockItem)
        const postMarket = dayEvents.filter(e => !isPreMarket(e)).map(transformEventToStockItem)

        days.push({
          dayKey: `${DAY_NAMES[index].toLowerCase()}-${offset}-${index}`,
          dateLabel,
          dayNumber: dayDate.getDate(),
          fullDate: dayDate,
          isToday,
          isPast,
          preMarket,
          postMarket,
        })
      }

      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 4)

      const weekLabel =
        weekStart.getMonth() === weekEnd.getMonth()
          ? `${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getDate()}-${weekEnd.getDate()}, ${weekStart.getFullYear()}`
          : `${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getDate()} - ${MONTH_NAMES[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekStart.getFullYear()}`

      return { weekLabel, days, weekOffset: offset }
    },
    [eventsByDate]
  )

  return { generateWeekData }
}
