import { memo, useEffect, useState } from 'react'

interface CountdownTimerProps {
  estimationTime?: number | null
  createdAt: string
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ estimationTime, createdAt }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const createdAtTimestamp = new Date(createdAt).getTime()

      // Use estimationTime if available (convert seconds to milliseconds), otherwise use createdAt + 5 minutes (300s)
      const targetTime = estimationTime
        ? createdAtTimestamp + estimationTime * 1000 // estimationTime is in seconds, convert to ms
        : createdAtTimestamp + 5 * 60 * 1000

      const difference = targetTime - now

      if (difference <= 0) {
        setTimeLeft(0)
        return 0
      }

      return Math.floor(difference / 1000)
    }

    const initialTime = calculateTimeLeft()
    setTimeLeft(initialTime)

    if (initialTime <= 0) return

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft()
      setTimeLeft(newTimeLeft)

      if (newTimeLeft <= 0) {
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [estimationTime, createdAt])

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return ''

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex items-center gap-1 pl-1">
      {/* <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse"></div> */}
      <span className="text-[11px]">{formatTime(timeLeft)}</span>
    </div>
  )
}

export default memo(CountdownTimer)
