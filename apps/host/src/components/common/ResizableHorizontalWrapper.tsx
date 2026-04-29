import { cn } from '@/lib/utils'
import { useEffect, useRef, useState, PropsWithChildren, ReactNode, Dispatch, SetStateAction } from 'react'

interface ResizableHorizontalWrapperProps {
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
  storageKey?: string
  onResizeEnd?: (width: number) => void
  renderResizeHandle?: (handleMouseDown: (e: React.MouseEvent) => void, isResizing: boolean) => ReactNode
  position?: 'left' | 'right'
  isResizing: boolean
  setIsResizing: Dispatch<SetStateAction<boolean>>
}

export default function ResizableHorizontalWrapper({
  children,
  defaultWidth = 300,
  minWidth = 100,
  maxWidth = window.innerWidth,
  storageKey = 'resizable-panel-width',
  onResizeEnd,
  renderResizeHandle,
  position = 'right',
  isResizing,
  setIsResizing
}: PropsWithChildren<ResizableHorizontalWrapperProps>) {
  const [width, setWidth] = useState<number>(() => {
    const saved = localStorage.getItem(storageKey)
    return saved ? parseInt(saved, 10) : defaultWidth
  })
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      const delta = e.clientX - startXRef.current
      let newWidth = startWidthRef.current

      if (position === 'left') {
        newWidth = startWidthRef.current - delta
      } else {
        newWidth = startWidthRef.current + delta
      }

      newWidth = Math.min(Math.max(newWidth, minWidth), maxWidth)
      setWidth(newWidth)
    }

    const handleMouseUp = () => {
      if (isResizing) {
        localStorage.setItem(storageKey, String(width))
        onResizeEnd?.(width)
      }
      setIsResizing(false)
      document.body.style.userSelect = ''
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
    }
  }, [isResizing, width, minWidth, maxWidth, onResizeEnd, storageKey, position])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true)
    startXRef.current = e.clientX
    startWidthRef.current = width
    e.preventDefault()
  }

  const handlePositionClass =
    position === 'left' ? 'absolute top-0 left-0 h-full w-[4px]' : 'absolute top-0 right-0 h-full w-[4px]'

  return (
    <div style={{ width }} className="relative h-full flex-shrink-0 select-none z-100">
      {children}

      {/* Resize handle */}
      {renderResizeHandle ? (
        renderResizeHandle(handleMouseDown, isResizing)
      ) : (
        // <div
        //   onMouseDown={handleMouseDown}
        //   className={`${handlePositionClass} cursor-ew-resize flex items-center justify-center z-50`}
        // >
        //   <div className="w-[4px] h-full bg-[#0a0a0a]" />
        // </div>
        <div
          onMouseDown={handleMouseDown}
          className={cn(
            `${handlePositionClass} cursor-ew-resize flex items-center justify-center z-50 bg-[#0a0a0a] hover:bg-[#212127]`,
            isResizing ? 'bg-[#212127]' : 'bg-[#0a0a0a]',
          )}
        >
        </div>
      )}

      {isResizing && <div className="fixed inset-0 z-[9999] cursor-ew-resize" />}
    </div>
  )
}
