import { cn } from '@/lib/utils.ts'
import { getCurrentTime, TimeWheelDateType } from '@/redux/modules/tokenDetail.slice.ts'
import { DateSelectedType } from '@/types/enums.ts'
import { checkStartTimeAfterEndTime, isDiffOver1Month } from '@/utils/helpers.ts'
import { Button } from '@components/ui/button.tsx'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@components/ui/drawer.tsx'
import { isEqual } from 'lodash-es'
import { X } from 'lucide-react'
import { memo, Ref, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import BoxTimeSelect from './BoxTimeSelect'
import TimeWheelPicker from './TimeWheelPicker'

export type ModalDateTimePickerHandle = {
  open: () => void
}

type ModalDateTimePickerProps = {
  initStartDate?: number
  initEndDate?: number
  resetTimeFn?: () => void
  handleChangeTime?: (startTime: TimeWheelDateType | undefined, endTime: TimeWheelDateType | undefined) => void
  ref?: Ref<ModalDateTimePickerHandle>
}

// Helper function to convert timestamp to TimeWheelDateType
const timestampToTimeWheelDate = (timestamp: number): TimeWheelDateType => {
  const date = new Date(timestamp * 1000)
  return {
    year: date.getFullYear().toString(),
    month: (date.getMonth() + 1).toString().padStart(2, '0'),
    day: date.getDate().toString().padStart(2, '0'),
    hour: date.getHours().toString().padStart(2, '0'),
    minute: date.getMinutes().toString().padStart(2, '0'),
  }
}

const ModalDateTimePicker = ({
  initEndDate,
  initStartDate,
  resetTimeFn,
  handleChangeTime,

  ref,
}: ModalDateTimePickerProps) => {
  const { t } = useTranslation()

  // Initialize state with provided initial values
  const [startTime, setStartTime] = useState<TimeWheelDateType | undefined>(() => {
    return initStartDate ? timestampToTimeWheelDate(initStartDate) : undefined
  })

  const [endTime, setEndTime] = useState<TimeWheelDateType | undefined>(() => {
    return initEndDate ? timestampToTimeWheelDate(initEndDate) : undefined
  })

  const [open, setOpen] = useState(false)
  const [type, setType] = useState(DateSelectedType.NOT_FOCUS)
  const [isOver1Month, setIsOver1Month] = useState(false)
  const [isStartTimeAfterEndTime, setIsStartTimeAfterEndTime] = useState(false)
  const [pickerMode, setPickerMode] = useState<'date' | 'time' | 'full'>('full')

  // Update state when initial values change
  useEffect(() => {
    if (initStartDate) {
      setStartTime(timestampToTimeWheelDate(initStartDate))
    }
  }, [initStartDate, open])

  useEffect(() => {
    if (initEndDate) {
      setEndTime(timestampToTimeWheelDate(initEndDate))
    }
  }, [initEndDate, open])

  useImperativeHandle(ref, () => {
    return {
      open: handleOnOpenModal,
    }
  })

  const handleResetClick = () => {
    handleChangeTime?.(undefined, undefined)
    setStartTime(undefined)
    setEndTime(undefined)
  }

  const handleConfirmClick = () => {
    try {
      if (isOver1Month || isStartTimeAfterEndTime) {
        return
      }
      handleChangeTime?.(startTime, endTime)
    } catch (err) {
      console.error(err)
    } finally {
      setOpen(false)
    }
  }

  const handleOnOpenModal = () => {
    resetTimeFn?.()
    setIsOver1Month(false)
    setIsStartTimeAfterEndTime(false)
    setType(DateSelectedType.NOT_FOCUS)

    // Reset to initial values when opening modal
    setStartTime(initStartDate ? timestampToTimeWheelDate(initStartDate) : undefined)
    setEndTime(initEndDate ? timestampToTimeWheelDate(initEndDate) : undefined)

    setOpen(true)
  }

  const startTimeMemo = useMemo(() => startTime, [startTime])
  const endTimeMemo = useMemo(() => endTime, [endTime])
  const setStartTimeMemo = useCallback(setStartTime, [])
  const setEndTimeMemo = useCallback(setEndTime, [])

  // const handleClickReselect = (type: DateSelectedType) => {
  //   setIsOver1Month(false)
  //   setIsStartTimeAfterEndTime(false)
  //   if (!startTime && !endTime) setType(DateSelectedType.NOT_FOCUS)
  //   if (type === DateSelectedType.START) {
  //     setStartTimeMemo(undefined)
  //   } else {
  //     setEndTimeMemo(undefined)
  //   }
  // }

  const handleStartDateClick = () => {
    setType(DateSelectedType.START)
    setPickerMode('date')
  }

  const handleStartTimeClick = () => {
    setType(DateSelectedType.START)
    setPickerMode('time')
  }

  // Handle box click for end date
  const handleEndDateClick = () => {
    setType(DateSelectedType.END)
    setPickerMode('date')
  }

  const handleEndTimeClick = () => {
    setType(DateSelectedType.END)
    setPickerMode('time')
  }

  useEffect(() => {
    if (startTime && endTime) {
      const exceeded = isDiffOver1Month(startTime, endTime)
      const startAfterEnd = checkStartTimeAfterEndTime(startTime, endTime)
      setIsOver1Month(exceeded)
      setIsStartTimeAfterEndTime(startAfterEnd)
    } else {
      setIsOver1Month(false)
      setIsStartTimeAfterEndTime(false)
    }
  }, [startTime, endTime])

  useEffect(() => {
    if (!startTime && !endTime) {
      setType(DateSelectedType.NOT_FOCUS)
    }
  }, [startTime, endTime])

  return (
    <>
      <Button size="xs" className="rounded-full bg-transparent p-0" onClick={handleOnOpenModal}>
        <img
          src={initEndDate || initStartDate ? '/images/icons/icon-filter-solid.svg' : '/images/icons/icon-filter.svg'}
          className="w-[11px] h-[11px]"
          alt="icon filter"
        />
      </Button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="w-full bg-[#212127] max-w-[768px] max-h-[80vh] mx-auto min-h-[495px]">
          <DrawerHeader>
            <DrawerTitle className="mt-1.5">
              <div className={cn('text-[calc(1rem*(22/16))] leading-[1] app-font-regular text-left')}>
                {t('filter.timeRange')}
              </div>
              <div
                className={cn(
                  'flex items-center justify-start mt-3 text-[calc(1rem*(14/16))] font-[350]',
                  isOver1Month || isStartTimeAfterEndTime ? 'text-[#FF353C]' : 'text-[#FFFFFFA6]',
                )}
              >
                {isOver1Month ? (
                  <span>{t('filter.Max30days_please_reselect')}</span>
                ) : (
                  <span>{t('filter.Max30days')}</span>
                )}
              </div>
            </DrawerTitle>

            <DrawerClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="size-5" />
            </DrawerClose>
          </DrawerHeader>

          <div className="flex flex-col gap-2 p-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="flex-1">
                <BoxTimeSelect
                  type="date"
                  handleClick={handleStartDateClick}
                  value={`${startTimeMemo?.year || '----'}/${startTimeMemo?.month || '--'}/${startTimeMemo?.day || '--'}`}
                  isActive={type === DateSelectedType.START && pickerMode === 'date'}
                />
              </div>
              <div className="flex-1 col-span-2">
                <BoxTimeSelect
                  type="time"
                  handleClick={handleStartTimeClick}
                  value={`${startTimeMemo?.hour || '--'}:${startTimeMemo?.minute || '--'}`}
                  isActive={type === DateSelectedType.START && pickerMode === 'time'}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex-1">
                <BoxTimeSelect
                  type="date"
                  handleClick={handleEndDateClick}
                  value={`${endTimeMemo?.year || '----'}/${endTimeMemo?.month || '--'}/${endTimeMemo?.day || '--'}`}
                  isActive={type === DateSelectedType.END && pickerMode === 'date'}
                />
              </div>
              <div className="flex-1 col-span-2">
                <BoxTimeSelect
                  type="time"
                  handleClick={handleEndTimeClick}
                  value={`${endTimeMemo?.hour || '--'}:${endTimeMemo?.minute || '--'}`}
                  isActive={type === DateSelectedType.END && pickerMode === 'time'}
                />
              </div>
            </div>
          </div>

          <DrawerDescription className="relative">
            <TimeWheelPicker
              type={type}
              currentTime={startTime ?? endTime ?? getCurrentTime()}
              startTime={startTimeMemo}
              endTime={endTimeMemo}
              setStartTime={setStartTimeMemo}
              setEndTime={setEndTimeMemo}
              mode={pickerMode}
            />
            <div className="absolute w-full h-10 -left-0.5 top-[49%] -translate-y-1/2 -z-[1] bg-[linear-gradient(90deg,rgba(43,_43,_51,_0)_0%,_#2B2B33_50.48%,_rgba(43,_43,_51,_0)_100%)]" />
          </DrawerDescription>

          <DrawerFooter>
            <div className="flex justify-center items-center flex-row gap-2.5 my-4">
              <Button size="lg" variant="close" className="flex-1 rounded-full h-11" onClick={handleResetClick}>
                {t('button.reset')}
              </Button>

              <Button
                size="lg"
                disabled={isOver1Month || isStartTimeAfterEndTime || (!startTime && !endTime)}
                variant="gradient"
                className="text-[#261236] flex-1 rounded-[50px] h-11"
                onClick={handleConfirmClick}
              >
                {t('settings.apply')}
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

ModalDateTimePicker.displayName = 'ModalDateTimePicker'

export default memo(
  ModalDateTimePicker,
  (prevProps, nextProps) =>
    isEqual(prevProps.initEndDate, nextProps.initEndDate) &&
    isEqual(prevProps.initEndDate, nextProps.initEndDate) &&
    isEqual(prevProps.ref, nextProps.ref) &&
    isEqual(prevProps.resetTimeFn, nextProps.resetTimeFn) &&
    isEqual(prevProps.handleChangeTime, nextProps.handleChangeTime),
)
