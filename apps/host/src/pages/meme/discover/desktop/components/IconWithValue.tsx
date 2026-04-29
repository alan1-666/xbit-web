import { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils.ts'

export interface IconWithValueProps extends HTMLAttributes<HTMLDivElement> {
  icon: ReactNode
  value: string | ReactNode
  className?: string
}

export const IconWithValue = (props: IconWithValueProps) => {
  const { icon, value, className, children, ...rest } = props
  return (
    <div className={cn('flex items-center gap-1', className)} {...rest}>
      {icon}
      <span>{value}</span>
    </div>
  )
}
