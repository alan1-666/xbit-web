import { TOPICS } from '@/lib/topics.ts'
import { useSubscription } from '@/lib/mqtt'
import { useCallback, useEffect, useRef } from 'react'

export type MigratedProgressPayload = {
  token_address: string
  ma: null
  imp: string
}

export interface UseTokenProgressByChainIdListenerOptions {
  chainId: number
  callback: (payload: MigratedProgressPayload[]) => void
}

export const useTokenProgressByChainIdListener = (options: UseTokenProgressByChainIdListenerOptions) => {
  const { chainId, callback } = options
  const topic = TOPICS.migratedProgress(chainId)
  const { message } = useSubscription(topic)
  const buffer = useRef<MigratedProgressPayload[]>([])

  const handler = useCallback((payload: MigratedProgressPayload) => {
    buffer.current.push(payload)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (buffer.current.length === 0) return
      const payloads = [...buffer.current]
      buffer.current = []
      callback(payloads)
    }, 300)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!message) return
    const msg = message.message
    if (!msg) return
    const payload = JSON.parse(msg.toString()) as MigratedProgressPayload
    handler(payload)
  }, [message])
}
