import { openDB } from 'idb';
import type { OrderBook } from '@/hooks/hyperliquid/useOrderBookData';

const DB_NAME = 'orderbook-db';
const STORE_NAME = 'snapshots';

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

export async function saveOrderBookSnapshot(symbol: string, data: OrderBook) {
  const db = await getDB();
  await db.put(STORE_NAME, { ...data, ts: Date.now() }, symbol);
}

export async function loadOrderBookSnapshot(symbol: string): Promise<OrderBook | null> {
  const db = await getDB();
  const cached = await db.get(STORE_NAME, symbol);
  if (!cached) return null;

  const SIX_HOURS = 6 * 60 * 60 * 1000; // 6 小时 = 21600000 毫秒
  const isFresh = Date.now() - cached.ts < SIX_HOURS;

  return isFresh ? cached : null;
}