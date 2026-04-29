import mqtt, { MqttClient } from 'mqtt'
import { Configs } from '@/const/configs'
import { optionsMqtt } from './options'
import { v4 as uuidv4 } from 'uuid'

class MqttClientManager {
  private static instance: MqttClientManager
  private client: MqttClient

  private constructor() {
    this.client = mqtt.connect(Configs.socketUrl, { 
      ...optionsMqtt, 
      clientId: 'xbit_web_platform_' + uuidv4() 
    })
  }

  public static getInstance(): MqttClientManager {
    if (!MqttClientManager.instance) {
      MqttClientManager.instance = new MqttClientManager()
    }
    return MqttClientManager.instance
  }

  public getClient(): MqttClient {
    return this.client
  }
}

export default MqttClientManager 