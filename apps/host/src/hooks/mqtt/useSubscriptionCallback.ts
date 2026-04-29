import { IClientSubscribeOptions, MqttClient } from 'mqtt'
import { useEffect, useRef } from 'react'
import { matches } from '@/lib/mqtt/useSubscription.tsx'

export interface UseSubscriptionCallbackOptions<T> {
  client?: MqttClient | null
  clientOptions?: IClientSubscribeOptions
  shouldSkip?: boolean
  onMessage?: (topic: string, payload: T) => void
  debug?: boolean
}

export const useSubscriptionCallback = <T>(topics: string | string[], options: UseSubscriptionCallbackOptions<T>) => {
  const { client, clientOptions, shouldSkip, onMessage, debug = false } = options
  const callbackRef = useRef(onMessage)

  useEffect(() => {
    callbackRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    if (!client || shouldSkip) return

    const messageHandler = (receivedTopic: string, receivedMessage: Buffer) => {
      const matching = Array.isArray(topics) ? topics.some((t) => matches(t, receivedTopic)) : topics === receivedTopic
      if (matching && callbackRef.current) {
        let payload: T
        try {
          payload = JSON.parse(receivedMessage.toString()) as T
          callbackRef.current(receivedTopic, payload)
          if (debug) {
            console.log('[MQTT] Message received', { topic: receivedTopic, payload })
          }
        } catch {
          // Ignore JSON parse errors
        }
      }
    }
    if (debug) {
      console.log('[MQTT] Subscribing to topics:', topics)
    }
    client.subscribe(topics, clientOptions)

    client.on('message', messageHandler)

    return () => {
      if (debug) {
        console.log('[MQTT] Unsubscribing from topics:', topics)
      }
      client.unsubscribe(topics)
      client.off('message', messageHandler)
    }
  }, [client, shouldSkip, topics])
}
