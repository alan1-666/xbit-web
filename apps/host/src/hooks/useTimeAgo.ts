import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import useForceUpdate from '@hooks/useForceUpdate.ts'

export const useTimeAgo = (timestamp?: number) => {
  const [timeAgo, setTimeAgo] = useState('')

  useEffect(() => {
    if (!timestamp || isNaN(timestamp) || timestamp <= 0) {
      setTimeAgo('--')
      return
    }

    const timestampMs = String(timestamp).length === 10 ? timestamp * 1000 : timestamp

    const update = () => {
      const now = dayjs()
      const past = dayjs(timestampMs)
      if (!past.isValid()) {
        setTimeAgo('--')
        return
      }

      const seconds = now.diff(past, 'seconds')
      const minutes = now.diff(past, 'minutes')
      const hours = now.diff(past, 'hours')
      const days = now.diff(past, 'days')
      const months = now.diff(past, 'months')
      const years = now.diff(past, 'years')

      let result = ''
      switch (true) {
        case seconds < 60:
          result = `${seconds}s`
          break
        case minutes < 60:
          result = `${minutes}m`
          break
        case hours < 24:
          result = `${hours}h`
          break
        case days < 30:
          result = `${days} day${days > 1 ? 's' : ''}`
          break
        case months < 12:
          result = `${months} month${months > 1 ? 's' : ''}`
          break
        default:
          result = `${years} year${years > 1 ? 's' : ''}`
      }

      setTimeAgo(result)
    }

    update() // Run once immediately
    const interval = setInterval(update, 1000) // Update every second

    return () => clearInterval(interval) // Cleanup on unmount
  }, [timestamp])

  return timeAgo
}
