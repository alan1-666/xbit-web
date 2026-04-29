import OneSignal, { NotificationForegroundWillDisplayEvent } from 'react-onesignal'
import { useEffect, useState } from 'react'
import { Configs } from '@const/configs.ts'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { _userInfo } from '@/redux/modules/newAuth.slice.ts'
import { useTranslation } from 'react-i18next'
import { NotificationToastDescription } from '@components/common/notification/NotificationToastDescription.tsx'
import { isSafari } from 'react-device-detect'
import ls from '@/lib/local-storage'
import { v4 as uuid } from 'uuid'

const oneSignalLanguageMap: Record<string, string> = {
  hk: 'zh-Hant',
  en: 'en',
  vi: 'vi',
  hi: 'hi',
  zh: 'zh',
}

const getDeviceId = () => {
  const deviceId = ls.get('onesignal_device_id')
  if (!deviceId) {
    const newDeviceId = uuid()
    ls.set('onesignal_device_id', newDeviceId)
    return newDeviceId
  }
  return deviceId
}

export const NotificationConfig = () => {
  const queryClient = useQueryClient()
  const userInfo = useSelector(_userInfo)
  const [initialized, setInitialized] = useState(false)
  const { i18n } = useTranslation()

  // Validate if notification should not close automatically based on template code
  // dismissible notifications: deposit_wallet_success, deposit_wallet_pending, deposit_wallet_failed
  const checkDisabledAutoDimiss = (additionalData: any) => {
    const templateCode = additionalData?.template_code
    return ['deposit_wallet_success', 'deposit_wallet_pending', 'deposit_wallet_failed'].includes(templateCode)
  }

  useEffect(() => {
    const listener = async (event: NotificationForegroundWillDisplayEvent) => {
      const notification = event.notification
      console.log('notification', notification)
      const isDisabledAutoDismiss = checkDisabledAutoDimiss(notification.additionalData)
      // TODO: customize notification display
      toast(notification.title, {
        description: (
          <NotificationToastDescription body={notification.body} additionalData={notification.additionalData} />
        ),
        duration: isDisabledAutoDismiss ? Infinity : 5000,
        dismissible: true,
        closeButton: true,
      })
      queryClient.invalidateQueries({ queryKey: ['notificationsCount'] }).then(() => {})
    }

    OneSignal.init({
      appId: Configs.oneSignalAppId(),
      allowLocalhostAsSecureOrigin: true,
      autoResubscribe: true,
    }).then(() => {
      setInitialized(true)
      OneSignal.Notifications.addEventListener('foregroundWillDisplay', listener)
    })

    if (!OneSignal.Notifications.permission) {
      if (!isSafari && 'Notification' in window) {
        Notification.requestPermission().then(() => {})
      }
    }

    // Cleanup firebase-messaging-sw from old versions
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          if (registration.active?.scriptURL.includes('firebase-messaging-sw.js')) {
            registration.unregister().then(() => {
              console.log('Old firebase service worker unregistered')
            })
          }
        })
      })
    }

    return () => {
      OneSignal.Notifications.removeEventListener('foregroundWillDisplay', listener)
    }
  }, [])

  useEffect(() => {
    const userId = userInfo?.userId
    if (!initialized) return
    if (userId) {
      const deviceId = getDeviceId()
      const uniqueId = `${userId}-${deviceId}`
      OneSignal.login(uniqueId).then(() => {
        ls.set('onesignal_unique_id_v2', uniqueId)
      })
      OneSignal.User.addTag('xbit_user_id', userId)
    } else {
      OneSignal.logout().then(() => {
        ls.remove('onesignal_unique_id_v2')
      })
    }
  }, [userInfo, initialized])

  useEffect(() => {
    if (!initialized) return
    const oneSignalLang = oneSignalLanguageMap[i18n.language] || i18n.language
    OneSignal.User.setLanguage(oneSignalLang)
  }, [i18n.language, initialized])

  return null
}
