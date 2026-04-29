import { openDB } from 'idb'

const DB_NAME = 'market-db'
const STORE_NAME = 'snapshots'

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    },
  })
}

export async function saveSymbolSnapshot(symbol: string, data: any) {
  const db = await getDB()
  await db.put(STORE_NAME, { ...data, ts: Date.now() }, `symbol-${symbol}`)
}

export async function loadSymbolSnapshot(symbol: string): Promise<any | null> {
  const db = await getDB()
  const cached = await db.get(STORE_NAME, `symbol-${symbol}`)
  if (!cached) return null

   const SIX_HOURS = 1 * 60 * 60 * 1000;
  const isFresh = Date.now() - cached.ts < SIX_HOURS;

  return isFresh ? cached : null
}
