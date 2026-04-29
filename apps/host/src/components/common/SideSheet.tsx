import { AnimatePresence, motion } from 'framer-motion'
import { ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

export interface SideSheetProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  direction?: 'left' | 'right' | 'none'
}

const SideSheet = (props: SideSheetProps) => {
  const { isOpen, onClose, children, direction = 'left' } = props

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'

      return () => {
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
          <motion.div
            className="fixed inset-0 z-[30] bg-[#12121432] drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ ease: 'easeInOut', duration: 0.25 }}
          />

          <div className="fixed inset-0 z-[40]" onClick={onClose}>
            <div className="size-full max-w-[786px] mx-auto overflow-x-hidden">
              <motion.div
                className={cn(
                  'h-full',
                  direction === 'left'
                    ? 'w-[85%] max-w-[400px] bg-[#141414] shadow-2xl drop-shadow-2xl'
                    : direction === 'right'
                      ? 'w-full bg-[#121212]'
                      : 'w-full bg-[#121212]',
                )}
                initial={{
                  x: direction === 'left' ? '-100%' : direction === 'right' ? '70%' : 0,
                  opacity: direction === 'none' ? 0 : 1,
                }}
                animate={{ 
                  x: 0,
                  opacity: 1,
                }}
                exit={{
                  x: direction === 'left' ? '-100%' : direction === 'right' ? '100%' : 0,
                  opacity: direction === 'none' ? 0 : 1,
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

export default SideSheet
