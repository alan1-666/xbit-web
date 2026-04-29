import { useEffect, useRef, useState, useMemo } from "react";
import { useWebSocketChannel } from "@/hooks/hyperliquid/useWebSocketChannel";
import isEqual from "lodash/isEqual";
import { fetchOrderBookSnapshot } from "@/api/hyperliquid";
import { loadOrderBookSnapshot, saveOrderBookSnapshot } from "@/utils/indexedDB/orderbookDB";

export interface OrderBookItem {
  price: number;
  quantity: number;
}

export interface OrderBook {
  bids: OrderBookItem[];
  asks: OrderBookItem[];
}

export function useOrderBookData(symbol: string, nSigFigs?: number | null, mantissa?: number | null, tier?: any): OrderBook {
  const [bids, setBids] = useState<OrderBookItem[]>([]);
  const [asks, setAsks] = useState<OrderBookItem[]>([]);

  const latestBidsRef = useRef<OrderBookItem[]>([]);
  const latestAsksRef = useRef<OrderBookItem[]>([]);
  const frameRef = useRef<number | null>(null);

  const channel = "l2Book";

  const params = useMemo(() => {
    if (!symbol || nSigFigs === undefined || mantissa === undefined || !tier) return null;
    
    return {
      type: "l2Book",
      coin: symbol,
      nSigFigs: nSigFigs ?? null,
      mantissa: mantissa ?? null,
    };
  }, [symbol, nSigFigs, mantissa, tier]);

  useEffect(() => {
    if (!symbol) return;
    setBids([]);
    setAsks([]);
    latestBidsRef.current = [];
    latestAsksRef.current = [];
    try {
      loadOrderBookSnapshot(symbol).then(async (cached) => {
        if (cached) {
          setBids(cached.bids);
          setAsks(cached.asks);
          latestBidsRef.current = cached.bids;
          latestAsksRef.current = cached.asks;
          
        }

          const snapshot = await fetchOrderBookSnapshot({
            type: 'l2Book',
            coin: symbol,
            nSigFigs,
            mantissa,
          });
          const bidsData = snapshot.levels[0].map(parseOrderBookItem);
          const asksData = snapshot.levels[1].map(parseOrderBookItem);
          setBids(bidsData);
          setAsks(asksData);
          latestBidsRef.current = bidsData;
          latestAsksRef.current = asksData;

          saveOrderBookSnapshot(symbol, { bids: bidsData, asks: asksData });
        });

    } catch (error) {
      
    }
  }, [symbol, nSigFigs, mantissa]);



  useWebSocketChannel(channel, params, (data) => {
    if (!symbol || !data?.levels?.length) return;
    if (data?.coin !== params?.coin) return

    latestBidsRef.current = data.levels[0].map(parseOrderBookItem);
    latestAsksRef.current = data.levels[1].map(parseOrderBookItem);

    if (frameRef.current === null) {
      frameRef.current = requestAnimationFrame(() => {
        if (!isEqual(bids, latestBidsRef.current)) {
          setBids(latestBidsRef.current);
        }
        if (!isEqual(asks, latestAsksRef.current)) {
          setAsks(latestAsksRef.current);
        }

        saveOrderBookSnapshot(symbol, {
          bids: latestBidsRef.current,
          asks: latestAsksRef.current,
        });

        frameRef.current = null;
      });
    }
  });

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return { bids, asks };
}

function parseOrderBookItem(item: any): OrderBookItem {
  return {
    price: parseFloat(item.px),
    quantity: parseFloat(item.sz),
  };
}
