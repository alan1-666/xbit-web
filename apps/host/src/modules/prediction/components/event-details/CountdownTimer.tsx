import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { RollingNumber } from '@/modules/prediction/components/portfolio/RollingNumber.tsx'

const Countdown = (props: { endDate: string }) => {
  const { endDate } = props
  const [timeLeft, setTimeLeft] = useState(dayjs(endDate).diff(dayjs()))

  useMemo(() => {
    const interval = setInterval(() => {
      setTimeLeft(dayjs(endDate).diff(dayjs()))
    }, 1000)

    return () => clearInterval(interval)
  }, [endDate])

  if (timeLeft <= 0) return null

  const hours = Math.floor(timeLeft / (1000 * 60 * 60))
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

  return (
    <div className="flex items-center gap-3 text-[#908E98]">
      {hours > 0 && (
        <div className="flex flex-col items-center gap-1.5">
          <RollingNumber className="font-semibold text-xl" value={hours.toString().padStart(2, '0')} />
          <div className="text-[14px]">HRS</div>
        </div>
      )}
      <div className="flex flex-col items-center gap-1.5">
        <RollingNumber className="font-semibold text-xl" value={minutes.toString().padStart(2, '0')} />
        <div className="text-[14px]">MINS</div>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <RollingNumber className="font-semibold text-xl" value={seconds.toString().padStart(2, '0')} />
        <div className="text-[14px]">SECS</div>
      </div>
    </div>
  )
}

export const CountdownTimer = () => {
  const { event } = useEventDetailsPageContext()

  const endDate = useMemo(() => {
    if (!event?.endDate) return null
    return dayjs(event.endDate)
  }, [event?.endDate])

  const showCountdown = useMemo(() => {
    // Only show countdown if the event ends within 24 hours
    if (!endDate) return false
    const now = dayjs()
    const diffInHours = endDate.diff(now, 'hour')
    return diffInHours <= 24
  }, [endDate])

  if (!endDate || !showCountdown) return null

  return <Countdown key={endDate.toISOString()} endDate={endDate.toISOString()} />
}
