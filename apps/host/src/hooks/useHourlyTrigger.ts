import { useEffect } from 'react'

export function useHourlyTrigger(callback: () => void) {
  useEffect(() => {
    const checkAndRun = () => {
      const now = new Date()
      const minutes = now.getMinutes()
      const seconds = now.getSeconds()

      if (minutes === 0 && seconds === 0) {
        callback()
      }
    }

    // Run every second to catch the top of the hour
    const interval = setInterval(checkAndRun, 1000)

    return () => clearInterval(interval)
  }, [callback])
}
