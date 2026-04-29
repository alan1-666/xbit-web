export const WEEK_OFFSETS = [-3, -2, -1, 0, 1, 2, 3]
export const CURRENT_WEEK_INDEX = 3
export const DAYS_PER_WEEK = 5
export const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
export const DAY_NAMES_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const SCROLL_DEBOUNCE_MS = 50
export const SCROLL_LOCK_TIMEOUT_MS = 100
export const SWIPE_THRESHOLD_PX = 50

export const COLORS = {
  HEADER_BG: '#18181B',
  DAY_NAME: '#908E98',
  DAY_NUMBER: '#FFF',
  TEXT_PRIMARY: '#FFF',
  TEXT_SECONDARY: '#838385',
  EMPTY_ICON_OPACITY: 0.5,
} as const

export const PROBABILITY_THRESHOLDS = {
  BEATS: 70,
  MISSES: 40,
} as const
