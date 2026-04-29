import { authActions } from '@/redux/modules/auth.slice'
import { walletActions } from '@/redux/modules/wallet.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { isMobile } from 'react-device-detect'
import { TYPE_ACCOUNT } from '@/lib/blockchain'
import { APP_PATH } from '@/lib/constant'
import { useTranslation } from 'react-i18next'
import { ServiceConfig } from '@/lib/gql/service-config'
import ls from '@/lib/local-storage'

function TelegramCallbackHandler() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const isWalletConnected = useAppSelector((state) => state?.wallet?.wallets?.sol?.telegram?.isConnected)
  const loginAttemptedRef = useRef(false)
  const { t } = useTranslation()

  useEffect(() => {
    if (loginAttemptedRef.current) return

    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const userId = urlParams.get('user_id')

    if (code && userId) {
      loginAttemptedRef.current = true

      dispatch(
        authActions.loginByTG({
          userId: userId,
          code: code,
        }),
      )
        .then((res) => {
          if ((res as any)?.error?.message === 'Rejected') {
            toast.error(isWalletConnected ? t('status.accountAlreadyExist') : t('status.loginFail'))
            navigate('/')
            return
          }

          if (res?.meta?.requestStatus === 'fulfilled') {
            ServiceConfig.token = res.payload.loginByTelegram.accessToken
            dispatch(walletActions.getAccountInfo({}))
              .then(() => {
                toast.success(t('status.loginSuccess'))
                ls.set('meme_account', TYPE_ACCOUNT.TELEGRAM)
                dispatch(walletActions.setActiveAccount(TYPE_ACCOUNT.TELEGRAM))
              })
              .finally(() => {
                if (!isMobile) {
                  navigate('/')
                } else {
                  // navigate(`?code=${code}&user_id=${userId}`)
                  navigate(`${APP_PATH.MEME_DISCOVER}?code=${code}&user_id=${userId}`)
                }
              })
          } else {
            toast.error(t('status.loginFail'))
          }
        })
        .catch((error) => {
          console.error('[Login Telegram]: Error:', error)
          navigate('/')
        })
    } else {
      console.error('[Login Telegram]: Missing parameters')
      navigate('/')
    }
  }, [dispatch, navigate])

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-sm">{t('connectingToTelegram')}</p>
    </div>
  )
}

export default TelegramCallbackHandler
