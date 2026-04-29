/* eslint-disable */
import { MqttClient } from 'mqtt'

export interface Error {
  name: string
  message: string
  stack?: string
}

export interface ConnectorProps {
  children: React.ReactNode
}

export interface IMqttContext {
  connectionStatus: string | Error
  client?: MqttClient | null
  publicClient?: MqttClient | null
  parserMethod?: (message: any) => string
}

export interface IMessageStructure {
  [key: string]: string
}

export interface IMessage {
  topic: string
  message?: string | IMessageStructure
}

export interface IUseSubscription {
  topic: string | string[]
  client?: MqttClient | null
  message?: IMessage
  connectionStatus: string | Error
}
