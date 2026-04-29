import { useEffect, useMemo, useState } from "react";
import { useWebSocketChannel } from "@/hooks/hyperliquid/useWebSocketChannel";

import dayjs from "dayjs";

export type OrderSide = 'Buy' | 'Sell';

export interface LastestTrade {
  time: string;
  side: OrderSide;
  price: number;
  quantity: number;
}

const defaultTrade: LastestTrade = {
  time: '',
  side: 'Buy',
  price: 0,
  quantity: 0,
};

export function useOrderTradeData(symbol: string): LastestTrade {
  const [tradesData, setTradesData] = useState<LastestTrade>(defaultTrade);

  const channel = "trades";

  const params = useMemo(() => {
    if (!symbol) return null;
    return {
      type: "trades",
      coin: symbol,
    };
  }, [symbol]);

 

  useWebSocketChannel(channel, params, (data) => {
    if (!symbol || !Array.isArray(data) || !data.length) return;

    const lastestTrade = data[data.length - 1];

    const parsed: LastestTrade = {
      time: dayjs(lastestTrade.time).format("HH:mm:ss"),
      side: lastestTrade.side === 'B' ? 'Buy' : 'Sell',
      price: parseFloat(lastestTrade.px),
      quantity: parseFloat(lastestTrade.sz),
    };

    setTradesData(parsed);
  });

  return tradesData;
}
