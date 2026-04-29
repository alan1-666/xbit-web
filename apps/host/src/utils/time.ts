import { TimeWheelDateType } from '@/redux/modules/tokenDetail.slice.ts'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import i18next from 'i18next'
import { isInteger } from 'lodash-es'

// Import dayjs locales
import 'dayjs/locale/en'
import 'dayjs/locale/vi'
import 'dayjs/locale/hi'
import 'dayjs/locale/zh'
import 'dayjs/locale/zh-hk'

// Extend dayjs with relative time plugin
dayjs.extend(relativeTime)

// Time unit thresholds in seconds
const TIME_THRESHOLDS = {
  MINUTE: 60,
  HOUR: 3600,
  DAY: 86400,
  MONTH: 2592000, // 30 days
  YEAR: 31536000, // 365 days
} as const

// Helper function to get time difference and appropriate unit
function getTimeDifference(
  now: dayjs.Dayjs,
  past: dayjs.Dayjs,
): { value: number; unit: keyof typeof TIME_THRESHOLDS; nextUpdate: number } {
  const diffInSeconds = now.diff(past, 'seconds')

  if (diffInSeconds < TIME_THRESHOLDS.MINUTE) {
    return { value: diffInSeconds, unit: 'MINUTE', nextUpdate: 1000 }
  }
  if (diffInSeconds < TIME_THRESHOLDS.HOUR) {
    return { value: Math.floor(diffInSeconds / TIME_THRESHOLDS.MINUTE), unit: 'HOUR', nextUpdate: 60 * 1000 }
  }
  if (diffInSeconds < TIME_THRESHOLDS.DAY) {
    return { value: Math.floor(diffInSeconds / TIME_THRESHOLDS.HOUR), unit: 'DAY', nextUpdate: 10 * 60 * 1000 }
  }
  if (diffInSeconds < TIME_THRESHOLDS.MONTH) {
    return { value: Math.floor(diffInSeconds / TIME_THRESHOLDS.DAY), unit: 'MONTH', nextUpdate: 60 * 60 * 1000 }
  }
  if (diffInSeconds < TIME_THRESHOLDS.YEAR) {
    return { value: Math.floor(diffInSeconds / TIME_THRESHOLDS.MONTH), unit: 'YEAR', nextUpdate: 60 * 60 * 1000 }
  }

  return { value: Math.floor(diffInSeconds / TIME_THRESHOLDS.YEAR), unit: 'YEAR', nextUpdate: 60 * 60 * 1000 }
}

// Helper function to format time with i18n
function formatTimeWithI18n(value: number, unit: keyof typeof TIME_THRESHOLDS): string {
  const i18nKeys = {
    MINUTE: 'const.time.s',
    HOUR: 'const.time.m',
    DAY: 'const.time.h',
    MONTH: 'const.time.d',
    YEAR: 'const.time.monthsShort',
  } as const

  // Special case for years
  if (unit === 'YEAR' && value >= 12) {
    return `${Math.floor(value / 12)}${i18next.t('const.time.yearsShort')}`
  }

  return `${value}${i18next.t(i18nKeys[unit])}`
}

export function getTimeAgo(timestamp: number | string | undefined, format: 'd' | 'YYYY/MM/DD HH:mm:ss' = 'd'): string {
  if (format === 'YYYY/MM/DD HH:mm:ss') {
    return dayjs(timestamp).format('YYYY/MM/DD HH:mm:ss')
  }

  const past = dayjs(timestamp)
  if (!past.isValid()) {
    return '--'
  }

  const now = dayjs()
  const { value, unit } = getTimeDifference(now, past)

  return formatTimeWithI18n(value, unit)
}
export function getTimeAgoWithNextTime(timestamp: number | undefined): { text: string; next: number } {
  if (!timestamp || isNaN(timestamp) || timestamp <= 0) {
    return {
      text: '--',
      next: 24 * 60 * 60 * 1000,
    }
  }

  const past = dayjs(timestamp)
  if (!past.isValid()) {
    return { text: '--', next: 24 * 60 * 60 * 1000 }
  }

  const now = dayjs()
  const { value, unit, nextUpdate } = getTimeDifference(now, past)

  return {
    text: formatTimeWithI18n(value, unit),
    next: nextUpdate,
  }
}

export function covertSeconds(seconds: number, to: 'd' | 'm' | 'y' = 'd'): string {
  if (seconds < 0) return '--'

  // Convert seconds to days, months, years with decimal places
  switch (to) {
    case 'd':
      return `${(seconds / TIME_THRESHOLDS.DAY).toFixed(isInteger(seconds / TIME_THRESHOLDS.DAY) ? 0 : 2)}d`
    case 'm':
      return `${(seconds / TIME_THRESHOLDS.MONTH).toFixed(isInteger(seconds / TIME_THRESHOLDS.MONTH) ? 0 : 2)}m`
    case 'y':
      return `${(seconds / TIME_THRESHOLDS.YEAR).toFixed(isInteger(seconds / TIME_THRESHOLDS.YEAR) ? 0 : 2)}y`
    default:
      return `${seconds}s`
  }
}
export const formatHoldingDuration = (seconds: number): string => {
  if (!seconds || seconds <= 0) {
    return '--'
  }

  const ONE_MINUTE = 60
  const ONE_HOUR = 3600 // 60 * 60
  const ONE_DAY = 86400 // 24 * 60 * 60

  const thresholds: { unit: TimeUnit; value: number }[] = [
    { unit: 'd', value: ONE_DAY },
    { unit: 'h', value: ONE_HOUR },
    { unit: 'm', value: ONE_MINUTE },
  ]

  for (let i = 0; i < thresholds.length; i++) {
    const { unit, value } = thresholds[i]
    if (seconds >= value) {
      return `${Math.floor(seconds / value)}${unit}`
    }
  }
  return `${seconds}s`
}

type TimeUnit = 's' | 'm' | 'h' | 'd'

interface I18nUnitKey {
  full: string
  short: string
}

const i18nUnitKeysMap: Record<TimeUnit, I18nUnitKey> = {
  s: { full: 'const.time.duration.second', short: 'const.time.duration.s' },
  m: { full: 'const.time.duration.minute', short: 'const.time.duration.m' },
  h: { full: 'const.time.duration.hour', short: 'const.time.duration.h' },
  d: { full: 'const.time.duration.day', short: 'const.time.duration.d' },
}

export interface FormatTimeAgoOptions {
  /**
   * Rounding method for the calculated time unit.
   * @default 'floor'
   */
  rounding?: 'floor' | 'ceil' | 'round'
  /**
   * Style of the unit label.
   * - 'short': s, m, h, d (e.g., "5s")
   * - 'full': seconds, minutes, hours, days (e.g., "5 seconds")
   * @default 'short'
   */
  unitLabel?: 'short' | 'full'
}

/**
 * Formats a timestamp into a time ago string (e.g., "5s", "10m", "2h", "1d").
 *
 * Supported timestamp formats:
 * - number: Unix timestamp in seconds or milliseconds.
 * - string: Date string (ISO 8601 or other formats parsable by dayjs).
 * - Date: JS Date object.
 *
 * @param timestamp - The timestamp to format.
 * @param options - Configuration options for rounding and formatting.
 * @returns The formatted time ago string.
 */
export const formatToTimeAgoI18n = (timestamp: number | string | Date, options?: FormatTimeAgoOptions): string => {
  if (!timestamp) {
    return '--'
  }

  let seconds = 0
  const now = dayjs().unix()

  if (typeof timestamp === 'number') {
    if (timestamp <= 0) return '--'
    // Detect ms vs seconds (10000000000 is roughly year 2286, so it's a safe threshold for ms)
    const timestampInSeconds = timestamp > 10000000000 ? Math.floor(timestamp / 1000) : timestamp
    seconds = now - timestampInSeconds
  } else {
    const date = dayjs(timestamp)
    if (!date.isValid()) return '--'
    seconds = now - date.unix()
  }

  if (seconds < 0) return '--'

  const { rounding = 'floor', unitLabel = 'short' } = options || {}

  const applyRounding = (val: number) => {
    switch (rounding) {
      case 'ceil':
        return Math.ceil(val)
      case 'round':
        return Math.round(val)
      default:
        return Math.floor(val)
    }
  }

  const formatWithUnit = (val: number, unit: TimeUnit) => {
    const roundedVal = applyRounding(val)
    const key = i18nUnitKeysMap[unit][unitLabel]

    return i18next.t(key, {
      duration: roundedVal,
    })
  }

  const thresholds: { unit: TimeUnit; value: number }[] = [
    { unit: 'd', value: TIME_THRESHOLDS.DAY },
    { unit: 'h', value: TIME_THRESHOLDS.HOUR },
    { unit: 'm', value: TIME_THRESHOLDS.MINUTE },
  ]

  for (const { unit, value } of thresholds) {
    if (seconds >= value) {
      return formatWithUnit(seconds / value, unit)
    }
  }

  return formatWithUnit(seconds, 's')
}

export function toTimestampFromTimeWheel(date: TimeWheelDateType): number {
  const { year = '1970', month = '01', day = '01', hour = '00', minute = '00' } = date

  // Create ISO string format for better dayjs parsing
  const formatted = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`
  const dayjsDate = dayjs(formatted)

  if (!dayjsDate.isValid()) {
    throw new Error(`Invalid date format: ${formatted}`)
  }

  return dayjsDate.valueOf() // timestamp in milliseconds
}

/**
 * Format date with proper locale support for i18n
 * @param date - The date to format (string, number, or dayjs object)
 * @param format - The format string (default: 'MMM D, YYYY')
 * @param locale - The locale to use (if not provided, uses current i18n language)
 * @returns Formatted date string
 */
export function formatDateWithLocale(
  date: string | number | dayjs.Dayjs | null | undefined,
  format: string = 'D[d] HH:mm:ss',
  locale?: string,
): string {
  if (!date) return '--'

  const dayjsDate = dayjs(date)
  if (!dayjsDate.isValid()) return '--'

  const currentLocale = locale || i18next.language || 'en'

  // Map i18n language codes to dayjs locale codes
  const localeMap: Record<string, string> = {
    en: 'en',
    vi: 'vi',
    hi: 'hi',
    zh: 'zh',
    hk: 'zh-hk',
  }

  const dayjsLocale = localeMap[currentLocale] || 'en'

  return dayjsDate.locale(dayjsLocale).format(format)
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
