import { useContext } from 'react'

import MqttContext from './ContextDex'
import { IMqttContextDex as Context } from './types'

export default function useMqttStateDex() {
  const { connectionStatus, client, parserMethod } = useContext<Context>(MqttContext)

  return {
    connectionStatus,
    client,
    parserMethod,
  }
}
