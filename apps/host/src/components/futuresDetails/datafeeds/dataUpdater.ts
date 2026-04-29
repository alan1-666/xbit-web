import { resolutionToHyperliquidInterval } from './resolution-map'
import { v4 as uuidv4 } from 'uuid'
import eventBus from '@/lib/eventBus'
import { Configs } from '@/const/configs'


interface HistoryData {
  time: number
  open: number
  close: number
  high: number
  low: number
  volume: number
}

// 每个订阅者的状态
interface SubscriberState {
  symbol: string
  resolution: string
  interval: string
  lastBars: HistoryData
  onTickCallback: (data: HistoryData) => void
  dailyBaseVolume: number
  lastReceiveAt: number
}

export default class DataUpdater {
  private ws: WebSocket | null = null;
  private lastBars: HistoryData;
  private symbol: string = '';
  private resolution: string = '';
  private onTickCallback: ((data: HistoryData) => void) | null = null;
  private interval: string = '';
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isConnected: boolean = false;
  private connectionAttempts: number = 0;
  private maxConnectionAttempts: number = 5;
  private fallbackInterval: NodeJS.Timeout | null = null;
  private currentSubscription: { coin: string, interval: string } | null = null;
  private subscriptionInProgress: boolean = false;
  private subscriptionRetryCount: number = 0;
  private maxSubscriptionRetries: number = 3;
  private lastHeartbeatResponse: number = 0;
  private subscriptionQueue: Array<{ coin: string, interval: string }> = [];
  private usingBackupCandleWss: boolean = false;
  private updateEventName: string
  private datafeedsRef: any
  private lastReceiveAt: number = 0
  // 天及以上周期时，记录"历史最后一根 K 线"的基准成交量，用于与 ws 推送的 volume 相加
  private dailyBaseVolume: number = 0
  // 保存 eventBus 监听器函数引用，用于正确移除
  private eventBusHandler: ((data: any) => void) | null = null
  // 当前订阅的分辨率和币对，用于防止重复订阅
  private currentResolution: string = ''
  private currentSymbol: string = ''
  // 浏览器网络状态监听器
  private browserOnlineListener: (() => void) | null = null
  private browserOfflineListener: (() => void) | null = null

  // 多订阅管理：按 subscriberUID 存储每个订阅者的状态
  // 根据 TradingView 文档，库可能同时有多个活跃订阅（如切换周期时）
  private subscribers: Map<string, SubscriberState> = new Map()

  constructor(datafeeds: any) {
    this.updateEventName = datafeeds.updateEventName
    this.datafeedsRef = datafeeds
    this.lastBars = {} as HistoryData;
    this.dailyBaseVolume = 0
    this.bindBrowserNetworkEvents()
  }


  // 绑定浏览器 online/offline 事件，用于在网络恢复后强制刷新历史 K 线
  private bindBrowserNetworkEvents() {
    if (typeof window === 'undefined') {
      return
    }

    if (this.browserOnlineListener || this.browserOfflineListener) {
      return
    }

    this.browserOnlineListener = () => {
      this.onBrowserOnline()
    }

    this.browserOfflineListener = () => {
      this.onBrowserOffline()
    }

    window.addEventListener('online', this.browserOnlineListener)
    window.addEventListener('offline', this.browserOfflineListener)
  }

  private unbindBrowserNetworkEvents() {
    if (typeof window === 'undefined') {
      return
    }

    if (this.browserOnlineListener) {
      window.removeEventListener('online', this.browserOnlineListener)
      this.browserOnlineListener = null
    }

    if (this.browserOfflineListener) {
      window.removeEventListener('offline', this.browserOfflineListener)
      this.browserOfflineListener = null
    }
  }

  // 浏览器从离线恢复到在线
  private onBrowserOnline() {
    try {
      // 避免重复重连
      if (!this.isConnected) {
        this.reconnectWebSocket()
      }

      // 通过 onResetCacheNeededCallback + chart.resetData 触发历史重拉
      if (this.datafeedsRef && typeof this.datafeedsRef.triggerResetForAllActive === 'function') {
        setTimeout(() => {
          try {
            this.datafeedsRef.triggerResetForAllActive()
          } catch (error) {
            console.error('[DataUpdater] 触发网络恢复后的历史重置失败:', error)
          }
        }, 1000)
      }
    } catch (e) {
      console.error('[DataUpdater] 处理浏览器 online 事件失败:', e)
    }
  }

  // 浏览器离线：清理当前 WS，停止重连定时器，等待 online 后再恢复
  private onBrowserOffline() {
    try {
      this.isConnected = false
      this.cleanup()
    } catch (e) {
      console.error('[DataUpdater] 处理浏览器 offline 事件失败:', e)
    }
  }


  private isNewSubscription(coin: string, interval: string): boolean {
    if (!this.currentSubscription) return true;
    return this.currentSubscription.coin !== coin || this.currentSubscription.interval !== interval;
  }

  private async changeSubscription(coin: string, interval: string): Promise<boolean> {
    if (!this.ws || !this.isConnected) {
      console.warn('Cannot change subscription: WebSocket not connected');
      return false;
    }


    if (this.subscriptionInProgress) {
      this.subscriptionQueue.push({ coin, interval });
      return true;
    }


    this.subscriptionInProgress = true;
    this.subscriptionRetryCount = 0;

    try {
      if (this.currentSubscription &&
        this.currentSubscription.coin === coin &&
        this.currentSubscription.interval === interval) {
        this.subscriptionInProgress = false;
        this.processSubscriptionQueue();
        return true;
      }

      if (this.currentSubscription) {
        try {
          const unsubscribeMessage = {
            method: "unsubscribe",
            subscription: {
              type: "candle",
              coin: this.currentSubscription.coin,
              interval: this.currentSubscription.interval
            }
          };
          this.ws.send(JSON.stringify(unsubscribeMessage));

          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error('Error unsubscribing:', error);
        }
      }

      try {
        const subscriptionMessage = {
          method: "subscribe",
          subscription: {
            type: "candle",
            coin: coin,
            interval: interval
          },
          id: uuidv4()
        };
        this.ws.send(JSON.stringify(subscriptionMessage));

        this.currentSubscription = { coin, interval: interval };

        setTimeout(() => {
          this.verifySubscription(coin, interval);
        }, 3000);

        return true;
      } catch (error) {
        console.error('Error subscribing to new channel:', error);
        this.subscriptionInProgress = false;
        this.processSubscriptionQueue();
        return false;
      }
    } catch (error) {
      console.error('Error in changeSubscription:', error);
      this.subscriptionInProgress = false;
      this.processSubscriptionQueue();
      return false;
    }
  }


  private verifySubscription(coin: string, interval: string) {

    if (!this.isConnected ||
      !this.currentSubscription ||
      this.currentSubscription.coin !== coin ||
      this.currentSubscription.interval !== interval) {
      this.subscriptionInProgress = false;
      return;
    }


    if (this.subscriptionRetryCount < this.maxSubscriptionRetries) {

      const lastDataTime = this.lastBars?.time || 0;
      const currentTime = Date.now();

      if (currentTime - lastDataTime < 5000) {
        this.subscriptionInProgress = false;

        this.processSubscriptionQueue();
        return;
      }

      this.subscriptionRetryCount++;
      console.warn(`No recent data for ${coin}/${interval}, retrying subscription (attempt ${this.subscriptionRetryCount})`);

      try {
        const subscriptionMessage = {
          method: "subscribe",
          subscription: {
            type: "candle",
            coin: coin,
            interval: interval
          },
          id: uuidv4()
        };

        if (this.ws && this.isConnected) {
          this.ws.send(JSON.stringify(subscriptionMessage));

          setTimeout(() => {
            this.verifySubscription(coin, interval);
          }, 3000);
        } else {
          console.error('WebSocket disconnected during verification, reconnecting...');
          this.subscriptionInProgress = false;
          this.connect();
        }
      } catch (error) {
        console.error('Error retrying subscription:', error);
        this.subscriptionInProgress = false;
      }
    } else {
      console.error(`Maximum subscription retries exceeded for ${coin}/${interval}`);
      this.subscriptionInProgress = false;

      this.processSubscriptionQueue();
    }
  }


  private processSubscriptionQueue() {
    if (this.subscriptionQueue.length > 0) {
      const next = this.subscriptionQueue.shift();
      if (next) {
        this.changeSubscription(next.coin, next.interval);
      }
    }
  }

  private connect(useBackup?: boolean) {

    this.cleanup();


    this.connectionAttempts++;

    const primaryUrl = Configs.getCandleWssUrl();
    const backupUrl = 'wss://unstable-hypertrader-ws-broadcaster.xbit.live/ws';
    const isUsingBackup = useBackup ?? this.usingBackupCandleWss;

    // 如果在主链路上多次重连失败，自动切换到备用 WebSocket 地址
    if (!isUsingBackup && this.connectionAttempts > this.maxConnectionAttempts) {
      if (primaryUrl !== backupUrl) {
        console.warn('Maximum connection attempts on primary candle WS reached, switching to backup WS URL.');
        this.connectionAttempts = 0;
        this.usingBackupCandleWss = true;
        this.connect(true);
        return;
      } else {
        console.error('Maximum connection attempts reached. Stopping reconnect.');
        return;
      }
    }

    try {
      const targetUrl = isUsingBackup ? backupUrl : primaryUrl;
      this.usingBackupCandleWss = isUsingBackup;

      this.ws = new WebSocket(targetUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.connectionAttempts = 0;
        this.lastHeartbeatResponse = Date.now();

        this.setupMessageHandler();

        setTimeout(() => {
          this.subscribe();
        }, 1000);

        this.startHeartbeat();
      };

      this.ws.onclose = (event) => {
        this.isConnected = false;
        this.subscriptionInProgress = false;
        this.cleanup();

        if (event.code !== 1000) {
          if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
          }

          const reconnectDelay = Math.min(3000 * Math.pow(1.5, this.connectionAttempts - 1), 30000);

          this.reconnectTimeout = setTimeout(() => {
            this.connect(this.usingBackupCandleWss);
          }, reconnectDelay);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);

      const reconnectDelay = Math.min(3000 * Math.pow(1.5, this.connectionAttempts - 1), 30000);
      this.reconnectTimeout = setTimeout(() => {
        this.connect(this.usingBackupCandleWss);
      }, reconnectDelay);
    }
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    // 减少心跳间隔到 5 秒，提高连接稳定性和响应速度
    this.heartbeatInterval = setInterval(() => {
      if (!this.ws || !this.isConnected) {
        return;
      }

      try {
        this.ws.send(JSON.stringify({ method: "ping" }));

        // 检查最后一次心跳响应时间，如果超过 15 秒没有响应，重新连接
        const now = Date.now();
        if (now - this.lastHeartbeatResponse > 15000) {
          console.warn('No heartbeat response for 15 seconds, reconnecting...');
          this.cleanup();
          this.connect();
        }
      } catch (error) {
        console.error('Error sending heartbeat:', error);
      }
    }, 5000); // 从原来的间隔减少到 5 秒
  }

  private cleanup() {

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }


    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }


    if (this.fallbackInterval) {
      clearInterval(this.fallbackInterval);
      this.fallbackInterval = null;
    }


    this.subscriptionInProgress = false;


    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;

      if (this.isConnected) {
        try {
          if (this.currentSubscription) {
            const unsubscribeMessage = {
              method: "unsubscribe",
              subscription: {
                type: "candle",
                coin: this.currentSubscription.coin,
                interval: this.currentSubscription.interval
              }
            };
            this.ws.send(JSON.stringify(unsubscribeMessage));
          }
        } catch (e) {
          console.warn('Error during unsubscribe in cleanup:', e);
        }
      }

      try {
        this.ws.close(1000, "Normal closure");
      } catch (e) {
        console.warn('Error closing WebSocket in cleanup:', e);
      }

      this.ws = null;
    }


    this.isConnected = false;
  }

  // 重新连接WebSocket的专用方法
  private reconnectWebSocket() {
    console.log('尝试重新连接WebSocket...');
    this.cleanup();
    this.connectionAttempts = 0; // 重置连接尝试次数
    this.connect(this.usingBackupCandleWss);
  }

  private subscribe() {
    if (!this.ws || !this.isConnected || !this.symbol) {
      console.error('Cannot subscribe: WebSocket not ready or symbol not set', {
        isConnected: this.isConnected,
        symbol: this.symbol,
        interval: this.interval
      });
      return;
    }


    const coin = this.symbol.split('/')[0];


    if (!coin) {
      console.error('Invalid coin extracted from symbol:', this.symbol);
      return;
    }


    const interval = this.interval || '1h';


    this.changeSubscription(coin, interval);
  }

  // 处理数据
  private processCandle(candleData: any) {
    if (!candleData || !candleData.data) {
      return;
    }

    // 检查是否有活跃的订阅者
    if (this.subscribers.size === 0 && !this.onTickCallback) {
      console.warn('[DataUpdater] processCandle: 没有活跃的订阅者，无法更新图表', {
        subscribersSize: this.subscribers.size,
        hasOnTickCallback: !!this.onTickCallback
      })
      return;
    }

    try {
      const data = candleData.data;
      const now = Date.now();

      // 优先处理最新的数据点
      if (data.t) {
        const tMs = Number(data.t)
        const closePrice = parseFloat(data.c)
        
        // 调试：打印当前订阅者信息
        // console.log('[DataUpdater] processCandle 开始处理:', {
        //   subscribersCount: this.subscribers.size,
        //   subscriberKeys: Array.from(this.subscribers.keys()),
        //   dataTime: new Date(tMs).toISOString(),
        //   closePrice
        // })
        
        // 遍历所有订阅者，为每个订阅者更新数据
        // 根据 TradingView 文档：当收到更新时，应该发送数据到正确的订阅者
        for (const [listenerGuid, subscriber] of this.subscribers.entries()) {
          // 检查数据是否匹配此订阅者的币对
          // 重要修复：使用订阅者自己的 symbol，而不是依赖全局 this.symbol
          const subscriberCoin = subscriber.symbol.split('/')[0]
          
          // 从 eventBus 数据中获取币对（如果有的话）
          // eventBus 推送的数据通常是当前活跃币对的数据
          const dataCoin = data.s ? data.s.split('/')[0] : null
          
          // 如果数据中有币对信息，检查是否匹配订阅者
          // 如果数据中没有币对信息，假设数据是针对当前活跃币对的（所有订阅者都是同一币对）
          if (dataCoin && subscriberCoin !== dataCoin) {
            // console.log('[DataUpdater] 币对不匹配，跳过订阅者:', {
            //   listenerGuid,
            //   subscriberCoin,
            //   dataCoin
            // })
            continue
          }

          // 月线时间对齐到自然月起点（UTC 00:00），其余周期保持原样
          const startOfUtcMonth = (ts: number) => {
            const d = new Date(ts)
            return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)
          }
          const alignedTime = (subscriber.resolution === '1M' || subscriber.resolution === 'M')
            ? startOfUtcMonth(tMs)
            : tMs

          const isDailyHigher = this.isDailyOrHigherResolution(subscriber.resolution)
          const currentDailyVolume = parseFloat(data.v) || 0
          // 高周期统一使用“基准（排除今天）+ 当前 1D 成交量”
          const mergedVolume = isDailyHigher
            ? (subscriber.dailyBaseVolume || 0) + currentDailyVolume
            : currentDailyVolume
          const updatedBar: HistoryData = isDailyHigher
            ? {
              time: alignedTime,
              open: subscriber.lastBars?.open ?? parseFloat(data.o),
              high: closePrice > subscriber.lastBars?.high ? closePrice : subscriber.lastBars?.high ?? parseFloat(data.h),
              low: closePrice < subscriber.lastBars?.low ? closePrice : subscriber.lastBars?.low ?? parseFloat(data.l),
              close: parseFloat(data.c) || 0,
              volume: mergedVolume,
            }
            : {
              time: alignedTime,
              open: parseFloat(data.o) || 0,
              high: parseFloat(data.h) || 0,
              low: parseFloat(data.l) || 0,
              close: parseFloat(data.c) || 0,
              volume: parseFloat(data.v) || 0,
            }

          // 更新订阅者的 lastBars
          const isUpdated = this.updateSubscriberLastBars(listenerGuid, updatedBar);

          if (isUpdated) {
            // console.log('[DataUpdater] 数据已更新，调用订阅者回调:', {
            //   listenerGuid,
            //   resolution: subscriber.resolution,
            //   symbol: subscriber.symbol,
            //   close: updatedBar.close,
            //   time: new Date(updatedBar.time).toISOString()
            // })
            // 使用 requestAnimationFrame 提高渲染性能
            // 重要：使用订阅者自己的回调函数，而不是全局的 onTickCallback
            const callback = subscriber.onTickCallback
            requestAnimationFrame(() => {
              if (callback) {
                callback(updatedBar);
              }
            });
          }
          
          // 更新订阅者的最后接收时间
          subscriber.lastReceiveAt = now
        }

        // 同时更新全局状态（保持向后兼容）
        this.updateGlobalState(data, tMs, closePrice, now)
      }
    } catch (error) {
      console.error('Error processing candle data:', error);
    }
    // if (!this.onTickCallback) {
    //   return;
    // }
    // try {
    //   let candles: any[] = [];

    //   if (Array.isArray(candleData)) {
    //     candles = candleData;
    //   } 
    //   else if (candleData && candleData.candles && Array.isArray(candleData.candles)) {
    //     candles = candleData.candles;
    //   }
    //   else if (candleData && (candleData.T || candleData.t)) {
    //     candles = [candleData];
    //   }


    //   if (candles.length > 0) {
    //     if (candles.length > 1) {
    //       candles.sort((a, b) => {
    //         const timeA = Number(a.T || a.t);
    //         const timeB = Number(b.T || b.t);
    //         return timeB - timeA;
    //       });
    //     }

    //     const latestCandle = candles[0];

    //     if (!latestCandle) {
    //       console.warn('No valid latest candle found');
    //       return;
    //     }


    //     const hasTimestamp = latestCandle.T !== undefined || latestCandle.t !== undefined;
    //     const hasOhlc = latestCandle.o !== undefined && 
    //                     latestCandle.h !== undefined && 
    //                     latestCandle.l !== undefined && 
    //                     latestCandle.c !== undefined;

    //     if (!hasTimestamp || !hasOhlc) {
    //       console.warn('Latest candle is missing required properties:', latestCandle);
    //       console.warn('Has timestamp:', hasTimestamp, 'Has OHLC:', hasOhlc);
    //       return;
    //     }

    //     let timestamp = latestCandle.T !== undefined ? Number(latestCandle.T) : Number(latestCandle.t);

    //     if (timestamp < 10000000000) {
    //       timestamp *= 1000; 
    //     }

    //     const updatedBar: HistoryData = {
    //       time: timestamp,
    //       open: parseFloat(latestCandle.o),
    //       high: parseFloat(latestCandle.h),
    //       low: parseFloat(latestCandle.l),
    //       close: parseFloat(latestCandle.c),
    //       volume: parseFloat(latestCandle.v || '0')
    //     };


    //     if (this.updateLastBars(updatedBar)) {
    //       if (this.onTickCallback) {
    //         try {
    //           this.onTickCallback(this.lastBars);
    //         } catch (error) {
    //           console.error('Error in onTick callback:', error);
    //         }
    //       }
    //     }
    //   } else {
    //   }
    // } catch (error) {
    //   console.error('Error processing candle data:', error, candleData);
    // }
  }


  private updateLastBars(updatedBar: HistoryData): boolean {

    if (!this.lastBars || !this.lastBars.time || updatedBar.time > this.lastBars.time) {
      this.lastBars = updatedBar;
      return true;
    }

    else if (updatedBar.time === this.lastBars.time) {
      const oldBar = { ...this.lastBars };

      this.lastBars = {
        ...this.lastBars,
        close: updatedBar.close,
        high: Math.max(this.lastBars.high, updatedBar.high),
        low: Math.min(this.lastBars.low, updatedBar.low),
        volume: updatedBar.volume
      };

      const hasChanged =
        oldBar.close !== this.lastBars.close ||
        oldBar.high !== this.lastBars.high ||
        oldBar.low !== this.lastBars.low ||
        oldBar.volume !== this.lastBars.volume;

      return hasChanged;
    }

    return false;
  }

  // 更新特定订阅者的 lastBars
  private updateSubscriberLastBars(listenerGuid: string, updatedBar: HistoryData): boolean {
    const subscriber = this.subscribers.get(listenerGuid)
    if (!subscriber) {
      return false
    }

    const lastBars = subscriber.lastBars

    if (!lastBars || !lastBars.time || updatedBar.time > lastBars.time) {
      subscriber.lastBars = updatedBar;
      return true;
    }

    if (updatedBar.time === lastBars.time) {
      const oldBar = { ...lastBars };

      subscriber.lastBars = {
        ...lastBars,
        close: updatedBar.close,
        high: Math.max(lastBars.high, updatedBar.high),
        low: Math.min(lastBars.low, updatedBar.low),
        volume: updatedBar.volume
      };

      const hasChanged =
        oldBar.close !== subscriber.lastBars.close ||
        oldBar.high !== subscriber.lastBars.high ||
        oldBar.low !== subscriber.lastBars.low ||
        oldBar.volume !== subscriber.lastBars.volume;

      return hasChanged;
    }

    return false;
  }

  // 更新全局状态（保持向后兼容）
  private updateGlobalState(data: any, tMs: number, closePrice: number, now: number) {
    // 月线时间对齐
    const startOfUtcMonth = (ts: number) => {
      const d = new Date(ts)
      return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)
    }
    const alignedTime = (this.resolution === '1M' || this.resolution === 'M')
      ? startOfUtcMonth(tMs)
      : tMs

    const isDailyHigher = this.isDailyOrHigherResolution(this.resolution)
    const currentDailyVolume = parseFloat(data.v) || 0
    const mergedVolume = isDailyHigher
      ? (this.dailyBaseVolume || 0) + currentDailyVolume
      : currentDailyVolume
    const updatedBar: HistoryData = isDailyHigher
      ? {
        time: alignedTime,
        open: this.lastBars?.open ?? parseFloat(data.o),
        high: closePrice > this.lastBars?.high ? closePrice : this.lastBars?.high ?? parseFloat(data.h),
        low: closePrice < this.lastBars?.low ? closePrice : this.lastBars?.low ?? parseFloat(data.l),
        close: parseFloat(data.c) || 0,
        volume: mergedVolume,
      }
      : {
        time: alignedTime,
        open: parseFloat(data.o) || 0,
        high: parseFloat(data.h) || 0,
        low: parseFloat(data.l) || 0,
        close: parseFloat(data.c) || 0,
        volume: parseFloat(data.v) || 0,
      }

    // 检测数据断流
    try {
      const resSec = this.getResolutionInSeconds(this.resolution || '60');
      const expectedMs = resSec * 1000;
      const idleGap = this.lastReceiveAt ? (now - this.lastReceiveAt) : 0;
      const idleThreshold = Math.max(15000, expectedMs);
      const wallClockGapDetected = this.lastReceiveAt && idleGap > idleThreshold;

      const dataTimeGap = this.lastBars?.time ? (updatedBar.time - this.lastBars.time) : 0;
      const maxDataGap = expectedMs * 3;
      const dataGapDetected = dataTimeGap > maxDataGap;

      if (wallClockGapDetected || dataGapDetected) {
        console.warn('检测到数据断流，触发历史重置', {
          idleGap,
          dataTimeGap,
          expectedMs,
          resolution: this.resolution,
          lastReceiveAt: this.lastReceiveAt,
          lastBarTime: this.lastBars?.time,
          currentBarTime: updatedBar.time,
          wallClockGapDetected,
          dataGapDetected
        });
        
        setTimeout(() => {
          if (this.datafeedsRef && typeof this.datafeedsRef.triggerResetForAllActive === 'function') {
            try {
              this.datafeedsRef.triggerResetForAllActive();
            } catch (resetError) {
              console.error('触发历史重置失败:', resetError);
              this.reconnectWebSocket();
            }
          }
        }, 1000);
      }
    } catch (e) {
      console.warn('Failed to evaluate data gap for reset:', e);
    }

    this.lastReceiveAt = now;
    this.updateLastBars(updatedBar);
  }

  subscribeBars(
    lastBar: HistoryData,
    symbolInfo: any,
    resolution: string,
    onTick: (newBars: any) => void,
    listenerGuid: string,
  ): void {
    const newSymbol = symbolInfo?.ticker || symbolInfo?.name;
    const newInterval = resolutionToHyperliquidInterval[resolution] || '1h';

    // console.log('[DataUpdater] subscribeBars 被调用:', {
    //   newSymbol,
    //   resolution,
    //   newInterval,
    //   listenerGuid,
    //   existingSubscribers: Array.from(this.subscribers.keys())
    // })

    // 为每个订阅者创建独立的状态
    // 根据 TradingView 文档：库可能同时有多个活跃订阅，每个订阅有唯一的 subscriberUID
    const subscriberState: SubscriberState = {
      symbol: newSymbol,
      resolution: resolution,
      interval: newInterval,
      lastBars: { ...lastBar },
      onTickCallback: onTick,
      dailyBaseVolume: 0,
      lastReceiveAt: 0
    }
    
    // 存储订阅者状态
    this.subscribers.set(listenerGuid, subscriberState)
    
    // 更新"天及以上周期"的基准成交量
    this.updateDailyBaseVolumeForSubscriber(listenerGuid, lastBar, resolution)

    // 同时更新全局状态（保持向后兼容）
    this.lastBars = lastBar;
    this.symbol = newSymbol;
    this.resolution = resolution;
    this.currentSymbol = newSymbol;
    this.currentResolution = resolution;
    this.onTickCallback = onTick;
    this.interval = newInterval;
    this.lastReceiveAt = 0
    this.updateDailyBaseVolumeOnSubscribe(lastBar, resolution)

    // 确保 eventBus 监听器已注册（只需注册一次）
    if (!this.eventBusHandler) {
      // console.log('[DataUpdater] 注册 eventBus 监听器, updateEventName:', this.updateEventName)
      this.eventBusHandler = (data: any) => {
        this.processCandle({
          data: data
        })
      }
      eventBus.on(this.updateEventName, this.eventBusHandler)
    }
    
    // console.log('[DataUpdater] subscribeBars 完成:', {
    //   listenerGuid,
    //   subscribersCount: this.subscribers.size,
    //   subscriberKeys: Array.from(this.subscribers.keys()),
    //   hasEventBusHandler: !!this.eventBusHandler
    // })
  }

  // 为特定订阅者更新"天及以上周期"的基准成交量
  private updateDailyBaseVolumeForSubscriber(listenerGuid: string, lastBar: HistoryData, resolution: string) {
    const subscriber = this.subscribers.get(listenerGuid)
    if (!subscriber) {
      return
    }

    // 非天及以上周期：直接归零
    if (!this.isDailyOrHigherResolution(resolution)) {
      subscriber.dailyBaseVolume = 0
      return
    }

    // 高周期的基准成交量统一由 updateDailyBaseVolumeOnSubscribe + fetchDailyVolumeForPeriod 计算，
    // 这里先置为 0，待全局基准更新后通过 syncDailyBaseVolumeToSubscribers 覆盖
    subscriber.dailyBaseVolume = 0
  }

  // 将当前全局基准成交量同步到同一分辨率的所有订阅者
  private syncDailyBaseVolumeToSubscribers(resolution: string) {
    for (const subscriber of this.subscribers.values()) {
      if (subscriber.resolution === resolution) {
        subscriber.dailyBaseVolume = this.dailyBaseVolume || 0
      }
    }
  }

  // 根据当前分辨率更新"天及以上周期"的基准成交量
  // - 普通日线：无需处理
  // - 多日线/周线/月线：根据"历史最后一根高周期K线的起始时间"去拉取 1d K 线并累加 volume
  private updateDailyBaseVolumeOnSubscribe(lastBar: HistoryData, resolution: string) {
    // 非天及以上周期：直接归零
    if (!this.isDailyOrHigherResolution(resolution)) {
      this.dailyBaseVolume = 0
      return
    }

    // 对 3D / 1W / 1M：改用“自该高周期起点以来的所有 1d K 线成交量之和（排除今天）”作为基准
    if (!this.isWeeklyOrMonthlyResolution(resolution)) {
      // 其他天以上周期（目前不存在）暂时使用 0 作为基准
      this.dailyBaseVolume = 0
      return
    }

    if (!this.symbol || !lastBar || !lastBar.time) {
      this.dailyBaseVolume = 0
      return
    }

    const coin = this.symbol.split('/')[0]
    if (!coin) {
      this.dailyBaseVolume = 0
      return
    }

    const startTime = lastBar.time
    const endTime = Date.now()

    this.fetchDailyVolumeForPeriod(coin, startTime, endTime)
      .then((totalVolume) => {
        // 如果接口异常返回，则不覆盖兜底的 dailyBaseVolume
        if (typeof totalVolume !== 'number' || Number.isNaN(totalVolume)) {
          return
        }
        this.dailyBaseVolume = totalVolume
        this.syncDailyBaseVolumeToSubscribers(resolution)
      })
      .catch((error) => {
        console.error('Error updating weekly/monthly base volume from daily candles:', error)
      })
  }

  // 判断是否为 3d / 周线或月线分辨率（包含兼容形式）
  private isWeeklyOrMonthlyResolution(resolution: string): boolean {
    if (!resolution) {
      return false
    }

    const upper = resolution.toUpperCase()

    if (upper === '3D') {
      return true
    }

    if (upper === '1W' || upper === 'W') {
      return true
    }

    if (upper === '1M' || upper === 'M') {
      return true
    }

    return false
  }

  // 拉取指定时间区间内的 1d K 线，并累加其成交量
  // 说明：
  // - startTime / endTime 均为毫秒时间戳，与历史 K 线保持一致
  // - 累加时会排除“当日”的 1d K 线，避免与 WS 推送的当日 volume 重复计算
  private fetchDailyVolumeForPeriod(coin: string, startTime: number, endTime: number): Promise<number> {
    if (!coin || !startTime || !endTime || endTime <= startTime) {
      return Promise.resolve(0)
    }

    const requestStart = typeof performance !== 'undefined' ? performance.now() : Date.now()

    return import('@/api/hyperliquid')
      .then((mod) => {
        const getCandleSnapshot = (mod as any).getCandleSnapshot
        if (!getCandleSnapshot) {
          return []
        }

        return getCandleSnapshot({
          coin: coin,
          interval: '1d',
          startTime: startTime,
          endTime: endTime
        })
      })
      .then((response: any) => {
        // 性能日志，参考 datafeeds.ts 中的实现
        try {
          const receivedAt = new Date().toISOString()
          const durationMs = Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - requestStart)
          // eslint-disable-next-line no-console
          console.log(`[perf][dataUpdater] daily volume snapshot returned ${coin} 1d @ ${receivedAt} (耗时 ${durationMs}ms)`)
        } catch {}

        if (!Array.isArray(response) || response.length === 0) {
          return 0
        }

        // 计算 UTC 当日零点，用于过滤“当日”K 线
        const now = new Date()
        const startOfTodayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())

        const totalVolume = response.reduce((sum: number, item: any) => {
          if (!item) {
            return sum
          }
          const ts = Number(item.T || item.t)
          // 排除当日的数据，避免与 WS 推送的当日 volume 重复计算
          if (!ts || ts >= startOfTodayUtc) {
            return sum
          }
          const v = parseFloat(item.v)
          if (Number.isNaN(v)) {
            return sum
          }
          return sum + v
        }, 0)

        return totalVolume
      })
      .catch((error) => {
        console.error('Error fetching daily candles for weekly/monthly volume merge:', error)
        return 0
      })
  }

  private async fetchCandleData(coin: string, interval: string, startTime: number, endTime: number) {
    try {
      const { getCandleSnapshot } = await import('@/api/hyperliquid');

      const response = await getCandleSnapshot({
        coin: coin,
        interval: interval,
        startTime: startTime,
        endTime: endTime
      });

      if (Array.isArray(response) && response.length > 0) {
        const sortedCandles = [...response].sort((a, b) => Number(b.T || b.t) - Number(a.T || a.t));

        const latestCandle = sortedCandles[0];

        if (latestCandle) {
          const updatedBar: HistoryData = {
            time: Number(latestCandle.T || latestCandle.t),
            open: parseFloat(latestCandle.o),
            high: parseFloat(latestCandle.h),
            low: parseFloat(latestCandle.l),
            close: parseFloat(latestCandle.c),
            volume: parseFloat(latestCandle.v) || 0
          };

          if (!this.lastBars || !this.lastBars.time || updatedBar.time > this.lastBars.time) {
            this.lastBars = updatedBar;
            if (this.onTickCallback) {
              this.onTickCallback(this.lastBars);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching fallback candle data:', error);
    }
  }

  // 取消特定订阅者的订阅
  unsubscribeBarsById(listenerGuid: string): void {
    // console.log('[DataUpdater] unsubscribeBarsById 被调用:', {
    //   listenerGuid,
    //   existingSubscribers: Array.from(this.subscribers.keys()),
    //   hasEventBusHandler: !!this.eventBusHandler
    // })

    // 移除特定的订阅者
    const removed = this.subscribers.delete(listenerGuid)
    
    // console.log('[DataUpdater] 移除订阅者结果:', {
    //   listenerGuid,
    //   removed,
    //   remainingCount: this.subscribers.size,
    //   remainingKeys: Array.from(this.subscribers.keys())
    // })

    // 重要：不要在这里清理 eventBusHandler！
    // 因为 TradingView 的调用顺序是：先 subscribeBars(新)，再 unsubscribeBars(旧)
    // 如果在移除旧订阅者时清理了 eventBusHandler，新订阅者就无法收到数据
    // eventBusHandler 应该保持活跃，直到组件卸载时调用 unsubscribeBars()
  }

  unsubscribeBars(): void {
    // console.log('[DataUpdater] unsubscribeBars 被调用:', {
    //   currentSymbol: this.currentSymbol,
    //   currentResolution: this.currentResolution,
    //   hasEventBusHandler: !!this.eventBusHandler,
    //   subscribersCount: this.subscribers.size
    // })

    // 清空所有订阅者
    this.subscribers.clear()

    // 移除 eventBus 监听器
    if (this.eventBusHandler) {
      // console.log('[DataUpdater] 移除 eventBus 监听器')
      eventBus.remove(this.updateEventName, this.eventBusHandler)
      this.eventBusHandler = null
    }

    // 重置订阅状态
    this.currentSymbol = ''
    this.currentResolution = ''

    if (this.ws && this.isConnected && this.currentSubscription) {
      try {
        const unsubscribeMessage = {
          method: "unsubscribe",
          subscription: {
            type: "candle",
            coin: this.currentSubscription.coin,
            interval: this.currentSubscription.interval
          }
        };


        this.ws.send(JSON.stringify(unsubscribeMessage));

        this.currentSubscription = null;
      } catch (error) {
        console.error('Error unsubscribing:', error);
      }
    }

    this.cleanup();
    this.unbindBrowserNetworkEvents()

    this.isConnected = false;
    this.onTickCallback = null;
    this.connectionAttempts = 0;
    this.subscriptionQueue = [];

    if (this.fallbackInterval) {
      clearInterval(this.fallbackInterval);
      this.fallbackInterval = null;
    }
  }


  private setupMessageHandler() {
    if (!this.ws) return;

    this.ws.onmessage = (event) => {
      try {

        this.lastHeartbeatResponse = Date.now();

        let data;
        try {
          data = JSON.parse(event.data);
        } catch (parseError) {
          console.error('Failed to parse WebSocket message:', parseError);
          return;
        }

        if (this.subscriptionInProgress) {
        }

        if (data.error) {
          console.error('Error from Hyperliquid WebSocket:', data.error);

          if (data.error.includes('subscription') || data.error.includes('subscribe')) {
            setTimeout(() => {
              if (this.currentSubscription) {
                this.changeSubscription(this.currentSubscription.coin, this.currentSubscription.interval);
              }
            }, 2000);
          }
          return;
        }

        if (data.channel === 'error' && data.data && typeof data.data === 'string') {
          console.warn('Received error:', data.data);

          if (data.data.includes('Already subscribed')) {

            this.subscriptionInProgress = false;
            this.processSubscriptionQueue();
            return;
          }

          if (data.data.includes('not found') || data.data.includes('Invalid')) {
            console.error('Subscription error:', data.data);
            this.subscriptionInProgress = false;
            this.processSubscriptionQueue();
          }
        }


        if (data.channel === 'subscriptionResponse') {
          if (data.data && data.data.status === 'success') {
            this.subscriptionInProgress = false;
            this.processSubscriptionQueue();
          } else {
            console.error('Subscription failed:', data);
            if (this.currentSubscription && this.subscriptionRetryCount < this.maxSubscriptionRetries) {
              this.subscriptionRetryCount++;
              setTimeout(() => {
                this.changeSubscription(this.currentSubscription!.coin, this.currentSubscription!.interval);
              }, 2000);
            } else {
              this.subscriptionInProgress = false;
              this.processSubscriptionQueue();
            }
          }
          return;
        }

        if (data.channel === 'candle' && data.data) {

          if (this.subscriptionInProgress) {
            this.subscriptionInProgress = false;
            this.processSubscriptionQueue();
          }

          this.processCandle(data);
          return;
        }

        if (Array.isArray(data) && data.length > 0) {
          const firstItem = data[0];
          if (firstItem &&
            (typeof firstItem.o === 'string' || typeof firstItem.o === 'number') &&
            (typeof firstItem.c === 'string' || typeof firstItem.c === 'number') &&
            (typeof firstItem.h === 'string' || typeof firstItem.h === 'number') &&
            (typeof firstItem.l === 'string' || typeof firstItem.l === 'number')) {


            if (this.subscriptionInProgress) {
              this.subscriptionInProgress = false;
              this.processSubscriptionQueue();
            }

            this.processCandle(data);
            return;
          }
        }

        if (data.data && Array.isArray(data.data)) {

          if (this.subscriptionInProgress) {
            this.subscriptionInProgress = false;
            this.processSubscriptionQueue();
          }

          this.processCandle(data.data);
          return;
        }

        if (data.channel === 'pong') {
          return;
        }

        console.warn('Unrecognized WebSocket message format:', data);
      } catch (error) {
        console.error('Error processing WebSocket message:', error, event.data);
      }
    };
  }

  // 解析 TradingView resolution 字符串为秒
  private getResolutionInSeconds(resolution: string): number {
    try {
      if (!resolution) return 60;
      if (resolution.endsWith('D')) return parseInt(resolution) * 86400;
      if (resolution.endsWith('W')) return parseInt(resolution) * 7 * 86400;
      if (resolution.endsWith('M')) return parseInt(resolution) * 30 * 86400;
      const val = parseInt(resolution);
      return isNaN(val) ? 60 : val * 60; // 默认以分钟为单位
    } catch {
      return 60;
    }
  }

  // 是否为天（不含）以上周期
  // 1D 无需额外处理
  private isDailyOrHigherResolution(resolution: string): boolean {
    if (!resolution) {
      return false
    }

    const upper = resolution.toUpperCase()

    // 含有日/周/月后缀的（如 3D / 1W / 1M）都视为“天以上周期”
    if ((upper.endsWith('D') && upper !== '1D') || upper.endsWith('W') || upper.endsWith('M')) {
      return true
    }

    return false
  }
}