import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import dayjs from 'dayjs'
import { cn } from '@/lib/utils'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { useDateSelector } from './useDateSelector'
import CalendarView from './CalendarView'

interface DateSelectorDrawerProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  availableDates: Date[]
}

const DateSelectorDrawer = ({ selectedDate, onDateChange, availableDates }: DateSelectorDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false)

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

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      {/* Date Navigation Bar with Prev/Next buttons */}
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

        <DrawerTrigger asChild>
          <button className="flex-1 h-10 px-4 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A] flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M5.33333 1.33337V4.00004M10.6667 1.33337V4.00004M2 6.66671H14M3.33333 2.66671H12.6667C13.403 2.66671 14 3.26366 14 4.00004V13.3334C14 14.0698 13.403 14.6667 12.6667 14.6667H3.33333C2.59695 14.6667 2 14.0698 2 13.3334V4.00004C2 3.26366 2.59695 2.66671 3.33333 2.66671Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-white text-sm font-normal">
              {dayjs(selectedDate).format('YYYY-MM-DD')}
            </span>
          </button>
        </DrawerTrigger>

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

      <DrawerContent className="w-full bg-[#1A1A1F] max-w-[768px] mx-auto rounded-t-[24px]">
        <CalendarView
          currentMonth={currentMonth}
          daysInMonth={daysInMonth}
          hasDataForDate={hasDataForDate}
          isSelectedDate={isSelectedDate}
          isFutureDate={isFutureDate}
          onDateClick={(date) => handleDateClick(date, () => setIsOpen(false))}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          variant="drawer"
        />
      </DrawerContent>
    </Drawer>
  )
}

export default DateSelectorDrawer
