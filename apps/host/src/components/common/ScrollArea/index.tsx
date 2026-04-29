import * as React from 'react'
import { cn } from '@/lib/utils'

type Props = React.HTMLAttributes<HTMLDivElement> & {
  maxHeight?: number | string
}

export function ScrollArea({ className, maxHeight = 280, style, ...props }: Props) {
  const mh = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight
  return (
    <div
      className={cn('overflow-y-auto overscroll-contain', className)}
      style={{ maxHeight: mh, ...style }}
      {...props}
    />
  )
}
