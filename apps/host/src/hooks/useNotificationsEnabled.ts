import { requestForToken } from '@/lib/firebase.ts'
import { useCallback, useEffect, useState } from 'react'
import { notificationClient } from '@/lib/gql/apollo-client.ts'
import { getActiveDeviceToken, registerTokenDevice } from '@services/notifications.service.ts'
import i18n from '@/i18n'
import { Platform, Provider } from '@/@generated/gql/graphql-notification.ts'
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { ServiceConfig } from '@/lib/gql/service-config.ts'

const sendTokenToBackend = async (token: string) => {
  const agent = await FingerprintJS.load()
  const userFingerprint = await agent.get()
  if (!ServiceConfig.token) {
    console.warn('ServiceConfig.token is not set, skipping token registration.')
    // save to localStorage to send later
    localStorage.setItem('registerToken', token)
    return
  }
  await notificationClient.mutate({
    mutation: registerTokenDevice,
    variables: {
      input: {
        appVersion: '1.0.0', // Replace with actual app version
        deviceName: window.navigator.userAgent,
        token: token,
        languageCode: i18n.language,
        platform: Platform.Web,
        provider: Provider.Fcm,
        fingerprint: userFingerprint.visitorId,
      },
    },
  })
}

let requestingPermission = false
const requestFCMTokenAndSendToBackend = async () => {
  const token = await requestForToken()
  if (requestingPermission) {
    console.log('FCM token already requested, skipping...')
    return null
  }
  requestingPermission = true
  if (token) {
    // Here you would typically send this token to your backend
    // await sendTokenToBackend(token);
    console.log('FCM token:', token)
    await sendTokenToBackend(token)
    return token
  }
  return null
}

export interface UseNotificationsEnabledOptions {
  onDenied?: (error: Error) => void
}

export const useNotificationsEnabled = (options?: UseNotificationsEnabledOptions) => {
  const { onDenied } = options || {}
  const [lastEnabled] = useState<boolean>(localStorage.getItem('notificationsEnabled') === 'true')
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    if ('Notification' in window) {
      return Notification.permission === 'granted'
    }
    return false
  })

  useEffect(() => {
    localStorage.setItem('notificationsEnabled', JSON.stringify(notificationsEnabled))
  }, [notificationsEnabled])

  useEffect(() => {
    // Check if notifications were not enabled before
    if (lastEnabled && !notificationsEnabled) {
      console.log('Notifications were previously enabled but are now disabled.')
      requestNotificationPermission()
    } else if (!lastEnabled && notificationsEnabled) {
      console.log('Notifications were not enabled before, requesting permission now.')
      requestNotificationPermission()
    }
  }, [lastEnabled, notificationsEnabled])

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      const currentPermission = Notification.permission
      if (currentPermission === 'denied') {
        console.log('Notifications are blocked. Please enable them in your browser settings.')
        onDenied?.(new Error('Notifications are blocked. Please enable them in your browser settings.'))
        setNotificationsEnabled(false)
        return
      }
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          setNotificationsEnabled(true)
          requestFCMTokenAndSendToBackend().then()
        } else {
          setNotificationsEnabled(false)
        }
      })
    }
  }

  return { notificationsEnabled, requestNotificationPermission }
}

export const useNotificationEnabledV2 = (options?: UseNotificationsEnabledOptions) => {
  const { onDenied } = options || {}
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    setEnabled(Notification.permission === 'granted')
  }, [])

  const requestNotificationPermission = useCallback(() => {
    Notification.requestPermission()
      .then((permission) => {
        setEnabled(permission === 'default')
      })
      .catch(() => {
        onDenied?.(new Error('Notifications are blocked. Please enable them in your browser settings.'))
      })
  }, [])

  return { notificationsEnabled: enabled, requestNotificationPermission }
}

const checkAndRegisterToken = async (token: string | null) => {
  if (!token) return
  const agent = await FingerprintJS.load()
  const userFingerprint = await agent.get()
  if (!ServiceConfig.token) return
  const res = await notificationClient.query({
    query: getActiveDeviceToken,
    variables: { input: { deviceToken: token, fingerprint: userFingerprint.visitorId } },
  })
  const registeredToken = res?.data?.getActiveDeviceToken?.token as string
  if (registeredToken === token) {
    console.log('Token is already registered:', token)
    return
  }
  const newToken = await requestFCMTokenAndSendToBackend()
  if (newToken) {
    console.log('New token registered:', newToken)
    localStorage.setItem('fcmToken', newToken)
  } else {
    console.warn('Failed to register new token.')
  }
}

export const useFCMToken = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('fcmToken')
    if (token) {
      setFcmToken(token)
    } else {
      console.log('Requesting FCM token...')
      // Check if the browser supports notifications
      if (!('Notification' in window)) {
        console.warn('This browser does not support notifications.')
        return
      }
      const currentPermission = Notification.permission
      if (currentPermission === 'denied') {
        console.warn('Notifications are blocked. Please enable them in your browser settings.')
        return
      }
      requestFCMTokenAndSendToBackend().then((token) => {
        if (token) {
          localStorage.setItem('fcmToken', token)
          setFcmToken(token)
        }
      })
    }
  }, [])

  useEffect(() => {
    checkAndRegisterToken(fcmToken)
  }, [fcmToken])

  return fcmToken
}
