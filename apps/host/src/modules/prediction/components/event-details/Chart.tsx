import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
// import { useEventMarkets } from '@/modules/prediction/hooks/useEventMarkets.ts'
import { useEffect, useMemo, useState } from 'react'
import { BaseChart } from '@/modules/prediction/components/event-details/BaseChart.tsx'
import { CryptoChart } from '@/modules/prediction/components/event-details/CryptoChart.tsx'
import { Button } from '@components/ui/button.tsx'
import { ChartSpline } from 'lucide-react'
import { cn } from '@/lib/utils.ts'
import { EventSeries } from './EventSeries'
import { BitcoinIcon, EthereumIcon, SolanaIcon, XRPIcon } from '../icons'
import dayjs from 'dayjs'
import { EventModel } from '../../models/EventModel'
import { TradeEventMonitorV2 } from '../shared/TradeEventMonitor'
import { useLocation } from 'react-router-dom'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import { MarketBase } from '@/@generated/gql/graphql-prediction.ts'
export const recurrences = ['5m', '15m', '1h', '4h', 'daily', 'weekly', 'monthly']

export const getEventRecurrence = (event: EventModel): string | null => {
  if (!event.tags) return null
  const recurrenceTag = event.tags.find((tag) => tag.slug && recurrences.includes(tag.slug.toLowerCase()))
  const slug = recurrenceTag?.slug?.toLowerCase()
  switch (slug) {
    case '5m':
      return '5m'
    case '15m':
      return '15m'
    case '1h':
      return 'hourly'
    case '4h':
      return '4h'
    case 'daily':
      return 'daily'
    case 'weekly':
      return 'weekly'
    case 'monthly':
      return 'monthly'
    default:
      return null
  }
}

export const getStartTime = (recurrence: string | null | undefined, eventEndDate: string): number => {
  const endTime = dayjs(eventEndDate).unix()
  switch (recurrence) {
    case '5m':
      return endTime - 5 * 60
    case '15m':
      return endTime - 15 * 60
    case 'hourly':
      return endTime - 60 * 60
    case '4h':
      return endTime - 4 * 60 * 60
    case 'daily':
      return endTime - 24 * 60 * 60
    case 'weekly':
      return endTime - 7 * 24 * 60 * 60
    case 'monthly':
      return endTime - 30 * 24 * 60 * 60
    default:
      return endTime - 15 * 60
  }
}
export const showLiveChart = (event: EventModel | null): boolean => {
  if (!event?.tags) return false
  const upDownTag = event.tags?.find((t) => t.slug === 'up-or-down')
  const cryptoPrice = event.tags?.find((t) => t.slug === 'crypto-prices')
  return !!upDownTag && !!cryptoPrice
}

interface ChartProps {
  showCryptoChart?: boolean
}
export const MarketChart = (props: ChartProps) => {
  const { showCryptoChart } = props
  const { event, isFetching } = useEventDetailsPageContext()
  // const allMarkets = event?.markets ?? []
  // const { activeMarkets } = useEventMarkets(allMarkets)

  const isLive = useMemo(() => {
    const now = dayjs()
    const startTime = dayjs(event?.startTime)
    const endDate = dayjs(event?.endDate)
    const isCryptoEvent = event?.tags?.some((tag) => tag.slug === 'crypto-prices')
    return now.isAfter(startTime) && now.isBefore(endDate) && isCryptoEvent
  }, [event?.startTime, event?.endDate, event?.tags])

  const recurrence = useMemo(() => {
    if (!event) return null
    return getEventRecurrence(event)
  }, [event])

  const markets = useMemo<MarketBase[]>(() => {
    if (!event?.markets) return []
    if (event.closed) {
      const winningMarket = event.markets.find((m) => m.outcomePrices?.[0] === '1')
      const rest = event.markets.slice(0, 4)
      if (!winningMarket) return rest
      if (rest.includes(winningMarket)) return rest
      return [winningMarket].concat(rest.slice(0, 3))
    }
    return event.markets.filter((m) => m.active && !m.closed).slice(0, 4)
  }, [event?.markets, event?.closed])

  return (
    <div className={cn('w-full h-full', showCryptoChart && 'pt-11')}>
      <BaseChart
        markets={markets}
        isPending={isFetching}
        isLive={isLive}
        volume={event?.volume}
        recurrence={recurrence}
      />
    </div>
  )
}

export const Chart = () => {
  const [chartType, setChartType] = useState<'market' | 'crypto'>('crypto')
  const { event } = useEventDetailsPageContext()
  const location = useLocation()
  const { isDesktop } = useResponsive()

  const showCryptoChart = useMemo(() => {
    if (location.state?.series === 'crypto') return true
    return showLiveChart(event)
  }, [event?.tags, location.state?.series])

  useEffect(() => {
    setChartType(!showCryptoChart ? 'market' : 'crypto')
  }, [showCryptoChart, event?.slug])

  const cryptoSymbol = useMemo(() => {
    if (!event?.slug) return null
    const eventSlug = event.slug.toLowerCase()
    const [symbol] = eventSlug.split('-')
    const normalized = symbol.toUpperCase()
    if (normalized === 'SOLANA') {
      return 'SOL'
    }
    if (normalized === 'ETHEREUM') {
      return 'ETH'
    }
    if (normalized === 'BITCOIN') {
      return 'BTC'
    }
    return normalized
  }, [event?.slug])

  const color = useMemo(() => {
    switch (cryptoSymbol) {
      case 'BTC':
        return '#F7931A'
      case 'ETH':
        return '#627EEA' // Blue
      case 'SOL':
        return '#9945FF' // Purple
      case 'XRP':
        return '#2196F3' // Light Blue
      default:
        return '#9E9E9E' // Gray
    }
  }, [cryptoSymbol])
  const tokenIcon = useMemo(() => {
    switch (cryptoSymbol) {
      case 'BTC':
        return <BitcoinIcon />
      case 'ETH':
        return <EthereumIcon />
      case 'SOL':
        return <SolanaIcon />
      case 'XRP':
        return <XRPIcon />
      default:
        return <BitcoinIcon />
    }
  }, [cryptoSymbol, color])

  return (
    <div>
      <div
        className={cn(
          'flex justify-between flex-col items-start gap-4 lg:flex-row lg:items-center mb-4 w-full',
          !!location.state?.series && 'min-h-10.5',
        )}
      >
        <div className="max-w-full overflow-x-auto no-scrollbar flex-1" id="event-series-container">
          <EventSeries symbol={cryptoSymbol || ''} />
        </div>
        {(showCryptoChart || location.state?.series === 'crypto') && isDesktop && (
          <div className="flex items-center w-full justify-between lg:justify-end lg:w-fit">
            <div className="border rounded-lg p-1 gap-1">
              <Button
                className={cn('h-8 text-white')}
                style={{
                  background: chartType === 'market' ? color : 'transparent',
                }}
                onClick={() => setChartType('market')}
              >
                <ChartSpline />
              </Button>
              <Button
                className={cn('h-8 text-white')}
                style={{
                  background: chartType === 'crypto' ? color : 'transparent',
                }}
                onClick={() => setChartType('crypto')}
              >
                {tokenIcon}
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="relative min-h-75">
        {(showCryptoChart || location.state?.series === 'crypto') && !isDesktop && (
          <div className="absolute top-0 right-0 z-60 flex items-center justify-end w-fit">
            <div className="border rounded-lg p-1 gap-1">
              <Button
                className={cn('h-8 w-9 text-white')}
                style={{
                  background: chartType === 'market' ? color : 'transparent',
                }}
                onClick={() => setChartType?.('market')}
              >
                <ChartSpline />
              </Button>
              <Button
                className={cn('h-8 w-9 text-white')}
                style={{
                  background: chartType === 'crypto' ? color : 'transparent',
                }}
                onClick={() => setChartType?.('crypto')}
              >
                {tokenIcon}
              </Button>
            </div>
          </div>
        )}
        {chartType === 'crypto' ? (
          <CryptoChart symbol={cryptoSymbol || ''} />
        ) : (
          <MarketChart showCryptoChart={(showCryptoChart || location.state?.series === 'crypto') && !isDesktop} />
        )}
        <div className="absolute left-0 bottom-8 pointer-events-none">
          {event?.slug && <TradeEventMonitorV2 eventSlug={event.slug} />}
        </div>
      </div>
      <div className="h-1.5 bg-white/10" />
    </div>
  )
}
