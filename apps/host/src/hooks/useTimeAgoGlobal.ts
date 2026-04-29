import { getTimeAgo, getTimeAgoWithNextTime } from '@/utils/time'
import { useEffect, useState } from 'react'

// Global force update system
const subscribers = new Set<() => void>()

const updateAllSubscribers = () => {
  subscribers.forEach((update) => update())
}

export type UseTimeAgoGlobalOptions = {
  formatFn?: (timestampMs: number) => string
}

const useTimeAgoGlobal = (timestamp?: number, options?: UseTimeAgoGlobalOptions) => {
  const [timeAgo, setTimeAgo] = useState('')
  const formatFn = options?.formatFn || getTimeAgo

  // Run a global interval once for all instances
  useEffect(() => {
    const interval = setInterval(updateAllSubscribers, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!timestamp || isNaN(timestamp) || timestamp <= 0) {
      setTimeAgo('--')
      return
    }

    const timestampMs = String(timestamp).length === 10 ? timestamp * 1000 : timestamp

    const update = () => {
      const result = formatFn(timestampMs)
      setTimeAgo(result)
    }

    update() // Run immediately
    subscribers.add(update) // Subscribe

    return () => {
      subscribers.delete(update) // Unsubscribe on unmount
    }
  }, [timestamp])

  return timeAgo
}

export type UseTimeAgoGlobalOptionsV2 = {
  formatFn?: (timestampMs?: number) => ReturnType<typeof getTimeAgoWithNextTime>
}

export function useTimeAgoGlobalV2(timestamp?: number, options?: UseTimeAgoGlobalOptionsV2) {
  const timestampMs = String(timestamp).length === 10 ? (timestamp || 0) * 1000 : timestamp
  const formatFn = options?.formatFn || getTimeAgoWithNextTime
  const [result, setResult] = useState(formatFn(timestampMs))

  useEffect(() => {
    setResult(formatFn(timestampMs))
  }, [timestampMs])

  useEffect(() => {
    const interval = setInterval(() => {
      setResult(formatFn(timestampMs))
    }, result.next)
    return () => clearInterval(interval)
  }, [result.next, timestampMs])

  return result.text
}

export default useTimeAgoGlobal
