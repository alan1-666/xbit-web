import { MqttClient } from 'mqtt'
import { resolutionTfMap, resolutionTimeFrameMap } from './resolution-map'
import eventBus from '@/lib/eventBus'
import MqttClientManager from '@/lib/mqtt/MqttClient'

export interface HistoryData {
  time: number
  open: number
  close: number
  high: number
  low: number
  volume: number
  marketCap?: string
  price: number
}

type ListLastBarItem = {
  key?: string
  topicMqtt: string
  lastBar: HistoryData
  timeFrameToSecond: number
  totalSupply?: number
  onTick?: (newBars: HistoryData) => void
  address?: string
  chainId?: number
}

type DataOHLCPostMessage = {
  time: number
  address?: string
  chainId?: number
  close: number
}

export const EVENT_MESSAGE_OHLC_UPDATED = 'EVENT_MESSAGE_OHLC_UPDATED'
export default class DataUpdater {
  private client: MqttClient
  private lastBars: HistoryData
  private listLastBars: ListLastBarItem[]
  private subscribersUID: any[]
  constructor(datafeeds: any) {
    this.subscribersUID = []
    this.listLastBars = []
    this.lastBars = {} as HistoryData
    this.client = MqttClientManager.getInstance().getClient()
    this.handleSubscriberOHLC()
  }

  handleSubscriberOHLC() {
    this.client.on('message', (topic, message) => {
      let dataTicker
      try {
        dataTicker = JSON.parse(message.toString())
      } catch (err) {
        console.warn('MQTT payload parse error', err)
        return
      }
      const { st, ts, o, h, l, c, v, p } = dataTicker

      // Find ALL entries matching this topic (could be multiple during symbol transitions)
      const matchingEntries = this.listLastBars.filter((item) => item.topicMqtt === topic)

      if (matchingEntries.length === 0) return

      // Process each matching entry
      for (const lastBarsObj of matchingEntries) {
        const { timeFrameToSecond, totalSupply, lastBar: thelastBar, onTick, address, chainId } = lastBarsObj
        
        if (!thelastBar || !thelastBar.time) {
          // Initialize lastBar for this entry
          lastBarsObj.lastBar = {
            time: st,
            open: +o,
            high: +h,
            low: +l,
            close: +c,
            volume: v ? +v : 0,
            price: +p,
            marketCap: totalSupply ? (Number(c) * totalSupply).toString() : undefined,
          }
          continue
        }

        const resolutionMs = timeFrameToSecond * 1000

        const incomingSec = st ?? ts
        if (incomingSec == null) continue

        const incomingMs = Math.floor(Number(incomingSec) * 1000)
        const currentBarTime = Math.floor(incomingMs / resolutionMs) * resolutionMs
        const lastBarStart = Math.floor(Number(thelastBar.time) / resolutionMs) * resolutionMs

        // ignore really old ticks
        if (Number(ts ?? incomingSec) * 1000 < thelastBar.time) continue

        let barsUpdated: HistoryData

        if (currentBarTime > lastBarStart) {
          // Create current bar
          barsUpdated = {
            time: currentBarTime,
            open: +thelastBar.close,
            high: +h,
            low: +l,
            close: +c,
            price: +p,
            volume: v ? +v : 0,
            marketCap: totalSupply ? (Number(c) * totalSupply).toString() : undefined,
          }
        } else {
          // Update current bar
          barsUpdated = {
            time: thelastBar.time,
            open: +thelastBar.open,
            close: +c,
            low: +l,
            high: +h,
            price: +p,
            volume: v ? +v : thelastBar.volume || 0,
            marketCap: totalSupply ? (Number(c) * totalSupply).toString() : undefined,
          }
        }

        lastBarsObj.lastBar = { ...barsUpdated }

        if (onTick) {
          try {
            onTick(barsUpdated)
          } catch (e) {
            console.error('onTick error', e)
          }
        }

        this.handleEventMessageOHLCUpdated({ ...barsUpdated, close: +p, address, chainId })
      }
    })
  }

  subscribeBars(
    lastBar: HistoryData,
    symbolInfo: any,
    resolution: string,
    onTick: (newBars: any) => void,
    subscriberUID: string,
    totalSupply: number,
    chainId: number,
    onResetCacheNeededCallback?: () => void,
  ): void {
    const timeFrame = resolutionTfMap[`${resolution}`]
    const timeFrameToSecond = resolutionTimeFrameMap[`${resolution}`]
    const isMC = symbolInfo?.name.includes('-MC')
    this.lastBars = { ...lastBar }
    this.handleEventMessageOHLCUpdated({
      ...this.lastBars,
      address: symbolInfo?.address,
      chainId: chainId,
      marketCap: totalSupply ? (this.lastBars?.close * totalSupply).toString() : undefined,
      close: +this.lastBars?.price,
    })

    const topicMqtt = `public/kline${!!isMC ? '-mc' : ''}/${timeFrame}/${chainId}/${symbolInfo?.address}`
    window.lastTopicMqtt = topicMqtt
    // Add new item to listLastBars (according to new topicMqtt)
    this.listLastBars.push({
      key: subscriberUID,
      topicMqtt: topicMqtt,
      lastBar: lastBar,
      timeFrameToSecond: timeFrameToSecond,
      totalSupply,
      address: symbolInfo?.address,
      chainId,
      onTick,
    })

    const exists = this.subscribersUID.some((item) => item.key === subscriberUID)
    // Add new subscriber
    if (!exists) {
      this.subscribersUID.push({
        key: subscriberUID,
        topic: topicMqtt,
      })
    }
    this.client.subscribe(topicMqtt, (err: Error | null) => {})
  }

  handleEventMessageOHLCUpdated(data: any) {
    eventBus.dispatch(EVENT_MESSAGE_OHLC_UPDATED, {
      data: data,
    })

    const dataPostMessage: DataOHLCPostMessage = {
      time: data?.time,
      close: data?.close,
      chainId: +data?.chainId,
      address: data?.address
    }
    
    const KLineChannelFromWeb = (window as any).KLineChannelFromWeb
    if (KLineChannelFromWeb) KLineChannelFromWeb.postMessage(JSON.stringify({ ...dataPostMessage }))
    window.parent.postMessage(JSON.stringify({ ...dataPostMessage }), '*')
  }

  unsubscribeBars(subscriberUID: string): void {
    const subscriber = this.subscribersUID.find((obj) => obj.key === subscriberUID)
    if (subscriber) {
      // Remove this subscriber from the list
      this.subscribersUID = this.subscribersUID.filter((obj) => obj.key !== subscriberUID)
      // Remove this entry from listLastBars by key, not by topic
      this.listLastBars = this.listLastBars.filter((obj) => obj.key !== subscriberUID)
      
      // Only unsubscribe from MQTT if no other subscribers are using this topic
      const topicStillInUse = this.listLastBars.some((obj) => obj.topicMqtt === subscriber.topic)
      
      if (!topicStillInUse) {
        this.client.unsubscribe(subscriber.topic, (err: Error | undefined) => {})
      }
    }
  }

  getNextBarTime(barTime: number, timeFrame: number) {
    return +barTime + +timeFrame * 1000
  }
}
