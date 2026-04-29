import { openDB } from 'idb';

const DB_NAME = 'category-list-db';
const STORE_NAME = 'snapshots-category';

export interface CategoryListCache {
  list: string[];
  lastUpdated: number;
  condition: string;
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

export async function saveCategorySnapshot(data: CategoryListCache) {
  const db = await getDB();
  await db.put(STORE_NAME, { ...data, ts: Date.now() }, `list-category`);
}

export async function loadCategorySnapshot(): Promise<CategoryListCache | null> {
  const db = await getDB();
  const cached = await db.get(STORE_NAME, `list-category`);
  if (!cached) return null;
  
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  const isFresh = Date.now() - cached.ts < SIX_HOURS;
  
  return isFresh ? cached : null;
}

export async function clearCategoryCache() {
  const db = await getDB();
  await db.clear(STORE_NAME);
}