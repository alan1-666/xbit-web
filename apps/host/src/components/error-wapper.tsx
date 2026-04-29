import eventBus from '@/lib/eventBus'
import { _getRefreshTokenActiveAccount } from '@/redux/modules/auth.slice'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useActiveAccount } from '@/hooks/useActiveAccount'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { newAuthActions } from '@/redux/modules/newAuth.slice'
import { newWalletActions } from '@/redux/modules/newWallet.slice'
import { useTurnkey } from '@turnkey/sdk-react'
import { NEW_TYPE_ACCOUNT } from '@/lib/blockchain'
import { logoutWithTurnkey } from '@/services/auth.service'
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react'
import { modal } from '@reown/appkit/react'

interface ErrorOptions {
  message: string
  code?: string
}

export const EVENT_MESSAGE_ERROR = 'EVENT_MESSAGE_ERROR'
export const EVENT_MESSAGE_REFRESH_TOKEN = 'EVENT_MESSAGE_REFRESH_TOKEN'
export const EVENT_MESSAGE_FORCE_LOGOUT = 'EVENT_MESSAGE_FORCE_LOGOUT'

export default function ErrorWrapper() {
  const ref = useRef(0)
  const { t } = useTranslation()
  const [showAlert, setShowAlert] = useState(false)
  const activeAccount = useActiveAccount()
  const dispatch = useAppDispatch()
  const { indexedDbClient } = useTurnkey()
  const solanaWallet = useSolanaWallet()
  const turnkeyUserId = useAppSelector((state) => state.newWallet.turnkeyUserId)

  useEffect(() => {
    // const handleErrorEvent = (data: any) => {
    //   if (data?.data) {
    //     const error = data?.data as ErrorOptions
    //     if (error.code === 'ErrAccessTokenInvalid') {
    //       if (ref.current === 0) {
    //         getRefreshTokenFunc()
    //         // setShowAlert(true)
    //         ref.current = 1
    //       }
    //     }
    //   }
    // }

    const handleRefreshToken = (data: any) => {
      if (data?.data) {
        dispatch(
          newAuthActions.updateRefreshToken({
            activeAccount: activeAccount,
            accessToken: data?.data,
          }),
        )
      }
    }

    const handleForceLogout = (data: any) => {
      if (!!data?.data?.isForceLogout) {
        setShowAlert(true)
        onClickDisConnected()
      }
    }

    // eventBus.on(EVENT_MESSAGE_ERROR, handleErrorEvent)
    eventBus.on(EVENT_MESSAGE_REFRESH_TOKEN, handleRefreshToken)
    eventBus.on(EVENT_MESSAGE_FORCE_LOGOUT, handleForceLogout)

    return () => {
      eventBus.remove(EVENT_MESSAGE_REFRESH_TOKEN)
    }
  }, [])

  const onClickDisConnected = async () => {
    // reset turnkey client
    await logoutWithTurnkey(indexedDbClient, turnkeyUserId)
    await indexedDbClient?.clear()
    dispatch(
      newAuthActions.logout({
        activeAccount: activeAccount,
      }),
    )
    dispatch(newWalletActions.logoutWallet({}))
    modal?.disconnect()

    // await indexedDbClient?.resetKeyPair()
    if (activeAccount === NEW_TYPE_ACCOUNT.WALLET) {
      solanaWallet.disconnect()
    }
  }

  return (
    <Dialog
      open={showAlert}
      onOpenChange={(open) => {
        setShowAlert(open)
        if (!open) window.location.reload()
      }}
    >
      <DialogContent className="w-[320px] bg-[#232329] rounded-2xl p-5" showDialogPrimitiveClose={false}>
        <div className="text-lg leading-[1.2] font-medium text-center">{t('login.tokenExpired')}</div>
        <div className="mt-2 flex justify-center items-center">
          <Button
            variant="gradient"
            className="text-[#261236] flex-1 rounded-[50px]"
            onClick={() => {
              window.location.reload()
              // onClickDisConnected()
            }}
          >
            {t('button.reload')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
