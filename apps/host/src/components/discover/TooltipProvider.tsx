import { createContext, useContext, useRef, useState, useLayoutEffect, ReactNode, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils.ts'
import { isMobile } from 'react-device-detect'

type TooltipContextType = {
  showTooltip: (content: ReactNode, target: HTMLElement) => void
  hideTooltip: () => void
  toggle: () => void
}

const TooltipContext = createContext<TooltipContextType | null>(null)
export const useTooltip = () => {
  const ctx = useContext(TooltipContext)
  if (!ctx) throw new Error('TooltipProvider is missing')
  return ctx
}

export function TooltipProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false)
  const [content, setContent] = useState<ReactNode>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)

  const showTooltip = useCallback((content: ReactNode, target: HTMLElement) => {
    const rect = target.getBoundingClientRect()
    setPosition({ x: rect.left + rect.width / 2, y: rect.top })
    setContent(content)
    setVisible(true)
  }, [])

  const hideTooltip = () => {
    setVisible(false)
  }

  useLayoutEffect(() => {
    if (visible && tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      const overRight = tooltipRect.right > window.innerWidth
      const overLeft = tooltipRect.left < 0

      if (overRight || overLeft) {
        const adjust = Math.min(Math.max(0, tooltipRect.right - window.innerWidth), tooltipRect.left)
        setPosition((pos) => ({ ...pos, x: pos.x - adjust }))
      }
    }
  }, [visible, content])

  const toggle = () => {
    setVisible((prev) => !prev)
  }

  return (
    <TooltipContext.Provider value={{ showTooltip, hideTooltip, toggle }}>
      {children}

      {visible &&
        createPortal(
          <>
            <div
              className={cn('fixed inset-0 z-[9998]', isMobile ? 'pointer-events-auto' : 'pointer-events-none')}
              onTouchStart={() => {
                hideTooltip()
              }}
            />
            <div
              ref={tooltipRef}
              className="fixed z-[9999] px-2 py-1 text-sm pointer-events-none transition-opacity duration-150 opacity-100"
              style={{
                top: position.y - 8,
                left: position.x,
                transform: 'translate(-50%, -100%)',
              }}
            >
              {content}
            </div>
          </>,
          document.body,
        )}
    </TooltipContext.Provider>
  )
}
