import { IconChevronLeft } from '@/components/icon'
import IconCalendar from '@/components/icon/stroke/IconCalendar'
import { Skeleton } from '@/components/ui/skeleton'
import { formatVolume } from '@/lib/format'
import { CountdownTimer } from '@/modules/prediction/components/event-details/CountdownTimer.tsx'
import { EventDuration } from '@/modules/prediction/components/event-details/EventDuration.tsx'
import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { formatDateWithLocale } from '@/utils/time.ts'
import { Avatar, AvatarImage } from '@components/ui/avatar.tsx'
import { useResponsive } from '@hooks/useResponsive.ts'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { homepageCategories } from '../../data/homepage-category'
import { APP_PATH } from '@/lib/constant'

export const Header = () => {
  const { event, isFetching } = useEventDetailsPageContext()
  const { isDesktop } = useResponsive()
  const location = useLocation()
  const navigate = useNavigate()
  const eventType = useMemo(() => {
    // check if tags include value in homepageCategories
    return homepageCategories.find((category) => event?.tags?.some((tag) => tag.slug === category.value))?.label
  }, [event?.tags])

  const endDate = useMemo(() => {
    const allMarkets = event?.markets || []
    if (allMarkets.length === 0) return event?.endDate
    // Find the latest end date among all markets
    const latestEndDate = allMarkets.reduce(
      (latest, market) => {
        const marketEndDate = dayjs(market.endDate)
        if (!marketEndDate.isValid()) return latest
        return marketEndDate.isAfter(latest) ? marketEndDate : latest
      },
      dayjs(event?.endDate || undefined),
    )

    return latestEndDate?.isValid() ? latestEndDate.toISOString() : event?.endDate
  }, [event?.markets, event?.endDate])

  const handleBack = () => {
    const state = location.state as { fromGlassLiquidNav?: boolean } | null

    // When entering from GlassLiquidNav Trade (default event entry),
    // always send user to Market prediction tab instead of relying on history.
    if (state?.fromGlassLiquidNav) {
      navigate(APP_PATH.MARKET + '/prediction')
      return
    }

    // In normal flows, best effort: go back if there is history, otherwise
    // fall back to Market prediction tab as a safe default.
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(APP_PATH.MARKET + '/prediction')
    }
  }
  return (
    <div className="sticky top-0 left-0 right-0 z-10 space-y-1 pb-4 xl:pt-10 bg-[#0a0a0a]">
      {/* <Breadcrumbs page={event?.title || ''} /> */}
      {!isDesktop && (
        <div className="flex pt-3 mb-3 mx-auto justify-between gap-3 bg-[#0a0a0a]">
          <div className="w-8 cursor-pointer">
            <IconChevronLeft className="text-white" onClick={handleBack} />
          </div>
          <div className="truncate text-center text-base font-light w-[65%]">{event?.title}</div>
          {/* {event?.id && (
            <FavoriteEventButton
              eventId={event.id}
              initialIsFavorite={event.isFavorite || false}
              isLoading={isFetching}
            />
          )} */}
          <div></div>
        </div>
      )}
      <div className="flex items-center">
        <div className="space-y-1 flex-1">
          <div className="flex min-h-7 xl:hidden items-center justify-between mb-0!">
            <span className="text-sm text-[#908E98] font-normal">
              {formatVolume(event?.volume, { showCurrency: true })} Vol.
            </span>
            {/* badge event type */}
            {eventType ? <div className="text-[10px] text-white font-medium px-2 py-1.5 rounded-[6px] bg-[#18181B]">{eventType}</div> : null}
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 pt-2 w-full">
              {isFetching && !location.state?.series ? (
                <>
                  <Skeleton className="size-16 rounded-[6px]" />
                  <Skeleton className="h-7 xl:h-9 w-2/3 xl:w-[70%]" />
                </>
              ) : (
                <>
                  <Avatar className="size-16 rounded-[6px]">
                    <AvatarImage src={event?.image || undefined} className="object-cover" />
                  </Avatar>
                  <div className="xl:text-[calc(24rem/16)] text-[calc(20rem/16)] line-clamp-2 text-ellipsis overflow-hidden font-semibold text-white">
                    {event?.title}
                  </div>
                </>
              )}

              {/*{isDesktop && event?.id && (*/}
              {/*  <FavoriteEventButton*/}
              {/*    eventId={event.id}*/}
              {/*    initialIsFavorite={event.isFavorite || false}*/}
              {/*    isLoading={isFetching}*/}
              {/*  />*/}
              {/*)}*/}
            </div>
            <div className="flex items-center gap-3">
              <CountdownTimer />
            </div>
          </div>

          {!event?.live && (
            <div className="flex items-center gap-6 text-[calc(12rem/16)] text-gray-400 mt-3">
              <EventDuration endDate={endDate} className="text-[#908E98] leading-0" />
              <div className="flex items-center gap-1.5">
                <IconCalendar width={16} height={16} />
                <div className="text-[calc(14rem/16)] text-[#908E98] leading-0">{formatDateWithLocale(endDate, 'MMM D, YYYY')}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
