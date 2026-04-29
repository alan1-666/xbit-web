import { ReactNode, useState } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { cn } from '@/lib/utils.ts'

export interface SimpleTooltipProps {
  children: ReactNode
  content: string | ReactNode
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  contentClassName?: string
  className?: string
  sideOffset?: number
}

export const SimpleTooltip = (props: SimpleTooltipProps) => {
  const { children, content, align, side = 'bottom', contentClassName, className, sideOffset = 8 } = props
  const [open, setOpen] = useState(false)
  return (
    <Tooltip delayDuration={10} open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild className={cn('cursor-pointer', className)} onClick={() => setOpen(!open)}>
        {children}
      </TooltipTrigger>
      <TooltipContent
        align={align || 'center'}
        side={side}
        sideOffset={sideOffset}
        className={cn('border border-[#79778C29] bg-[#212127] text-[#908E98]', contentClassName)}
      >
        {content}
      </TooltipContent>
    </Tooltip>
  )
}
