import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@components/ui/button.tsx'
import { NEW_TYPE_ACCOUNT } from '@/lib/blockchain'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog'
import { newAuthActions } from '@/redux/modules/newAuth.slice'
import { newWalletActions } from '@/redux/modules/newWallet.slice'
import { useTurnkey } from '@turnkey/sdk-react'
import { useDisconnect } from 'wagmi'
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react'
import { logoutWithTurnkey } from '@/services/auth.service'
import ls from '@/lib/local-storage'
import { modal } from '@reown/appkit/react'

const PopupConfirmDisconnected = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const activeAccount = useAppSelector((state) => state.newWallet.activeAccount)
  const { indexedDbClient } = useTurnkey()
  const { disconnect: disconnectEvm } = useDisconnect()
  const solanaWallet = useSolanaWallet()
  const turnkeyUserId = useAppSelector((state) => state.newWallet.turnkeyUserId)

  const onClickDisConnected = async () => {
    // reset turnkey client
    await logoutWithTurnkey(indexedDbClient, turnkeyUserId) // clear turnkey data
    await indexedDbClient?.clear() // clear indexedDB data

    dispatch(
      newAuthActions.logout({
        activeAccount: activeAccount,
      }),
    )
    dispatch(newWalletActions.logoutWallet({}))
    modal?.disconnect()
    // await indexedDbClient?.resetKeyPair()
    ls.remove('run-once-logined')
    if (activeAccount === NEW_TYPE_ACCOUNT.WALLET) {
      disconnectEvm()
      solanaWallet.disconnect()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[335px] bg-[#232329] rounded-2xl p-5">
        <DialogTitle></DialogTitle>
        <DialogHeader>
          <p className="text-center text-lg leading-none font-medium py-3">{t('wallet.confirmDisconnect')}</p>
          <div className="flex justify-center items-center flex-row gap-2.5 mt-4">
            <Button variant="close" className="flex-1" onClick={() => setOpen(false)}>
              {t('login.cancel')}
            </Button>
            <Button
              variant="gradient"
              className="text-[#261236] flex-1 rounded-[50px]"
              onClick={() => onClickDisConnected()}
            >
              {t('toast.confirm')}
            </Button>
          </div>
        </DialogHeader>
        <DialogDescription />
      </DialogContent>
    </Dialog>
  )
}

export default PopupConfirmDisconnected
