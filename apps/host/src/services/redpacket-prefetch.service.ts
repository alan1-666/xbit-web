import { redpacketClient } from '@/lib/gql/apollo-client'
import { GET_RED_PACKET_STATUS_FEATURES } from '@/services/redpacket.service'
import { saveRedPacketCache } from '@/utils/redpacket-cache'

/**
 * 预加载红包配置并缓存到本地
 * 这个函数会在应用启动时调用，提前获取红包配置
 */
export const prefetchRedPacketFeatures = async () => {
  try {
    const res = await redpacketClient.query({
      query: GET_RED_PACKET_STATUS_FEATURES,
      variables: {},
      fetchPolicy: 'network-only', // 强制从网络获取最新数据
    })
    
    if (res?.data?.getRedPacketFeatures) {
      // 保存到缓存
      saveRedPacketCache(res.data.getRedPacketFeatures)
      console.log('Redpacket features prefetched and cached')
    }
  } catch (error) {
    console.error('Failed to prefetch redpacket features:', error)
  }
}
