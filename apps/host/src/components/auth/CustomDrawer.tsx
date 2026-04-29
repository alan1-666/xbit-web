import React, { useEffect, useState, useRef } from 'react'
import ReactDOM from 'react-dom'

interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  height?: number | string
}

export default function CustomDrawer({ open, onOpenChange, children, height = '100dvh' }: DrawerProps) {
  const [isVisible, setIsVisible] = useState(open)
  const [isClosing, setIsClosing] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setIsVisible(true)
      setIsClosing(false)
    } else if (isVisible) {
      setIsClosing(true)
    }
  }, [open])

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        startClose()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isVisible])

  function startClose() {
    setIsClosing(true)
  }

  function onAnimationEnd() {
    if (isClosing) {
      setIsVisible(false)
      setIsClosing(false)
      onOpenChange(false)
    }
  }

  if (!isVisible) return null

  return ReactDOM.createPortal(
    <>
      {/* Overlay */}
      <div
        onClick={startClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          zIndex: 49,
          animation: isClosing ? 'fadeOutOverlay 0.24s forwards' : 'fadeInOverlay 0.24s forwards',
        }}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        onAnimationEnd={onAnimationEnd}
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          height,
          maxHeight: '100dvh',
          boxShadow: '0 -4px 10px rgba(0,0,0,0.2)',
          zIndex: 50,
          overflowY: 'auto',
          animation: isClosing ? 'slideDownDrawer 0.24s forwards' : 'slideUpDrawer 0.24s forwards',
        }}
        className="relative max-w-[768px] mx-auto bg-[#0a0a0a]"
      >
        <img
          src="/images/icons/icon-x.svg"
          className="w-6 h-6 cursor-pointer"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'transparent',
            border: 'none',
            color: '#ccc',
            fontSize: 24,
            cursor: 'pointer',
            lineHeight: 1,
            padding: 0,
          }}
          onClick={startClose}
          alt=""
        />

        <div className="pt-12 w-full h-dvh">{children}</div>
      </div>

      <style>
        {`
          @keyframes slideUpDrawer {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          @keyframes slideDownDrawer {
            from { transform: translateY(0); }
            to { transform: translateY(100%); }
          }
          @keyframes fadeInOverlay {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fadeOutOverlay {
            from { opacity: 1; }
            to { opacity: 0; }
          }
        `}
      </style>
    </>,
    document.body,
  )
}
