import dayjs from 'dayjs'
import { PriceTimeframe, EventBase } from '@/@generated/gql/graphql-prediction.ts'
import { getStartTime } from '../Chart'
import Calendar from 'dayjs/plugin/calendar'
import { Timeframe } from '@/@generated/gql/graphql-prediction.ts'

dayjs.extend(Calendar)
export const dayjsCalendarFormat = {
  sameDay: '[Today]',
  nextDay: '[Tomorrow]',
  lastDay: '[Yesterday]',
  lastWeek: 'MMM DD',
  nextWeek: 'MMM DD',
  sameElse: 'MMM DD',
}
export const formatEventDate = (recurrence: string | null | undefined, endDate: string) => {
  const date = dayjs(endDate)

  if (recurrence === '5m' || recurrence === '15m') {
    return date.format('hh:mm A')
  }
  return date.format('hh A')
}
export const getPriceHistoryTimeframe = (recurrence: string | null | undefined): Timeframe => {
  switch (recurrence) {
    case '5m':
      return Timeframe.Timeframe1H
    case '15m':
      return Timeframe.Timeframe1H
    case 'hourly':
      return Timeframe.Timeframe6Hour
    case '4h':
      return Timeframe.Timeframe6Hour
    case 'daily':
      return Timeframe.Timeframe1Day
    case 'weekly':
      return Timeframe.Timeframe1Week
    case 'monthly':
      return Timeframe.Timeframe1Month
    default:
      return Timeframe.TimeframeAll
  }
}

export const getTimeframe = (recurrence: string | null | undefined): PriceTimeframe | null => {
  switch (recurrence) {
    case '5m':
      return PriceTimeframe.FiveMinutes
    case '15m':
      return PriceTimeframe.FifteenMinutes
    case 'hourly':
      return PriceTimeframe.OneHour
    case '4h':
      return PriceTimeframe.FourHours
    case 'daily':
      return PriceTimeframe.OneDay
    default:
      return null
  }
}

export const isLiveEvent = (event: EventBase, recurrence?: string | null) => {
  if (!event.endDate || !recurrence) return false
  const now = dayjs()
  const endDate = dayjs(event.endDate)
  const startDate = dayjs(getStartTime(recurrence === 'weekly' ? 'daily' : recurrence, event.endDate) * 1000)
  return now.isAfter(startDate) && now.isBefore(endDate)
}

export const getTooltipContent = (recurrence: string | null | undefined, endTime: number) => {
  const date = dayjs(endTime * 1000)
  if (recurrence === '5m' || recurrence === '15m' || recurrence === 'hourly' || recurrence === '4h') {
    return date.format('hh:mm A')
  }
  return date.format('MM/DD')
}

export const getUserTimezoneOffset = () => {
  const offset = -new Date().getTimezoneOffset() / 60
  const sign = offset >= 0 ? '+' : ''
  return `UTC${sign}${offset}`
}
