import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { NAVIGATIONS } from '@/lib/navigations'
import { useCryptoEvents } from '@/modules/prediction/hooks/useCryptoEvents'
import { EventModel } from '@/modules/prediction/models/EventModel'

const STORAGE_KEY = 'prediction.recentEvent'
const LEGACY_STORAGE_KEY = 'prediction.recentEventSlug'

export interface StoredEventData {
  event?: EventModel
  slug?: string
}

const getStoredData = (): StoredEventData | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as StoredEventData
      if (parsed && (parsed.event || parsed.slug)) return parsed
    }
    const legacySlug = sessionStorage.getItem(LEGACY_STORAGE_KEY)
    if (legacySlug) {
      sessionStorage.removeItem(LEGACY_STORAGE_KEY)
      return { slug: legacySlug }
    }
    return null
  } catch {
    return null
  }
}

const persistStoredData = (data: StoredEventData): void => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving recentEvent to sessionStorage:', error)
  }
}

/** Find BTC event from crypto 15m list (slug contains btc or bitcoin) */
const findBtcEvent = (events: EventModel[]): EventModel | undefined => {
  if (!events?.length) return undefined
  const btc = events.find(
    (e) =>
      e.slug?.toLowerCase().includes('btc') || e.slug?.toLowerCase().includes('bitcoin'),
  )
  return btc ?? events[0]
}

/**
 * Hook for prediction bottom nav data processing.
 * Default: BTC crypto live 15m. Stores full event object.
 * Only fetches when: no valid stored event, or stored event has ended.
 */
export const usePredictionBottomNavData = () => {
  const { pathname } = useLocation()
  const [storedData, setStoredDataState] = useState<StoredEventData | null>(() =>
    typeof window !== 'undefined' ? getStoredData() : null,
  )

  const currentEventSlug = useMemo(() => {
    const match = pathname.match(/\/event\/([^/?]+)/)
    return match ? match[1] : null
  }, [pathname])

  const shouldFetch = useMemo(() => {
    if (currentEventSlug) return false
    if (storedData?.slug) return false
    if (storedData?.event && !storedData.event.ended) return false
    return true
  }, [currentEventSlug, storedData])

  const { data: cryptoEvents } = useCryptoEvents('15M', { enabled: shouldFetch })

  useEffect(() => {
    if (!currentEventSlug) return
    setStoredDataState((prev) => {
      const next = { ...(prev || {}), slug: currentEventSlug }
      persistStoredData(next)
      return next
    })
  }, [currentEventSlug])

  useEffect(() => {
    if (!cryptoEvents?.length || !shouldFetch) return
    console.log({cryptoEvents});
    
    const btcEvent = findBtcEvent(cryptoEvents)
    if (!btcEvent) return
    setStoredDataState((prev) => {
      const next: StoredEventData = { ...(prev || {}), event: btcEvent }
      persistStoredData(next)
      return next
    })
  }, [cryptoEvents, shouldFetch])

  const eventDetailsPath = useMemo(() => {
    if (currentEventSlug) {
      return NAVIGATIONS.prediction.eventDetails(currentEventSlug)
    }
    if (storedData?.slug) {
      return NAVIGATIONS.prediction.eventDetails(storedData.slug)
    }
    if (storedData?.event?.slug) {
      return NAVIGATIONS.prediction.eventDetails(storedData.event.slug)
    }
    const fallback = cryptoEvents?.length
      ? findBtcEvent(cryptoEvents)?.slug ?? cryptoEvents[0]?.slug
      : undefined
    return fallback
      ? NAVIGATIONS.prediction.eventDetails(fallback)
      : NAVIGATIONS.prediction.home()
  }, [currentEventSlug, storedData, cryptoEvents])

  return { eventDetailsPath }
}
