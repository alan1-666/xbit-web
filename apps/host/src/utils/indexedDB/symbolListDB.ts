import { openDB } from 'idb';

const DB_NAME = 'symbol-list-db';
const STORE_NAME = 'snapshots';

export interface SymbolListCache {
  list: any[];
  lastUpdated: number;
  condition: string;
  category?: string; // Thêm category field
}

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

// Tạo key duy nhất cho từng category
function createCacheKey(condition: string, category?: string): string {
  // if (condition === 'category' && category) {
  //   return `list-${condition}-${category}`;
  // }
  if(!!category) {
    return `list-${condition}-${category}`;
  }
  return `list-${condition}`;
}

export async function saveSymbolListSnapshot(condition: string, data: SymbolListCache, category?: string) {
  const db = await getDB();
  const key = createCacheKey(condition, category);
  await db.put(STORE_NAME, { ...data, ts: Date.now(), category }, key);
}

export async function loadSymbolListSnapshot(condition: string, category?: string): Promise<SymbolListCache | null> {
  const db = await getDB();
  const key = createCacheKey(condition, category);
  const cached = await db.get(STORE_NAME, key);
  if (!cached) return null;

  const SIX_HOURS = 6 * 60 * 60 * 1000;
  const isFresh = Date.now() - cached.ts < SIX_HOURS;

  return isFresh ? cached : null;
}

export async function clearSymbolListCache() {
  const db = await getDB();
  await db.clear(STORE_NAME);
}

export async function getAllCacheKeys(): Promise<string[]> {
  const db = await getDB();
  const keys = await db.getAllKeys(STORE_NAME);
  return keys.map(key => String(key));
}