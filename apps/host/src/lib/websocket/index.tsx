import { socketLoginData } from "./socketLoginData";

enum ConnState {
  CLOSED = 0,
  CONNECTING = 1,
  OPEN = 2,
}

type MessageHandler = (data: any) => void;
type WebSocketEvent = "open" | "close" | "login" | "ping" | "message" | string;
type CloseType = "normal" | "client";

interface SocketMessage {
  Event?: WebSocketEvent;
  Data?: any;
  channel?: string;
  data?: any;
  method?: string;
  error?: { code: number };
}

export class CustomizeWebsocket {
  private baseUrl: string;
  private heartBeatTimer: number | null = null;
  private messageMap: Map<WebSocketEvent, Set<MessageHandler>> = new Map();
  private subscribeMap: Map<string, any> = new Map();
  private waitSubMap: Map<string, any> = new Map();
  private connState: ConnState = ConnState.CLOSED;
  private repeatCount = 0;
  private repeatTimer: number | null = null;
  private socket: WebSocket | null = null;
  private closeType: CloseType = "normal";
  private hasOpenListener = false;
  private readonly maxRetryCount = 10;
  private readonly heartbeatInterval = 30000; // 30秒

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.init();
  }

  private async init() {
    if (this.connState !== ConnState.CLOSED) return;
    
    this.cleanup();
    this.connState = ConnState.CONNECTING;
    
    try {
      const BrowserWebSocket = window.WebSocket || window.MozWebSocket;
      const socket = new BrowserWebSocket(this.baseUrl);
      socket.binaryType = "arraybuffer";
      
      socket.onopen = (event) => this.onOpen(event);
      socket.onclose = (event) => this.onClose(event);
      socket.onmessage = (event) => this.onMessage(event.data);
      socket.onerror = (err) => this.onError(err);
      
      this.socket = socket;
    } catch (err) {
      console.error("WebSocket initialization failed:", err);
      this.reConnect();
    }
  }

  private cleanup() {
    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onclose = null;
      this.socket.onmessage = null;
      this.socket.onerror = null;
      
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.close();
      }
    }
    
    this.clearTimers();
  }

  private clearTimers() {
    if (this.heartBeatTimer) {
      clearInterval(this.heartBeatTimer);
      this.heartBeatTimer = null;
    }
    
    if (this.repeatTimer) {
      clearTimeout(this.repeatTimer);
      this.repeatTimer = null;
    }
  }

  private onOpen(event: Event) {
    this.connState = ConnState.OPEN;
    this.repeatCount = 0; // 重置重试计数器
    this.loginSocket().catch(console.error);
    this.onReceiver({ Event: "open" });

    setTimeout(() => {
      this.clearTimers();
      this.checkHeartbeat();
      this.heartBeatTimer = window.setInterval(
        this.checkHeartbeat.bind(this), 
        this.heartbeatInterval
      );
      this.subscribeMap.forEach((value, key) => this.sendMessage(value, key));
    }, 500);
  }

  private onClose(event: CloseEvent) {
    const wasConnected = this.connState === ConnState.OPEN;
    this.connState = ConnState.CLOSED;
    
    if (wasConnected) {
      this.onReceiver({ Event: "close", Data: event });
    }
    
    if (this.closeType === "normal") {
      this.reConnect();
    } else {
      this.closeType = "normal";
    }
  }

  private onError(err: Event) {
    console.error("WebSocket error:", err);
    this.reConnect();
  }

  private reConnect() {
    this.clearTimers();
    
    if (this.repeatCount >= this.maxRetryCount) {
      console.error("Maximum reconnection attempts reached");
      return;
    }
    
    const retryTime = Math.min(Math.pow(2, this.repeatCount), 64) * 1000;
    this.repeatTimer = window.setTimeout(() => {
      this.repeatCount++;
      this.init();
    }, retryTime);
  }

  private checkHeartbeat() {
    this.sendMessage({ method: "ping" });
  }

  private upsertMap(map: Map<string, any>, key: string, value: any) {
    if (!map.has(key)) map.set(key, value);
  }

  /**
   * 添加事件处理器
   * @param name 事件名称
   * @param handler 处理器函数
   */
  on(name: WebSocketEvent, handler: MessageHandler): this {
    if (!this.messageMap.has(name)) {
      this.messageMap.set(name, new Set());
    }
    this.messageMap.get(name)!.add(handler);
    return this;
  }

  /**
   * 移除特定事件处理器
   * @param name 事件名称
   * @param handler 要移除的处理器函数
   */
  off(name: WebSocketEvent, handler: MessageHandler): this {
    if (this.messageMap.has(name)) {
      const handlers = this.messageMap.get(name)!;
      handlers.delete(handler);
      
      if (handlers.size === 0) {
        this.messageMap.delete(name);
      }
    }
    return this;
  }

  /**
   * 移除某事件的所有处理器
   * @param name 事件名称
   */
  offAll(name: WebSocketEvent): this {
    this.messageMap.delete(name);
    return this;
  }

  /**
   * 触发事件，调用所有注册的处理器
   * @param data 事件数据
   */
  private onReceiver(data: { Event: WebSocketEvent; Data?: any }): void {
    const { Event, Data } = data;
    
    if (this.messageMap.has(Event)) {
      // 使用 Array.from 创建副本避免迭代时修改的问题
      const handlers = Array.from(this.messageMap.get(Event)!);
      
      handlers.forEach(handler => {
        try {
          handler(Data);
        } catch (err) {
          console.error(`Error in handler for event "${Event}":`, err);
        }
      });
    }
  }

  doClose(type: CloseType = "normal"): void {
    this.closeType = type;
    this.clearTimers();
    
    if (this.socket) {
      this.cleanup();
      this.socket = null;
    }
    
    this.messageMap.clear();
    this.waitSubMap.clear();
    this.subscribeMap.clear();
    this.connState = ConnState.CLOSED;
    this.repeatCount = 0;
  }

  async loginSocket(): Promise<boolean> {
    const loginData = socketLoginData();
    if (!loginData) return true;
    
    return new Promise((resolve, reject) => {
      this.sendMessage(loginData, "login");
      
      const loginHandler = (data: any) => {
        this.off("login", loginHandler); 
        
        const { error } = data || {};
        if (error?.code) {
          reject(error);
        } else {
          resolve(true);
        }
      };
      
      this.on("login", loginHandler);
    });
  }

  checkOpen(): boolean {
    return this.connState === ConnState.OPEN;
  }

  sendMessage(data: any, callbackName: WebSocketEvent = "ping"): void {
    if (this.checkOpen()) {
      try {
        this.socket?.send(JSON.stringify(data));
      } catch (err) {
        console.error("Error sending message:", err);
      }
    } else {
      if (callbackName !== "ping") {
        this.upsertMap(this.waitSubMap, callbackName, data);
      }
      
      if (!this.hasOpenListener) {
        this.hasOpenListener = true;
        this.on("open", () => {
          this.waitSubMap.forEach((value, key) => {
            this.sendMessage(value, key);
            if (key !== "ping") this.waitSubMap.delete(key);
          });
        });
      }
    }
  }

  subscribe(data: any, callbackName: string, callback: MessageHandler): this {
    if (!this.subscribeMap.has(callbackName)) {
      this.subscribeMap.set(callbackName, data);
      this.sendMessage(data, callbackName);
    }
    this.on(callbackName, callback);
    return this;
  }

  unsubscribe(callbackName: string, callback?: MessageHandler): this {
    if (callback) {
      this.off(callbackName, callback);
      
      if (this.messageMap.has(callbackName)) {
        return this;
      }
    } else {
      this.offAll(callbackName);
    }
    
    if (this.subscribeMap.has(callbackName)) {
      const unsubscribeData = { 
        ...this.subscribeMap.get(callbackName), 
        method: "unsubscribe" 
      };
      this.sendMessage(unsubscribeData, callbackName);
      this.subscribeMap.delete(callbackName);
    }
    return this;
  }

  private onMessage(message: string | ArrayBuffer): void {
    if (typeof message !== "string") {
      console.warn("Binary message received, but not handled");
      return;
    }

    try {
      if (!message.trim()) return;
      
      const data: SocketMessage = JSON.parse(message);
      const eventType = data.Event || data.channel;
      const eventData = data.Data || data.data;

      if (eventType === 'candle' && eventData?.i === '1d') {
        this.onReceiver({ Event: 'candle_1d', Data: eventData });
      }
      
      if (eventType) {
        this.onReceiver({ Event: eventType, Data: eventData });
      }
      
      if (data.Event) {
        this.onReceiver({ Event: data.Event, Data: data.Data });
      }
    } catch (err) {
      console.error("Data parsing error:", err, "Raw message:", message);
    }
  }
}