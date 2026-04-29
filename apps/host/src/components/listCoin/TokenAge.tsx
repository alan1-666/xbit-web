import { useTokenAge } from '@hooks/useTokenAge.ts'
import { DurationDisplay } from '@components/common/FormattingDisplay.tsx'
import { cn } from '@/lib/utils.ts'

export interface TokenAgeProps {
  createdTime: string
  className?: string
  allowOverrideStyle?: boolean
}

export const TokenAge = (props: TokenAgeProps) => {
  const { createdTime, className, allowOverrideStyle } = props
  const duration = useTokenAge(createdTime)

  return (
    <DurationDisplay
      value={duration}
      className={cn('text-[calc(1rem*(12/16))] leading-[calc(1rem*(12/16))] mr-1', className)}
      allowOverrideStyle={allowOverrideStyle}
    />
  )
}
