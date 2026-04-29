import { useActiveWallet } from '@/hooks/useActiveWallet'
import { notificationClient } from '@/lib/gql/apollo-client'
import { ServiceConfig } from '@/lib/gql/service-config'
import { cn } from '@/lib/utils'
import DialogNotificationsSettings from '@/pages/settings/dialog-notifications-settings'
import { getUnreadNotificationCount, toggleUnreadCountNotification } from '@/services/notifications.service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IconNotifications } from '../icon/stroke/IconNotifications'
import { NotificationList } from '../notifications/NotificationList'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

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

const HeaderNotifications = () => {
  const { t } = useTranslation()
  const unreadCount = useNotificationsCount()
  const [openPoper, setOpenPoper] = useState(false)

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

  const handleClick = () => {
    if (ServiceConfig.token) {
      mutate(true)
    }
  }

  if (!ServiceConfig.token) return null

  return (
    <>
      <Popover
        open={openPoper}
        onOpenChange={(e) => {
          if (e) {
            handleClick()
          }
          setOpenPoper(e)
        }}
      >
        <PopoverTrigger asChild>
          <div
            role="button"
            aria-label="Notifications"
            className="relative flex border-[0.5px] border-[#79778C29] bg-[#212127] size-[34px] rounded-full items-center justify-center cursor-pointer"
            onClick={() => setOpenPoper(!openPoper)}
          >
            <IconNotifications className='text-[#CACACA]'/>
            {!!unreadCount && unreadCount > 0 && (
              <div className="border boder-[#141414] min-w-5 rounded-full text-center text-white bg-[#FF3526] py-0.5 px-1 text-[calc(10rem/16)] leading-[calc(10rem/16)] absolute -top-1 -right-1.5">
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="px-0 py-2 max-w-lg w-lg" sideOffset={10}>
          <div className={cn('flex items-center justify-between py-4 w-full relative')}>
            <button className="w-[70px]" />
            <div className={cn('text-lg font-normal text-center flex-1')}>{t('notifications.title')}</div>
            <DialogNotificationsSettings />
          </div>

          <div className="h-[450px] overflow-auto">
            <NotificationList className="h-[450px]" setOpenPoper={setOpenPoper} />
          </div>
        </PopoverContent>
      </Popover>
    </>
  )
}

export default HeaderNotifications
