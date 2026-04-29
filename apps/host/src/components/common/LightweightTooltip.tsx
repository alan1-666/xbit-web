import { ReactNode, useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils.ts'

export interface LightweightTooltipProps {
  content: ReactNode
  children: ReactNode
  align?: 'left' | 'center' | 'right'
  position?: 'top' | 'bottom'
  contentClassName?: string
}
export const LightweightTooltip = (props: LightweightTooltipProps) => {
  const { content, children, align = 'center', position = 'bottom', contentClassName } = props
  const [show, setShow] = useState(false)
  const onEnter = useCallback(() => setShow(true), [])
  const onLeave = useCallback(() => setShow(false), [])

  const alignment =
    align === 'left'
      ? 'left-0 translate-x-0'
      : align === 'right'
        ? 'right-0 translate-x-0'
        : 'left-1/2 -translate-x-1/2'

  const verticalPosition =
    position === 'top' ? 'bottom-[calc(100%+6px)] origin-bottom' : 'top-[calc(100%+6px)] origin-top'

  return (
    <div
      className="relative inline-block"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{
              opacity: 0,
              y: position === 'top' ? -4 : 4,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: position === 'top' ? -4 : 4,
              scale: 0.98,
            }}
            transition={{ duration: 0.16 }}
            className={cn(
              `absolute z-60 rounded-md border border-[#79778c29] bg-[#2a2b31] p-2 shadow-xl ${verticalPosition} ${alignment}`,
              contentClassName,
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
