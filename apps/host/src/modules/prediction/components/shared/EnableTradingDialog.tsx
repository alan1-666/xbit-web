import { useProxyWallet } from '../../hooks/useProxyWallet'
import { Dialog, DialogContent, DialogTitle } from '@components/ui/dialog.tsx'
import { Button } from '@components/ui/button.tsx'
import { useCreateExternalWalletMutation } from '@/modules/prediction/hooks/useCreateExternalWalletMutation.ts'
import { useEffect, useState } from 'react'
import SecurityCheckModal from '@components/auth/WalletBackup/SecurityCheckModal.tsx'

export const EnableTradingDialog = () => {
  const [open, setOpen] = useState(false)
  const proxyWallet = useProxyWallet()
  const mutation = useCreateExternalWalletMutation()
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!proxyWallet) {
      setOpen(true)
    }
  }, [proxyWallet])

  if (proxyWallet) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[350px]" showDialogPrimitiveClose={false}>
        <DialogTitle>Enable Trading</DialogTitle>
        <p className="text-sm text-gray-500 mb-2">Enable Trading to trade on KairoX.</p>
        <div className="flex items-center gap-2">
          <Button variant="close" className="rounded-full flex flex-1" onClick={() => setOpen(false)}>
            Later
          </Button>
          <Button
            variant="gradient"
            className="rounded-full"
            onClick={() => setShowModal(true)}
            disabled={mutation.isPending}
            isLoading={mutation.isPending}
          >
            Enable trading
          </Button>
        </div>
      </DialogContent>
      <SecurityCheckModal
        showModal={showModal}
        setShowModal={setShowModal}
        type="verifyAuth"
        onVerifyWallet={() => mutation.mutate()}
      />
    </Dialog>
  )
}
