import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'
import { CheckIcon } from './icon'

interface VerificationSuccessToastProps {
  showModal: boolean
  setShowModal: (show: boolean) => void
  title?: string
  duration?: number
  className?: string
}

const VerificationSuccessToast = ({
  showModal,
  setShowModal,
  title = '验证成功',
  duration = 2000,
  className,
}: VerificationSuccessToastProps) => {
  useEffect(() => {
    if (!showModal) return

    const timer = setTimeout(() => {
      // setShowModal(false)
    }, duration)

    return () => clearTimeout(timer)
  }, [showModal, setShowModal, duration])

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent
        className={cn(
          'absolute bg-transparent z-50 w-[160px] max-w-[160px] p-0 shadow-xl !left-1/2 !top-1/2 !transform !-translate-x-1/2 !-translate-y-1/2 border-0',
          className,
        )}
        showDialogPrimitiveClose={false}
      >
        <svg
          width="calc(100% + 1px)"
          height="calc(100% + 1px)"
          viewBox="0 0 160 40"
          className="absolute inset-0"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="borderGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#72347E" />
              <stop offset="100%" stopColor="#207B6D" />
            </linearGradient>
          </defs>
          <rect
            x="0.5"
            y="0.5"
            width="159"
            height="39"
            rx="11.5"
            ry="11.5"
            fill="#232329"
            stroke="url(#borderGradient)"
            strokeWidth="1"
          />
        </svg>

        <div className="flex items-center gap-2 relative z-10 p-3 ">
          <CheckIcon />
          <DialogTitle className="text-white text-sm font-medium">{title}</DialogTitle>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default VerificationSuccessToast
