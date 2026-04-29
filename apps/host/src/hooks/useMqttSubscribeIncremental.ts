import { useCallback, useContext, useEffect, useRef } from 'react'
import { IMqttContext as Context } from '@/lib/mqtt'
import MqttContext from '@/lib/mqtt/Context.tsx'

export interface MqttSubscribeIncrementalOptions<T = any> {
  topics: string[]
  onMessage: (topic: string, message: T) => void
}

interface HandlerFn {
  (topic: string, message: Buffer): void
}

export const useMqttSubscribeIncremental = <T>(options: MqttSubscribeIncrementalOptions) => {
  const { topics, onMessage } = options
  const { publicClient: client, parserMethod } = useContext<Context>(MqttContext)
  const prevTopics = useRef<string[]>([])

  const handlerRef = useRef<HandlerFn>(null)

  useEffect(() => {
    handlerRef.current = (topic: string, msg: Buffer) => {
      const parsedMessage = parserMethod ? parserMethod(msg) : msg.toString()
      // Check if topic is in the subscribed topics
      if (!topics.includes(topic)) return
      onMessage(topic, JSON.parse(parsedMessage) as T)
    }
  }, [topics, onMessage])

  useEffect(() => {
    if (!client) return

    const added = topics.filter((t) => !prevTopics.current.includes(t))
    const removed = prevTopics.current.filter((t) => !topics.includes(t))

    // Only subscribe new topics
    if (added.length > 0) {
      client.subscribe(added)
    }

    // Only unsubscribe removed topics
    if (removed.length > 0) {
      client.unsubscribe(removed)
    }

    prevTopics.current = topics
  }, [client, topics])

  useEffect(() => {
    if (!client) return

    const listener = (topic: string, msg: Buffer) => {
      handlerRef.current?.(topic, msg)
    }

    client.on('message', listener)

    return () => {
      client.off('message', listener)
    }
  }, [client])

  const clearSubscriptions = useCallback(() => {
    if (!client) return
    const allTopics = [...prevTopics.current]
    if (allTopics.length > 0) {
      client.unsubscribe(allTopics)
      prevTopics.current = []
    }
    return allTopics
  }, [client])

  return {
    clearSubscriptions,
  }
}
