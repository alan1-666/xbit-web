import VerificationFailedToast from './VerificationFailedToast'
import VerificationSuccessToast from './VerificationSuccessToast'
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog'
import { X } from 'lucide-react'
import { useState } from 'react'

interface SecurityCheckModalProps {
  showModal: boolean
  setShowModal: (show: boolean) => void
  onContinue?: () => void
  onVerifyWallet?: () => void
}

const SecurityCheckModal = ({ showModal, setShowModal, onContinue, onVerifyWallet }: SecurityCheckModalProps) => {
  const [showVerificationFailedToast, setShowVerificationFailedToast] = useState(false)
  const [showVerificationSuccessToast, setShowVerificationSuccessToast] = useState(false)

  const handleContinue = () => {
    if (onContinue) {
      onContinue()
    }
    setShowVerificationSuccessToast(true)
    setShowModal(false)
  }

  const handleVerifyWallet = () => {
    if (onVerifyWallet) {
      onVerifyWallet()
    }
    setShowVerificationFailedToast(true)
  }

  return (
    <>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent
          className="bg-[url(/images/bg-drawer-gradient.png)] bg-cover border-none !rounded-2xl w-[334px] p-0 shadow-xl !left-1/2 !top-1/2 !transform !-translate-x-1/2 !-translate-y-1/2"
          showDialogPrimitiveClose={false}
          style={{
            position: 'fixed',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 50,
          }}
        >
          <button
            onClick={() => setShowModal(false)}
            className="absolute right-3 top-3 p-1 rounded-full text-white/60 hover:text-white/80 transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="px-6 py-6 flex flex-col">
            <DialogTitle className="text-white text-lg font-medium text-center mb-6 mt-2">安全检查</DialogTitle>

            <button
              onClick={handleContinue}
              style={{
                border: '0.5px solid var(--colors-alpha-dark-100, color(display-p3 0.9255 0.9255 0.9294 / 0.12))',
              }}
              className="w-full bg-[#ECECED]/12 text-white rounded-full px-4 py-3 mb-5 flex items-center justify-center gap-3 transition-colors text-sm"
            >
              <img src="/images/google-logo-connect.svg" alt="Google Logo" className="h-4 w-4" />
              <span className="text-center font-medium">谷歌 Continue with Google</span>
            </button>

            <div className="border-t border-[#565656] mb-5 border-dashed"></div>

            <div
              onClick={handleVerifyWallet}
              className="w-full text-[#F23F58] text-center py-3 hover:text-[#FF5A73] transition-colors text-sm font-medium"
            >
              请验证您的钱包
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <VerificationFailedToast
        showModal={showVerificationFailedToast}
        setShowModal={setShowVerificationFailedToast}
        title="验证失败"
        description="邮箱未注册,请先注册"
      />

      <VerificationSuccessToast
        showModal={showVerificationSuccessToast}
        setShowModal={setShowVerificationSuccessToast}
        title="验证成功"
      />
    </>
  )
}

export default SecurityCheckModal
