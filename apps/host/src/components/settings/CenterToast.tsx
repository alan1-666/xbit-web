import { ReactNode, RefObject, useImperativeHandle, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'

export interface CenterToastHandle {
  show: (element: ReactNode | string) => void
}

export interface CenterToastProps {
  ref: RefObject<CenterToastHandle | null>
}

export const CenterToast = (props: CenterToastProps) => {
  const { ref } = props
  const [show, setShow] = useState(false)
  const [children, setChildren] = useState<ReactNode | string>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useImperativeHandle(ref, () => {
    return {
      show: (element: ReactNode) => {
        setChildren(element)
        setShow(true)
        // Clear the previous toast, then show the new one
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
          setShow(false)
          setChildren(null)
        }, 2000)
      },
    }
  })

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="bg-[linear-gradient(43.83deg,#E843FE66_0%,#FFFFFF66_44.73%,#FFFFFF66_49.05%,#00FFCD66_103.57%)] rounded-[8px] p-[1px]">
            <div className="bg-[#232329] rounded-[8px] px-5 h-12 gap-2.5 flex items-center text-white">{children}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
