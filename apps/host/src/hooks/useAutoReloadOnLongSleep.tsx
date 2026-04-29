import { _isMobileDevice } from '@/lib/utils'
import { useEffect, useRef } from 'react'

export function useAutoReloadOnLongSleep(timeoutMinutes = 10) {
  const hiddenAt = useRef<number | null>(null)
  const lastHeartbeat = useRef<number>(Date.now())
  const threshold = timeoutMinutes * 60 * 1000

  useEffect(() => {
    if (_isMobileDevice()) return

    const interval = setInterval(() => {
      const now = Date.now()

      if (document.visibilityState === 'visible') {
        const gap = now - lastHeartbeat.current
        if (gap > threshold + 5000) {
          window.location.reload()
        }
      }
      lastHeartbeat.current = now
    }, 2000)

    const handler = () => {
      if (document.visibilityState === 'hidden') {
        if (!hiddenAt.current) {
          hiddenAt.current = Date.now()
        }
      } else {
        if (hiddenAt.current) {
          const diff = Date.now() - hiddenAt.current

          if (diff > threshold) {
            window.location.reload()
          }
          hiddenAt.current = null
        }
        lastHeartbeat.current = Date.now()
      }
    }

    document.addEventListener('visibilitychange', handler)
    window.addEventListener('focus', handler)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handler)
      window.removeEventListener('focus', handler)
    }
  }, [threshold])
}
