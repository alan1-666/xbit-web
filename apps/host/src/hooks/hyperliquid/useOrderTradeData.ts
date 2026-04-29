import { useState, useMemo } from "react";
import { useWebSocketChannel } from "@/hooks/hyperliquid/useWebSocketChannel";
import dayjs from "dayjs";

export type OrderSide = 'Buy' | 'Sell';

export interface OrderTradeItem {
  time: string;
  side: OrderSide;
  price: number;
  quantity: number;
  timestamp: number;
}

export function useOrderTradeData(symbol: string): OrderTradeItem[] {
  const [tradesData, setTradesData] = useState<OrderTradeItem[]>([]);

  const channel = "trades";

  const params = useMemo(() => {
    if (!symbol) return null;
    setTradesData([]);
    return {
      type: "trades",
      coin: symbol,
    };
  }, [symbol]);

  useWebSocketChannel(channel, params, (data) => {
    if (!symbol) return;
    const newTrades = data || [];
    if (!Array.isArray(newTrades) || !newTrades.length) return;
    if (newTrades[0].coin !== params?.coin) return

    setTradesData((prev:any) => {
      const parsedNewTrades = newTrades.map((item: any) => {
        const timestamp = Number(item.time);
        return {
          time: dayjs(timestamp).format("HH:mm:ss"),
          side: item.side === "B" ? "Buy" : "Sell",
          price: parseFloat(item.px),
          quantity: parseFloat(item.sz),
          timestamp,
        };
      });

      const combined = [...parsedNewTrades, ...prev];
      combined.sort((a, b) => b.timestamp - a.timestamp);

      return combined.slice(0, 100);
    });
  });

  return tradesData;
}
