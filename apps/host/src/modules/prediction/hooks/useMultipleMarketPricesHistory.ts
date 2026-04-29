import { useQueries, useQuery } from '@tanstack/react-query'
import { eventsService } from '@/modules/prediction/services/events.service.ts'
import { useMemo } from 'react'
import { PriceModel } from '@/modules/prediction/models/PriceModel.ts'
import { Timeframe } from '@/@generated/gql/graphql-prediction.ts'
import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import dayjs from 'dayjs'
import { GetPriceHistoryInput } from '@/modules/prediction/types'

const getResolution = (timeframe: Timeframe): number => {
  switch (timeframe) {
    case Timeframe.Timeframe1H:
      return 1
    case Timeframe.Timeframe6Hour:
      return 1
    case Timeframe.Timeframe1Day:
      return 5
    case Timeframe.Timeframe1Week:
      return 30
    case Timeframe.Timeframe1Month:
    case Timeframe.TimeframeAll:
      return 180
    default:
      return 1
  }
}

export const useMultipleMarketPricesHistory = (tokenIds: string[], timeframe: Timeframe) => {
  const queries = useQueries({
    queries: tokenIds.map((tokenId) => ({
      queryKey: ['prediction', 'marketPricesHistory', tokenId, timeframe],
      enabled: !!tokenId,
      queryFn: async () => {
        return eventsService.getPricesHistory({
          tokenId,
          interval: timeframe,
          resolution: getResolution(timeframe),
        })
      },
    })),
  })

  const data = useMemo(() => {
    const map: Record<string, PriceModel[]> = {}
    queries.forEach((query, index) => {
      if (query.data) {
        map[tokenIds[index]] = query.data
      }
    })
    return map
  }, [queries])

  const isLoading = queries.some((query) => query.isLoading)

  return {
    data,
    isLoading,
  }
}

const getStartAndEndTime = (market: MarketModel, timeframe: Timeframe) => {
  const endDate = dayjs(market.umaEndDate)
  const startDate = dayjs(market.startDate)

  switch (timeframe) {
    case Timeframe.Timeframe1Day: {
      const startTime = endDate.subtract(1, 'day')
      return {
        startTime: startTime.isAfter(startDate) ? startTime.unix() : startDate.unix(),
        endTime: endDate.unix(),
      }
    }
    case Timeframe.Timeframe1H: {
      const startTime = endDate.subtract(1, 'hour')
      return {
        startTime: startTime.isAfter(startDate) ? startTime.unix() : startDate.unix(),
        endTime: endDate.unix(),
      }
    }
    case Timeframe.Timeframe6Hour: {
      const startTime = endDate.subtract(6, 'hour')
      return {
        startTime: startTime.isAfter(startDate) ? startTime.unix() : startDate.unix(),
        endTime: endDate.unix(),
      }
    }
    case Timeframe.Timeframe1Week: {
      const startTime = endDate.subtract(1, 'week')
      return {
        startTime: startTime.isAfter(startDate) ? startTime.unix() : startDate.unix(),
        endTime: endDate.unix(),
      }
    }
    case Timeframe.Timeframe1Month: {
      const startTime = endDate.subtract(1, 'month')
      return {
        startTime: startTime.isAfter(startDate) ? startTime.unix() : startDate.unix(),
        endTime: endDate.unix(),
      }
    }
    case Timeframe.TimeframeAll: {
      return {
        startTime: startDate.unix(),
        endTime: endDate.unix(),
      }
    }
  }
}

export const useMultipleMarketPricesHistoryV2 = (markets: MarketModel[], timeframe: Timeframe) => {
  const inputs = useMemo<GetPriceHistoryInput[]>(() => {
    return markets.map((market) => {
      const now = dayjs()
      if (now.isAfter(dayjs(market.umaEndDate))) {
        const { startTime, endTime } = getStartAndEndTime(market, timeframe)
        return {
          tokenId: market.clobTokenIds?.[0] || '',
          resolution: getResolution(timeframe),
          startTime: startTime,
          endTime: endTime,
        }
      } else {
        return {
          tokenId: market.clobTokenIds?.[0] || '',
          interval: timeframe,
          resolution: getResolution(timeframe),
        }
      }
    })
  }, [markets, timeframe])
  const marketIds = useMemo(() => markets.map((m) => m.id).join(','), [markets])
  // return eventsService.getMultipleMarketsPriceHistory(inputs)
  return useQuery({
    queryKey: ['prediction', 'multipleMarketPricesHistory', marketIds, timeframe],
    queryFn: async () => {
      return eventsService.getMultipleMarketsPriceHistory(inputs)
    },
    enabled: marketIds.length > 0,
  })
}
