import { useEffect, useState, useRef, useMemo } from 'react'
import useMqttState from '@/lib/mqtt/useMqttState'

const ALPHA = 0.6
const smoothLatency = (latency: number, prev: number | null) =>
  prev == null ? latency : Math.round(ALPHA * latency + (1 - ALPHA) * prev)

interface UseNetworkLatencyReturn {
  latency: number | null
  isOnline: boolean
}

/**
 * Hook to measure network latency by periodically pinging the server
 */
export function useNetworkLatency(interval: number = 6000): UseNetworkLatencyReturn {
  const [latency, setLatency] = useState<number | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const { client, connectionStatus } = useMqttState()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingPingAtRef = useRef<number | null>(null)
  const smoothedLatencyRef = useRef<number | null>(null)
  const isTabVisibleRef = useRef<boolean>(document.visibilityState === 'visible')

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      if (client && !client.connected) {
        client.end(true, () => client.reconnect?.())
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setLatency(null)
      smoothedLatencyRef.current = null
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [client])

  useEffect(() => {
    if (!client || !client.connected) return

    const onPacketSend = (p: any) => {
      if (p?.cmd === 'pingreq') {
        pendingPingAtRef.current = performance.now()
      }
    }

    const onPacketReceive = (p: any) => {
      if (p?.cmd === 'pingresp' && pendingPingAtRef.current != null && isTabVisibleRef.current) {
        const delta = performance.now() - pendingPingAtRef.current
        const smoothed = smoothLatency(delta, smoothedLatencyRef.current)
        smoothedLatencyRef.current = smoothed
        setLatency(+smoothed.toFixed(0))
        setIsOnline(true)
        pendingPingAtRef.current = null

        // Clear timeout false-positive
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
      }
    }

    client.on('packetsend', onPacketSend)
    client.on('packetreceive', onPacketReceive)

    return () => {
      client.off('packetsend', onPacketSend)
      client.off('packetreceive', onPacketReceive)
    }
  }, [client, connectionStatus])

  const sendPing = () => {
    if (!client || !client.connected || !isTabVisibleRef.current) return
    try {
      ;(client as any)?._sendPacket?.({ cmd: 'pingreq' })
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(
        () => {
          // console.warn('[MQTT] Ping timeout → offline flag')
          setLatency(null)
          setIsOnline(false)
          pendingPingAtRef.current = null
          smoothedLatencyRef.current = null
        },
        Math.max(2000, interval - 200),
      )
    } catch (err) {
      // console.warn('[MQTT] Ping error', err)
      setIsOnline(false)
      setLatency(null)
    }
  }

  const sendBurstPings = (count = 3, gap = 200) => {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        sendPing()
      }, i * gap)
    }
  }

  useEffect(() => {
    if (!client) return

    const startPing = () => {
      if (intervalRef.current) return
      sendPing()
      intervalRef.current = setInterval(sendPing, interval)
    }

    const stopPing = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }

    const handleVisibilityChange = () => {
      const visible = document.visibilityState === 'visible'
      isTabVisibleRef.current = visible
      if (visible) {
        // console.log('[MQTT] Tab active → burst ping to warm-up connection')
        if (!client.connected) {
          client.end(true, () => client.reconnect?.())
        }
        sendBurstPings(3, 150)
        startPing()
      } else {
        // console.log('[MQTT] Tab hidden → pause ping')
        stopPing()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    if (isTabVisibleRef.current) startPing()

    return () => {
      stopPing()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [client, connectionStatus, interval])

  return useMemo(() => ({ latency, isOnline }), [latency, isOnline])
}
