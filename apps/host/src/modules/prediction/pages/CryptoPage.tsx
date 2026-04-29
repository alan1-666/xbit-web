import {
  CRYPTO_TAG_PARAM,
  CryptoHorizontalFilter,
  CryptoSidebar,
  getStoredCryptoTag,
  setStoredCryptoTag,
  VALID_CRYPTO_TAGS,
} from '@/modules/prediction/components/events-list/CryptoSidebar.tsx'
import { cn } from '@/lib/utils.ts'
import { EventsList } from '@/modules/prediction/components/shared/EventsList.tsx'
import { getTimeframeFromTag, useCryptoEvents } from '@/modules/prediction/hooks/useCryptoEvents.ts'
import { useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useSubscription } from '@/lib/mqtt'
import { usePublicSubscriptionCallback } from '@/hooks/mqtt/usePublicSubscriptionCallback'
import { TopicTradeEvent } from '@/modules/prediction/components/shared/TradeEventMonitorSplit.tsx'
import { showLiveChart } from '../components/event-details/Chart'

const DEFAULT_CRYPTO_TAG = 'crypto'

type CryptoPageProps = {
  /** Which query param key to use for filters. Defaults to `cryptoTag` (desktop),
   *  but on MarketPrediction mobile we can pass `tag`.
   */
  tagParamKey?: string
}

export const CryptoPage = ({ tagParamKey = CRYPTO_TAG_PARAM }: CryptoPageProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const tag = useMemo(() => {
    const urlTag = searchParams.get(tagParamKey)
    if (urlTag && VALID_CRYPTO_TAGS.has(urlTag)) return urlTag
    return getStoredCryptoTag() || DEFAULT_CRYPTO_TAG
  }, [searchParams, tagParamKey])

  // Sync: restore stored tag to URL when lost, persist valid URL tag, or clear invalid legacy tag
  useEffect(() => {
    const urlTag = searchParams.get(tagParamKey)
    const storedTag = getStoredCryptoTag()
    const next = new URLSearchParams(searchParams)

    // Only migrate legacy `tag` -> `cryptoTag` on desktop (`tagParamKey === CRYPTO_TAG_PARAM`)
    if (tagParamKey === CRYPTO_TAG_PARAM) {
      const legacyTag = searchParams.get('tag')
      if (legacyTag && VALID_CRYPTO_TAGS.has(legacyTag)) {
        next.delete('tag')
        next.set(CRYPTO_TAG_PARAM, legacyTag)
        setStoredCryptoTag(legacyTag)
        setSearchParams(next, { replace: true })
        return
      }
    }

    if (urlTag && VALID_CRYPTO_TAGS.has(urlTag)) {
      if (urlTag !== storedTag) setStoredCryptoTag(urlTag)
    } else if (urlTag && !VALID_CRYPTO_TAGS.has(urlTag)) {
      next.delete(tagParamKey)
      setSearchParams(next, { replace: true })
    } else if (!urlTag && storedTag && VALID_CRYPTO_TAGS.has(storedTag)) {
      next.set(tagParamKey, storedTag)
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams, tagParamKey])
  const { data, isLoading, loadMore, hasNextPage, refetch } = useCryptoEvents(tag)
  const { message } = useSubscription(`public/new/crypto-event/${getTimeframeFromTag(tag)?.toLowerCase()}`, {
    shouldSkip: !tag,
  })

  const cryptoEventSlugs = useMemo(() => {
    if (!data) return []
    return data.filter((event) => showLiveChart(event)).map((event) => event.slug)
  }, [data])

  const [topicDataMap, setTopicDataMap] = useState<Map<string, TopicTradeEvent[]>>(new Map())

  // Initialize map when cryptoEventSlugs change
  useEffect(() => {
    setTopicDataMap((prevMap) => {
      const newMap = new Map(prevMap)
      cryptoEventSlugs.forEach((slug) => {
        const topic = `public/crypto-event/${slug}/volume`
        if (!newMap.has(topic)) {
          newMap.set(topic, [])
        }
      })
      return newMap
    })
  }, [cryptoEventSlugs])

  usePublicSubscriptionCallback(
    cryptoEventSlugs.map((slug) => `public/crypto-event/${slug}/volume`),
    {
      shouldSkip: cryptoEventSlugs.length === 0,
      onMessage: (topic, payload) => {
        setTopicDataMap((prevMap) => {
          const newMap = new Map(prevMap)
          const currentData = newMap.get(topic) || []

          // Add new message and keep only last 10 items
          const updatedData = [
            ...currentData,
            {
              id: Date.now() + Math.random() + (payload as any).v, // Unique ID based on timestamp and order info
              receivedAt: new Date(),
              outcome: (payload as any).oi,
              value: (payload as any).mv,
              volume: (payload as any).v,
            },
          ].slice(-10)
          newMap.set(topic, updatedData)

          return newMap
        })
      },
    },
  )

  useEffect(() => {
    if (!!message) {
      refetch()
    }
  }, [message, refetch])
  return (
    <>
      <CryptoHorizontalFilter className="block xl:hidden" tagParamKey={tagParamKey} />
      <div className="flex flex-row items-start w-full">
        <CryptoSidebar className="hidden xl:block" tagParamKey={tagParamKey} />
        <div className={cn('flex-1 min-w-0', '')}>
          <EventsList
            isLoading={isLoading}
            data={data || []}
            loadMore={loadMore}
            hasNextPage={hasNextPage}
            classNameList="grid-cols-1 lg:grid-cols-2 pc:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 min-[1920px]:grid-cols-6"
            topicDataMap={topicDataMap}
          />
        </div>
      </div>
    </>
  )
}
