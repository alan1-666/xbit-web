import { MqttBinancePricePayload } from '@/modules/prediction/types/mqtt-payload.ts'
import {
  ChartPricePoint,
  PriceChartBase,
  PriceChartQuote,
  PriceChartSource,
} from '@/@generated/gql/graphql-prediction.ts'
import { usePublicSubscriptionCallback } from '@hooks/mqtt/usePublicSubscriptionCallback.ts'
import { TOPICS } from '@/lib/topics.ts'
import { useUpdateQueryCache } from '@/modules/prediction/hooks/useUpdateQueryCache.ts'
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'
import { useCallback, useMemo } from 'react'

const getPair = (symbol: PriceChartBase) => {
  return `${symbol}USDT`
}

export const useCryptoPriceUpdate = (symbol: PriceChartBase, source: PriceChartSource, unsubscribe?: boolean) => {
  const updateQueryCache = useUpdateQueryCache<ChartPricePoint[], MqttBinancePricePayload>({
    queryKey: QUERY_KEYS_CONFIGS.cryptoPrice(source, symbol, PriceChartQuote.Usdt),
    updater: (oldData, modified) => {
      const newData = oldData ? [...oldData] : []
      newData.unshift({
        price: modified.p,
        timestamp: modified.t,
      })
      return newData
    },
  })

  const handleOnMessage = useCallback(
    (_: string, payload: MqttBinancePricePayload) => {
      updateQueryCache(payload)
    },
    [updateQueryCache],
  )

  const sourceTopic = useMemo(() => {
    switch (source) {
      case PriceChartSource.Binance:
        return 'binance'
      case PriceChartSource.Chainlink:
        return 'chainlink'
      default:
        return 'binance'
    }
  }, [source])

  const topic = useMemo(() => {
    return TOPICS.prediction.cryptoPrice(sourceTopic, getPair(symbol))
  }, [sourceTopic, symbol])

  usePublicSubscriptionCallback<MqttBinancePricePayload>(topic, {
    shouldSkip: !symbol || unsubscribe,
    onMessage: handleOnMessage,
  })
}
