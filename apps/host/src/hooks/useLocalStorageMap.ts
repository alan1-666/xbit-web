import ls from '@/lib/local-storage'
import { useState, useEffect, useCallback } from 'react'

export function useLocalStorageMap<T>(storageKey: string, initialValue: Map<string, T> = new Map()) {
  // Load Map from localStorage on init
  const [map, setMap] = useState<Map<string, T>>(() => {
    const raw = ls.get(storageKey)
    if (!raw) return initialValue
    try {
      return new Map(JSON.parse(raw))
    } catch {
      return initialValue
    }
  })

  // Sync state back to localStorage whenever the map changes
  useEffect(() => {
    ls.set(storageKey, JSON.stringify(Array.from(map.entries())))
  }, [map, storageKey])

  // Add or update an item
  const setItem = useCallback((key: string, value: T) => {
    setMap((prev) => {
      const newMap = new Map(prev)
      newMap.set(key, value)
      return newMap
    })
  }, [])

  // Remove an item
  const removeItem = useCallback((key: string) => {
    setMap((prev) => {
      const newMap = new Map(prev)
      newMap.delete(key)
      return newMap
    })
  }, [])

  // Clear all items
  const clear = useCallback(() => {
    setMap(new Map())
  }, [])

  // Check if a key exists
  const hasItem = useCallback(
    (key: string): boolean => {
      return map.has(key)
    },
    [map],
  )

  // Get value by key
  const getItem = useCallback(
    (key: string): T | undefined => {
      return map.get(key)
    },
    [map],
  )

  return { map, setItem, removeItem, clear, hasItem, getItem }
}
