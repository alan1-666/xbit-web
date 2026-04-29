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
      return <div className="w-6 h-6 text-center justify-center text-white text-[14px] font-medium leading-4">{rank}</div>
    }
  }

  return (
    <div className={`self-stretch px-1.5 ${rank <= 3 ? 'py-2' : 'py-3'} border-b border-white/20 inline-flex justify-between items-center`}>
      <div className="flex justify-start items-center gap-2">
        {renderIcon()}
        <div className="w-20 self-stretch justify-start text-white text-[14px] font-medium leading-4">{userId}</div>
      </div>
      <div className="justify-start text-neutral-500 text-xs font-medium">{amount}</div>
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
        amount: formatAmount(item.tradingVolume, {roundMode: 'floor',}) + ' USDC',
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
  return (
    <div className="flex flex-col h-[calc(100vh-60px-37px)] overflow-hidden w-full">
      <div className={cn('@container flex flex-col h-full w-full')}>
        <div className="relative w-full px-[40px] flex flex-col flex-1 pb-[20px] overflow-hidden">
          <div className="w-full py-8 flex flex-col justify-start items-start gap-2.5 h-full">
            <div className="w-full flex flex-col justify-start items-start gap-6 h-full">
              <div className="w-full flex flex-col justify-start items-start gap-1.5 flex-shrink-0">
                <div className="justify-start text-white text-[40px] leading-[40px] font-medium mb-[8px]">{t('red.packet.new.leaderboard')}</div>
                <div className="opacity-60 justify-start text-white text-[16px] leading-[16px] font-normal">{t('red.packet.trading.climb.ranks.tips')}</div>
              </div>
              <div className="w-full p-3 bg-zinc-950 rounded-[30px] shadow-[inset_0px_-7px_15px_0px_rgba(255,255,255,0.06)] outline-1 outline-offset-[-1px] outline-white/10 flex justify-center items-center gap-2.5 flex-1 overflow-hidden">
                <div className="w-full flex flex-col justify-start items-start gap-6 h-full">
                  <div className="w-full flex flex-col gap-6 flex-shrink-0">
                    <div className="w-full px-4 py-3 rounded-[20px] flex flex-col justify-center items-start gap-4 min-h-[50px] max-h-[60px] bg-cover bg-center bg-[url('/images/redpacket/pc-leaderboard-nav-bg.png')]">
                      <div className="w-full text-center justify-start text-yellow-400 text-[14px] font-medium">{t('red.packet.top.share.rewards', { num: 100 })}</div>
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
                  </div>
                  <div className="w-full flex flex-col justify-start items-start flex-1 overflow-hidden min-h-0">
                    {
                      loading ? (
                        <div className="flex flex-col items-center justify-center w-full">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="w-full px-3 py-4 flex flex-col justify-start items-start gap-2.5 overflow-hidden">
                              <div className="w-full inline-flex justify-between items-center">
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
                        <div className="flex flex-col flex-1 items-center justify-center h-80 w-full">
                          <IconEmpty />
                          <span className="text-[#FFFFFF80] text-[0.75rem]">{t('futuresDetails.tips.noData')}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col w-full flex-1 overflow-y-auto min-h-0">
                          {
                            leaderboardData.map((item, index) => (
                              <LeaderboardItem key={index} {...item} />
                            ))
                          }
                        </div>
                      )
                    }
                    <div className="w-full p-3 bg-zinc-900 rounded-bl-3xl rounded-br-3xl inline-flex justify-center items-center gap-2.5 flex-shrink-0">
                      <div className="flex-1 justify-start text-rose-500 text-[16px] font-semibold">{t('red.packet.my.rank')}</div>
                      <div className="flex-1 text-right justify-start text-rose-500 text-[16px] font-semibold">{myRank ? `#${myRank}` : '--'}</div>
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
