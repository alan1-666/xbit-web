import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'
import { FailIcon } from './icon'

interface VerificationFailedToastProps {
  showModal: boolean
  setShowModal: (show: boolean) => void
  title?: string
  description?: string
  duration?: number
  className?: string
}

const VerificationFailedToast = ({
  showModal,
  setShowModal,
  title = '验证失败',
  description = '邮箱未注册,请先注册',
  duration = 3000,
  className,
}: VerificationFailedToastProps) => {
  useEffect(() => {
    if (!showModal) return

    const timer = setTimeout(() => {
      //   setShowModal(false)
    }, duration)

    return () => clearTimeout(timer)
  }, [showModal, setShowModal, duration])

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent
        className={cn(
          'relative bg-transparent w-[280px] max-w-[280px] p-0 shadow-xl !left-1/2 !top-1/2 !transform !-translate-x-1/2 !-translate-y-1/2 border-0',
          className,
        )}
        showDialogPrimitiveClose={false}
        style={{
          position: 'fixed',
          zIndex: 50,
        }}
      >
        <svg
          width="calc(100% + 1px)"
          height="calc(100% + 1px)"
          viewBox="0 0 280 120"
          className="absolute inset-0"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="failBorderGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#72347E" />
              <stop offset="100%" stopColor="#207B6D" />
            </linearGradient>
          </defs>
          <rect
            x="0.5"
            y="0.5"
            width="279"
            height="119"
            rx="11.5"
            ry="11.5"
            fill="#232329"
            stroke="url(#failBorderGradient)"
            strokeWidth="1"
          />
        </svg>

        <div className="flex flex-col items-center text-center relative z-10 p-2.5">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3">
            <FailIcon />
          </div>
          <DialogTitle className="text-white text-base font-medium mb-2">{title}</DialogTitle>

          {description && <p className="text-white/70 text-sm leading-5">{description}</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default VerificationFailedToast