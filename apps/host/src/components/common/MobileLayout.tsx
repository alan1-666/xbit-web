import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils.ts'

export interface MobileLayoutProps extends HTMLAttributes<HTMLDivElement> {}
export const MobileLayout = (props: MobileLayoutProps) => {
  const { className, ...rest } = props
  return <div className={cn('max-w-[786px] mx-auto', className)} {...rest} />
}
