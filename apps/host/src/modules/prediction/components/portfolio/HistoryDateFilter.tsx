import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths
} from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { DateRange } from 'react-day-picker'
import { useTranslation } from 'react-i18next'

interface HistoryDateFilterProps {
  value: string | DateRange | undefined
  onChange: (value: any) => void
  className?: string
}

const getPresets = (t: any) => [
  { label: t('prediction.filters.today'), value: 'Today', getValue: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }) },
  {
    label: t('prediction.filters.yesterday'),
    value: 'Yesterday',
    getValue: () => ({
      from: startOfDay(subDays(new Date(), 1)),
      to: endOfDay(subDays(new Date(), 1)),
    }),
  },
  {
    label: t('prediction.filters.lastWeek'),
    value: 'Last Week',
    getValue: () => ({
      from: startOfWeek(subDays(new Date(), 7)),
      to: endOfWeek(subDays(new Date(), 7)),
    }),
  },
  {
    label: t('prediction.filters.lastMonth'),
    value: 'Last Month',
    getValue: () => ({
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1)),
    }),
  },
  {
    label: t('prediction.filters.last3Months'),
    value: 'Last 3 Months',
    getValue: () => ({
      from: startOfMonth(subMonths(new Date(), 3)),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: t('prediction.filters.yearToDate'),
    value: 'Year to Date',
    getValue: () => ({ from: startOfYear(new Date()), to: endOfDay(new Date()) }),
  },
  {
    label: t('prediction.filters.lastYear'),
    value: 'Last Year',
    getValue: () => ({
      from: startOfYear(subDays(new Date(), 365)),
      to: endOfYear(subDays(new Date(), 365)),
    }),
  },
  { label: t('prediction.filters.all'), value: 'All', getValue: () => undefined },
]

export const HistoryDateFilter = ({ value, onChange, className }: HistoryDateFilterProps) => {
  const { t } = useTranslation()
  const PRESETS = getPresets(t)
  const [date, setDate] = useState<DateRange | undefined>(
    typeof value === 'object' ? value : undefined
  )
  const [open, setOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(
    typeof value === 'string' ? value : null
  )

  const [month, setMonth] = useState<Date>(new Date())

  useEffect(() => {
    if (date?.from) {
      setMonth(date.from)
    }
  }, [date])

  const handleSelectPreset = (presetValue: string, getDateValue: () => DateRange | undefined) => {
    setSelectedPreset(presetValue)
    const newDate = getDateValue()
    setDate(newDate)
    if (newDate?.from) {
      setMonth(newDate.from)
    }
  }

  const handleApply = () => {
    if (selectedPreset === 'All') {
      onChange('All')
    } else {
      onChange(date)
    }
    setOpen(false)
  }

  const handleCancel = () => {
    setOpen(false)
    // Reset to prop value if needed, or just close
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-sm border border-white/10 bg-transparent px-3 text-sm font-medium text-gray-400 transition hover:border-white/20 hover:text-gray-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
            (date || selectedPreset) && 'text-white border-white/20',
            className
          )}
        >
          <CalendarIcon size={16} className="text-gray-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex flex-col sm:flex-row">
          <div className="flex flex-col gap-1 p-2 sm:border-r border-border min-w-[140px]">
            {PRESETS.map((preset) => (
              <Button
                key={preset.value}
                variant="ghost"
                className={cn(
                  'justify-start font-normal h-8 px-2',
                  selectedPreset === preset.value && 'bg-accent text-accent-foreground'
                )}
                onClick={() => handleSelectPreset(preset.value, preset.getValue)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <div className="p-2">
            <Calendar
              mode="range"
              defaultMonth={date?.from}
              month={month}
              onMonthChange={setMonth}
              selected={date}
              onSelect={(newDate) => {
                setDate(newDate)
                setSelectedPreset(null)
              }}
              numberOfMonths={1}
              disabled={{ after: new Date() }}
              toDate={new Date()}
            />
            <div className="flex items-center justify-between gap-2 p-2 pb-0 border-t border-border/50">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setDate(undefined)
                  setSelectedPreset(null)
                }}
              >
                {t('prediction.filters.clearDateRange')}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  {t('prediction.filters.cancel')}
                </Button>
                <Button size="sm" onClick={handleApply}>
                  {t('prediction.filters.setDates')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
