import { NotificationItem } from '@components/notifications/NotificationItem.tsx'
import { useInfiniteQuery } from '@tanstack/react-query'
import { notificationClient } from '@/lib/gql/apollo-client.ts'
import { getNotificationsList } from '@services/notifications.service.ts'
import { Notification } from '@/@generated/gql/graphql-notification.ts'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { EmptyList } from '@components/discover/EmptyList.tsx'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '@components/ui/skeleton.tsx'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import { cn } from '@/lib/utils'
import { Loading } from '@components/common/Loading.tsx'

const useNotifications = () => {
  const { i18n } = useTranslation()
  const activeWallet = useActiveWallet()
  const { data, ...rest } = useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: async ({ pageParam }) => {
      const { data } = await notificationClient.query({
        query: getNotificationsList,
        variables: {
          input: {
            page: pageParam,
            pageSize: 20,
            languageCode: i18n.language,
            includePending: true, // Include pending notifications
          },
        },
      })
      return data.ListNotification ?? ([] as Notification[])
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 20) return undefined
      return allPages.length + 1
    },
    enabled: activeWallet.isConnected,
  })
  const notifications = useMemo(() => {
    if (!data) return []
    return data.pages.flatMap((page) => page)
  }, [data])
  return { notifications, ...rest }
}

export const NotificationList = ({ className, setOpenPoper }: { className?: string; setOpenPoper?: (value: boolean) => void }) => {
  const { notifications, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useNotifications()
  const lastItemRef = useRef(null)

  const fetchMoreNotifications = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return
    fetchNextPage().then()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && notifications.length > 0) {
          fetchMoreNotifications()
        }
      },
      { threshold: 1.0 },
    )
    if (lastItemRef.current) {
      observer.observe(lastItemRef.current)
    }
    return () => {
      if (lastItemRef.current) {
        observer.unobserve(lastItemRef.current)
      }
    }
  }, [fetchMoreNotifications])

  if (isLoading) {
    return (
      <div className="space-y-3 px-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="w-full h-24" />
        ))}
      </div>
    )
  }
  if (notifications.length === 0) return <EmptyList />
  return (
    <div className={cn('flex-1 overflow-y-auto no-scrollbar px-4 space-y-3 py-4', className)}>
      {notifications.map((notification, index) => (
        <NotificationItem
          ref={index === notifications.length - 1 ? lastItemRef : undefined}
          key={index}
          notification={notification}
          setOpenPoper={setOpenPoper}
        />
      ))}
      {hasNextPage && (
        <div className="flex justify-center items-center py-4">
          <Loading />
        </div>
      )}
    </div>
  )
}
