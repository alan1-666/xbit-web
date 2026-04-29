import { Link } from 'react-router-dom'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { NAVIGATIONS } from '@/lib/navigations'
import { Timeframe } from '@/@generated/gql/graphql-prediction'
import { EventModel } from '@/modules/prediction/models/EventModel'
import { MarketModel } from '@/modules/prediction/models/MarketModel'
import { BaseChart } from '@/modules/prediction/components/event-details/BaseChart'
import { ElectionEventCard } from '@/modules/prediction/components/shared/ElectionEventCard'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { BlankState } from '@components/v2/ui-shared/components/BlankState'
import { useMacroSectionEvents } from '@/modules/prediction/hooks/useMacroSectionEvents'
import GaugeChart from '@/components/detailInfo/contractMonitoring/GaugeChart'

const getActiveMarket = (event: EventModel): MarketModel | null => {
  if (!event.markets?.length) return null
  return (event.markets.find((market) => market?.active && !market.closed) ||
    event.markets[0]) as MarketModel | null
}

const getChanceFromMarket = (market: MarketModel | null) => {
  const price = market?.outcomePrices?.[0]
  if (price == null) return null
  return Math.round(Number(price) * 100)
}

const getOneDayPriceChangeFromMarket = (market: MarketModel | null) => {
  const oneDayPriceChange = market?.oneDayPriceChange
  if (oneDayPriceChange == null) return 0
  return Number(oneDayPriceChange)
}

const SectionTitle = ({ children, className }: { children: string, className?: string }) => {
  return <h2 className={cn("text-xl xl:text-2xl font-semibold leading-5 text-[#FAFAFA]", className)}>{children}</h2>
}

const ChanceGauge = ({ percentage }: { percentage: number | null }) => {
  const raw = percentage == null ? null : percentage <= 1 ? percentage * 100 : percentage
  const value = raw == null ? 0 : Math.max(0, Math.min(100, Math.round(raw)))
  const displayValue = value === 0 ? '–' : `${value}%`
  const gaugeColor = '#843BEA'

  return (
    <div className="flex w-[96px] shrink-0 justify-center">
      <GaugeChart
        value={value}
        size={100}
        title={displayValue}
        subtitle="chance"
        startColor={gaugeColor}
        midColor={gaugeColor}
        endColor={gaugeColor}
        titleColor='#FFFFFF'
        subtitleColor='#838385'
      />
    </div>
  )
}

const CompactEventCard = ({ event }: { event: EventModel }) => {
  const market = getActiveMarket(event)
  const chance = getChanceFromMarket(market)

  return (
    <Link
      to={NAVIGATIONS.prediction.eventDetails(event.slug || '')}
      state={{ event }}
      className="flex items-center gap-3 rounded-[12px] border border-[#1E1E1E] bg-[#060606] px-4 py-3 transition-colors hover:bg-[#111113] xl:flex-col xl:items-stretch xl:gap-3"
    >
      <div className="flex items-center gap-3 flex-1">
        <Avatar className="size-9 pc:size-12 shrink-0 rounded-[12px]">
          <AvatarImage src={event.image || undefined} className="object-cover" />
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="line-clamp-2 text-[14px] xl:text-[16px] font-semibold leading-[1.3] text-white">
            {event.title}
          </div>
        </div>
      </div>
      <div className="ml-auto flex justify-end xl:ml-0 xl:mt-1 xl:w-full xl :justify-center">
        <ChanceGauge percentage={chance} />
      </div>
    </Link>
  )
}

const MacroDashboardCard = ({ event }: { event: EventModel }) => {
  const market = getActiveMarket(event)
  const chance = getChanceFromMarket(market)
  const oneDayPriceChange = getOneDayPriceChangeFromMarket(market)

  return (
    <Link
      to={NAVIGATIONS.prediction.eventDetails(event.slug || '')}
      state={{ event }}
      className="block rounded-[12px] border border-[#1E1E1E] bg-[#060606] p-4 transition-colors hover:bg-[#111113]"
    >
      <div className="mb-4 flex items-center gap-3">
        <Avatar className="size-14 shrink-0 rounded-[12px]">
          <AvatarImage src={event.image || undefined} className="object-cover" />
        </Avatar>
        <div className="line-clamp-2 text-[14px] font-semibold leading-[1.3] text-white">{event.title}</div>
      </div>

      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="text-[20px] font-semibold leading-none text-white">
            {chance == null ? '–' : chance < 1 ? '<1' : chance}% chance
          </div>
          <div
            className={cn(
              'flex items-center gap-1 text-[15px] font-semibold',
              oneDayPriceChange < 0 ? 'text-[#FF5A1F]' : 'text-[#00CE89]',
            )}
          >
            <span
              className={cn(
                'inline-block size-0 border-y-[6px] border-y-transparent',
                oneDayPriceChange < 0
                  ? 'border-l-[9px] border-l-[#FF5A1F] rotate-90'
                  : 'border-l-[9px] border-l-[#00CE89] -rotate-90',
              )}
            />
            {Math.round(Math.abs(oneDayPriceChange) * 100)}%
          </div>
        </div>
      </div>

      <div className="mt-4">
        <BaseChart
          markets={market ? [market] : []}
          isPending={!market}
          variant="default"
          hideVolumeHeader
          recurrence="macro-dashboard"
          initialTimeframe={Timeframe.TimeframeAll}
        />
      </div>
    </Link>
  )
}

export const MacroTabContent = () => {
  const { t } = useTranslation()
  const { dashboard, economy, keyElections, geopolitics } = useMacroSectionEvents()

  return (
    <div className="space-y-4 pb-8">
      <section className="space-y-4">
        <SectionTitle className="xl:text-3xl">{t('prediction.electionsPage.macroDashboard')}</SectionTitle>
        {dashboard.isLoading ? (
          <Skeleton className="h-[420px] rounded-[12px]" />
        ) : dashboard.data?.[0] ? (
          <MacroDashboardCard event={dashboard.data[0]} />
        ) : (
          <div className="py-10">
            <BlankState />
          </div>
        )}
      </section>

      <section className="space-y-4">
        <SectionTitle>{t('prediction.electionsPage.economy')}</SectionTitle>
        <div className="space-y-3 pc:grid pc:grid-cols-3 pc:gap-3 pc:space-y-0">
          {economy.isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-[108px] rounded-[12px]" />
            ))
          ) : economy.data && economy.data.length > 0 ? (
            economy.data.map((event) => <CompactEventCard key={event.id || event.slug} event={event} />)
          ) : (
            <div className="py-10 pc:col-span-3">
              <BlankState />
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle>{t('prediction.electionsPage.keyElections')}</SectionTitle>
        <div className="space-y-3 pc:grid pc:grid-cols-3 pc:gap-3 pc:space-y-0">
          {keyElections.isLoading ? (
            Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} />)
          ) : keyElections.data && keyElections.data.length > 0 ? (
            keyElections.data.map((event) => (
              <ElectionEventCard key={event.id || event.slug} event={event} />
            ))
          ) : (
            <div className="py-10 pc:col-span-3">
              <BlankState />
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle>{t('prediction.electionsPage.geopolitics')}</SectionTitle>
        <div className="space-y-3 pc:grid pc:grid-cols-3 pc:gap-3 pc:space-y-0">
          {geopolitics.isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-[108px] rounded-[12px]" />
            ))
          ) : geopolitics.data && geopolitics.data.length > 0 ? (
            geopolitics.data.map((event) => <CompactEventCard key={event.id || event.slug} event={event} />)
          ) : (
            <div className="py-10 pc:col-span-3">
              <BlankState />
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

