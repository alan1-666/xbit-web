import HeaderWithBack from '@/components/header/HeaderWithBack'
import { TransferProvider } from '@/components/transfer/context/TransferContext'
import TransferForm from '@/components/transfer/TransferForm'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useCheckLoginOnArb } from '@/hooks/hyperliquid/useCheckLoginOnArb'
import { APP_PATH } from '@/lib/constant.ts'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

interface DialogCryptoDepositProps {
  open: boolean
  cryptoDepositSource: 'funding' | 'futures'
  setOpen: (open: boolean) => void
}

const DialogCryptoDeposit = ({ open, setOpen, cryptoDepositSource }: DialogCryptoDepositProps) => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className={cn('max-w-[768px] rounded-2xl px-0 min-h-[617px] py-0')} showDialogPrimitiveClose={false}>
        <HeaderWithBack
          title={t('assets.transfer')}
          className="justify-center bg-transparent py-0 border-b"
          titleClassName="ml-0"
          isHidenIconLeft
          right={
            <div
              className="font-medium text-[14px] leading-none cursor-pointer w-24 text-end"
              onClick={() => {
                navigate(APP_PATH.ASSETS + '?page=overview?tab=funds&type=TRANSFER')
                setOpen(false)
              }}
            >
              {t('assets.transfers.history')}
            </div>
          }
        />

        <TransferProvider isFutures={cryptoDepositSource === 'futures'}>
          <TransferForm source={cryptoDepositSource === 'futures' ? 'futures': 'funding'} onSuccess={() => setOpen(false)}/>
        </TransferProvider>
      </DialogContent>
    </Dialog>
  )
}

export default DialogCryptoDeposit
