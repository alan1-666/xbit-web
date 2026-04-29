import { RealtimeTransaction } from '@/redux/modules/transactionsHistory.slice.ts'
import { cn } from '@/lib/utils.ts'
import { formatSmartTimeDiff } from '@/utils/helpers.ts'
import { useEffect, useState } from 'react'

export interface TimeCellProps {
  transaction: RealtimeTransaction
  exclusive: boolean
}

export const TimeCell = (props: TimeCellProps) => {
  const { transaction, exclusive } = props
  const [_, setTick] = useState<number>(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1)
    }, 300) // Update every 300 milliseconds to keep time difference accurate
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={cn('text-right text-[#FFFFFFCC]', exclusive ? 'opacity-50' : '')}>
      {formatSmartTimeDiff(transaction.timestamp)}
    </div>
  )
}
