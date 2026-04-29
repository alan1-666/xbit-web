import { AnimatePresence, motion } from 'framer-motion'
import { ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

export interface AppSettingsPortalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  direction?: 'left' | 'right'
  isFullWidth?: boolean
}

export const AppSettingsPortal = (props: AppSettingsPortalProps) => {
  const { isOpen, onClose, children, direction = 'left', isFullWidth = false } = props

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  // 防止移动端滚动穿透问题
  useEffect(() => {
    if (isOpen) {
      // 锁定滚动位置
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'

      return () => {
        // 恢复滚动
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-[30] bg-[#12121432] drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ ease: 'easeInOut', duration: 0.25 }}
          />

          <div className="fixed inset-0 z-[40]" onClick={onClose}>
            <div className="size-full max-w-[786px] bg-[#0A0A0A] mx-auto overflow-x-hidden">
              <motion.div
                className={cn(
                  'min-h-full',
                  direction === 'left'
                    ? `${isFullWidth ? 'w-full' : 'w-[85%] max-w-[400px]'} shadow-2xl drop-shadow-2xl`
                    : 'w-full',
                )}
                initial={{
                  x: direction === 'left' ? '-100%' : '70%',
                }}
                animate={{ x: 0 }}
                exit={{
                  x: direction === 'left' ? '-100%' : '100%',
                }}
                transition={{ ease: 'easeInOut', duration: 0.25 }}
                onClick={(event) => {
                  event.stopPropagation()
                  event.preventDefault()
                }}
              >
                {children}
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}
