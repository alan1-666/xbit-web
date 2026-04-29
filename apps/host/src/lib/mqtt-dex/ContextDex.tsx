import { createContext } from 'react'
import { IMqttContextDex } from './types'
export default createContext<IMqttContextDex>({} as IMqttContextDex)
