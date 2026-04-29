import { cn } from '@/lib/utils.ts'

export interface NumberOfTransactionPillProps {
  buy: number
  sell: number
  className?: string
  progressClassName?: string
}

export const NumberOfTransactionPill = (props: NumberOfTransactionPillProps) => {
  const { buy, sell, className, progressClassName } = props
  const total = buy + sell

  const percentage = total === 0 ? 100 : (buy * 100) / total

  return (
    <div className={cn('bg-[#F25461] w-6 h-1 rounded-full overflow-hidden', className)}>
      <div
        className={cn(
          'bg-[#00FFB4] h-full rounded-full relative before:hidden before:absolute before:top-0 before:right-0 before:border-[4px] before:translate-x-1',
          percentage === 0
            ? 'before:border-transparent'
            : 'before:border-[#00FFB4] before:border-b-transparent before:border-r-transparent',
          progressClassName,
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
