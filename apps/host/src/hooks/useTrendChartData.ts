import { TokenTrending } from '@/types/token.ts'
import { useMemo } from 'react'
import dayjs from 'dayjs'
import { listCoinHelper } from '@/utils/list-coin-helper.ts'
import { dropRightWhile, dropWhile } from 'lodash-es'
import { Ohlc } from '@/types/ohlc.ts'

interface UseTrendChartDataParams {
  token: TokenTrending
  timeframe: string
}

function trimUndefined<T>(data: T[]) {
  return dropRightWhile(
    dropWhile(data, (value) => value === undefined),
    (value) => value === undefined,
  )
}

function getStep(timeframe: string) {
  switch (timeframe) {
    case '1m':
      return 60 // 1m
    case '5m':
      return 5 * 60 // 5m
    case '1h':
      return 10 * 60 // 10m
    case '6h':
      return 30 * 60 // 30m
    case '24h':
      return 2 * 60 * 60 // 2h
    default:
      return 60
  }
}

export const useTrendChartData = (params: UseTrendChartDataParams) => {
  const { token, timeframe } = params

  return useMemo(() => {
    const ohlc = [...(token.ohlc || [])]
    const step = getStep(timeframe)
    const now = dayjs().unix()
    let data: Ohlc[] = []
    let previousData = ohlc[0]
    for (let i = 9; i >= 0; i--) {
      const startTime = now - step * i
      const endTime = now - step * (i + 1)
      const item = ohlc.find((item) => {
        return item.ts >= endTime && item.ts < startTime
      })
      if (item) {
        data.push(item)
        previousData = item
      } else if (previousData) {
        data.push({
          ts: startTime,
          open: previousData.open,
          usdVolume: '0',
          high: previousData.high,
          low: previousData.low,
          close: previousData.close,
        })
      } else {
        // find the first item has open value greater than 0
        const firstItem = ohlc.find((item) => +item.open > 0 && item.ts >= endTime)
        if (firstItem) {
          data.push({
            ts: startTime,
            open: firstItem.open,
            usdVolume: '0',
            high: firstItem.high,
            low: firstItem.low,
            close: firstItem.close,
          })
        } else {
          data.push({
            ts: startTime,
            open: '0',
            usdVolume: '0',
            high: '0',
            low: '0',
            close: '0',
          })
        }
      }
    }
    data = trimUndefined(data)
    const pricesData = listCoinHelper.normalizeChartData2(
      data.map((item) => parseFloat(item.open)),
      50,
    )
    const volumesData = listCoinHelper.normalizeChartData2(data.map((item) => parseFloat(item.usdVolume)))
    return {
      pricesData,
      volumesData,
      chartLength: 10,
    }
  }, [token, timeframe])
}
