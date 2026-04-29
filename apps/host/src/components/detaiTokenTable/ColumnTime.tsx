import { cn } from '@/lib/utils'
import { formatSmartTimeDiff } from '@/utils/helpers.ts'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { SimpleTooltip } from '@components/v2/ui-shared/components/SimpleTooltip.tsx'
import { TooltipProvider } from '@components/ui/tooltip.tsx'
import { IconWarning } from '@components/icon/stroke/IconWarning.tsx'
import { useTranslation } from 'react-i18next'

type ColumnTimeProps = {
  displayDateTimeMode: boolean
  timestamp: number
  className?: string
  isKlineTx: boolean
  filteringReason?: string
}

const formatTimestamp = (timestamp?: number): string => {
  if (!timestamp) return '0'
  return dayjs(timestamp).format('MM/DD HH:mm:ss')
}

const DimTxTooltip = ({ filteringReason }: { filteringReason?: string }) => {
  const { t } = useTranslation()
  if (!filteringReason) return null
  return (
    <SimpleTooltip content={t(`orderBook.exclusive.${filteringReason}`)}>
      <IconWarning className="size-4" />
    </SimpleTooltip>
  )
}

const ColumnTime = ({ displayDateTimeMode, timestamp, className, isKlineTx, filteringReason }: ColumnTimeProps) => {
  // ✅ Force re-render every 1 second
  const [_, setTick] = useState<number>(0)
  useEffect(() => {
    if (displayDateTimeMode) return
    const interval = setInterval(() => {
      setTick((t) => t + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <TooltipProvider>
      <div
        className={cn(
          'flex items-center text-[12px] leading-[1] app-font-regular h-[31px] gap-1 text-[#CACACA]',
          className,
        )}
      >
        {displayDateTimeMode ? formatTimestamp(timestamp ? +timestamp : 0) : formatSmartTimeDiff(Number(timestamp))}
        {!isKlineTx && filteringReason ? <DimTxTooltip filteringReason={filteringReason} /> : null}
      </div>
    </TooltipProvider>
  )
}

export default ColumnTime
