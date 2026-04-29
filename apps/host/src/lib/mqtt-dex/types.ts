/* eslint-disable */
import { MqttClient } from 'mqtt'

export interface Error {
  name: string
  message: string
  stack?: string
}

export interface ConnectorProps {
  children: React.ReactNode
  disableConnect?: boolean
}

export interface IMqttContextDex {
  connectionStatus: string | Error
  client?: MqttClient | null
  parserMethod?: (message: any) => string
}

export interface IMessageStructure {
  [key: string]: string
}

export interface IMessage {
  topic: string
  message?: string | IMessageStructure
}

export interface IUseSubscriptionDex {
  topic: string | string[]
  client?: MqttClient | null
  message?: IMessage
  connectionStatus: string | Error
}
