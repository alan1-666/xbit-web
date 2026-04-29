import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQuery } from '@apollo/client'
import ls from '@/lib/local-storage'
import { adminClient } from '@/lib/gql/apollo-client'
import { getAnnouncementPopups } from '@/services/admin.service'
import {
  AnnouncementPopup,
  AnnouncementPopupData,
  AnnouncementPopupFrequency,
  AnnouncementPopupStatus,
} from '@/@generated/gql/graphql-admin'
import { useTranslation } from 'react-i18next'

const STORAGE_KEY = 'xbit_announcement_data'

interface AnnouncementStorageData {
  seenIds: string[]
  dailySeen: Record<string, string>
}

// Get local date string (YYYY-MM-DD) based on device timezone
const getLocalDateString = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function useAnnouncementPopup() {
  const [open, setOpen] = useState(false)
  const [visiblePopups, setVisiblePopups] = useState<AnnouncementPopup[]>([])
  const { i18n } = useTranslation()
  const currentLang = i18n.language || 'en'

  // Fetch announcements from API
  const { data, loading } = useQuery(getAnnouncementPopups, {
    client: adminClient,
    fetchPolicy: 'no-cache',
  })

  // Filter active announcements and get highest priority one
  const activePopups = useMemo(() => {
    if (!data?.announcementPopups) return []

    const now = new Date()

    const filtered = data.announcementPopups
      .filter((popup: AnnouncementPopup) => {
        if (popup.status !== AnnouncementPopupStatus.Online) return false
        if (popup.startTime && new Date(popup.startTime) > now) return false
        if (popup.endTime && new Date(popup.endTime) < now) return false
        return true
      })
      .sort((a: AnnouncementPopup, b: AnnouncementPopup) => (b.priority || 0) - (a.priority || 0))

    // Only return the highest priority popup
    return filtered.length > 0 ? [filtered[0]] : []
  }, [data])

  // Get content for current language
  const getLocalizedContents = useCallback(
    (popup: AnnouncementPopup): AnnouncementPopupData[] => {
      const langData =
        popup.data?.find((d) => d.language === currentLang) ||
        popup.data?.find((d) => d.language === 'en') ||
        popup.data?.[0]

      return (langData?.contents || []).filter(Boolean) as AnnouncementPopupData[]
    },
    [currentLang]
  )

  // Check frequency and show popup
  useEffect(() => {
    if (loading || activePopups.length === 0) return

    const storageData: AnnouncementStorageData = ls.get(STORAGE_KEY) || {
      seenIds: [],
      dailySeen: {},
    }

    const today = getLocalDateString()
    let filtered: AnnouncementPopup[] = []

    activePopups.forEach((popup: AnnouncementPopup) => {
      const frequency = popup.frequency || AnnouncementPopupFrequency.Once

      if (frequency === AnnouncementPopupFrequency.Everytime) {
        filtered.push(popup)
      } else if (frequency === AnnouncementPopupFrequency.Daily) {
        if (storageData.dailySeen[popup.id] !== today) {
          filtered.push(popup)
        }
      } else {
        // ONCE
        if (!storageData.seenIds.includes(popup.id)) {
          filtered.push(popup)
        }
      }
    })

    if (filtered.length > 0) {
      setVisiblePopups(filtered)
      setOpen(true)
    }
  }, [loading, activePopups])

  const handleClose = useCallback(() => {
    setOpen(false)

    if (visiblePopups.length === 0) return

    const storageData: AnnouncementStorageData = ls.get(STORAGE_KEY) || {
      seenIds: [],
      dailySeen: {},
    }
    const today = getLocalDateString()
    let hasChanges = false

    visiblePopups.forEach((popup) => {
      const frequency = popup.frequency || AnnouncementPopupFrequency.Once

      if (frequency === AnnouncementPopupFrequency.Once) {
        if (!storageData.seenIds.includes(popup.id)) {
          storageData.seenIds.push(popup.id)
          hasChanges = true
        }
      } else if (frequency === AnnouncementPopupFrequency.Daily) {
        storageData.dailySeen[popup.id] = today
        hasChanges = true
      }
    })

    if (hasChanges) {
      ls.set(STORAGE_KEY, storageData)
    }
  }, [visiblePopups])

  return {
    open,
    popups: visiblePopups,
    getLocalizedContents,
    onClose: handleClose,
    loading,
  }
}
