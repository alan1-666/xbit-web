import { useEffect, useState, useMemo } from 'react'
import { cn } from '@/lib/utils'

import HeroSection from './HeroSection'
import WithdrawProgressCard from './WithdrawProgressCard'
import LuckyDrawCard from './LuckyDrawCard'
import UnlockMoreCard from './UnlockMoreCard'
import TaskProgressCard from './TaskProgressCard'
import ActivityBanner from './ActivityBanner'
import CountdownModal from './CountdownModal'
import DownloadAppModal from './DownloadAppModal'
import { redpacketClient } from '@/lib/gql/apollo-client'
import {
  GET_RED_PACKET_STATUS_QUERY,
  GET_LUCKY_LOTTO_STATUS,
  GET_TWITTER_BINDING_STATUS,
  GET_RED_PACKET_UNLOCK_STATUS,
  GET_LUCKY_LOTTO_HISTORY,
  GET_SHARED_PRIZE_POOL_INFO,
} from '@/services/redpacket.service.ts'
import {
  UserRedPacketStatus,
  LuckyLottoStatus,
  TwitterBindingStatus,
  RedPacketUnlockStatus,
  RedPacketUnlockTier,
  LuckyLottoDrawHistory,
  RedPacketConfig,
} from '@/@generated/gql/graphql-redpacket'
import { useTranslation } from 'react-i18next'
import ls from '@/lib/local-storage'
interface HomePageProps {
  showLuckyLotto?: boolean
  config?: RedPacketConfig
  onOpenCountdownModal?: () => boolean
  onRefreshRedpacketConfig?: () => void | Promise<void>
  activityStartTime?: number // 活动开始时间戳
  isCampaignActive?: boolean
  showOverlay?: boolean
  claimEnabledWeb?: boolean
  withdrawalEnabledWeb?: boolean
}

const HomePage = ({
  showLuckyLotto,
  config,
  onOpenCountdownModal,
  onRefreshRedpacketConfig,
  activityStartTime,
  isCampaignActive,
  showOverlay,
  claimEnabledWeb,
  withdrawalEnabledWeb,
}: HomePageProps) => {
  const { t } = useTranslation()

  const [redpacketStatus, setRedpacketStatus] = useState<UserRedPacketStatus | null>(null)
  const [luckyLottoStatus, setLuckyLottoStatus] = useState<LuckyLottoStatus | null>(null)
  const [twitterBindingStatus, setTwitterBindingStatus] = useState<TwitterBindingStatus | null>(null)
  const [redpacketUnlockStatus, setRedpacketUnlockStatus] = useState<RedPacketUnlockStatus | null>(null)
  const [luckyLottoHistory, setLuckyLottoHistory] = useState<Array<LuckyLottoDrawHistory>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCountdownModal, setShowCountdownModal] = useState(false)
  const [showDownloadAppModal, setShowDownloadAppModal] = useState(false)

  type SharedPrizePoolInfo = {
    totalDailyBudget: number
    remainingAmount: number
    poolType: string
    isAvailable: boolean
  }
  const [sharedPrizePoolInfo, setSharedPrizePoolInfo] = useState<SharedPrizePoolInfo | null>(null)

  // 本地存储的 key
  const UNLOCK_STATUS_CACHE_KEY = 'redpacket.unlockStatus'

  // 初始化时检查是否有缓存，决定是否显示 loading
  const [unlockStatusLoading, setUnlockStatusLoading] = useState<boolean>(() => {
    // 首次访问时，如果没有缓存数据，显示 loading
    const hasCache = !!ls.get(UNLOCK_STATUS_CACHE_KEY)
    return !hasCache
  })

  const getUserRedpacketStatus = async () => {
    try {
      setIsLoading(true)
      const res = await redpacketClient.query({
        query: GET_RED_PACKET_STATUS_QUERY,
        variables: {},
      })
      setRedpacketStatus(res?.data?.getRedPacketStatus)
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
    }
  }

  const getUserLuckyLottoStatus = async () => {
    try {
      const res = await redpacketClient.query({
        query: GET_LUCKY_LOTTO_STATUS,
        variables: {},
      })
      setLuckyLottoStatus(res?.data?.getLuckyLottoStatus)
    } catch (error) {
      setLuckyLottoStatus(null)
    }
  }

  const getUserTwitterBindingStatus = async () => {
    try {
      const res = await redpacketClient.query({
        query: GET_TWITTER_BINDING_STATUS,
        variables: {},
      })
      setTwitterBindingStatus(res?.data?.getTwitterBindingStatus)
    } catch (error) {}
  }

  // 从本地存储加载数据
  const loadUnlockStatusFromCache = () => {
    try {
      const cachedData = ls.get(UNLOCK_STATUS_CACHE_KEY) as RedPacketUnlockStatus | null
      if (cachedData) {
        setRedpacketUnlockStatus(cachedData)
      }
    } catch (error) {
      // 如果读取失败，忽略错误
    }
  }

  const getRedpacketUnlockStatus = async () => {
    try {
      const res = await redpacketClient.query({
        query: GET_RED_PACKET_UNLOCK_STATUS,
        variables: {},
      })
      const newData = res?.data?.getRedPacketUnlockStatus
      if (newData) {
        setRedpacketUnlockStatus(newData)
        // 保存到本地存储
        ls.set(UNLOCK_STATUS_CACHE_KEY, newData)
      }
    } catch (error) {
      setRedpacketUnlockStatus(null)
    }
  }

  const getLuckyLottoHistory = async () => {
    try {
      const res = await redpacketClient.query({
        query: GET_LUCKY_LOTTO_HISTORY,
        variables: {
          limit: 10,
        },
      })
      setLuckyLottoHistory(res?.data?.getLuckyLottoHistory)
    } catch (error) {}
  }

  const getSharedPrizePoolInfo = async () => {
    try {
      const res = await redpacketClient.query<{ getSharedPrizePoolInfo: SharedPrizePoolInfo }>({
        query: GET_SHARED_PRIZE_POOL_INFO,
        variables: {},
        fetchPolicy: 'network-only',
      })
      setSharedPrizePoolInfo(res?.data?.getSharedPrizePoolInfo ?? null)
    } catch (error) {
      setSharedPrizePoolInfo(null)
    }
  }

  const depositItems = useMemo(() => {
    const tikers = redpacketUnlockStatus?.deposit?.tiers
    if (!tikers) return []

    const items = tikers.map((tier: RedPacketUnlockTier) => ({
      icon: tier.isReached ? (
        <img src="/images/redpacket/success-icon.svg" />
      ) : (
        <div className="p-1 bg-white/10 rounded-xl flex justify-center items-center overflow-hidden">
          <div className="w-3.5 h-3.5 relative overflow-hidden">
            <img src="/images/redpacket/lock-icon.svg" />
          </div>
        </div>
      ),
      text: `${t('red.packet.deposit.title')} ${tier.thresholdAmount} USDC`,
      isReached: tier.isReached,
      status: `+${tier.incrementalPackets} ${t('red.packet.packet.title')}`,
      bg: tier.isReached ? 'bg-[#002111]' : 'bg-[#262626]',
      textColor: tier.isReached ? 'text-white' : 'text-neutral-500',
      statusColor: tier.isReached ? 'text-green-400' : 'text-neutral-500',
    }))
    return items
  }, [redpacketUnlockStatus, t])

  const tradeItems = useMemo(() => {
    const tikers = redpacketUnlockStatus?.trading?.tiers
    if (!tikers) return []

    const items = tikers.map((tier: RedPacketUnlockTier) => ({
      icon: tier.isReached ? (
        <img src="/images/redpacket/blue-success-icon.svg" />
      ) : (
        <div className="p-1 bg-white/10 rounded-xl flex justify-center items-center overflow-hidden">
          <div className="w-3.5 h-3.5 relative overflow-hidden">
            <img src="/images/redpacket/lock-icon.svg" />
          </div>
        </div>
      ),
      text: `${t('red.packet.trade.title')} ${tier.thresholdAmount} USDC`,
      isReached: tier.isReached,
      status: `+${tier.incrementalPackets} ${t('red.packet.packet.title')}`,
      bg: tier.isReached ? 'bg-[#071727]' : 'bg-[#262626]',
      textColor: tier.isReached ? 'text-white' : 'text-neutral-500',
      statusColor: tier.isReached ? 'text-blue-600' : 'text-neutral-500',
    }))
    return items
  }, [redpacketUnlockStatus, t])

  const taskItems = useMemo(() => {
    // TODO: Follow Official
    return [
      {
        type: 'galxe',
        title: t('red.packet.connet.galxe.title'),
        sub_title: t('red.packet.connet.galxe.remark'),
        reward: null,
      },
      // {
      //   type: 'Connect',
      //   title: t('red.packet.connet.twitter'),
      //   reward: `+1 ${t('red.packet.packet.title')}`,
      //   done: twitterBindingStatus?.isBound,
      // },
      // {
      //   type: 'Follow',
      //   title: t('red.packet.follw.official'),
      //   reward: `+1 ${t('red.packet.packet.title')}`,
      //   done: twitterBindingStatus?.isFollowingOfficial,
      // },
    ]
  }, [twitterBindingStatus, t])

  const handleRreshData = () => {
    getUserRedpacketStatus()
    getUserLuckyLottoStatus()
    getSharedPrizePoolInfo()
  }

  useEffect(() => {
    getUserRedpacketStatus()
    getUserLuckyLottoStatus()
    getUserTwitterBindingStatus()
    getLuckyLottoHistory()
    getSharedPrizePoolInfo()

    // 先从本地存储加载 unlockStatus 数据（立即显示，如果有缓存）
    loadUnlockStatusFromCache()

    // 调用 API 获取最新数据（静默更新，不显示 loading）
    const fetchUnlockStatus = async () => {
      try {
        await getRedpacketUnlockStatus()
      } finally {
        // 首次访问时，API 调用完成后关闭 loading
        setUnlockStatusLoading(false)
      }
    }
    fetchUnlockStatus()
  }, [])

  const depositUnlockNum =
    (redpacketUnlockStatus?.deposit?.claimedPackets || 0) + (redpacketUnlockStatus?.deposit?.pendingPackets || 0)
  const tradeUnlockNum =
    (redpacketUnlockStatus?.trading?.claimedPackets || 0) + (redpacketUnlockStatus?.trading?.pendingPackets || 0)

  const bannerStatus = useMemo(() => {
    console.log('bannerStatus', showOverlay, isCampaignActive, sharedPrizePoolInfo?.remainingAmount)
    if (showOverlay || !isCampaignActive) return 'not-started' as const
    if ((!showOverlay || isCampaignActive) && Number(sharedPrizePoolInfo?.remainingAmount) > 0) {
      return 'ongoing' as const
    }
    return 'ended' as const
  }, [isCampaignActive, showOverlay, sharedPrizePoolInfo?.remainingAmount])

  const bannerProgress = useMemo(() => {
    const total = sharedPrizePoolInfo?.totalDailyBudget
    const using = Number(total || 0) - Number(sharedPrizePoolInfo?.remainingAmount || 0)
    if (!total || total <= 0 || using === null || using === undefined) return 0
    const percent = (using / total) * 100
    if (!Number.isFinite(percent)) return 0
    return Math.max(0, Math.min(100, percent))
  }, [sharedPrizePoolInfo])

  const handleOpenCountdownModal = () => {
    setShowCountdownModal(true)
    return true
  }

  return (
    <div className="flex flex-col h-full pb-20">
      <div className={cn('bg-[#0A0A0A] @container min-h-[100vh]')}>
        <div className="relative mx-auto px-[40px] pt-8">
          {/* 活动横幅 */}
          <ActivityBanner
            status={bannerStatus}
            startTime={activityStartTime}
            isCampaignActive={isCampaignActive}
            showOverlay={showOverlay}
            progress={bannerProgress}
            remainingAmount={sharedPrizePoolInfo?.remainingAmount}
            onCountdownEnd={() => {
              onRefreshRedpacketConfig?.()
            }}
          />

          <div className="flex items-start gap-6 h-[655px] mb-8">
            <HeroSection
              redPackets={redpacketStatus?.redPackets || []}
              onClaim={handleRreshData}
              isLoading={isLoading}
              onOpenCountdownModal={handleOpenCountdownModal}
              claimEnabledWeb={claimEnabledWeb}
              onOpenDownloadAppModal={() => setShowDownloadAppModal(true)}
              activityStatus={bannerStatus}
            />
            <div className="flex flex-col gap-6 flex-1">
              <WithdrawProgressCard
                availableBalance={redpacketStatus?.availableBalance || '0'}
                onWithdraw={handleRreshData}
                withdrawalThreshold={config?.withdrawalThreshold || 0}
                withdrawalEnabledWeb={withdrawalEnabledWeb}
                onOpenDownloadAppModal={() => setShowDownloadAppModal(true)}
              />
              <LuckyDrawCard
                luckyLottoStatus={luckyLottoStatus || null}
                luckyLottoHistory={luckyLottoHistory}
                showOverlay={showLuckyLotto || false}
              />
            </div>
          </div>

          <UnlockMoreCard
            depositItems={depositItems}
            depositUnlockNum={depositUnlockNum}
            tradeItems={tradeItems}
            tradeUnlockNum={tradeUnlockNum}
            loading={unlockStatusLoading}
          />
          {/* <TaskProgressCard tasks={taskItems} /> */}

          <div className="relative w-full">
            <img className="w-full" src="/images/redpacket/bonus-pc.png" />
            <div className="absolute bottom-0 left-0 w-full h-[60%] px-4 flex flex-col justify-center gap-2 py-4">
              <div className="text-left justify-start text-white text-2xl font-bold">
                {t('red.packet.jackpot.bonus')}
              </div>
              <div className="text-left justify-start text-white text-base font-normal">
                {t('red.packet.large.packets.tips')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 倒计时弹窗 */}
      <CountdownModal
        activityStatus={bannerStatus}
        isOpen={showCountdownModal}
        onClose={() => setShowCountdownModal(false)}
        startTime={activityStartTime}
        isCampaignActive={isCampaignActive}
        showOverlay={showOverlay}
      />

      {/* 下载 APP 弹窗 */}
      <DownloadAppModal isOpen={showDownloadAppModal} onClose={() => setShowDownloadAppModal(false)} />
    </div>
  )
}

export default HomePage
