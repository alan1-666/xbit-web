import { cn, formatUserId } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { redpacketClient } from '@/lib/gql/apollo-client'
import { GET_TRADING_LEADERBOARD } from '@/services/redpacket.service.ts'
import { LeaderboardEntry } from '@/@generated/gql/graphql-redpacket'
import { IconEmpty } from '@/components/icon'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/components/ui/skeleton'
import ls from '@/lib/local-storage'
import { formatAmount } from '@/lib/format'


const LeaderboardItem = ({ rank, userId, amount, iconType }: { rank: number; userId: string; amount: string; iconType?: 'gold' | 'silver' | 'bronze' | 'number' }) => {
  const renderIcon = () => {
    if (iconType === 'gold') {
      return (
        <div className="w-6 h-6 relative overflow-hidden">
          <img src="/images/redpacket/gold-icon.svg" />
        </div>
      )
    } else if (iconType === 'silver') {
      return (
        <div className="w-6 h-6 relative overflow-hidden">
          <img src="/images/redpacket/silver-icon.svg" />
        </div>
      )
    } else if (iconType === 'bronze') {
      return (
        <div className="w-6 h-6 relative overflow-hidden">
          <img src="/images/redpacket/bronze-icon.svg" />
        </div>
      )
    } else {
      return <div className="w-6 h-6 text-center justify-center text-white text-sm font-medium  leading-4">{rank}</div>
    }
  }

  return (
    <div className={`self-stretch px-1.5 ${rank <= 3 ? 'py-2' : 'py-3'} border-b border-white/20 inline-flex justify-between items-center`}>
      <div className="flex justify-start items-center gap-2">
        {renderIcon()}
        <div className="w-20 self-stretch justify-start text-white text-sm font-medium  leading-4">{userId}</div>
      </div>
      <div className="justify-start text-neutral-500 text-xs font-medium ">{amount}</div>
    </div>
  )
}

const LeaderboardPage = ({ }: {}) => {
  const { t } = useTranslation()
  const [leaderboardData, setLeaderboardData] = useState<Array<{ rank: number; userId: string; amount: string; iconType?: 'gold' | 'silver' | 'bronze' | 'number' }>>([])
  const [myRank, setMyRank] = useState<number | null>(null)
  const [leaderboardStatus, setLeaderboardStatus] = useState<'LIVE' | 'ENDED' | null>(null)
  
  // 本地存储的 key
  const LEADERBOARD_CACHE_KEY = 'redpacket.leaderboard'
  
  // 初始化时检查是否有缓存，决定是否显示 loading
  const [loading, setLoading] = useState<boolean>(() => {
    // 首次访问时，如果没有缓存数据，显示 loading
    const hasCache = !!ls.get(LEADERBOARD_CACHE_KEY)
    return !hasCache
  })

  // 从本地存储加载数据
  const loadLeaderboardFromCache = () => {
    try {
      const cachedData = ls.get(LEADERBOARD_CACHE_KEY) as { leaderboardData: Array<{ rank: number; userId: string; amount: string; iconType?: 'gold' | 'silver' | 'bronze' | 'number' }>; myRank: number | null; leaderboardStatus: 'LIVE' | 'ENDED' | null } | null
      if (cachedData) {
        setLeaderboardData(cachedData.leaderboardData)
        setMyRank(cachedData.myRank)
        setLeaderboardStatus(cachedData.leaderboardStatus)
      }
    } catch (error) {
      // 如果读取失败，忽略错误
    }
  }

  const getTradingLeaderboard = async () => {
    try {
      const res = await redpacketClient.query({
        query: GET_TRADING_LEADERBOARD,
        variables: {
          "limit": 100
        },
      })
      
      const data = (res?.data?.getTradingLeaderboard?.rankings || [])?.map((item: LeaderboardEntry, index: number) => ({
        rank: item.rank,
        userId: formatUserId(item.walletAddress as string),
        amount: formatAmount(item.tradingVolume, {roundMode: 'floor'}) + ' USDC',
        iconType: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'number'
      }))
      const newMyRank = res?.data?.getTradingLeaderboard?.myRank || null
      const newLeaderboardStatus = res?.data?.getTradingLeaderboard?.leaderboardStatus || null
      
      setMyRank(newMyRank)
      setLeaderboardData(data)
      setLeaderboardStatus(newLeaderboardStatus)
      
      // 保存到本地存储
      ls.set(LEADERBOARD_CACHE_KEY, {
        leaderboardData: data,
        myRank: newMyRank,
        leaderboardStatus: newLeaderboardStatus
      })
    } catch (error) {
      setLeaderboardData([])
    }
  }

  useEffect(() => {
    // 先从本地存储加载数据（立即显示，如果有缓存）
    loadLeaderboardFromCache()
    
    // 调用 API 获取最新数据（静默更新，不显示 loading）
    const fetchData = async () => {
      try {
        await getTradingLeaderboard()
      } finally {
        // 首次访问时，API 调用完成后关闭 loading
        setLoading(false)
      }
    }
    fetchData()
  }, [])
  /* const leaderboardData = [
    { rank: 1, userId: '0x1111…aaaa', amount: '1,9347.45 b', iconType: 'gold' as const },
    { rank: 2, userId: '0x1111…aaaa', amount: '1,3347.45 b', iconType: 'silver' as const },
    { rank: 3, userId: '0x1111…aaaa', amount: '1,0347.45 b', iconType: 'bronze' as const },
    { rank: 4, userId: '0x1111…aaaa', amount: '111.23 b', iconType: 'number' as const },
    { rank: 5, userId: '0x2222…bbbb', amount: '101.23 b', iconType: 'number' as const },
    { rank: 6, userId: '0x3333…cccc', amount: '11.23 m', iconType: 'number' as const },
    { rank: 7, userId: '0x4444…dddd', amount: '9.23 m', iconType: 'number' as const },
    { rank: 8, userId: '0x5555…eeee', amount: '8.23 m', iconType: 'number' as const },
    { rank: 9, userId: '0x5555…eeee', amount: '7.23', iconType: 'number' as const },
    { rank: 10, userId: '0x5555…eeee', amount: '6.23', iconType: 'number' as const },
  ] */

  return (
    <div className="flex flex-col h-full">
      <div className={cn('@container min-h-[70vh]')}>
        <div className="relative mx-auto px-3 flex flex-col items-center">
          <div className="w-full pt-8 pb-4 bg-neutral-950 inline-flex flex-col justify-start items-start gap-2.5 overflow-hidden">
            <div className="self-stretch flex flex-col justify-start items-start gap-6">
              <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                <div className="justify-start text-white text-xl font-medium ">{t('red.packet.new.leaderboard')}</div>
                <div className="opacity-60 justify-start text-white text-xs font-normal ">{t('red.packet.trading.climb.ranks.tips')}</div>
              </div>
              <div className="self-stretch p-3 bg-zinc-950  rounded-[30px] shadow-[inset_0px_-7px_15px_0px_rgba(255,255,255,0.06)] outline-1 outline-offset-[-1px] outline-white/10 inline-flex justify-center items-center gap-2.5 overflow-hidden">
                <div className="flex-1 inline-flex flex-col justify-start items-start gap-6">
                  <div className="self-stretch px-4 py-3  flex flex-col justify-center items-start gap-4  aspect-[654/82]  bg-cover bg-left bg-[url('/images/redpacket/leaderboard-nav-bg.png')]">
                    <div className="self-stretch text-center justify-start text-yellow-400 text-sm font-medium ">{t('red.packet.top.share.rewards', { num: 100 })}</div>
                  </div>
                  {leaderboardStatus && (
                      <div className={cn(
                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-[10px] border self-start",
                        leaderboardStatus === 'LIVE'
                          ? "border-[#00A45D]" 
                          : "border-white/10"
                      )}>
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          leaderboardStatus === 'LIVE' ? "bg-[#00A45D]" : "bg-[#777]"
                        )} />
                        <span className={cn(
                          "text-sm font-medium",
                          leaderboardStatus === 'LIVE' ? "text-white" : "text-white/60"
                        )}>
                          {t(leaderboardStatus === 'LIVE' ? 'red.packet.tag.live' : 'red.packet.tag.ended')}
                        </span>
                      </div>
                    )}
                  <div className="self-stretch flex flex-col justify-start items-start">
                    {
                      loading ? (
                        <div className="flex flex-col items-center justify-center w-full">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="self-stretch px-3 py-4 flex flex-col justify-start items-start gap-2.5 overflow-hidden">
                            <div className="self-stretch inline-flex justify-between items-center">
                              <div className="flex justify-start items-center gap-2">
                                <Skeleton className="w-5 h-5 rounded-lg" />
                                <Skeleton className="h-4 w-32" />
                              </div>
                              <Skeleton className="h-3 w-20" />
                            </div>
                          </div>
                          ))} 
                        </div>
                      ) : leaderboardData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-80 w-full">
                          <IconEmpty />
                          <span className="text-[#FFFFFF80] text-[0.75rem]">{t('futuresDetails.tips.noData')}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col w-full h-[546px] max-h-[calc(100vh-320px)] overflow-y-auto">
                          {
                            leaderboardData.map((item, index) => (
                              <LeaderboardItem key={index} {...item} />
                            ))
                          }
                        </div>
                      )
                    }
                    <div className="self-stretch p-3 bg-zinc-900 rounded-bl-3xl rounded-br-3xl inline-flex justify-center items-center gap-2.5">
                      <div className="flex-1 justify-start text-rose-500 text-base font-semibold ">{t('red.packet.my.rank')}</div>
                      <div className="flex-1 text-right justify-start text-rose-500 text-base font-semibold">{myRank ? `#${myRank}` : '--'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div >
      </div>
    </div>
  )
}

export default LeaderboardPage
