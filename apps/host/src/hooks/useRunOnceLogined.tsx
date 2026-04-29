// useRunOnceAfterLogin.ts
import ls from '@/lib/local-storage'
import { useEffect } from 'react'

export function useRunOnceAfterLogin({
  isLoggedIn,
  callback,
  key = 'run-once-logined',
}: {
  isLoggedIn: boolean
  callback: () => void
  key?: string
}) {
  useEffect(() => {
    if (!isLoggedIn) return

    const hasRun = ls.get(key)
    if (!hasRun) {
      callback()
      ls.set(key, 'true')
    }
  }, [isLoggedIn, callback, key])
}
