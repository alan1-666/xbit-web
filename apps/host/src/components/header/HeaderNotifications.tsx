import { APP_PATH } from '@/lib/constant.ts'
import { notificationClient } from '@/lib/gql/apollo-client.ts'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { IconNotifications } from '@components/icon/stroke/IconNotifications.tsx'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import { useNavigateWithLocation } from '@hooks/useNavigateWithLocation.ts'
import { getUnreadNotificationCount, toggleUnreadCountNotification } from '@services/notifications.service.ts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'; // Hoặc routing library bạn đang dùng

const useNotificationsCount = () => {
  const activeWallet = useActiveWallet()
  const { data } = useQuery({
    queryKey: ['notificationsCount', activeWallet?.walletAddress],
    queryFn: async () => {
      const { data } = await notificationClient.mutate({
        mutation: getUnreadNotificationCount,
      })
      return data?.getUnreadNotificationCount ?? 0
    },
    refetchInterval: 15000, // Refetch every 15 seconds
    enabled: activeWallet.isConnected,
  })
  return data
}

export const HeaderNotifications = () => {
  const navigate = useNavigateWithLocation()
  const location = useLocation()
  const unreadCount = useNotificationsCount()
  const activeWallet = useSelector(_activeWallet)

  const queryClient = useQueryClient()
  const { mutate } = useMutation({
    mutationKey: ['toggleUnreadCountNotification'],
    mutationFn: async (flag: boolean) => {
      const { data } = await notificationClient.mutate({
        mutation: toggleUnreadCountNotification,
        variables: { flag },
      })
      return data?.toggleUnreadCountNotification
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationsCount'] })
    },
  })

  const buildNavigationPath = () => {
    const currentParams = new URLSearchParams(location.search)

    if (currentParams.toString()) {
      return `${APP_PATH.MEME_NOTIFICATIONS}?${currentParams.toString()}&backHref=${location.pathname}`
    } else {
      return `${APP_PATH.MEME_NOTIFICATIONS}?backHref=${location.pathname}`
    }
  }
  const handleClick = () => {
    if (activeWallet.isConnected) {
      mutate(true)
    }
    navigate(buildNavigationPath())
  }

  if (!activeWallet.isConnected) return null

  return (
    <div className="relative pr-1 cursor-pointer" onClick={handleClick}>
      <IconNotifications />
      {!!unreadCount && unreadCount > 0 && (
        <div className="border boder-[#141414] min-w-5 rounded-full text-center text-white bg-[#FF3526] py-0.5 px-1 text-[calc(10rem/16)] leading-[calc(10rem/16)] absolute -top-1 -right-1.5">
          {unreadCount > 99 ? '99+' : unreadCount}
        </div>
      )}
    </div>
  )
}
