import { openDB, type IDBPDatabase } from 'idb'

const DB_VERSION = 1

const dbPromises = new Map<string, Promise<IDBPDatabase>>()

function getDB(dbName: string, storeNames: string[]): Promise<IDBPDatabase> {
  let dbPromise = dbPromises.get(dbName)

  if (!dbPromise) {
    dbPromise = openDB(dbName, DB_VERSION, {
      upgrade(db) {
        storeNames.forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName)
          }
        })
      },
    })

    dbPromises.set(dbName, dbPromise)
  }

  return dbPromise
}

export async function getFromIDB<T>(dbName: string, storeName: string, key: IDBValidKey): Promise<T | undefined> {
  try {
    if (typeof window === 'undefined') return undefined

    const db = await getDB(dbName, [storeName])
    const result = await db.get(storeName, key)

    return result as T | undefined
  } catch {
    return undefined
  }
}

export async function setToIDB<T>(dbName: string, storeName: string, key: IDBValidKey, value: T): Promise<void> {
  try {
    if (typeof window === 'undefined') return

    const db = await getDB(dbName, [storeName])
    await db.put(storeName, value, key)
  } catch {
    // Swallow errors: cache must never break UI
  }
}
