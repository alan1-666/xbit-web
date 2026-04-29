import { useEffect, useRef, useState } from 'react'

export function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const timerRef = useRef<number | null>(null)

  function formatCountdown(seconds: number) {
    if (seconds < 60) {
      return {
        isLessThanOneMinute: true,
        hours: '00',
        minutes: '00',
        seconds: String(seconds).padStart(2, '0')
      }
    }

    const totalMinutes = Math.ceil(seconds / 60)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return {
      isLessThanOneMinute: false,
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: '00'
    }
  }

  useEffect(() => {
    // 先同步到最新的 initialSeconds（支持后续传入非 0 值）
    setSeconds(initialSeconds)

    if (initialSeconds <= 0) return // 不启动倒计时

    // 清理旧定时器，避免并行 interval
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    timerRef.current = window.setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [initialSeconds])

  return {
    seconds,
    countdown: formatCountdown(seconds),
    isFinished: seconds <= 0
  }
}