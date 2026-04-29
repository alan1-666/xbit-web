import { useCallback, useContext, useEffect, useState } from 'react'

import { IClientSubscribeOptions } from 'mqtt'

import MqttContext from './ContextDex'
import { IMqttContextDex as Context, IMessage, IUseSubscriptionDex } from './types'

const SEPARATOR = '/'
const SINGLE = '+'
const ALL = '#'

function matches(pattern: any, topic: any) {
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

    // Only allow # at end
    if (patternChar === ALL) return i === lastIndex
    if (patternChar !== SINGLE && currentPattern !== currentTopic) return false
  }

  return patternLength === topicLength
}

interface UseSubscriptionOptions {
  clientOptions?: IClientSubscribeOptions
  shouldSkip?: boolean
}

export default function useSubscriptionDex(
  topic: string | string[],
  options: UseSubscriptionOptions = {
    clientOptions: {},
    shouldSkip: false,
  } as UseSubscriptionOptions,
): IUseSubscriptionDex {
  const { client, connectionStatus, parserMethod } = useContext<Context>(MqttContext)

  const [message, setMessage] = useState<IMessage | undefined>(undefined)

  const subscribe = useCallback(async () => {
    client?.subscribe(topic, options.clientOptions)
  }, [client, options, topic])

  const callback = useCallback(
    (receivedTopic: string, receivedMessage: any) => {
      if ([topic].flat().some((rTopic) => matches(rTopic, receivedTopic))) {
        setMessage({
          topic: receivedTopic,
          message: parserMethod?.(receivedMessage) || receivedMessage.toString(),
        })
      }
    },
    [parserMethod, topic],
  )

  useEffect(() => {
    if (!options.shouldSkip) {
      if (client?.connected) {
        client.setMaxListeners(100)
        subscribe()
        client.on('message', callback)
      }
    }
    return () => {
      client?.off('message', callback)
    }
  }, [callback, client, subscribe, options])

  return {
    client,
    topic,
    message,
    connectionStatus,
  }
}
