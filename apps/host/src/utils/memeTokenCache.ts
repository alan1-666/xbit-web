import { set, get, del, clear, keys } from 'idb-keyval'

// In-memory cache for fast access
const memoryCache: Record<string, any> = {}

export const memeTokenCache = {
  /**
   * Get data for a token from memory cache first, then fallback to IndexedDB.
   * Returns a Promise that resolves to the cached data or undefined.
   * @param {string} token
   * @param {number} [ttl] - Time to live in milliseconds
   */
  async get(token: string, ttl?: number) {
    const now = Date.now()
    let cached = memoryCache[token]
    if (!cached) {
      cached = await get(token)
      if (cached) memoryCache[token] = cached
    }
    if (cached && ttl) {
      if (!cached.__cachedAt || now - cached.__cachedAt > ttl) {
        // Expired
        this.remove(token)
        return undefined
      }
    }
    // Return data without __cachedAt
    if (cached && typeof cached === 'object' && '__cachedAt' in cached) {
      const { __cachedAt, ...data } = cached
      return data
    }
    return cached
  },

  /**
   * Set data for a token in both memory cache and IndexedDB.
   * @param {string} token
   * @param {any} data
   * @param ttl - Time to live in milliseconds
   */
  set(token: string, data: any, ttl?: number) {
    const wrapped = { ...data, __cachedAt: Date.now(), __ttl: ttl }
    memoryCache[token] = wrapped
    set(token, wrapped)
  },

  /**
   * Remove a token from both memory cache and IndexedDB.
   */
  remove(token: string) {
    delete memoryCache[token]
    del(token)
  },

  /**
   * Clear all cache (memory and IndexedDB).
   */
  clearAll() {
    for (const key in memoryCache) delete memoryCache[key]
    clear()
  },

  cleanExpired: async () => {
    const allKeys = await keys()
    for (const key of allKeys) {
      const data = await get<any>(key)
      const ttl = data?.__ttl ?? 0
      if (data && typeof data.__cachedAt === 'number' && Date.now() - data.__cachedAt > ttl) {
        await del(key)
      }
    }
  },
}
