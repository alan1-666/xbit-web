import { useState, useMemo, useEffect } from "react";
import { useWebSocketChannel } from "@/hooks/hyperliquid/useWebSocketChannel";
import { getCandleSnapshot } from "@/api/hyperliquid";


export interface TickerSnapshot {
    T: number;
    c: string;
    h: string;
    i: string;
    l: string;
    n: number;
    o: string;
    s: string;
    t: number;
    v: string;
}[]

export function useCandleOneDay(symbol: string) {
  const [ticker, setTicker] = useState<TickerSnapshot | undefined>();



  const channel = 'candle_1d';
  const interval = '1d'

  const params = useMemo(() => {
    if (!symbol) return null; 
    return {
      type: 'candle',
      coin: symbol,
      interval: interval
    }
  }, [symbol, interval]);


  useEffect(() => {
    if (!symbol) return;
    try {
      (async () => {
        const endTime = Date.now()
        const startTime = endTime - 24 * 60 * 60 * 1000; 
        const snapshot = await getCandleSnapshot({
          coin: symbol,
          interval,
          startTime,
          endTime
        });
        if(snapshot && snapshot.length) {
          
          setTicker(snapshot[snapshot.length - 1])
        }        

      })()
      

    } catch (error) {
      
    }
  }, [symbol]);

  useWebSocketChannel(
    channel,
    params,
    (data) => {
      if (data?.s !== params?.coin) return
      setTicker(data)
    }
  );




  return { 
    ticker
  }
}
