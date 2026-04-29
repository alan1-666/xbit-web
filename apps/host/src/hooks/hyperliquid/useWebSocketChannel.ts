import { useEffect, useRef, useMemo, useState } from "react";
import { CustomizeWebsocket } from '@/lib/websocket';
import { Configs } from '@/const/configs'

let socket: CustomizeWebsocket | null = null;
const socketMap: Map<string, CustomizeWebsocket> = new Map();

// 统一获取默认 Hyperliquid WebSocket 地址，避免重复调用 Configs
const getDefaultWssUrl = () => {
  return Configs.getHyperliquidConfig().wss;
}

// 根据 URL 重置对应的 WebSocket 实例：
// - 未传 url：重置默认单例 socket
// - 传入 url：重置 socketMap 中的对应实例
const resetSocketInstance = (url?: string) => {
  if (url) {
    const targetUrl = url;
    const existing = socketMap.get(targetUrl);
    if (existing) {
      existing.doClose('client');
      socketMap.delete(targetUrl);
    }
    return;
  }

  if (socket) {
    socket.doClose('client');
    socket = null;
  }
}


function getSocketInstance(url?: string) {
  // 如果没有指定 URL，使用默认的 Hyperliquid WebSocket
  const targetUrl = url || getDefaultWssUrl();
  
  // 如果指定了 URL，使用 socketMap 管理多个实例
  if (url) {
    if (!socketMap.has(targetUrl)) {
      socketMap.set(targetUrl, new CustomizeWebsocket(targetUrl));
    }
    return socketMap.get(targetUrl)!;
  }
  
  // 默认使用单例 socket（保持向后兼容）
  if (!socket) {
    socket = new CustomizeWebsocket(targetUrl);
  }
  return socket;
}

export function useWebSocketChannel(
  channel: string,
  params: Record<string, any> | null,
  callback: (data: any) => void,
  wssUrl?: string
) {
  const cbRef = useRef(callback);
  const stableParams = useMemo(() => params, [JSON.stringify(params)]);
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return true;
    }
    return navigator.onLine;
  });

  // 仅针对 K 线专用 wss，在网络恢复后强制丢弃旧实例，下一次订阅时重建连接
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const onOnline = () => {
      setIsOnline(true);

      // 网络恢复时，重置当前 hook 使用的 WebSocket 实例：
      // - 如果传入了 wssUrl，则重置对应 URL 的实例（例如 K 线专用 wss）
      // - 如果未传入 wssUrl，则重置默认 Hyperliquid WebSocket 单例
      const targetUrl = wssUrl || getDefaultWssUrl();
      resetSocketInstance(targetUrl === getDefaultWssUrl() ? undefined : targetUrl);
    };

    const onOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [wssUrl]);


  useEffect(() => {
    cbRef.current = callback;
  }, [callback]);


  useEffect(() => {
    if (!params || !isOnline) {
      return;
    }
    
    const socketInstance = getSocketInstance(wssUrl);

    const subData = {
      method: "subscribe",
      subscription: stableParams,
    };


    const internalCallback = (data: any) => {
      cbRef.current(data);
    };

    socketInstance.subscribe(subData, channel, internalCallback);

    return () => {
      socketInstance.unsubscribe(channel, internalCallback);
    };
  }, [stableParams, params, channel, isOnline, wssUrl]);
}


if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    socket?.doClose("client");
    socket = null;
    // 清理所有 socket 实例
    socketMap.forEach((s) => s.doClose("client"));
    socketMap.clear();
  });
}