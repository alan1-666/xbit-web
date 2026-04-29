import { TransactionType } from '@/@generated/gql/graphql-future.ts'
import { TimeRange } from '@/@generated/gql/graphql-meme2'

const options = ['1m', '5m', '1h', '6h', '24h'] as const

export type TimeframeOption = (typeof options)[number]

export interface SmartMoneyFilterType {
  transactionType?: TransactionType
  minAmountUsd?: number | undefined
  maxAmountUsd?: number | undefined
  address?: string[]
  timeframe?: TimeframeOption
}

export const mapTimeframeToTimeRange = (timeframe?: TimeframeOption): TimeRange | undefined => {
  if (!timeframe) return undefined

  const mapping: Record<TimeframeOption, TimeRange> = {
    '1m': TimeRange.M1,
    '5m': TimeRange.M5,
    '1h': TimeRange.H1,
    '6h': TimeRange.H6,
    '24h': TimeRange.H24,
  }

  return mapping[timeframe]
}
