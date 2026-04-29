import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { IClientSubscribeOptions } from 'mqtt'

import MqttContext from './Context'
import { IMqttContext as Context, IMessage, IUseSubscription } from './types'

const SEPARATOR = '/'
const SINGLE = '+'
const ALL = '#'

export function matches(pattern: string, topic: string) {
  const patternSegments = pattern.split(SEPARATOR)
  const topicSegments = topic.split(SEPARATOR)
  const patternLength = patternSegments.length
  const topicLength = topicSegments.length
  const lastIndex = patternLength - 1

  for (let i = 0; i < patternLength; i++) {
    const currentPattern = patternSegments[i]
    const patternChar = currentPattern[0]
    const currentTopic = topicSegments[i]

    if (!currentTopic && !currentPattern) continue
    if (!currentTopic && currentPattern !== ALL) return false
    if (patternChar === ALL) return i === lastIndex
    if (patternChar !== SINGLE && currentPattern !== currentTopic) return false
  }

  return patternLength === topicLength
}

interface UseSubscriptionOptions {
  clientOptions?: IClientSubscribeOptions
  shouldSkip?: boolean
  clientType?: 'public' | 'private'
}

export default function useSubscription(
  topic: string | string[],
  options: UseSubscriptionOptions = { clientOptions: { qos: 0 }, shouldSkip: false },
): IUseSubscription {
  const clientType = options.clientType || 'private'
  const { client: privateClient, publicClient, connectionStatus, parserMethod } = useContext<Context>(MqttContext)
  const [message, setMessage] = useState<IMessage | undefined>(undefined)

  const client = useMemo(() => {
    if (clientType === 'public') return publicClient
    return privateClient
  }, [clientType, privateClient, publicClient])

  const callbackRef = useRef<(t: string, m: any) => void>(null)
  useEffect(() => {
    callbackRef.current = (receivedTopic, receivedMessage) => {
      const topics = Array.isArray(topic) ? topic : [topic]
      if (topics.some((rTopic) => matches(rTopic, receivedTopic))) {
        setMessage({
          topic: receivedTopic,
          message: parserMethod?.(receivedMessage) || receivedMessage.toString(),
        })
      }
    }
  }, [topic, parserMethod])

  useEffect(() => {
    if (!client || options.shouldSkip) return
    const topics = Array.isArray(topic) ? topic : [topic]

    const handler = (t: string, m: any) => callbackRef.current?.(t, m)

    try {
      client.setMaxListeners(200)
      topics.forEach((tp) => {
        client.subscribe(tp, options.clientOptions)
        // console.log('[MQTT] ✅ Subscribed:', tp)
      })
      client.on('message', handler)
    } catch (err) {
      console.error('[MQTT] subscribe error:', err)
    }

    return () => {
      try {
        client.off('message', handler)
        topics.forEach((tp) => {
          client.unsubscribe(tp)
          // console.log('[MQTT] 🚫 Unsubscribed:', tp)
        })
        // console.log('[MQTT] listenerCount:', client.listenerCount('message'))
      } catch (err) {
        console.error('[MQTT] unsubscribe error:', err)
      }
    }
  }, [client, topic, options.shouldSkip])

  return {
    client,
    topic,
    message,
    connectionStatus,
  }
}
