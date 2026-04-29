import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils.ts'

export interface BorderGradientCardProps extends HTMLAttributes<HTMLDivElement> {}

export const BorderGradientCard = (props: BorderGradientCardProps) => {
  const { className, ...rest } = props
  return (
    <div
      className={cn(
        'p-[0.5px] rounded-[8px]',
        className,
      )}
    >
      <div className="bg-[#232329] rounded-[8px] px-3 py-[14px]" {...rest}></div>
    </div>
  )
}
