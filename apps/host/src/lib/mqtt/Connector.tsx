import mqtt, { IClientOptions, MqttClient } from 'mqtt'
import { useEffect, useMemo, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import MqttContext from './Context'
import { ConnectorProps, IMqttContext } from './types'
import { Configs } from '@/const/configs'
import { useSelector } from 'react-redux'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { optionsMqtt } from './options'

export default function Connector({ children }: ConnectorProps) {
  const [client, setClient] = useState<MqttClient | null>(null)
  const [publicClient, setPublicClient] = useState<MqttClient | null>(null)
  const [connectionStatus, setStatus] = useState<string | Error>('Offline')

  const userInfo = useSelector(_userInfo)

  // Identifiers
  const userClientId = useRef('xbit_web_platform_' + uuidv4()).current
  const publicClientId = useRef('xbit_web_platform_public_' + uuidv4()).current

  const parserMethod = (msg: any) => msg

  // 1. PUBLIC CLIENT (Always Anon)
  useEffect(() => {
    // Only initialize once. publicClient state check acts as guard, 
    // but better to rely on empty dependency array for "mount" logic.
    // However, since we set state, we need to ensure we don't create multiple.
    // The empty dependency array guarantees this runs once.

    const options: IClientOptions = {
      ...optionsMqtt,
      clientId: publicClientId,
      username: 'anon',
      password: 'anon',
    }

    const pcs = mqtt.connect(Configs.socketUrl, options)
    setPublicClient(pcs)

    pcs.on('connect', () => {
        // Public client connected
    })
    
    pcs.on('error', (err) => {
        console.error('[MQTT][Public] Error:', err)
    })

    return () => {
      pcs.end(true)
      setPublicClient(null)
    }
  }, [])

  // 2. USER CLIENT (Auth or Anon)
  useEffect(() => {
    // Determine credentials
    const userId = userInfo?.userId || 'anon'
    const accessToken = userInfo?.access_token || 'anon'

    const options: IClientOptions = {
      ...optionsMqtt,
      clientId: userClientId,
      username: userId,
      password: accessToken,
    }

    const ucs = mqtt.connect(Configs.socketUrl, options)
    setClient(ucs)

    ucs.on('connect', () => {
      setStatus('Connected')
    })
    ucs.on('reconnect', () => setStatus('Reconnecting'))
    ucs.on('error', (err) => {
      setStatus(err.message)
    })
    ucs.on('offline', () => setStatus('Offline'))
    ucs.on('end', () => setStatus('Offline'))

    // Cleanup when credentials change or unmount
    return () => {
      ucs.end(true)
      setClient(null)
    }
  }, [userInfo?.userId, userInfo?.access_token])

  // 3. Visibility Handling (Force Reconnect on Tab Active)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') return

      // Check User Client
      if (client && !client.connected && !client.reconnecting) {
        client.reconnect()
      }

      // Check Public Client
      if (publicClient && !publicClient.connected && !publicClient.reconnecting) {
        publicClient.reconnect()
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [client, publicClient])

  // 4. Context Value
  const value: IMqttContext = useMemo<IMqttContext>(
    () => ({
      connectionStatus,
      client: client, // Private/User client
      publicClient: publicClient, // Public client
      parserMethod,
    }),
    [connectionStatus, client, publicClient],
  )

  return <MqttContext.Provider value={value}>{children}</MqttContext.Provider>
}
