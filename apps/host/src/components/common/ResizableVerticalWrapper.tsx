import { cn } from '@/lib/utils'
import { useEffect, useRef, useState, PropsWithChildren, ReactNode } from 'react'

interface ResizableVerticalWrapperProps {
  defaultHeight?: number
  minHeight?: number
  maxHeight?: number
  storageKey?: string
  onResizeEnd?: (height: number) => void
  renderResizeHandle?: (handleMouseDown: (e: React.MouseEvent) => void, isResizing: boolean) => ReactNode
}

export default function ResizableVerticalWrapper({
  children,
  defaultHeight = 300,
  minHeight = 100,
  maxHeight = window.innerHeight,
  storageKey = 'resizable-panel-height',
  onResizeEnd,
  renderResizeHandle,
}: PropsWithChildren<ResizableVerticalWrapperProps>) {
  const [height, setHeight] = useState<number>(() => {
    const saved = localStorage.getItem(storageKey)
    return saved ? parseInt(saved, 10) : defaultHeight
  })
  const [isResizing, setIsResizing] = useState(false)
  const startYRef = useRef(0)
  const startHeightRef = useRef(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      const delta = e.clientY - startYRef.current
      const newHeight = Math.min(Math.max(startHeightRef.current + delta, minHeight), maxHeight)

      setHeight(newHeight)
      localStorage.setItem(storageKey, String(newHeight))
      onResizeEnd?.(newHeight)
    }

    const handleMouseUp = () => {
      if (isResizing) {
        onResizeEnd?.(height)
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
  }, [isResizing, height, maxHeight, minHeight, onResizeEnd, storageKey])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true)
    startYRef.current = e.clientY
    startHeightRef.current = height
    e.preventDefault()
  }

  return (
    <div style={{ height }} className="relative select-none">
      {children}

      {/* Resize handle */}
      {renderResizeHandle ? (
        renderResizeHandle(handleMouseDown, isResizing)
      ) : (
        <div
          onMouseDown={handleMouseDown}
          className={cn('z-50 w-full h-1 cursor-ns-resize flex items-center justify-center transition bg-[#0a0a0a] hover:bg-[#212127]', 
            isResizing ? 'bg-[#212127]' : 'bg-[#0a0a0a]'
          )}
        >
        </div>
      )}

      {isResizing && <div className="fixed inset-0 z-[9999] cursor-ns-resize" />}
    </div>
  )
}
