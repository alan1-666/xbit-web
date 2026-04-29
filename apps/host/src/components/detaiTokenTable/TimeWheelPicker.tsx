import { getCurrentTime, TimeWheelDateType } from '@/redux/modules/tokenDetail.slice.ts'
import { WheelItem } from '@/types/tokenDetail.ts'
import dayjs from 'dayjs'
import React, { Dispatch, SetStateAction, useMemo, useRef, useEffect } from 'react'
import WheelPicker from 'react-simple-wheel-picker'
import { DateSelectedType, TimeKey } from '@/types/enums.ts'
import { getDaysInMonth } from '@/utils/helpers.ts'
import { cn } from '@/lib/utils.ts'
import { useTranslation } from 'react-i18next'

type TimeWheelPickerProps = {
  type: DateSelectedType
  startTime: TimeWheelDateType | undefined
  endTime: TimeWheelDateType | undefined
  currentTime: TimeWheelDateType
  setStartTime: Dispatch<SetStateAction<TimeWheelDateType | undefined>>
  setEndTime: Dispatch<SetStateAction<TimeWheelDateType | undefined>>
  mode?: 'date' | 'time' | 'full'
}

type TimeOption = {
  type: TimeKey
  maximum: number
  unit: string
  minimum?: number
  isPadStart?: boolean
}

const TimeWheelPicker: React.FC<TimeWheelPickerProps> = ({
  type = DateSelectedType.START,
  startTime,
  endTime,
  setEndTime,
  setStartTime,
  currentTime,
  mode = 'full',
}) => {
  const { t } = useTranslation()
  const wheelContainerRef = useRef<HTMLDivElement>(null)
  const lastVibrationTime = useRef<number>(0)
  const currentTimeSelect = type === DateSelectedType.END ? endTime : startTime
  const setTime = type === DateSelectedType.END ? setEndTime : setStartTime

  // Đưa TIME_OPTIONS vào useMemo để re-calculate khi dependencies thay đổi
  const TIME_OPTIONS: TimeOption[] = useMemo(
    () => [
      {
        type: TimeKey.YEAR,
        unit: t('detail.tokenDetail.year'),
        maximum: dayjs().year(),
        minimum: 1990,
      },
      {
        type: TimeKey.MONTH,
        unit: t('detail.tokenDetail.month'),
        maximum: 12,
        minimum: 1,
      },
      {
        type: TimeKey.DAY,
        unit: t('detail.tokenDetail.day'),
        maximum: dayjs(
          `${currentTimeSelect?.year ?? currentTime.year}-${currentTimeSelect?.month ?? currentTime.month}`,
        ).daysInMonth(),
        minimum: 1,
      },
      {
        type: TimeKey.HOUR,
        unit: t('detail.tokenDetail.hour'),
        maximum: 23,
        minimum: 0,
      },
      {
        type: TimeKey.MINUTE,
        unit: t('detail.tokenDetail.minute'),
        maximum: 59,
        minimum: 0,
      },
    ],
    [t, currentTimeSelect, currentTime],
  )

  const filteredTimeOptions = useMemo(() => {

    if (mode === 'date') {
      const dateOptions = TIME_OPTIONS.filter(
        (opt) => opt.type === TimeKey.YEAR || opt.type === TimeKey.MONTH || opt.type === TimeKey.DAY,
      )
      return dateOptions
    }

    if (mode === 'time') {
      const timeOptions = TIME_OPTIONS.filter((opt) => opt.type === TimeKey.HOUR || opt.type === TimeKey.MINUTE)
      return timeOptions
    }

    return TIME_OPTIONS
  }, [mode, TIME_OPTIONS])

  const displayTime = useMemo(() => {
    return currentTimeSelect || currentTime
  }, [currentTimeSelect, currentTime])

  const updateItemOpacity = () => {
    if (!wheelContainerRef.current) return

    const wheelLists = wheelContainerRef.current.querySelectorAll('ul[role="listbox"]')

    wheelLists.forEach((list) => {
      const containerRect = list.getBoundingClientRect()
      const containerCenterY = containerRect.top + containerRect.height / 2
      const items = list.querySelectorAll('li[role="option"]')

      items.forEach((item) => {
        const itemRect = item.getBoundingClientRect()
        const itemCenterY = itemRect.top + itemRect.height / 2
        const distance = Math.abs(itemCenterY - containerCenterY)

        const maxDistance = containerRect.height / 2
        let opacity = 1 - (distance / maxDistance) * 0.8
        opacity = Math.max(0.2, Math.min(1, opacity))

        const textElement = item.querySelector('p')
        if (textElement) {
          textElement.style.opacity = opacity.toString()
        }
      })
    })
  }

  useEffect(() => {
    if (!wheelContainerRef.current) return

    const wheelLists = wheelContainerRef.current.querySelectorAll('ul[role="listbox"]')

    const handleScroll = () => {
      requestAnimationFrame(updateItemOpacity)
    }

    wheelLists.forEach((list) => {
      list.addEventListener('scroll', handleScroll)
    })

    const timer = setTimeout(updateItemOpacity, 150)

    return () => {
      clearTimeout(timer)
      wheelLists.forEach((list) => {
        list.removeEventListener('scroll', handleScroll)
      })
    }
  }, [displayTime, type, mode])

  const generateTimeList = (option: TimeOption): WheelItem[] => {
    const { type, unit, maximum, minimum = 0 } = option
    return Array.from({ length: maximum - minimum + 1 }, (_, i) => ({
      id: `${type}-${(i + minimum).toString().padStart(2, '0')}`,
      value: `${(i + minimum).toString().padStart(2, '0')}${unit}`,
    }))
  }

  const vibrate = (): void => {
    const now = Date.now()
    if (now - lastVibrationTime.current > 100 && navigator.vibrate) {
      lastVibrationTime.current = now
      navigator.vibrate(30)
    }
  }

  const handleTimeChange = (timeOption: TimeOption, value: string) => {
    if (type === DateSelectedType.NOT_FOCUS) return

    const newValue = value.replace(timeOption.unit, '')
    const currentSelectedTime = type === DateSelectedType.START ? startTime : endTime
    if (currentSelectedTime && currentSelectedTime[timeOption.type] === newValue) return

    if (timeOption.type === TimeKey.MONTH || timeOption.type === TimeKey.YEAR) {
      const year = timeOption.type === TimeKey.YEAR ? newValue : displayTime.year || currentTime.year
      const month = timeOption.type === TimeKey.MONTH ? newValue : displayTime.month || currentTime.month
      const newMonthDays = getDaysInMonth(year!, month!)

      const currentDay = parseInt(displayTime.day || currentTime.day || '1')
      if (currentDay > newMonthDays) {
        setTime((prev) => {
          if (!prev)
            return { ...getCurrentTime(), day: String(newMonthDays).padStart(2, '0'), [timeOption.type]: newValue }
          return { ...prev, day: String(newMonthDays).padStart(2, '0'), [timeOption.type]: newValue }
        })
        return
      }
    }

    vibrate()
    setTime((prev) => {
      if (!prev) return { ...getCurrentTime(), [timeOption.type]: newValue }
      return { ...prev, [timeOption.type]: newValue }
    })
  }

  const timeList = useMemo(
    () =>
      filteredTimeOptions.map((option) => ({
        ...option,
        value:
          option.type === TimeKey.YEAR
            ? displayTime?.[option.type] || currentTime?.[option.type]
            : String(displayTime?.[option.type] || currentTime?.[option.type]).padStart(2, '0'),
        data: generateTimeList(option),
      })),
    [displayTime, filteredTimeOptions],
  )

  return (
    <div ref={wheelContainerRef} className="flex w-full h-full relative">
      <div className="w-full flex justify-center items-center">
        <div className="flex">
          {timeList.map((item) => (
            <div
              key={`${item.type}-${item.value}-${mode}`}
              className={cn(
                'hidden-icon _hidescrollbar relative',
                '[&>ul]:!px-3 [&>ul]:!right-[-4px]',
                '[&>ul_li]:whitespace-nowrap',
                'wheel-picker-column beSqUU-1',
              )}
            >
              <WheelPicker
                data={item.data}
                selectedID={`${item.type}-${item.value}`}
                onChange={(data) => handleTimeChange(item, (data as WheelItem).value)}
                height={220}
                itemHeight={40}
                backgroundColor="transparent"
                color="#6a6a8a"
                activeColor="#ffffff"
                fontSize={16}
                shadowColor="transparent"
                focusColor="transparent"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TimeWheelPicker
