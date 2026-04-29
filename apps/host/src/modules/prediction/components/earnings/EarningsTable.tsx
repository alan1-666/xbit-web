import { useMemo, useState, useRef, useEffect } from 'react'
import { EventModel } from '@/modules/prediction/models/EventModel'
import { EarningsBody } from './EarningsBody'
import { StockCard } from './StockCard'
import {
  useWeekData,
  useEarningsScroll,
  useWeekNavigation,
  useGestureHandlers,
} from '@/modules/prediction/hooks/earnings'
import { ArrowButton, EmptyState, WeekLabel } from './ui'
import { WEEK_OFFSETS, CURRENT_WEEK_INDEX, COLORS, DAY_NAMES_FULL } from '@/modules/prediction/constants/earnings.constants'

interface EarningsTableProps {
  events?: EventModel[]
  isLoading?: boolean
  onActiveWeekChange?: (weekStartDate: Date) => void
}

const EarningsTable = ({ events = [], onActiveWeekChange }: EarningsTableProps) => {
  const [activeWeekIndex, setActiveWeekIndex] = useState(CURRENT_WEEK_INDEX)
  const headerScrollRef = useRef<HTMLDivElement>(null)
  const bodyScrollRef = useRef<HTMLDivElement>(null)

  const { generateWeekData } = useWeekData(events)

  const allWeeksData = useMemo(() => {
    return WEEK_OFFSETS.map((offset) => generateWeekData(offset))
  }, [generateWeekData])

  const { scrollToWeek } = useEarningsScroll({
    headerScrollRef,
    bodyScrollRef,
    activeWeekIndex,
    setActiveWeekIndex,
  })

  const { handlePrevWeek, handleNextWeek, canGoPrev, canGoNext } = useWeekNavigation({
    activeWeekIndex,
    scrollToWeek,
    totalWeeks: WEEK_OFFSETS.length,
    headerScrollRef,
    bodyScrollRef,
  })

  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useGestureHandlers({
    activeWeekIndex,
    scrollToWeek,
    totalWeeks: WEEK_OFFSETS.length,
  })

  useEffect(() => {
    if (onActiveWeekChange && allWeeksData[activeWeekIndex]?.days[0]) {
      onActiveWeekChange(allWeeksData[activeWeekIndex].days[0].fullDate)
    }
  }, [activeWeekIndex, allWeeksData, onActiveWeekChange])

  return (
    <div className="mt-4.5 xl:mt-6 w-full px-4 md:px-10">
      <div
        className="relative overflow-hidden rounded-2xl border border-slate-700/50 shadow-2xl"
        style={{ backgroundColor: 'transparent' }}
      >
        {/* Mobile/Tablet Week Navigation Header (< 1280px) */}
        <div className="flex items-center justify-between p-3 xl:hidden" style={{ backgroundColor: COLORS.HEADER_BG }}>
          <ArrowButton direction="left" onClick={handlePrevWeek} disabled={!canGoPrev} ariaLabel="Previous week" />
          <WeekLabel days={allWeeksData[activeWeekIndex]?.days} className="text-center" />
          <ArrowButton direction="right" onClick={handleNextWeek} disabled={!canGoNext} ariaLabel="Next week" />
        </div>

        {/* PC Header with Navigation (≥ 1280px) */}
        <div
          className="relative hidden border-b border-slate-700/50 xl:block"
          style={{ backgroundColor: COLORS.HEADER_BG }}
        >
          <div
            className="pointer-events-none absolute left-0 top-0 z-10 h-15 w-30"
            style={{ background: `linear-gradient(to right, ${COLORS.HEADER_BG} 0%, transparent 100%)` }}
          />

          <ArrowButton
            direction="left"
            onClick={handlePrevWeek}
            disabled={!canGoPrev}
            className="absolute left-4 top-5.5 z-20"
            ariaLabel="Previous week"
          />

          <div
            className="pointer-events-none absolute right-0 top-0 z-10 h-15 w-30"
            style={{ background: `linear-gradient(to left, ${COLORS.HEADER_BG} 0%, transparent 100%)` }}
          />

          <ArrowButton
            direction="right"
            onClick={handleNextWeek}
            disabled={!canGoNext}
            className="absolute right-4 top-5.5 z-20"
            ariaLabel="Next week"
          />

          <div
            ref={headerScrollRef}
            className="flex overflow-x-auto scrollbar-hide py-2"
            style={{
              scrollSnapType: 'none',
              scrollBehavior: 'auto',
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {allWeeksData.map((weekData, index) => (
              <div key={index} className="w-full shrink-0" style={{ scrollSnapAlign: 'start' }}>
                <div className="grid grid-cols-5 gap-0">
                  {weekData.days.map((day) => {
                    const [dayName, dayNum] = day.dateLabel.split(' ')

                    return (
                      <div key={day.dayKey} className="flex items-center justify-center gap-1 py-2">
                        <span className="text-sm leading-5 font-medium" style={{ color: COLORS.DAY_NAME }}>
                          {dayName}
                        </span>
                        {day.isToday ? (
                          <span
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-sm font-bold"
                            style={{ color: COLORS.DAY_NUMBER }}
                          >
                            {dayNum}
                          </span>
                        ) : (
                          <span
                            className="flex h-7 w-7 items-center justify-center text-base leading-5 font-semibold"
                            style={{ color: COLORS.DAY_NUMBER }}
                          >
                            {dayNum}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile/Tablet: Vertical List Layout (< 1280px) */}
        <div className="flex flex-col overflow-y-auto xl:hidden" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          {allWeeksData[activeWeekIndex]?.days.map((day, index) => (
            <div key={day.dayKey} className="border-b border-slate-700/50 last:border-b-0">
              <div className="pt-4 pb-3 px-2.5">
                <h3
                  className="flex items-center gap-1 text-sm font-medium w-fit px-3 py-2 rounded-[8px]"
                  style={{ backgroundColor: COLORS.HEADER_BG }}
                >
                  <span style={{ color: COLORS.DAY_NAME }}>{DAY_NAMES_FULL[index] ?? day.dateLabel.split(' ')[0]}</span>{' '}
                  <span className="text-base" style={{ color: COLORS.DAY_NUMBER }}>
                    {day.dayNumber}
                  </span>
                </h3>
              </div>

              <div className="px-4 pb-4">
                {day.preMarket.length === 0 && day.postMarket.length === 0 ? (
                  <EmptyState className="flex flex-col items-center justify-center py-12" />
                ) : (
                  <div className="space-y-6">
                    {day.preMarket.length > 0 && (
                      <div>
                        <div className="mb-4 flex items-center gap-3">
                          <div className="h-px flex-1 border-t border-t-white/10 border-dashed" />
                          <span className="text-xs font-normal capitalize text-[#908E98]">Pre Market</span>
                          <div className="h-px flex-1 border-t border-t-white/10 border-dashed" />
                        </div>
                        <div className="rounded-lg border border-slate-700/50">
                          {day.preMarket.map((item, index) => (
                            <div key={item.id}>
                              <StockCard item={item} />
                              {index < day.preMarket.length - 1 && <div className="mx-3 h-px bg-slate-700/50" />}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {day.postMarket.length > 0 && (
                      <div>
                        <div className="mb-4 flex items-center gap-3">
                          <div className="h-px flex-1 border-t border-t-white/10 border-dashed" />
                          <span className="text-xs font-normal capitalize text-[#908E98]">Post Market</span>
                          <div className="h-px flex-1 border-t border-t-white/10 border-dashed" />
                        </div>
                        <div className="rounded-lg border border-slate-700/50">
                          {day.postMarket.map((item, index) => (
                            <div key={item.id}>
                              <StockCard item={item} />
                              {index < day.postMarket.length - 1 && <div className="mx-3 h-px bg-slate-700/50" />}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* PC: Horizontal Carousel Layout (≥ 1280px) */}
        <div
          ref={bodyScrollRef}
          className="hidden xl:flex overflow-x-auto scrollbar-hide"
          style={{
            scrollSnapType: 'none',
            maxHeight: 'calc(100vh - 280px)',
            scrollBehavior: 'auto',
          }}
        >
          {allWeeksData.map((weekData, index) => (
            <div key={index} className="w-full shrink-0" style={{ scrollSnapAlign: 'start' }}>
              <EarningsBody days={weekData.days} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EarningsTable
