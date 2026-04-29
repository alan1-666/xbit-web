import { IClientOptions } from 'mqtt'
import { v4 as uuidv4 } from 'uuid'

export const optionsMqtt: IClientOptions = {
  clientId: 'xbit_web_platform' + uuidv4(),
  username: 'anon',
  password: 'anon',
  protocolVersion: 5,
  clean: false,
  keepalive: 45,
  reconnectPeriod: 1000,
  connectTimeout: 60000,
  properties: {
    sessionExpiryInterval: 30 * 60, // 30 minutes
  },
  path: '/mqtt',
  protocol: 'wss',
}
