import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import IconClock from '@components/icon/stroke/IconClock.tsx'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'

const formatRemaining = (endDate: dayjs.Dayjs): string => {
  const now = dayjs()
  const diffSeconds = Math.max(0, endDate.diff(now, 'second'))
  if (diffSeconds <= 0) return ''

  const days = Math.floor(diffSeconds / 86400)
  const remainderSeconds = diffSeconds % 86400
  const h = Math.floor(remainderSeconds / 3600)
  const m = Math.floor((remainderSeconds % 3600) / 60)
  const s = remainderSeconds % 60
  const timePart = [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
  if (days > 0) {
    const dayLabel = i18next.t('const.time.duration.d', { duration: days })
    return `${dayLabel} ${timePart}`
  }
  return timePart
}

export interface EventDurationProps {
  endDate: string | null | undefined
  className?: string
}

export const EventDuration = ({ endDate, className }: EventDurationProps) => {
  const [remaining, setRemaining] = useState('')
  const [hasEnded, setHasEnded] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    if (!endDate) return

    const end = dayjs(endDate)
    const update = () => {
      if (end.isBefore(dayjs())) {
        setHasEnded(true)
        setRemaining('')
        return
      }
      setHasEnded(false)
      setRemaining(formatRemaining(end))
    }

    update()
    const interval = setInterval(update, 1000) // update every second
    return () => clearInterval(interval)
  }, [endDate])
  const isEnded = !endDate || hasEnded || !remaining

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <IconClock width={16} height={16} />
      <div className="text-[calc(14rem/16)] min-w-[80px] tabular-nums">
        {isEnded ? t('prediction.event.ended') : remaining}
      </div>
    </div>
  )
}
