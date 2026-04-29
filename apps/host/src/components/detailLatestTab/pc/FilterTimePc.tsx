import { Ref, useCallback, useEffect, useImperativeHandle, useMemo, useState, memo } from 'react'
import { Button } from '@components/ui/button.tsx'
import { X } from 'lucide-react'
import TimeWheelPicker from '@components/detaiTokenTable/TimeWheelPicker.tsx'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog.tsx'
import { getCurrentTime, TimeWheelDateType } from '@/redux/modules/tokenDetail.slice.ts'
import { DateSelectedType } from '@/types/enums.ts'
import { cn } from '@/lib/utils.ts'
import { isDiffOver1Month, checkStartTimeAfterEndTime } from '@/utils/helpers.ts'
import InputDateTime from '@components/detaiTokenTable/InputDateTime.tsx'

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

const FilterTimePc = ({
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

  const handleClickReselect = (type: DateSelectedType) => {
    setIsOver1Month(false)
    setIsStartTimeAfterEndTime(false)
    if (!startTime && !endTime) setType(DateSelectedType.NOT_FOCUS)
    if (type === DateSelectedType.START) {
      setStartTimeMemo(undefined)
    } else {
      setEndTimeMemo(undefined)
    }
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full bg-[#232329] max-w-[768px] max-h-[80vh] mx-auto min-h-[495px]" showDialogPrimitiveClose={false}>
          <DialogHeader>
            <DialogTitle className="mt-1.5">
              <div className={cn('text-[calc(1rem*(22/16))] leading-[1] app-font-regular text-left')}>
                {t(
                  type === DateSelectedType.START
                    ? 'detail.tokenDetail.selectStartTime'
                    : 'detail.tokenDetail.selectEndTime',
                )}
              </div>
              <div
                className={cn(
                  'flex items-center justify-start mt-3 text-[calc(1rem*(14/16))] font-[350]',
                  isOver1Month || isStartTimeAfterEndTime ? 'text-[#FF353C]' : 'text-[#FFFFFFA6]',
                )}
              >
                <span>{t('detail.tokenDetail.maximumTime')}</span>
                {isStartTimeAfterEndTime ? (
                  <span>{`. ${t('detail.tokenDetail.startTimeAfterEndTimeError')}`}</span>
                ) : isOver1Month ? (
                  <span>{t('detail.tokenDetail.overMaxTime')}</span>
                ) : null}
              </div>
            </DialogTitle>

            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="size-5" />
            </DialogClose>
          </DialogHeader>

          <DialogDescription className="relative">
            <TimeWheelPicker
              type={type}
              currentTime={startTime ?? endTime ?? getCurrentTime()}
              startTime={startTimeMemo}
              endTime={endTimeMemo}
              setStartTime={setStartTimeMemo}
              setEndTime={setEndTimeMemo}
            />
            <div className="absolute w-full h-10 -left-0.5 top-1/2 -translate-y-1/2 -z-[1] bg-[linear-gradient(90deg,_rgba(153,_69,_255,_0.08)_20%,_rgba(0,_243,_171,_0.08)_100%)]" />
          </DialogDescription>

          <div>
            <div className="flex flex-col gap-4 px-4">
              <div className="flex items-center justify-between app-font-regular text-[calc(1rem*(14/16))] leading-[1] text-[#FFFFFF] h-[19px]">
                <div
                  className={cn(
                    'flex items-center justify-start gap-1.5 cursor-pointer',
                    type === DateSelectedType.START && 'scale-[1.1]',
                  )}
                  onClick={() => setType(DateSelectedType.START)}
                >
                  <span className="whitespace-nowrap cursor-pointer">{t('detail.tokenDetail.startTime')}:</span>
                  <div className="cursor-pointer">
                    {startTime ? (
                      <InputDateTime currentDateTime={startTimeMemo} setTime={setStartTimeMemo} customOnClick={() => setType(DateSelectedType.START)} />
                    ) : (
                      <span className="text-[#FFFFFFB2]">{t('detail.tokenDetail.notSelected')}</span>
                    )}
                  </div>
                </div>
                {startTime && (
                  <span
                    className="text-[#00FFF6] cursor-pointer"
                    onClick={() => handleClickReselect(DateSelectedType.START)}
                  >
                    {t('detail.tokenDetail.reselect')}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between app-font-regular text-[calc(1rem*(14/16))] leading-[1] text-[#FFFFFF] h-[19px]">
                <div
                  className={cn(
                    'flex items-center gap-1.5 cursor-pointer',
                    type === DateSelectedType.END && 'scale-[1.1]',
                  )}
                  onClick={() => setType(DateSelectedType.END)}
                >
                  <span className="whitespace-nowrap">{t('detail.tokenDetail.endTime')}:</span>
                  <span>
                    {endTime ? (
                      <InputDateTime currentDateTime={endTimeMemo} setTime={setEndTimeMemo} />
                    ) : (
                      <span className="text-[#FFFFFFB2]">{t('detail.tokenDetail.notSelected')}</span>
                    )}
                  </span>
                </div>

                {endTime && (
                  <span
                    className="text-[#00FFF6] cursor-pointer"
                    onClick={() => handleClickReselect(DateSelectedType.END)}
                  >
                    {t('detail.tokenDetail.reselect')}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-center items-center flex-row gap-2.5 my-4">
              <Button
                size="lg"
                variant="borderGradient"
                className="flex-1 rounded-full h-11"
                onClick={handleResetClick}
              >
                {t('button.reset')}
              </Button>

              <Button
                size="lg"
                disabled={isOver1Month || isStartTimeAfterEndTime || (!startTime && !endTime)}
                variant="gradient"
                className="text-[#261236] flex-1 rounded-[50px] h-11"
                onClick={handleConfirmClick}
              >
                {t('chart.buttons.confirm')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

FilterTimePc.displayName = 'ModalDateTimePicker'

export default memo(FilterTimePc)
