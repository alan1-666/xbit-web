import mqtt, { IClientOptions, MqttClient } from 'mqtt'
import { useEffect, useMemo, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import MqttContext from './ContextDex'
import { ConnectorProps, IMqttContextDex } from './types'
import { Configs } from '@/const/configs'
import { useSelector } from 'react-redux'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { optionsMqtt } from '../mqtt/options'

export default function ConnectorDex({ children, disableConnect }: ConnectorProps) {
  const clientRef = useRef<MqttClient | null>(null)
  const [connectionStatus, setStatus] = useState<string | Error>('Offline')

  const userInfo = useSelector(_userInfo)

  // ✅ Keep session stable by keeping clientId fixed
  const stableClientId = useRef('xbit_web_dex_platform_' + uuidv4()).current

  const parserMethod = (msg: any) => msg

  // ✅ Initial connection (only once)
  useEffect(() => {
    if (clientRef.current || disableConnect) return

    const options: IClientOptions = {
      ...optionsMqtt,
      username: import.meta.env.VITE_USERNAME_MQTT_DEX,
      password: import.meta.env.VITE_PASSWORD_MQTT_DEX,
      clientId: stableClientId,
    }

    const client = mqtt.connect(Configs.socketUrlDex, options)
    clientRef.current = client

    client.on('connect', () => {
      setStatus('Connected')
    })
    client.on('reconnect', () => setStatus('Reconnecting'))
    client.on('error', (err) => setStatus(err.message))
    client.on('offline', () => setStatus('Offline'))
    client.on('end', () => setStatus('Offline'))

    return () => {
      client.end(true)
      clientRef.current = null
    }
  }, [disableConnect])

  // ✅ Update username/password when login/logout
  // useEffect(() => {
  //   const client = clientRef.current
  //   if (!client) return

  //   const newUsername = userInfo?.userId ? userInfo?.userId : import.meta.env.VITE_USERNAME_MQTT_DEX
  //   const newPassword = userInfo?.access_token ? userInfo?.access_token : import.meta.env.VITE_PASSWORD_MQTT_DEX

  //   if (client.options.username === newUsername && client.options.password === newPassword) {
  //     return
  //   }

  //   // ✅ Update auth
  //   client.options.username = newUsername
  //   client.options.password = newPassword

  //   client.reconnect()
  // }, [userInfo])

  const value: IMqttContextDex = useMemo<IMqttContextDex>(
    () => ({
      connectionStatus,
      client: clientRef.current,
      parserMethod,
    }),
    [connectionStatus],
  )

  return <MqttContext.Provider value={value}>{children}</MqttContext.Provider>
}
