import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { EventFrequency, EventSortField } from '@/@generated/gql/graphql-prediction'
import { useEventsByCategoryId } from '@/modules/prediction/hooks/useEventsByCategoryId'
import { NAVIGATIONS } from '@/lib/navigations'
import { BlankState } from '@components/v2/ui-shared/components/BlankState'
import { LoadMoreTrigger } from '@/modules/prediction/components/shared/LoadMoreTrigger'
import { formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'

const TRUMP_TAB = 'trump'

export const TrumpTabContent = () => {
  const { t } = useTranslation()
  const { data, isLoading, loadMore, hasNextPage } = useEventsByCategoryId('elections', {status: 'active', sortBy: EventSortField.Volume_24H, frequency: EventFrequency.All, hideSports: false, hideCrypto: false, hideEarnings: false}, TRUMP_TAB)

  const promisesMarkets = useMemo(() => {
    if (!data?.length) return []
    return data.map(event => {
      const firstMarket = event.markets?.[0]
      return {
        ...firstMarket,
        __typename: 'Market' as const,
        events: [{ slug: event.slug || '', image: event.image }],
        _firstMarketChance: firstMarket?.outcomePrices?.[0] == null ? null : Math.round(Number(firstMarket.outcomePrices[0]) * 100),
        _firstMarketChange: Number((firstMarket as any)?.allTimePriceChangePct ?? (firstMarket as any)?.oneDayPriceChange ?? 0),
        _firstMarketQuestion: firstMarket?.question ?? '',
      }
    })
  }, [data])

  return (
    <div className="space-y-4 pb-8">
      <div
        className="w-full overflow-hidden rounded-xl"
        style={{
          backgroundImage:
            'linear-gradient(180deg, #1D0737 0%, #090212 100%), linear-gradient(180deg, color(display-p3 0.102 0.031 0.208) 0%, color(display-p3 0.031 0.012 0.067) 100%)',
        }}
      >
        <div className="flex h-[200px] pc:h-[260px] flex-col pc:flex-row items-center justify-center pc:justify-start px-6 gap-4 pc:gap-8 relative">
          <div className="max-w-[266px] text-center pc:text-left">
            <p className="text-white text-[22px] sm:text-[24px] font-semibold leading-none mt-4 pc:mt-0 whitespace-nowrap">
              Trump won, now what?
            </p>
            <div className="mt-2 h-[3px] w-17 rounded-full bg-[#9B2CFC]" />
          </div>
          <div className="relative flex-1 flex items-end justify-center h-full pc:absolute pc:left-1/2 pc:-translate-x-1/2 pc:bottom-0">
            <img
              src="/images/prediction/bg-trump.png"
              alt="Trump"
              className="max-h-full w-auto object-contain pc:w-[300px]"
            />
          </div>
        </div>
      </div>

      <h1 className="text-xl font-semibold leading-5 text-[#FAFAFA]">
        {t('prediction.electionsPage.promisesAndPolicies')}
      </h1>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 pc:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[1920px]:grid-cols-6 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-[88px] rounded-[10px] bg-[#060606] border border-[#1E1E1E] animate-pulse" />
          ))}
        </div>
      ) : promisesMarkets.length === 0 ? (
        <div className="py-10">
          <BlankState />
        </div>
      ) : (
        <div className="pb-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 pc:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[1920px]:grid-cols-6 gap-3">
            {promisesMarkets.map((market, index) => {
              const chance = (market as any)._firstMarketChance ?? (market.outcomePrices?.[0] != null ? Math.round(Number(market.outcomePrices[0]) * 100) : null)
              // _firstMarketChange is decimal (0.05 = 5%); fallback: allTimePriceChangePct/100 or oneDayPriceChange
              const raw = (market as any)._firstMarketChange
              const change =
                raw != null
                  ? Number(raw)
                  : (market as any).allTimePriceChangePct != null
                    ? Number((market as any).allTimePriceChangePct) / 100
                    : Number((market as any).oneDayPriceChange ?? 0)
              const eventMeta = (market as any).events?.[0]
              const eventSlug = eventMeta?.slug || ''
              const image = market.image || eventMeta?.image
              const title = (market as any)._firstMarketQuestion || market.question || ''

              return (
                <Link
                  key={market.id ?? market.questionID ?? index}
                  to={NAVIGATIONS.prediction.eventDetails(eventSlug)}
                  className="group flex h-full flex-col justify-between rounded-[12px] border border-[#1E1E1E] bg-[#060606] px-4 py-3 transition-colors hover:bg-[#111113]"
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0">
                      <div className="size-10 rounded-[8px] overflow-hidden bg-[#18181B]">
                        {image ? (
                          <img
                            src={image}
                            alt={title}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[14px] font-semibold leading-[1.3] text-white">
                        {title}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-end justify-between gap-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[16px] leading-none font-semibold text-white">
                        {chance == null ? '–' : chance < 1 ? '<1' : `${chance}%`}
                      </span>
                      <span className="text-[11px] leading-none text-[#908E98] lowercase">
                        {t('prediction.markets.chanceLabel')}
                      </span>
                    </div>
                    <div className="flex flex-col items-end justify-center min-w-[64px]">
                      <div
                        className={cn(
                          'flex items-center gap-1 text-[12px] font-medium',
                          change > 0
                            ? 'text-[#00CE89]'
                            : change < 0
                              ? 'text-[#F65333]'
                              : 'text-[#908E98]',
                        )}
                      >
                        {change !== 0 && (
                          <span
                            className={cn(
                              'inline-block size-0 border-x-4 border-b-[6px] border-x-transparent',
                              change > 0
                                ? 'border-b-[#00CE89]'
                                : 'border-b-[#F65333] rotate-180',
                            )}
                          />
                        )}
                        <span>
                          {change === 0
                            ? '0%'
                            : formatPercent(Math.round(Math.abs(change) * 100), { showSign: false })}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
          <LoadMoreTrigger onLoadMore={loadMore} hasMore={hasNextPage} />
        </div>
      )}
    </div>
  )
}

