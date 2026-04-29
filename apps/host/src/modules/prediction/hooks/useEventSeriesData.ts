import { useMemo } from 'react'
import dayjs from 'dayjs'

import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { EventBase, PriceCandleOutcome, PriceChartSource, PriceTimeframe } from '@/@generated/gql/graphql-prediction.ts'
import { useSeriesByID } from '@/modules/prediction/hooks/useSeriesByID.ts'
import { usePriceResult } from './usePriceResult'

import { getTimeframe } from '../components/event-details/event-series/utils'
import { getEventRecurrence, getStartTime } from '../components/event-details/Chart'
import { getBase } from '../components/event-details/CryptoChart'

export interface EventBaseResult extends EventBase {
  outcome: PriceCandleOutcome | null
}

const getEventTimestamp = (dateString?: string | null) => (dateString ? new Date(dateString).getTime() : 0)

const sortByDateDesc = (a: EventBase, b: EventBase) => getEventTimestamp(b.endDate) - getEventTimestamp(a.endDate)

const sortByDateAsc = (a: EventBase, b: EventBase) => getEventTimestamp(a.endDate) - getEventTimestamp(b.endDate)

const useEventSeriesData = (seriesId: string, symbol: string) => {
  const { event, selectedMarket } = useEventDetailsPageContext()
  const { data: seriesData, isPending: isSeriesPending } = useSeriesByID(seriesId)

  const recurrence = useMemo(() => (event ? getEventRecurrence(event) : null), [event])

  const { past, upcoming } = useMemo(() => {
    const activeEvents = seriesData?.events?.filter((e) => e.active) || []
    if (!activeEvents.length) return { past: [], upcoming: [] }

    const pastEvents = activeEvents.filter((e) => e.closed)
    const upcomingEvents = activeEvents.filter((e) => !e.closed)

    return {
      past: pastEvents.sort(sortByDateDesc).slice(0, 20),
      upcoming: upcomingEvents.sort(sortByDateAsc),
    }
  }, [seriesData?.events])

  const currentEventIsPast = useMemo(() => {
    return past.some((e) => e.slug === event?.slug)
  }, [event?.slug, past])

  const source = useMemo<PriceChartSource>(() => {
    const resolutionSource = selectedMarket?.resolutionSource?.toLowerCase()
    if (!resolutionSource || resolutionSource === 'binance') return PriceChartSource.Binance
    return PriceChartSource.Chainlink
  }, [selectedMarket?.resolutionSource])

  const base = useMemo(() => getBase(symbol), [symbol])
  const timeframe = useMemo(() => getTimeframe(recurrence) || PriceTimeframe.FifteenMinutes, [recurrence])

  const startTime = useMemo(() => {
    if (!event?.endDate) return 0
    const st = getStartTime(recurrence, event.endDate)
    return dayjs(st * 1000).isAfter(dayjs()) ? dayjs().unix() : st
  }, [event?.endDate, recurrence])

  const getPriceResultConfig = useMemo(
    () => ({
      source,
      base,
      timeframe,
      enabled: !!startTime && !!timeframe,
      seriesID: seriesId,
    }),
    [source, base, timeframe, startTime, seriesId],
  )

  const { data: prevPriceResultData, isFetching: isFetchingPrev } = usePriceResult({
    ...getPriceResultConfig,
    timestamp: startTime,
  })
  const currentTime = useMemo(() => dayjs().unix(), [])

  const { data: recentPriceResultData, isFetching: isFetchingRecent } = usePriceResult({
    ...getPriceResultConfig,
    timestamp: currentTime,
  })

  const prevPastResults = useMemo(() => {
    if (!prevPriceResultData) return []
    return [...prevPriceResultData]
      .sort((a, b) => a.endTime - b.endTime)
      .filter((result) => !!result.outcome && !!result.eventSlug)
      .slice(-4)
  }, [prevPriceResultData])

  const eventResults: EventBaseResult[] = useMemo(() => {
    if (!past.length) return []
    return past.map((pastEvent) => {
      const result = recentPriceResultData?.find(
        (res) => res.eventSlug === pastEvent.slug || pastEvent.id === res.eventSlug,
      )
      return { ...pastEvent, outcome: result?.outcome || null }
    })
  }, [past, recentPriceResultData])

  const isPending = isSeriesPending || isFetchingPrev || isFetchingRecent

  return {
    event,
    recurrence,
    past,
    upcoming,
    currentEventIsPast,
    prevPastResults,
    eventResults,
    isPending,
  }
}

export default useEventSeriesData
