import { RedPacketFeatures } from '@/@generated/gql/graphql-redpacket'

const CACHE_KEY = 'redpacket_features_cache'
const CACHE_TIMESTAMP_KEY = 'redpacket_features_cache_timestamp'
const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存有效期

export interface RedPacketCache {
  data: RedPacketFeatures | null
  timestamp: number
}

/**
 * 保存红包配置到本地缓存
 */
export const saveRedPacketCache = (data: RedPacketFeatures | null) => {
  try {
    const cache: RedPacketCache = {
      data,
      timestamp: Date.now(),
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.error('Failed to save redpacket cache:', error)
  }
}

/**
 * 从本地缓存获取红包配置
 * @param checkExpiry 是否检查缓存是否过期，默认为 true
 */
export const getRedPacketCache = (checkExpiry = true): RedPacketFeatures | null => {
  try {
    const cacheStr = localStorage.getItem(CACHE_KEY)
    if (!cacheStr) return null

    const cache: RedPacketCache = JSON.parse(cacheStr)
    
    // 检查缓存是否过期
    if (checkExpiry) {
      const now = Date.now()
      if (now - cache.timestamp > CACHE_DURATION) {
        // 缓存过期，清除缓存
        clearRedPacketCache()
        return null
      }
    }

    return cache.data
  } catch (error) {
    console.error('Failed to get redpacket cache:', error)
    return null
  }
}

/**
 * 清除红包配置缓存
 */
export const clearRedPacketCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY)
    localStorage.removeItem(CACHE_TIMESTAMP_KEY)
  } catch (error) {
    console.error('Failed to clear redpacket cache:', error)
  }
}
