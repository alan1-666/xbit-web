import * as React from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export interface TooltipWrapperProps {
  children: React.ReactNode
  content: React.ReactNode
  delayDuration?: number
  className?: string
  contentClassName?: string
  asChild?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const TooltipWrapper = ({
  children,
  content,
  className,
  contentClassName,
  asChild = false,
  open,
  onOpenChange,
}: TooltipWrapperProps) => {
  return (
    <Tooltip open={open} onOpenChange={onOpenChange}>
      <TooltipTrigger asChild={asChild} className={className}>
        {children}
      </TooltipTrigger>
      <TooltipContent className={cn(contentClassName, 'w-fit max-w-fit bg-transparent')}>{content}</TooltipContent>
    </Tooltip>
  )
}

export default TooltipWrapper
