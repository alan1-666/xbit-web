import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@components/ui/dialog.tsx'
import { Button } from '@components/ui/button.tsx'
import { useTranslation } from 'react-i18next'
import { newAuthActions } from '@/redux/modules/newAuth.slice.ts'
import { newWalletActions } from '@/redux/modules/newWallet.slice.ts'
import { NEW_TYPE_ACCOUNT } from '@/lib/blockchain.ts'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { useTurnkey } from '@turnkey/sdk-react'
import { useDisconnect } from 'wagmi'
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react'
import ls from '@/lib/local-storage'
import { toast } from 'sonner'
import { IconCheckCircle } from '@components/icon/stroke/IconCheckCircle.tsx'
import { clearAllSlice } from '@/redux/modules/userPosition.Slice'
import { clearUserPositionCache } from '@/utils/indexedDB/userPositionDB'
import { setFavorites } from '@/redux/modules/symbolList.slide'
import { logoutWithTurnkey } from '@/services/auth.service'
import { clearSymbolListCache } from '@/utils/indexedDB/symbolListDB'
import { modal } from '@reown/appkit/react'
import { useSession, useDisconnect as useDisconnectWC } from '@walletconnect/modal-sign-react'
import { cleanXWalletsFavourite } from '@/hooks/useGetTotalFollowingAddress'
import { useActiveChainType } from '@/hooks/useActiveChain'
import { useState } from 'react'
import { APP_PATH } from '@/lib/constant'
import { useNavigate } from 'react-router-dom'
import { BACK_UP_MNEMONIC_STORAGE_KEY, NOTICE_DEPRECATED_STORAGE_KEY } from '@const/configs.ts'
import { trackUserLoggedOut } from '@/services/google-analytics.service'

export interface LogoutDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export const LogoutDialog = (props: LogoutDialogProps) => {
  const { open, setOpen } = props
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const activeAccount = useAppSelector((state) => state.newWallet.activeAccount)
  const { indexedDbClient } = useTurnkey()
  const { disconnect: disconnectEvm } = useDisconnect()
  const solanaWallet = useSolanaWallet()
  const turnkeyUserId = useAppSelector((state) => state.newWallet.turnkeyRootUserId)
  const session = useSession()
  const activeChainType = useActiveChainType()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { disconnect } = useDisconnectWC({
    topic: session?.topic,
    reason: { code: 6000, message: 'User disconnected' },
  })
  const navigate = useNavigate()
  const onClickDisConnected = async () => {
    setIsLoading(true)
    // reset turnkey client
    await logoutWithTurnkey(indexedDbClient, turnkeyUserId) // clear turnkey data
    await indexedDbClient?.clear() // clear indexedDB data

    dispatch(
      newAuthActions.logout({
        activeAccount: activeAccount,
      }),
    )
    dispatch(newWalletActions.logoutWallet({}))
    toast.info(t('toast.disconnected'), { icon: <IconCheckCircle className="size-4" /> })
    modal?.disconnect()

    // await indexedDbClient?.resetKeyPair()
    ls.remove('run-once-logined')
    if (activeAccount === NEW_TYPE_ACCOUNT.WALLET) {
      disconnectEvm()
      solanaWallet.disconnect()
    }
    setIsLoading(false)
    setOpen(false)
    await clearUserPositionCache()
    await clearSymbolListCache()
    dispatch(setFavorites([]))
    dispatch(clearAllSlice())
    if (session) {
      disconnect({
        topic: session?.topic,
        reason: { code: 6000, message: 'User disconnected' },
      })
    }
    cleanXWalletsFavourite(activeChainType)
    // clear local storage
    // localStorage.clear()
    // mobile
    ls.remove('asset_chain_id')
    ls.remove('asset_wallet_address')
    ls.remove('asset_hide_balance')
    // pc
    ls.remove('asset_meme_chain')
    ls.remove('asset_meme_wallet')
    localStorage.removeItem('portfolio')
    localStorage.removeItem('detailHolders')
    localStorage.removeItem('quickBuyAmount')
    localStorage.removeItem('tokenPricesData')
    localStorage.removeItem(NOTICE_DEPRECATED_STORAGE_KEY)
    localStorage.removeItem(BACK_UP_MNEMONIC_STORAGE_KEY)
    // navigate(APP_PATH.LOGIN)
    trackUserLoggedOut()
    ls.remove('redpacket.activityHistory')
    ls.remove('redpacket.redpacketStatus')
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[335px] bg-[#232329] rounded-2xl p-5">
        <DialogTitle></DialogTitle>
        <DialogHeader>
          <p className="text-center text-lg leading-none font-medium py-3">{t('appSettings.logout.title')}</p>
          <div className="flex justify-center items-center flex-row gap-2.5 mt-4">
            <Button variant="close" className="flex-1" onClick={() => setOpen(false)}>
              {t('login.cancel')}
            </Button>
            <Button
              variant="gradient"
              className="text-[#261236] flex-1 rounded-[50px]"
              onClick={() => onClickDisConnected()}
              isLoading={isLoading}
            >
              {t('appSettings.logout.confirm')}
            </Button>
          </div>
        </DialogHeader>
        <DialogDescription />
      </DialogContent>
    </Dialog>
  )
}
