import Aside, { activeMenuType } from './Aside.tsx'
import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import HomePage from './home/index.tsx'
import LeaderboardPage from './leaderboard/index.tsx'
import RewardsPage from './rewards/index.tsx'
import { redpacketClient } from '@/lib/gql/apollo-client'
import { GET_RED_PACKET_STATUS_FEATURES } from '@/services/redpacket.service.ts'
import { RedPacketFeatures } from '@/@generated/gql/graphql-redpacket'
import { useCountdown } from '../../hooks/useCountdown.ts'
import { useTranslation } from 'react-i18next'
import ParticleBackground from '../ParticleBackground.tsx'
import { getRedPacketCache, saveRedPacketCache } from '@/utils/redpacket-cache'
import LoadingSkeleton from '../LoadingSkeleton'

const PcRedpacketPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  const query = useMemo(() => new URLSearchParams(location.search), [location.search])
  const rawTab = query.get('tab')
  const initialTab = ['home', 'leaderboard', 'rewards'].includes(rawTab || '') ? (rawTab as any) : 'home'

  const [activeMenu, setActiveMenu] = useState<activeMenuType>(initialTab as activeMenuType)

  const [redPacketFeatures, setRedPacketFeatures] = useState<RedPacketFeatures | null>(() => {
    // 初始化时尝试从缓存获取数据（不检查过期，先用缓存）
    return getRedPacketCache(false)
  })
  const [isLoadingFeatures, setIsLoadingFeatures] = useState<boolean>(!redPacketFeatures)
  const contentRef = useRef<HTMLDivElement>(null)

  // 手动打开倒计时弹框
  const [countdownModalOpen, setCountdownModalOpen] = useState(false)
  // 手动关闭后，本次不再自动弹（避免“看起来点击没反应”）
  const [overlaySuppressed, setOverlaySuppressed] = useState(false)

  const { countdown, isFinished } = useCountdown(redPacketFeatures?.overlayCountdown || 0)

  // TIMED 才展示倒计时样式
  const shouldShowCountdown = useMemo(() => {
    return redPacketFeatures?.overlayType === 'TIMED'
  }, [redPacketFeatures?.overlayType])

  const activityStartTime = useMemo(() => {
    const startDate = redPacketFeatures?.overlayRemovalTime
    if (!startDate) return undefined
    const ms = Date.parse(startDate)
    return Number.isFinite(ms) ? ms : undefined
  }, [redPacketFeatures?.overlayRemovalTime])

  // 由 HeroSection 触发：如果有倒计时且未结束，就弹出倒计时弹框
  const openCountdownModal = useCallback(() => {
    const hasCountdown =
      redPacketFeatures?.overlayType === 'TIMED' &&
      (redPacketFeatures?.overlayCountdown || 0) > 0 &&
      redPacketFeatures?.showOverlay !== false &&
      !isFinished

    if (hasCountdown) {
      setOverlaySuppressed(false) // 手动打开时，取消 suppress
      setCountdownModalOpen(true)
      return true
    }
    return false
  }, [redPacketFeatures, isFinished])

  const closeCountdownModal = useCallback(() => {
    setCountdownModalOpen(false)
    setOverlaySuppressed(true) // 手动关了，本次不再自动弹
  }, [])

  useEffect(() => {
    setActiveMenu(initialTab as activeMenuType)
  }, [initialTab])

  // 当菜单切换时，滚动到顶部
  useEffect(() => {
    const timer = setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [activeMenu])

  const handleSetActiveMenu = (menu: activeMenuType) => {
    const urlSearchParams = new URLSearchParams()
    urlSearchParams.set('tab', menu)
    setActiveMenu(menu)
    navigate({ search: urlSearchParams.toString() }, { replace: true })
  }

  const getRedpacketConfig = async () => {
    try {
      const res = await redpacketClient.query({
        query: GET_RED_PACKET_STATUS_FEATURES,
        variables: {},
      })
      const newData = res?.data?.getRedPacketFeatures
      setRedPacketFeatures(newData)

      if (newData) {
        saveRedPacketCache(newData)
      }
    } catch (error) {
      console.error('Failed to fetch redpacket config:', error)
    } finally {
      setIsLoadingFeatures(false)
    }
  }

  useEffect(() => {
    getRedpacketConfig()
  }, [])

  // 倒计时结束后，下次可再次自动弹
  useEffect(() => {
    if (isFinished) {
      setOverlaySuppressed(false)
      setCountdownModalOpen(false)
    }
  }, [isFinished])

  // 配置变化后，允许再次自动弹
  useEffect(() => {
    setOverlaySuppressed(false)
  }, [redPacketFeatures?.overlayType, redPacketFeatures?.overlayCountdown])

  // 不显示 overlay 了，直接置为 false
  const isShowPageOverlay = false

  // 如果正在加载且没有缓存数据，显示骨架屏
  if (isLoadingFeatures && !redPacketFeatures) {
    return (
      <div className={cn('bg-[#0A0A0A]', '@container min-h-[100vh]')}>
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <>
      <div className={cn('bg-[#0A0A0A]', '@container')}>
        <Aside
          activeMenu={activeMenu}
          activeMenuChange={handleSetActiveMenu}
          showLeaderboard={redPacketFeatures?.leaderboardEnabled}
        />

        <div ref={contentRef} className="pl-64 scroll-mt-[60px]">
          {activeMenu === 'home' && (
            <HomePage
              showLuckyLotto={redPacketFeatures?.luckyLottoEnabled}
              config={redPacketFeatures?.config}
              onOpenCountdownModal={openCountdownModal}
              onRefreshRedpacketConfig={getRedpacketConfig}
              claimEnabledWeb={redPacketFeatures?.claimEnabledWeb}
              withdrawalEnabledWeb={redPacketFeatures?.withdrawalEnabledWeb}
              activityStartTime={activityStartTime}
              isCampaignActive={redPacketFeatures?.isCampaignActive}
              showOverlay={redPacketFeatures?.showOverlay}
            />
          )}
          {activeMenu === 'leaderboard' && <LeaderboardPage />}
          {activeMenu === 'rewards' && (
            <RewardsPage
              withdrawalThreshold={redPacketFeatures?.config?.withdrawalThreshold || 0}
              withdrawalEnabledWeb={redPacketFeatures?.withdrawalEnabledWeb}
            />
          )}
        </div>
      </div>

      {isShowPageOverlay && (
        <div className="fixed inset-0 z-12 bg-black/80 backdrop-blur-[10px] flex flex-col items-center justify-center">
          {/* 背景层 */}
          <ParticleBackground />

          {/* 内容层 */}
          <div className="relative z-10 w-full flex items-center justify-center">
            {shouldShowCountdown ? (
              <div className="relative w-full flex items-center justify-center">
                {/* 后方背景图 */}
                <img
                  className="absolute top-1/2 left-0 w-full -translate-y-1/2 object-cover pointer-events-none"
                  src="/images/redpacket/bg-bg-h5.png"
                  alt="background"
                />

                {/* 前景背景图 */}
                <div className="relative flex flex-col items-center">
                  <img
                    className="w-[375px] h-auto relative left-[20px] z-10 pointer-events-none"
                    src="/images/redpacket/countdown-bg.png"
                    alt="countdown background"
                  />

                  {/* 关闭按钮 */}
                  <img
                    className="w-[50px] h-auto relative z-50 cursor-pointer pointer-events-auto"
                    src="/images/redpacket/close-btn.png"
                    alt="close"
                    onClick={(e) => {
                      e.stopPropagation()
                      closeCountdownModal()
                    }}
                  />
                </div>

                {/* 倒计时内容 */}
                <div className="absolute top-[315px] left-1/2 -translate-x-1/2 flex items-center gap-[38px] z-20 pointer-events-none">
                  {/* 小时 */}
                  <div className="w-[60px] flex justify-center -translate-x-[5px]">
                    <div
                      className="text-[48px] leading-[48px] text-white font-semibold text-center tabular-nums
                      [text-shadow:_-1px_-1px_0_#8B1A1A,_1px_-1px_0_#8B1A1A,_-1px_1px_0_#8B1A1A,_1px_1px_0_#8B1A1A]"
                    >
                      {String(countdown.hours).padStart(2, '0')}
                    </div>
                  </div>

                  {/* 分钟 */}
                  <div className="w-[60px] flex justify-center translate-x-[2px]">
                    <div
                      className="text-[48px] leading-[48px] text-white font-semibold text-center tabular-nums
                      [text-shadow:_-1px_-1px_0_#8B1A1A,_1px_-1px_0_#8B1A1A,_-1px_1px_0_#8B1A1A,_1px_1px_0_#8B1A1A]"
                    >
                      {String(countdown.minutes).padStart(2, '0')}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // MANUAL 类型：活动结束蒙层（你原来的 UI 保持不动）
              <div className="relative flex flex-col items-center justify-center px-4 w-[500px] h-[400px]">
                <div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-[786px] pointer-events-none"
                  style={{
                    background: ' radial-gradient(50% 50% at 50% 50%, #B8483C 1.32%, #B8483C 100%)',
                    filter: 'blur(132px)',
                  }}
                />

                <img
                  className="absolute left-[-50px] top-0 w-[100px] z-10 pointer-events-none"
                  src="/images/redpacket/daojishi-left-icon.png"
                  alt=""
                />
                <img
                  className="absolute right-[-50px] top-0 w-[100px] z-10 pointer-events-none"
                  src="/images/redpacket/daojishi-right-icon.png"
                  alt=""
                />

                <img
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-[400px] w-auto pointer-events-none -z-1"
                  src="/images/redpacket/light-pc.png"
                  alt=""
                  style={{ opacity: 0.6 }}
                />

                <div
                  className="w-[500px] h-[2px] relative z-10"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(212, 165, 116, 0) 0%, #D4A574 50%, rgba(212, 165, 116, 0) 100%)',
                  }}
                />

                <div className="text-[40px] leading-[48px] py-2 relative z-10 font-medium">
                  <div
                    className="absolute inset-0 -z-10 w-full h-full"
                    style={{
                      background:
                        'linear-gradient(270deg, rgba(237, 61, 39, 0.00) -0.09%, rgba(237, 61, 39, 0.58) 49.39%, rgba(237, 61, 39, 0.00) 99.91%)',
                    }}
                  />
                  <span
                    style={{
                      background: 'linear-gradient(90deg, #D4A574 0%, #F4D9A8 50%, #D4A574 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {t('red.packet.campaign.end')}
                  </span>
                </div>

                <div
                  className="w-[500px] h-[2px] relative z-10"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(212, 165, 116, 0) 0%, #D4A574 50%, rgba(212, 165, 116, 0) 100%)',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default PcRedpacketPage
