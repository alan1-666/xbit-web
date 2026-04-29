import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import dayjs from 'dayjs'
import { cn } from '@/lib/utils'
import { useDateSelector } from './useDateSelector'
import CalendarView from './CalendarView'

interface DateSelectorProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  availableDates: Date[]
}

const DateSelector = ({ selectedDate, onDateChange, availableDates }: DateSelectorProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)

  const {
    currentMonth,
    daysInMonth,
    hasDataForDate,
    isSelectedDate,
    isFutureDate,
    handleDateClick,
    handlePrevMonth,
    handleNextMonth,
    handlePrevDate,
    handleNextDate,
    canGoPrev,
    canGoNext
  } = useDateSelector({ selectedDate, onDateChange, availableDates })

  // 点击外部关闭日历
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false)
      }
    }

    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isCalendarOpen])

  return (
    <div className="relative z-20" ref={calendarRef}>
      {/* Date Navigation Bar */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePrevDate}
          disabled={!canGoPrev}
          className={cn(
            "w-10 h-10 rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] flex items-center justify-center",
            !canGoPrev && "opacity-30 cursor-not-allowed"
          )}
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        <button
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          className="flex-1 h-10 px-4 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A] flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M5.33333 1.33337V4.00004M10.6667 1.33337V4.00004M2 6.66671H14M3.33333 2.66671H12.6667C13.403 2.66671 14 3.26366 14 4.00004V13.3334C14 14.0698 13.403 14.6667 12.6667 14.6667H3.33333C2.59695 14.6667 2 14.0698 2 13.3334V4.00004C2 3.26366 2.59695 2.66671 3.33333 2.66671Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span className="text-white text-sm font-normal">
            {dayjs(selectedDate).format('YYYY-MM-DD')}
          </span>
        </button>

        <button
          onClick={handleNextDate}
          disabled={!canGoNext}
          className={cn(
            "w-10 h-10 rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] flex items-center justify-center",
            !canGoNext && "opacity-30 cursor-not-allowed"
          )}
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Calendar Dropdown */}
      {isCalendarOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-full max-w-[360px] bg-[#212127] rounded-2xl z-[20] shadow-xl border border-white/10">
          <CalendarView
            currentMonth={currentMonth}
            daysInMonth={daysInMonth}
            hasDataForDate={hasDataForDate}
            isSelectedDate={isSelectedDate}
            isFutureDate={isFutureDate}
            onDateClick={(date) => handleDateClick(date, () => setIsCalendarOpen(false))}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            variant="dropdown"
          />
        </div>
      )}
    </div>
  )
}

export default DateSelector
