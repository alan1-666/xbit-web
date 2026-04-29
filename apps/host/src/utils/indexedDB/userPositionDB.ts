import { xPositions } from '@/components/futuresDetails/trade/types'
import { openDB } from 'idb'

const DB_NAME = 'user-position-db'
const STORE_NAME = 'positions'

export interface UserPositionCache {
  positions: Array<xPositions>
  oneDayChange: number
  lastUpdated: number
  rawUSD: number
  balance: number
}

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    },
  })
}

export async function saveUserPosition(data: UserPositionCache) {
  const db = await getDB()
  await db.put(STORE_NAME, { ...data, ts: Date.now() }, 'user-positions')
}

async function getCurrentData(): Promise<UserPositionCache> {
  const db = await getDB()
  const cached = await db.get(STORE_NAME, 'user-positions')

  return (
    cached || {
      positions: [],
      oneDayChange: 0,
      lastUpdated: 0,
      rawUSD: 0,
      balance: 0,
    }
  )
}

export async function saveUserPositionWeb2AndBalance(positions: UserPositionCache['positions'], balance: UserPositionCache['balance']) {
  const currentData = await getCurrentData()
  const updatedData = {
    ...currentData,
    positions,
    balance,
    ts: Date.now(),
  }
  const db = await getDB()
  await db.put(STORE_NAME, updatedData, 'user-positions')
}

export async function saveBalance(balance: UserPositionCache['balance']) {
  const currentData = await getCurrentData()
  const updatedData = {
    ...currentData,
    balance,
    ts: Date.now(),
  }
  const db = await getDB()
  await db.put(STORE_NAME, updatedData, 'user-positions')
}

export async function loadUserPosition(): Promise<UserPositionCache | null> {
  const db = await getDB()
  const cached = await db.get(STORE_NAME, 'user-positions')
  if (!cached) return null

  const ONE_HOURS = 60 * 60 * 1000
  const isFresh = Date.now() - cached.ts < ONE_HOURS

  return isFresh ? cached : null
}

export async function clearUserPositionCache() {
  const db = await getDB()
  await db.clear(STORE_NAME)
}
