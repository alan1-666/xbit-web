import { useEffect, useState } from 'react'
import dayjs from 'dayjs'

export const useTokenAge = (createdTime: string) => {
  const [duration, setDuration] = useState(Math.max(dayjs().unix() - dayjs(createdTime).unix(), 0))

  useEffect(() => {
    const iv = setInterval(() => {
      const currentDuration = Math.max(dayjs().unix() - dayjs(createdTime).unix(), 0)
      setDuration(currentDuration)
    }, 1000)
    return () => {
      clearInterval(iv)
    }
  }, [createdTime])

  return duration
}
