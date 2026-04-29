import { useState, useMemo } from 'react'
import dayjs from 'dayjs'

interface UseDateSelectorProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  availableDates: Date[]
}

export const useDateSelector = ({ selectedDate, onDateChange, availableDates }: UseDateSelectorProps) => {
  const [currentMonth, setCurrentMonth] = useState(dayjs(selectedDate))

  const daysInMonth = useMemo(() => {
    const startOfMonth = currentMonth.startOf('month')
    const endOfMonth = currentMonth.endOf('month')
    const startDay = startOfMonth.day()
    const daysCount = endOfMonth.date()

    const days: (dayjs.Dayjs | null)[] = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let i = 1; i <= daysCount; i++) {
      days.push(startOfMonth.date(i))
    }

    return days
  }, [currentMonth])

  const hasDataForDate = (date: dayjs.Dayjs | null) => {
    if (!date) return false
    return availableDates.some(d => dayjs(d).isSame(date, 'day'))
  }

  const isSelectedDate = (date: dayjs.Dayjs | null) => {
    if (!date) return false
    return dayjs(selectedDate).isSame(date, 'day')
  }

  const isFutureDate = (date: dayjs.Dayjs | null) => {
    if (!date) return false
    return date.isAfter(dayjs(), 'day')
  }

  const handleDateClick = (date: dayjs.Dayjs | null, onClose?: () => void) => {
    if (!date || isFutureDate(date)) return
    onDateChange(date.toDate())
    onClose?.()
  }

  const handlePrevMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, 'month'))
  }

  const handleNextMonth = () => {
    setCurrentMonth(currentMonth.add(1, 'month'))
  }

  const handlePrevDate = () => {
    const prevDate = dayjs(selectedDate).subtract(1, 'day')
    onDateChange(prevDate.toDate())
    setCurrentMonth(prevDate)
  }

  const handleNextDate = () => {
    const nextDate = dayjs(selectedDate).add(1, 'day')
    // 只有下一天不是未来日期才能切换
    if (!nextDate.isAfter(dayjs(), 'day')) {
      onDateChange(nextDate.toDate())
      setCurrentMonth(nextDate)
    }
  }

  const canGoPrev = useMemo(() => {
    // 总是可以往前切换（查看更早的日期）
    return true
  }, [])

  const canGoNext = useMemo(() => {
    // 只有下一天不是未来日期才能点击
    const nextDate = dayjs(selectedDate).add(1, 'day')
    return !nextDate.isAfter(dayjs(), 'day')
  }, [selectedDate])

  return {
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
    canGoNext,
    setCurrentMonth
  }
}
