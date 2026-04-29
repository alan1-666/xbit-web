import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import OneSignal from 'react-onesignal'
import { toast } from 'sonner'
import { NotificationToastDescription } from '@components/common/notification/NotificationToastDescription.tsx'
import { useSubscription } from '@/lib/mqtt'
import { NotificationPayload } from '@/types/mqtt/NotificationPayload.ts'
import { useSelector } from 'react-redux'
import { _userInfo } from '@/redux/modules/newAuth.slice.ts'

const checkDisabledAutoDismiss = (templateCode: string) => {
  return ['deposit_wallet_success', 'deposit_wallet_pending', 'deposit_wallet_failed'].includes(templateCode)
}

/**
 * Subscribe to user-specific notification topic and display incoming notifications as toasts. Use for unsupported
 * browsers that don't support native OneSignal notifications, as a fallback to ensure users still receive important updates.
 * @param userId
 */
const useNotificationSubscription = (userId: string) => {
  const queryClient = useQueryClient()
  const isUnsupportedBrowser =
    OneSignal.Notifications.permissionNative === 'denied' || !OneSignal.User.PushSubscription.id
  const { message } = useSubscription(`users/${userId}/notifications`, {
    shouldSkip: !isUnsupportedBrowser,
  })
  useEffect(() => {
    if (!message || !message.message) return
    const notification = JSON.parse(message.message.toString()) as NotificationPayload
    const isDisabledAutoDismiss = checkDisabledAutoDismiss(notification.data.template_code)
    toast(notification.title, {
      description: <NotificationToastDescription body={notification.body} additionalData={notification.data} />,
      duration: isDisabledAutoDismiss ? Infinity : 5000,
      dismissible: true,
      closeButton: true,
    })
    queryClient.invalidateQueries({ queryKey: ['notificationsCount'] }).then(() => {})
  }, [message])
}

export const NotificationMqttSubscription = () => {
  const userInfo = useSelector(_userInfo)
  useNotificationSubscription(userInfo?.userId || '')
  return null
}
