import { get, set, del, keys } from 'idb-keyval'

interface TTLData<T> {
  value: T
  expiry: number // timestamp in ms
}

class TTLStorage {
  set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    const expiry = Date.now() + ttlMs
    const data: TTLData<T> = { value, expiry }
    return set(key, data)
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await get<TTLData<T>>(key)
    if (!data) return null
    if (Date.now() > data.expiry) {
      await del(key)
      return null
    }
    return data.value
  }

  async cleanupExpired(): Promise<void> {
    const allKeys = await keys()
    console.log('Cleaning up expired keys, total keys:', allKeys.length)
    for (const key of allKeys) {
      const data = await get<any>(key)
      if (data && typeof data.expiry === 'number' && Date.now() > data.expiry) {
        console.log('Cleaning up expired key:', key)
        await del(key)
      }
    }
  }

  remove(key: string): Promise<void> {
    return del(key)
  }

  keys(): Promise<string[]> {
    return keys()
  }
}

export const ttlStorage = new TTLStorage()
