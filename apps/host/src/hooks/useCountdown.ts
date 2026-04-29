import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'

dayjs.extend(duration)

export function useCountdown(targetTime: number) {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    if (!targetTime) return

    const updateRemaining = () => {
      const diff = targetTime - Date.now()
      setRemaining(diff > 0 ? diff : 0)
    }

    updateRemaining()

    const timer = setInterval(updateRemaining, 1000)

    return () => clearInterval(timer)
  }, [targetTime])

  const format = dayjs.duration(remaining).format('HH:mm:ss')

  return { remaining, format }
}
