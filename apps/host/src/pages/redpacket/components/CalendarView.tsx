import { ChevronLeft, ChevronRight } from 'lucide-react'
import dayjs from 'dayjs'
import { cn } from '@/lib/utils'

interface CalendarViewProps {
  currentMonth: dayjs.Dayjs
  daysInMonth: (dayjs.Dayjs | null)[]
  hasDataForDate: (date: dayjs.Dayjs | null) => boolean
  isSelectedDate: (date: dayjs.Dayjs | null) => boolean
  isFutureDate: (date: dayjs.Dayjs | null) => boolean
  onDateClick: (date: dayjs.Dayjs | null) => void
  onPrevMonth: () => void
  onNextMonth: () => void
  variant?: 'dropdown' | 'drawer'
}

const CalendarView = ({
  currentMonth,
  daysInMonth,
  hasDataForDate,
  isSelectedDate,
  isFutureDate,
  onDateClick,
  onPrevMonth,
  onNextMonth,
  variant = 'dropdown'
}: CalendarViewProps) => {
  const isDrawer = variant === 'drawer'

  return (
    <div className={cn(isDrawer ? 'px-4 pb-8 pt-4' : 'p-5')}>
      {/* Month Navigation */}
      <div className={cn('flex items-center justify-between', isDrawer ? 'mb-6' : 'mb-5')}>
        <button
          onClick={onPrevMonth}
          className={cn(
            'flex items-center justify-center rounded-lg border border-white/15 bg-[#2B2B33] hover:opacity-80 transition-opacity',
            isDrawer ? 'w-10 h-10' : 'p-1.5'
          )}
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <span className={cn('text-white font-normal', isDrawer ? 'text-base' : 'text-sm')}>
          {currentMonth.format('MMMM YYYY')}
        </span>
        <button
          onClick={onNextMonth}
          className={cn(
            'flex items-center justify-center rounded-lg border border-white/15 bg-[#2B2B33] hover:opacity-80 transition-opacity',
            isDrawer ? 'w-10 h-10' : 'p-1.5'
          )}
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className={cn('text-center text-white/40 text-sm', isDrawer ? 'py-2' : 'py-1')}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-2">
        {daysInMonth.map((day, index) => {
          const hasData = hasDataForDate(day)
          const isSelected = isSelectedDate(day)
          const isFuture = isFutureDate(day)

          return (
            <button
              key={index}
              onClick={() => onDateClick(day)}
              disabled={!day || isFuture}
              className={cn(
                'aspect-square rounded-xl text-base transition-all flex items-center justify-center',
                isDrawer ? 'min-h-[44px]' : 'min-h-[32px]',
                !day && 'invisible',
                day && isFuture && 'text-white/20 cursor-not-allowed',
                day && !isFuture && !isSelected && cn(
                  hasData ? 'text-white' : 'text-white/40',
                  'cursor-pointer',
                  isDrawer ? 'hover:bg-[#2B2B33]' : 'hover:bg-[#0A0A0A]'
                ),
                isSelected && 'bg-white text-black font-medium cursor-pointer'
              )}
            >
              {day?.date()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default CalendarView
