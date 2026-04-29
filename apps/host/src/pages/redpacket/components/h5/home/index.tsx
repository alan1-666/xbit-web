import { useEffect, useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import HeroSection from './HeroSection'
import WithdrawProgressCard from './WithdrawProgressCard'
import LuckyDrawCard from './LuckyDrawCard'
import UnlockMoreCard from './UnlockMoreCard'
import TaskProgressCard from './TaskProgressCard'
import { redpacketClient } from '@/lib/gql/apollo-client'
import {
  GET_RED_PACKET_STATUS_QUERY,
  GET_LUCKY_LOTTO_STATUS,
  GET_TWITTER_BINDING_STATUS,
  GET_RED_PACKET_UNLOCK_STATUS,
  GET_LUCKY_LOTTO_HISTORY,
  GET_SHARED_PRIZE_POOL_INFO
} from '@/services/redpacket.service.ts'
import {
  UserRedPacketStatus,
  LuckyLottoStatus,
  TwitterBindingStatus,
  RedPacketUnlockStatus,
  RedPacketUnlockTier,
  LuckyLottoDrawHistory,
  RedPacketConfig
} from '@/@generated/gql/graphql-redpacket'
import ls from '@/lib/local-storage'
import CountdownModal from '@/pages/redpacket/components/h5/CountdownModal'
import DownloadModal from '@/pages/redpacket/components/h5/DownloadModal'
import { ShareXbitDrawer } from '@/components/settings/ShareXbitDrawer'
import ActivityStatusCard from './ActivityStatusCard'




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

type SharedPrizePoolInfo = {
  totalDailyBudget: number
  remainingAmount: number
  poolType: string
  isAvailable: boolean
}

const HomePage = ({ 
  showLuckyLotto, 
  config, 
  onOpenCountdownModal, 
  onRefreshRedpacketConfig,
  claimEnabledWeb,
  withdrawalEnabledWeb,
  activityStartTime,
  isCampaignActive,
  showOverlay,
}: HomePageProps) => {
  const { t } = useTranslation()
  const [redpacketStatus, setRedpacketStatus] = useState<UserRedPacketStatus | null>(null);
  const [luckyLottoStatus, setLuckyLottoStatus] = useState<LuckyLottoStatus | null>(null);
  const [twitterBindingStatus, setTwitterBindingStatus] = useState<TwitterBindingStatus | null>(null);
  const [redpacketUnlockStatus, setRedpacketUnlockStatus] = useState<RedPacketUnlockStatus | null>(null);
  const [luckyLottoHistory, setLuckyLottoHistory] = useState<Array<LuckyLottoDrawHistory>>([])
  const [isLoading, setIsLoading] = useState(false)

  const [isCanClaimingWithdraw, setIsCanClaimingWithdraw] = useState(false)
  const [isOpenCountdownModal, setIsOpenCountdownModal] = useState(false)
  const [isOpenDownloadModal, setIsOpenDownloadModal] = useState(false)
  const [showShare, setShowShare] = useState(false)

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


    } catch (error) {
    }
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
          limit: 10
        },
      })
      setLuckyLottoHistory(res?.data?.getLuckyLottoHistory)


    } catch (error) {
    }
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
      icon: tier.isReached ? <img src="/images/redpacket/success-icon.svg" /> :
        <div className="p-1 bg-white/10 rounded-xl flex justify-center items-center overflow-hidden">
          <div className="w-3.5 h-3.5 relative overflow-hidden">
            <img src="/images/redpacket/lock-icon.svg" />
          </div>
        </div>,
      text: `${t('red.packet.deposit.title')} ${tier.thresholdAmount} USDC`,
      isReached: tier.isReached,
      status: `+${tier.incrementalPackets} ${t('red.packet.packet.title')}`,
      bg: tier.isReached ? "bg-[#002111]" : "bg-[#262626]",
      textColor: tier.isReached ? "text-white" : "text-neutral-500",
      statusColor: tier.isReached ? "text-green-400" : "text-neutral-500"
    }))
    return items
  }, [redpacketUnlockStatus, t])

  const tradeItems = useMemo(() => {
    const tikers = redpacketUnlockStatus?.trading?.tiers
    if (!tikers) return []

    const items = tikers.map((tier: RedPacketUnlockTier) => ({
      icon: tier.isReached ? <img src="/images/redpacket/blue-success-icon.svg" /> :
        <div className="p-1 bg-white/10 rounded-xl flex justify-center items-center overflow-hidden">
          <div className="w-3.5 h-3.5 relative overflow-hidden">
            <img src="/images/redpacket/lock-icon.svg" />
          </div>
        </div>,
      text: `${t('red.packet.trade.title')} ${tier.thresholdAmount} USDC`,
      isReached: tier.isReached,
      status: `+${tier.incrementalPackets} ${t('red.packet.packet.title')}`,
      bg: tier.isReached ? "bg-[#071727]" : "bg-[#262626]",
      textColor: tier.isReached ? "text-white" : "text-neutral-500",
      statusColor: tier.isReached ? "text-blue-600" : "text-neutral-500"
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
      // { type: 'Connect', title: t('red.packet.connet.twitter'), reward: `+1 ${t('red.packet.packet.title')}`, done: twitterBindingStatus?.isBound },
      // { type: 'Follow', title: t('red.packet.follw.official'), reward: `+1 ${t('red.packet.packet.title')}`, done: twitterBindingStatus?.isFollowingOfficial }
    ]
  }, [twitterBindingStatus, t])

  const handleRreshData = () => {
    getUserRedpacketStatus()
    getUserLuckyLottoStatus()
    getSharedPrizePoolInfo()
  }


  const handleClickApp = () => {
    // 检测用户设备类型
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

    // 安卓设备判断
    const isAndroid = /android/i.test(userAgent);
    // iOS设备判断 (包括iPhone, iPad, iPod)
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;

    if (isAndroid) {
      // 安卓跳转链接 A
      window.open('https://play.google.com/store/apps/details?id=com.xtech.xbitmobile&hl=en', '_blank')
    } else if (isIOS) {
      // iOS跳转链接 B
      window.open('https://apps.apple.com/vn/app/xbit-buy-bitcoin-perps-dex/id6747072897', '_blank')
    } else {
      // 其他设备（桌面浏览器等）默认跳转，可以根据需求选择
      window.location.href = 'https://app.xbit.com/apps';
    }
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
  const depositUnlockNum = (redpacketUnlockStatus?.deposit?.claimedPackets || 0) + (redpacketUnlockStatus?.deposit?.pendingPackets || 0)
  const tradeUnlockNum = (redpacketUnlockStatus?.trading?.claimedPackets || 0) + (redpacketUnlockStatus?.trading?.pendingPackets || 0)

  const bannerStatus = useMemo(() => {
    if (showOverlay || !isCampaignActive) return 'not-started' as const
    if ((!showOverlay || isCampaignActive) && Number(sharedPrizePoolInfo?.remainingAmount) > 0){
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
    setIsOpenCountdownModal(true)
    return true
  }


  return (
    <div className="flex flex-col h-full">
      <div className={cn('bg-[#0A0A0A] @container min-h-[100vh] overflow-hidden relative')}>
        <div aria-hidden="true" className="absolute inset-0 bg-[url('/images/redpacket/h5/page-bg.webp')]  w-full h-[744px]  bg-cover bg-center z-0" />

        <div className="relative">
          <img src="/images/redpacket/h5/top-bg.png?v=2" className="w-full h-full object-cover" />
          {/* <div className="w-full text-center absolute bottom-[18%]  text-[#BE5B57] text-[12px]">{t('red.packet.open packets.tips')}</div> */}
        </div>

        <div className="relative mx-auto flex flex-col items-center  pb-[50px] ">
          <div className="px-4 mt-[-10px] w-full">
            <ActivityStatusCard 
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
          </div>
          <HeroSection
            redPackets={redpacketStatus?.redPackets || []}
            onClaim={handleRreshData}
            isLoading={isLoading}
            onOpenCountdownModal={handleOpenCountdownModal}
            activityStatus={bannerStatus}
            claimEnabledWeb={claimEnabledWeb}
            onOpenDownloadAppModal={() => setIsOpenDownloadModal(true)}
          />

          <div className="w-full px-4 mt-4">
            <WithdrawProgressCard
              availableBalance={redpacketStatus?.availableBalance || '0'}
              onWithdraw={handleRreshData}
              withdrawalThreshold={config?.withdrawalThreshold || 0}
              withdrawalEnabledWeb={withdrawalEnabledWeb}
              onOpenDownloadAppModal={() => setIsOpenDownloadModal(true)}
            />

            <LuckyDrawCard
              luckyLottoStatus={luckyLottoStatus || null}
              luckyLottoHistory={luckyLottoHistory}
              showOverlay={showLuckyLotto || false}
            />


            <UnlockMoreCard
              depositItems={depositItems}
              depositUnlockNum={depositUnlockNum}
              tradeItems={tradeItems}
              tradeUnlockNum={tradeUnlockNum}
              loading={unlockStatusLoading}
            />


            <TaskProgressCard tasks={taskItems} />
          </div>
        </div>
      </div>

      <CountdownModal
        activityStatus={bannerStatus}
        isOpen={isOpenCountdownModal}
        onOpenChange={() =>{setIsOpenCountdownModal(false)}}
        startTime={activityStartTime}
        isCampaignActive={isCampaignActive}
        showOverlay={showOverlay}
      />

      <DownloadModal
        isOpen={isOpenDownloadModal}
        onOpenChange={() => setIsOpenDownloadModal(false)}
        onClickShare={() => setShowShare(true)}
        onClickApp={() => handleClickApp()}
      />
    <ShareXbitDrawer open={showShare} setOpen={setShowShare} />
    </div>
  )
}

export default HomePage
