import { z } from 'zod'
import { TAB_MEME, TAB_TRENDING } from '@components/discover/DiscoverTabs.tsx'
import { LAUNCHPADS, LaunchPlatformOptions } from '@/lib/constant.ts'

export type RangeItem = {
  min: number | undefined
  max: number | undefined
  isCustom: boolean
}

export type SortType = 'asc' | 'desc'

export type SortField = 'marketCap' | 'holders' | 'transactions' | 'volumes' | 'progress' | 'liquidityPool' | 'price' | 'price1hChange' | 'symbol'

export type FilterFormData = {
  marketCap?: RangeItem | null
  holders?: RangeItem | null
  transactions?: RangeItem | null
  volumes?: RangeItem | null
  progress?: RangeItem | null
  liquidityPool?: RangeItem | null
  dexList: string[]
  timeframe: string
  sortBy?: {
    field: SortField
    type: SortType
  }
  version?: number
  solDexList?: string[]
  bscDexList?: string[]
  ethDexList?: string[]
  arbDexList?: string[]
}

export type DexFilter = 'solDexList' | 'bscDexList' | 'ethDexList' | 'arbDexList'

const refineRangeItem = (data: { min?: number; max?: number } | null | undefined) => {
  if (data === null || data === undefined) return true
  const { min, max } = data
  if (max !== undefined && max <= 0) return false
  if (min === undefined || max === undefined) return true
  return min <= max
}

const defaultError = {
  message: 'Min value must be less than max value',
}

export const filterSchema = z.object({
  marketCap: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .nullish()
    .refine(refineRangeItem, defaultError)
    .nullable(),
  holders: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .nullish()
    .refine(refineRangeItem, defaultError)
    .nullable(),
  transactions: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .nullish()
    .refine(refineRangeItem, defaultError)
    .nullable(),
  volumes: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .nullish()
    .refine(refineRangeItem, defaultError)
    .nullable(),
  progress: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .nullish()
    .refine(refineRangeItem, defaultError)
    .nullable(),
  liquidityPool: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .nullish()
    .refine(refineRangeItem, defaultError)
    .nullable(),
  dexList: z.array(z.string()),
  timeframe: z.string(),
  sortBy: z
    .object({
      field: z.enum(['marketCap', 'holders', 'transactions', 'volumes', 'progress', 'liquidityPool', 'price', 'price1hChange', 'symbol']),
      type: z.enum(['asc', 'desc']),
    })
    .optional(),
})

export const getDexList = (currentTab: string) => {
  if (currentTab === TAB_MEME) {
    return LAUNCHPADS
  }
  return LaunchPlatformOptions.slice(1).map((option) => option.value)
}

export const getDefaultFilters = (currentTab: string): FilterFormData => {
  return {
    dexList: getDexList(currentTab),
    timeframe: currentTab === TAB_TRENDING ? '24h' : '1h',
  }
}
