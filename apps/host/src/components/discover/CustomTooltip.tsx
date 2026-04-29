import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils.ts'

type TooltipProps = {
  content: React.ReactNode
  children: React.ReactNode
  align?: 'left' | 'right' | 'center'
}

/**
 * Custom tooltip component that displays content on hover.
 * @param content
 * @param children
 * @param align
 * @constructor
 */
export function CustomTooltip({ content, children, align = 'center' }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [showing, setShowing] = useState(false) // control render

  useEffect(() => {
    if (visible) {
      setShowing(true)
    } else {
      const timeout = setTimeout(() => setShowing(false), 300) // match transition
      return () => clearTimeout(timeout)
    }
  }, [visible])

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onClick={() => setVisible(!visible)}
    >
      {children}

      {showing && (
        <div
          className={cn(
            'absolute bottom-full transition duration-300 p-0 bg-transparent rounded-[4px] text-[calc(12rem/16)] whitespace-nowrap z-[999] pointer-events-none mb-2',
            visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1 scale-95',
            align === 'left'
              ? 'left-0 translate-x-0'
              : align === 'right'
                ? 'right-0 translate-x-0'
                : 'left-1/2 -translate-x-1/2',
          )}
        >
          {content}
        </div>
      )}
    </div>
  )
}
