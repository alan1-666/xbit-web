import HeaderWithBack from '@components/header/HeaderWithBack.tsx'
import { Button } from '@components/ui/button.tsx'
import { Ref, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils.ts'
import { isIOS, isMacOs } from 'react-device-detect'
import { ConfirmUnbindGoogleAuthDrawer } from '@components/settings/ConfirmUnbindGoogleAuthDrawer.tsx'
import { BaseBottomDrawerHandle } from '@components/settings/BaseBottomDrawer.tsx'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { APP_PATH } from '@/lib/constant.ts'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@apollo/client'
import { userSettings } from '@services/userSettings.service.ts'
import { userGqlClient } from '@/lib/gql/apollo-client.ts'
import { Skeleton } from '@components/ui/skeleton.tsx'

interface UnbindCompleteToastProps {
  ref?: Ref<any>
}

const UnbindCompleteToast = (props: UnbindCompleteToastProps) => {
  const { ref } = props
  const [show, setShow] = useState(false)
  const { t } = useTranslation()
  useImperativeHandle(ref, () => {
    return {
      open: () => {
        setShow(true)
        setTimeout(() => {
          setShow(false)
        }, 2000)
      },
    }
  })
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="text-white bg-[linear-gradient(43.83deg,#E843FE66_0%,#FFFFFF66_44.73%,#FFFFFF66_49.05%,#00FFCD66_103.57%)] relative rounded-[8px] p-[1px]">
            <div className="bg-[#232329] px-5 h-12 gap-2.5 flex items-center rounded-[8px]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12.001 1.33301C17.8919 1.33318 22.667 6.10907 22.667 12C22.6668 17.8908 17.8918 22.6658 12.001 22.666C6.11005 22.666 1.33416 17.8909 1.33398 12C1.33398 6.10896 6.10994 1.33301 12.001 1.33301ZM12.001 2.66699C6.84632 2.66699 2.66699 6.84534 2.66699 12C2.66708 17.1546 6.84637 21.333 12.001 21.333C17.1554 21.3329 21.3339 17.1545 21.334 12C21.334 6.84544 17.1555 2.66715 12.001 2.66699Z"
                  fill="white"
                />
                <path
                  d="M16.6424 8.69513C16.4471 8.49987 16.1306 8.49987 15.9353 8.69513L11.1951 13.4354C10.9998 13.6306 10.6832 13.6306 10.488 13.4354L8.26188 11.2093C8.06661 11.014 7.75003 11.014 7.55477 11.2093L7.14447 11.6196C6.94921 11.8149 6.94921 12.1314 7.14447 12.3267L10.1344 15.3166C10.5249 15.7071 11.1581 15.7071 11.5486 15.3166L17.0527 9.81254C17.248 9.61728 17.248 9.30069 17.0527 9.10543L16.6424 8.69513Z"
                  fill="white"
                />
              </svg>
              <span>{t('appSettings.googleAuth.unlinkToast')}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const GoogleAuthenticatorPage = () => {
  const unbindRef = useRef<BaseBottomDrawerHandle>(null)
  const toastRef = useRef<any>(null)
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { data, loading, refetch } = useQuery(userSettings, {
    client: userGqlClient,
  })

  const bound = useMemo(() => {
    return data?.userSettings?.googleAuthenticator?.isEnabled
  }, [data])

  const handleDownloadApp = () => {
    if (isIOS || isMacOs) {
      window.open('https://apps.apple.com/app/google-authenticator/id388497605', '_blank')
    } else {
      window.open('https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2', '_blank')
    }
  }

  const handleBind = () => {
    navigate(APP_PATH.MEME_SETTINGS_CONNECT_GOOGLE_AUTH)
  }

  const handleUnbind = () => {
    unbindRef.current?.open()
  }

  const handleConfirmUnbind = () => {
    toastRef.current?.open()
    refetch()
  }

  const handleResetGoogleAuth = () => {
    navigate(APP_PATH.MEME_SETTINGS_RESET_GOOGLE_AUTH)
  }

  return (
    <div className="w-full h-dvh">
      <HeaderWithBack title={t('appSettings.googleAuth.title')} className="bg-transparent" />
      <div className="flex flex-col py-10 items-center px-4 text-center">
        <img src="/images/settings/google-authenticator.svg" alt="Google Authenticator" className="w-44 md:w-64" />
        <div className="text-[calc(15rem/16)] text-[#FFFFFF] mt-6">{t('appSettings.googleAuth.app')}</div>
        <div className="text-[calc(14rem/16)] text-[#FFFFFFCC] mt-1">{t('appSettings.googleAuth.guide')}</div>
        {loading ? (
          <Skeleton className="h-6 w-20 mt-2" />
        ) : (
          <div
            className={cn(
              'px-4 py-1.5 rounded-full mt-2 text-[calc(12rem/16)] leading-[calc(12rem/16)]',
              !bound ? 'bg-[#00FFB4] text-black' : 'bg-[#ECECED1F] text-white',
            )}
          >
            {bound ? t('appSettings.googleAuth.linked') : t('appSettings.googleAuth.notLinked')}
          </div>
        )}
      </div>
      {loading ? (
        <div className="absolute inset-x-0 bottom-6 px-3 grid grid-cols-2 gap-3 pt-4 border-t">
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
        </div>
      ) : (
        <div className="absolute inset-x-0 bottom-6 px-3 grid grid-cols-2 gap-3 pt-4 border-t">
          {!bound ? (
            <>
              <Button variant="borderGradient" className="rounded-full" onClick={handleDownloadApp}>
                {t('appSettings.googleAuth.download')}
              </Button>
              <Button variant="gradient" className="rounded-full text-[#141414]" onClick={handleBind}>
                {t('appSettings.googleAuth.linkNow')}
              </Button>
            </>
          ) : (
            <>
              <Button variant="borderGradient" className="rounded-full" onClick={handleResetGoogleAuth}>
                {t('appSettings.googleAuth.reset')}
              </Button>
              <Button variant="gradient" className="rounded-full text-[#141414]" onClick={handleUnbind}>
                {t('appSettings.googleAuth.unlink')}
              </Button>
            </>
          )}
        </div>
      )}
      <ConfirmUnbindGoogleAuthDrawer ref={unbindRef} onConfirm={handleConfirmUnbind} />
      <UnbindCompleteToast ref={toastRef} />
    </div>
  )
}
