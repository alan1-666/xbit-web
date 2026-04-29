import { useEffect, useRef, useState } from 'react'

export const useFundingCountdown = (fundingTime: string, interval: string, onEnd?: () => void) => {
  const [countdown, setCountdown] = useState('--:--:--')
  const hasTriggeredEnd = useRef(false)

  useEffect(() => {
    hasTriggeredEnd.current = false

    const baseTimeMs = new Date(fundingTime).getTime()
    const hoursCount = parseInt(interval.replace('h', '')) || 0
    const targetTimeMs = baseTimeMs + hoursCount * 60 * 60 * 1000

    const calculateTime = () => {
      const nowMs = new Date().getTime()
      const diff = targetTimeMs - nowMs

      if (diff <= 0) {
        setCountdown('00:00:00')
        if (!hasTriggeredEnd.current) {
          onEnd?.()
          hasTriggeredEnd.current = true
        }
        return true
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      const formatted = [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0'),
      ].join(':')

      setCountdown(formatted)
      return false // Chưa kết thúc
    }

    const isAlreadyEnded = calculateTime()
    if (isAlreadyEnded) return

    const timer = setInterval(() => {
      const isFinished = calculateTime()
      if (isFinished) {
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [fundingTime, interval])

  return countdown
}
