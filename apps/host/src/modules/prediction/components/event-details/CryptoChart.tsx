import { usePriceChart } from '@/modules/prediction/hooks/usePriceChartFromEvents.ts'
import { PriceChartBase, PriceChartQuote, PriceChartSource } from '@/@generated/gql/graphql-prediction.ts'
import { useEffect, useMemo, useState } from 'react'
import { useCryptoPriceUpdate } from '@/modules/prediction/hooks/useHandleBinancePriceUpdate.ts'
import RealTimeChartTS, { DataPoint } from './PartialPriceLine'
import { UTCTimestamp } from 'lightweight-charts'
import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { PriceToBeat } from './PriceToBeat'
import { CurrentPrice } from '@/modules/prediction/components/event-details/CurrentPrice.tsx'
import { usePriceAt } from '../../hooks/usePriceAt'
import dayjs from 'dayjs'
import { getTimeframe } from './event-series/utils'
import { getEventRecurrence } from './Chart'
import { usePriceSnapshot } from '../../hooks/usePriceSnapshot'
import StaticCryptoChart from './StaticCryptoChart'

export interface CryptoChartProps {
  symbol: string
}

export const getBase = (symbol: string) => {
  switch (symbol) {
    case 'BTC':
      return PriceChartBase.Btc
    case 'ETH':
      return PriceChartBase.Eth
    case 'SOL':
      return PriceChartBase.Sol
    case 'XRP':
      return PriceChartBase.Xrp
    default:
      return PriceChartBase.Btc
  }
}

export const CryptoChart = (props: CryptoChartProps) => {
  const { symbol } = props
  const { selectedMarket, event, isFetching: isEventFetching } = useEventDetailsPageContext()
  const startTimeUnix = useMemo(() => (!!event?.startTime ? dayjs(event?.startTime).unix() : 0), [event?.startTime])

  const recurrence = useMemo(() => {
    if (!event) return null
    return getEventRecurrence(event)
  }, [event])

  const source = useMemo<PriceChartSource>(() => {
    const resolutionSource = selectedMarket?.resolutionSource
    if (!resolutionSource) return PriceChartSource.Binance
    if (resolutionSource.toLowerCase().includes('binance')) return PriceChartSource.Binance
    return PriceChartSource.Chainlink
  }, [selectedMarket?.resolutionSource])

  const base = useMemo(() => getBase(symbol), [symbol])

  const [isPastEvent, setIsPastEvent] = useState(() => !!event?.endDate && dayjs().isAfter(dayjs(event.endDate)))
  const initialStatusPastEvent = useMemo(() => {
    if (!event?.endDate) return false
    return dayjs().isAfter(dayjs(event.endDate))
  }, [event?.endDate])
  useEffect(() => {
    if (!event?.endDate) {
      setIsPastEvent(false)
      return
    }

    const endTimeMs = dayjs(event.endDate).valueOf()
    const nowMs = Date.now()
    const diffMs = endTimeMs - nowMs

    if (diffMs <= 0) {
      setIsPastEvent(true)
      return
    }

    setIsPastEvent(false)
    const timeoutId: ReturnType<typeof setTimeout> = setTimeout(() => {
      setIsPastEvent(true)
    }, diffMs)

    return () => clearTimeout(timeoutId)
  }, [event?.endDate])

  const { data: priceSnapshot, isFetching: isPriceSnapshotFetching } = usePriceSnapshot({
    source,
    base,
    endTime: event?.endDate ? dayjs(event.endDate).unix() : 0,
    enabled: !!event?.endDate && initialStatusPastEvent,
  })

  const { data } = usePriceChart({
    source: source,
    base: base,
    quote: PriceChartQuote.Usdt,
    enabled: !!selectedMarket?.resolutionSource && !isPastEvent,
  })
  const {
    data: targetPriceData,
    refetch,
    isFetching: isTargetPriceFetching,
  } = usePriceAt({
    source: source,
    base: base,
    timestamp: startTimeUnix,
    enabled: !!selectedMarket?.resolutionSource,
    filter: recurrence
      ? ({
          timeframe: getTimeframe(recurrence),
        } as any)
      : undefined,
  })

  const { data: finalPrice, isFetching: isFinalPriceFetching } = usePriceAt({
    source: source,
    base: base,
    enabled: isPastEvent && !!selectedMarket?.resolutionSource,
    timestamp: !!event?.endDate ? dayjs(event?.endDate).unix() : 0,
    filter: recurrence
      ? ({
          timeframe: getTimeframe(recurrence),
        } as any)
      : undefined,
  })

  useCryptoPriceUpdate(base, source, !data?.length || isPastEvent)

  useEffect(() => {
    if (!startTimeUnix || targetPriceData !== null) return

    const currentUnix = dayjs().unix()
    const timeDiffMs = (startTimeUnix - currentUnix) * 1000

    if (timeDiffMs <= 0) {
      refetch()
      return
    }

    const timeoutId = setTimeout(() => {
      refetch()
    }, timeDiffMs)

    return () => clearTimeout(timeoutId)
  }, [startTimeUnix, targetPriceData, refetch])

  const dataPoints = useMemo<DataPoint[]>(() => {
    if (!data) return []
    return data.map((point) => ({
      time: (point.timestamp * 1000) as UTCTimestamp,
      value: +point.price,
    }))
  }, [data])

  const lastPrice = useMemo(() => {
    if (isPastEvent) {
      return finalPrice && finalPrice.price ? +finalPrice.price : null
    }
    return data && data.length > 0 ? +data[0].price : null
  }, [data, isPastEvent, finalPrice])

  const color = useMemo(() => {
    switch (base) {
      case PriceChartBase.Btc:
        return '#F7931A'
      case PriceChartBase.Eth:
        return '#627EEA' // Blue
      case PriceChartBase.Sol:
        return '#9945FF' // Purple
      case PriceChartBase.Xrp:
        return '#2196F3' // Light Blue
      default:
        return '#9E9E9E' // Gray
    }
  }, [base])

  const priceDecimals = useMemo(() => {
    if (base === PriceChartBase.Xrp) return 4
    return 2
  }, [base])

  if (!symbol) return null

  const isUpcomingEvent = !!event?.startTime && dayjs().isBefore(dayjs(event.startTime))
  const targetPrice = targetPriceData ? +targetPriceData.price : null

  return (
    <div className="">
      <div className="flex items-center justify-between w-full mt-4 min-h-13 lg:min-h-14">
        <div className="flex-1 flex items-center justify-start xl:justify-end">
          <PriceToBeat isUpcomingEvent={isUpcomingEvent} price={targetPrice} decimals={priceDecimals} />
          <CurrentPrice
            price={lastPrice || 0}
            symbol={base}
            color={color}
            decimals={priceDecimals}
            isPastEvent={isPastEvent}
            targetPrice={targetPrice || 0}
          />
        </div>
      </div>

      <div className="w-full relative overflow-hidden rounded-lg">
        {initialStatusPastEvent ? (
          <StaticCryptoChart
            priceSnapshot={priceSnapshot}
            lineColor={color}
            currentPrice={lastPrice}
            targetPrice={targetPrice}
            decimals={priceDecimals}
            isFetching={isEventFetching || isPriceSnapshotFetching || isTargetPriceFetching || isFinalPriceFetching}
          />
        ) : (
          <RealTimeChartTS
            dataPoints={dataPoints}
            lineColor={color}
            currentPrice={lastPrice}
            targetPrice={targetPrice}
            decimals={priceDecimals}
          />
        )}
      </div>
    </div>
  )
}
