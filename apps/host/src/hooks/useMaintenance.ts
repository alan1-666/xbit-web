import { MaintenanceStatus } from '@/@generated/gql/graphql-meme2'
import { TTL_MAINTENANCE } from '@/const/configs'
import { CACHE_KEY } from '@/lib/constant'
import { gqlMeme2 } from '@/lib/gql/apollo-client'
import { useSubscription } from '@/lib/mqtt'
import {
  dismissNotification,
  selectIsDismissed,
  setShouldShowMaintenanceNotification,
} from '@/redux/modules/maintenance.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { getSystemMaintenanceSchedule } from '@/services/tokens2.service'
import { calculateMaintenanceStatus } from '@/utils/maintenance'
import { getFromLocalStorageWithTTL, saveToLocalStorageWithTTL } from '@/utils/storage'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'

export const saveMaintenanceToLocal = (data: MaintenanceStatus) => {
  try {
    saveToLocalStorageWithTTL(CACHE_KEY.MAINTENANCE_SCHEDULE, data, TTL_MAINTENANCE)
  } catch (error) {
    console.error('Failed to save maintenance data to localStorage: ', error)
  }
}

export const getMaintenanceFromLocal = (): MaintenanceStatus | null => {
  try {
    return getFromLocalStorageWithTTL<MaintenanceStatus>(CACHE_KEY.MAINTENANCE_SCHEDULE)
  } catch (error) {
    console.error('Failed to get maintenance data from localStorage:', error)
    return null
  }
}

export const useMaintenance = () => {
  const [currentTime, setCurrentTime] = useState(Date.now())
  const dispatch = useAppDispatch()
  const isDismissed = useAppSelector(selectIsDismissed)
  const queryClient = useQueryClient()

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const {
    data: maintenanceData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['maintenance'],
    initialData: getMaintenanceFromLocal(),
    queryFn: async () => {
      try {
        const { data } = await gqlMeme2.query({
          query: getSystemMaintenanceSchedule,
          fetchPolicy: 'no-cache',
        })

        const maintenanceData = data.getSystemMaintenanceSchedule

        if (maintenanceData) {
          saveMaintenanceToLocal(maintenanceData)
        }

        return maintenanceData
      } catch (error) {
        console.error('Failed to fetch maintenance data:', error)
      }
    },
    staleTime: TTL_MAINTENANCE,
    refetchOnMount: true,
    refetchInterval: 60000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const { message } = useSubscription('public/maintenance_status_updated')

  useEffect(() => {
    if (message?.message) {
    try {
      let parsedData: MaintenanceStatus | null = null
      
      if (typeof message.message === 'string') {
        parsedData = JSON.parse(message.message)
      } else if (message.message instanceof Uint8Array) {
        const decoder = new TextDecoder()
        const jsonString = decoder.decode(message.message)
        parsedData = JSON.parse(jsonString)
      }

      if (parsedData) {
        queryClient.setQueryData(['maintenance'], parsedData)
        saveMaintenanceToLocal(parsedData)
      }
    } catch (error) {
      console.error('Failed to parse message:', error)
    }
  }
  }, [message])

  const handleDismiss = useCallback(() => {
    dispatch(dismissNotification())
  }, [dispatch])

  const maintenanceStatus = useMemo(() => {
    return calculateMaintenanceStatus(maintenanceData)
  }, [maintenanceData, currentTime])

  const calculatedShouldShowMaintenanceNotification = useMemo(() => {
    if (!maintenanceStatus.shouldShowNotification) return false
    if (!isDismissed && !maintenanceStatus.isInCriticalWarningPeriod) return true
    if (maintenanceStatus.isInCriticalWarningPeriod) return true
    return false
  }, [maintenanceStatus.shouldShowNotification, isDismissed, maintenanceStatus.isInCriticalWarningPeriod])

  useEffect(() => {
    dispatch(setShouldShowMaintenanceNotification(calculatedShouldShowMaintenanceNotification))
  }, [calculatedShouldShowMaintenanceNotification, dispatch])

  return {
    maintenanceData,
    isLoading,
    shouldShowNotification: maintenanceStatus.shouldShowNotification,
    shouldRedirectToMaintenance: maintenanceStatus.shouldRedirectToMaintenance,
    maintenanceStart: maintenanceStatus.fromTime,
    maintenanceEnd: maintenanceStatus.toTime,
    isInWarningPeriod: maintenanceStatus.isInWarningPeriod,
    isInMaintenancePeriod: maintenanceStatus.isInMaintenancePeriod,
    isInCriticalWarningPeriod: maintenanceStatus.isInCriticalWarningPeriod,
    handleDismiss,
    isDismissed,
  }
}
