import { memo } from "react"
import { useTimeAgoGlobalV2 } from "@/hooks/useTimeAgoGlobal"

interface TimeAgoProps {
  timestamp: number
}

export const TimeAgo = memo(({ timestamp }: TimeAgoProps) => {
  const timeAgo = useTimeAgoGlobalV2(timestamp)
  return (
    <>{timeAgo}</>
  )
})

TimeAgo.displayName = 'TimeAgo'
