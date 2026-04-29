import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { activeMenuType } from './NavigationHeader.tsx'
import { useNavigate, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import HomePage from './home/index.tsx'
import LeaderboardPage from './leaderboard/index.tsx'
import RewardsPage from './rewards/index.tsx'
import { redpacketClient } from '@/lib/gql/apollo-client'
import {
  GET_RED_PACKET_STATUS_FEATURES
} from '@/services/redpacket.service.ts'
import { RedPacketFeatures } from '@/@generated/gql/graphql-redpacket'
import { useTranslation } from 'react-i18next'
import HeaderWithBack from '@/components/header/HeaderWithBack'
import { useCountdown } from '../../hooks/useCountdown.ts'
import ParticleBackground from '../ParticleBackground.tsx'
import { getFuturesTradePath } from '@/components/futuresDetails/trade/tools.ts'
import { getRedPacketCache, saveRedPacketCache } from '@/utils/redpacket-cache'
import LoadingSkeleton from '../LoadingSkeleton'


const H5RedpacketPage = ({ }: {}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  const query = useMemo(() => new URLSearchParams(location.search), [location.search])
  const rawTab = query.get('tab')

  const initialTab = ['home', 'leaderboard', 'rewards'].includes(rawTab || '') ? rawTab! : 'home'
  const [activeMenu, setActiveMenu] = useState<activeMenuType>(initialTab as activeMenuType)

  const [redPacketFeatures, setRedPacketFeatures] = useState<RedPacketFeatures | null>(() => {
    // 初始化时尝试从缓存获取数据
    return getRedPacketCache(false) // 不检查过期，先用缓存数据
  })
  const [isLoadingFeatures, setIsLoadingFeatures] = useState<boolean>(!redPacketFeatures) // 如果有缓存就不显示加载状态
  const [isShowMenu, setIsShowMenu] = useState<boolean>(false)
  const contentRef = useRef<HTMLDivElement>(null)

  // 手动打开倒计时弹框
  const [countdownModalOpen, setCountdownModalOpen] = useState(false)
  // 手动关闭后，本次不再自动弹（避免“看起来点击没反应”）
  const [overlaySuppressed, setOverlaySuppressed] = useState(false)


  const { countdown, isFinished } = useCountdown(redPacketFeatures?.overlayCountdown || 0)
  // const { countdown, isFinished } = useCountdown(10)

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

    navigate({
      search: urlSearchParams.toString()
    }, { replace: true })
  }

  const getRedpacketConfig = async () => {
    try {
      const res = await redpacketClient.query({
        query: GET_RED_PACKET_STATUS_FEATURES,
        variables: {},
      })
      const newData = res?.data?.getRedPacketFeatures

      // 更新状态
      setRedPacketFeatures(newData)

      // 保存到缓存
      if (newData) {
        saveRedPacketCache(newData)
      }

    } catch (error) {
      console.error('Failed to fetch redpacket config:', error)
    } finally {
      setIsLoadingFeatures(false)
    }
  }

  const isShowPageOverlay = false

  useEffect(() => {
    if (isShowPageOverlay) {
      document.body.style.overflow = 'hidden' // 禁止滚动
    } else {
      document.body.style.overflow = '' // 恢复默认
    }

    // 清理函数，组件卸载时恢复
    return () => {
      document.body.style.overflow = ''
    }
  }, [isShowPageOverlay])

  useEffect(() => {
    getRedpacketConfig()
  }, [])

  let menuItems = [
    { id: 'home', label: t('red.packet.home') },
    { id: 'rewards', label: t('red.packet.rewards') },
  ]
  if (redPacketFeatures?.leaderboardEnabled) {
    menuItems.splice(1, 0, { id: 'leaderboard', label: t('red.packet.new.leaderboard') })
  }
  const activeMenuText = menuItems.find(mi => mi.id === activeMenu)?.label || ''

  const renderIcon = (id: string) => {
    switch (id) {
      case 'home':
        return (
          <div className="w-6 h-6 relative overflow-hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4.5 9V21H19.5V9L12 3L4.5 9Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9.5 14.5V21H14.5V14.5H9.5Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
              <path d="M4.5 21H19.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        )
      case 'leaderboard':
        return (
          <div className="w-6 h-6 relative overflow-hidden">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.5 9H2V21H8.5V9Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15 3H8.5V21H15V3Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
              <path d="M21.5 13H15V21H21.5V13Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )
      case 'rewards':
        return (
          <div className="w-6 h-6 relative overflow-hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20.5 22V10H3.5V22H20.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 22V10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20.5 22H3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M22 6H2V10H22V6Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
              <path d="M8 2L12 6L16 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )
      default:
        return null
    }
  }

  const handleGoDeposit = () => {
    navigate('/perps-deposit')
  }

  const handleGoTrade = () => {
    navigate(getFuturesTradePath())
  }

  // 如果正在加载且没有缓存数据，显示骨架屏
  if (isLoadingFeatures && !redPacketFeatures) {
    return (
      <div className={cn('bg-[#0A0A0A]', "@container min-h-[100vh]")}>
        <div className="sticky top-0 z-10 h-[60px]">
          <HeaderWithBack
            title={
              <div className="flex items-center justify-center gap-2">
                <span>{t('red.packet.xbit.drawer.title') }</span>
              </div>
            }
            className="bg-[#0A0A0A] border-b border-[#FE3669]"
            onBack={() => { navigate('/') }}
            rightClassName="w-7"
            leftClassName="w-7"
          />
        </div>
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <>
      <div className={cn('bg-[#0A0A0A]', "@container min-h-[100vh]")}>
        <div className="sticky top-0 z-10 h-[60px]">
          <HeaderWithBack
            title={
              <div className="flex items-center justify-center gap-2">
                <span>{t('red.packet.xbit.drawer.title')}</span>
              </div>
            }
            className={`${isShowPageOverlay ? 'bg-black/90' : 'bg-[#0A0A0A]'} border-b border-[#FE3669]`}
            onBack={() => { navigate('/') }}
            rightClassName="w-7"
            leftClassName="w-7"
            right={
              isShowPageOverlay ? <></> : <div className="w-7 h-7 relative overflow-hidden cursor-pointer" onClick={() => setIsShowMenu(true)}>
                <img src="/images/redpacket/menu-icon.svg" alt="menu" />
              </div>
            }
          />
        </div>
        <div ref={contentRef} className="scroll-mt-[100px]">
          {!isLoadingFeatures && activeMenu === 'home' &&
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
          }
          {!isLoadingFeatures && activeMenu === 'leaderboard' && <LeaderboardPage />}
          {!isLoadingFeatures && activeMenu === 'rewards' &&
            <RewardsPage
              withdrawalThreshold={redPacketFeatures?.config?.withdrawalThreshold || 0}
              withdrawalEnabledWeb={redPacketFeatures?.withdrawalEnabledWeb}
            />}
        </div>

        {/* 菜单弹窗 */}
        {isShowMenu && (
          <div className="fixed inset-0 z-[999] bg-[#121214] backdrop-blur-sm flex justify-center flex-col items-center overflow-auto max-w-[960px] mx-auto">
            <div className="self-stretch p-4 border-t inline-flex justify-center w-full items-center gap-2.5 overflow-hidden">
              <div className="flex-1 justify-start flex items-center gap-2 text-white text-xl font-medium h-6">
                <img src="/images/kairox-logo.svg" className="h-full" alt="logo xbit text" />
                <img src="/images/kairox-logo-text.svg" className="h-4" alt="logo xbit text" />
              </div>
              <div className="w-7 h-7 relative overflow-hidden cursor-pointer" onClick={() => setIsShowMenu(false)}>
                <img src="/images/redpacket/close-icon.svg" alt="close" />
              </div>
            </div>

            <div className="w-full max-w-[960px] h-full mx-auto" onClick={(e) => e.stopPropagation()}>
              <div className="w-full h-full inline-flex flex-col justify-start items-center bg-[#121214]">
                <div className="self-stretch flex-1 p-6 flex flex-col justify-start items-start gap-4">
                  {menuItems.map((mi) => (
                    <div
                      key={mi.id}
                      className={cn("cursor-pointer relative self-stretch p-2.5 rounded-2xl inline-flex justify-start items-center gap-2 overflow-hidden", activeMenu !== mi.id ? ' opacity-60 ' : 'bg-gradient-to-r from-rose-600 to-orange-300')}
                      onClick={() => {
                        setIsShowMenu(false)
                        handleSetActiveMenu(mi.id as activeMenuType)
                      }}
                    >
                      {activeMenu === mi.id && <img src="/images/redpacket/nav-btn-bg.png" className="absolute left-0 top-0 w-full h-full object-cover" alt="bg" />}
                      {renderIcon(mi.id)}
                      <div className="justify-start text-white text-base font-medium ">{mi.label}</div>
                    </div>
                  ))}
                </div>
                <div className="self-stretch p-6 border-t border-white/0 flex flex-col justify-start items-center gap-6">
                  <div className="navigationHeader-border-gradient w-full mb-6"></div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-3">
                    <div className="self-stretch opacity-60 justify-start text-white text-xs font-medium ">{t('red.packet.quick.links')}</div>
                    <div className="self-stretch inline-flex justify-start items-center gap-[5px] cursor-pointer" onClick={handleGoTrade}>
                      <div className="justify-start text-white text-base font-medium ">{t('red.packet.trade.title')}</div>
                      <img src="/images/redpacket/enter-icon.svg" alt="enter" />
                    </div>
                    <div className="self-stretch inline-flex justify-start items-center gap-1.5 cursor-pointer" onClick={handleGoDeposit}>
                      <div className="justify-start text-white text-base font-medium ">{t('red.packet.deposit.title')}</div>
                      <img src="/images/redpacket/enter-icon.svg" alt="enter" />
                    </div>
                  </div>
                  <div className="self-stretch px-3.5 py-3 bg-yellow-300/10 rounded-2xl outline outline-1 outline-offset-[-1px] outline-yellow-300/30 flex flex-col justify-start items-start gap-2.5 overflow-hidden">
                    <div className="self-stretch flex flex-col justify-start items-center gap-4">
                      <div className="self-stretch inline-flex justify-start items-center gap-2">
                        <div className="w-4 h-4 relative overflow-hidden">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3.33325 12.6667V6.00004C3.33325 3.42271 5.42259 1.33337 7.99992 1.33337C10.5773 1.33337 12.6666 3.42271 12.6666 6.00004V12.6667M1.33325 12.6667H14.6666" stroke="#FFDC3E" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M7.99992 14.6666C8.92039 14.6666 9.66659 13.9204 9.66659 13V12.6666H6.33325V13C6.33325 13.9204 7.07945 14.6666 7.99992 14.6666Z" stroke="#FFDC3E" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div className="justify-start text-yellow-300 text-sm font-normal ">{t('red.packet.coming.soon.title')}:</div>
                      </div>
                      <div className="self-stretch justify-start text-white text-xs font-normal leading-4">{t('red.packet.coming.soon.content1')}<br />{t('red.packet.coming.soon.content2')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {
        isShowPageOverlay && 
        
        <div 
          className="fixed top-[60px] left-0 right-0 left-0 bottom-0 z-12  bg-black/90 backdrop-blur-[10px]  flex flex-col items-center justify-center">

          {shouldShowCountdown ? (
            // TIMED 类型：显示倒计时
            <div className="relative w-full flex items-center justify-center">
              {/* 后方背景图 - 宽度撑满屏幕，垂直居中 */}
              <img
                className="absolute top-1/2 left-0 w-full -translate-y-1/2 object-cover"
                src="/images/redpacket/bg-bg-h5.png"
                alt="background"
              />

              {/* 前景背景图 */}
              <img
                className="w-[375px] h-auto relative left-[20px] z-10"
                src="/images/redpacket/countdown-bg.png"
                alt="countdown background"
              />

              {/* 倒计时内容 - 绝对定位到背景图上 */}
              <div className="absolute top-[315px] left-1/2 -translate-x-1/2 flex items-center gap-[38px] z-20">
                {/* 小时 */}
                <div className="flex flex-col items-center text-white font-semibold">
                  <div className="text-[48px] leading-[48px] [text-shadow:_-1px_-1px_0_#8B1A1A,_1px_-1px_0_#8B1A1A,_-1px_1px_0_#8B1A1A,_1px_1px_0_#8B1A1A]">
                    {String(countdown.hours).padStart(2, '0')}
                  </div>
                </div>

                {/* 分钟 */}
                <div className="flex flex-col items-center text-white font-semibold">
                  <div className="text-[48px] leading-[48px] [text-shadow:_-1px_-1px_0_#8B1A1A,_1px_-1px_0_#8B1A1A,_-1px_1px_0_#8B1A1A,_1px_1px_0_#8B1A1A]">
                    {String(countdown.minutes).padStart(2, '0')}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // MANUAL 类型：显示活动结束蒙层
            <>
              <ParticleBackground />
              <div className="relative flex flex-col items-center justify-center px-4 h-[365px]">
                {/* 模糊背景层 - 独立出来避免影响内容 */}
                <div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-[430px] pointer-events-none"
                  style={{
                    background: 'radial-gradient(50% 50% at 50% 50%, #B8483C 1.32%, #B8483C 100%)',
                    filter: 'blur(132px)'
                  }}
                />

                {/* 左上方装饰图标 */}
                <img
                  className="absolute left-0 top-[60px] w-[71px] z-10"
                  src="/images/redpacket/daojishi-left-icon.png"
                  alt=""
                />

                {/* 右上方装饰图标 */}
                <img
                  className="absolute right-0 top-[60px] w-[71px] z-10"
                  src="/images/redpacket/daojishi-right-icon.png"
                  alt=""
                />

                {/* 背景光束 - 居中显示 */}
                <img
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-[300px] w-auto pointer-events-none -z-1"
                  src="/images/redpacket/light.png"
                  alt=""
                  style={{ opacity: 0.6 }}
                />

                {/* 上方金色横线 */}
                <div
                  className="w-[320px] h-[2px] relative z-10"
                  style={{
                    background: 'linear-gradient(90deg, rgba(212, 165, 116, 0) 0%, #D4A574 50%, rgba(212, 165, 116, 0) 100%)',
                  }}
                />

                {/* 文字 */}
                <div className="text-[28px] leading-[32px] py-4 relative z-10 font-medium">
                  {/* 红色渐变背景层 */}
                  <div
                    className="absolute inset-0 -z-10 w-full h-full"
                    style={{
                      background: 'linear-gradient(270deg, rgba(237, 61, 39, 0.00) -0.09%, rgba(237, 61, 39, 0.58) 49.39%, rgba(237, 61, 39, 0.00) 99.91%)',
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

                {/* 下方金色横线 */}
                <div
                  className="w-[320px] h-[2px] relative z-10"
                  style={{
                    background: 'linear-gradient(90deg, rgba(212, 165, 116, 0) 0%, #D4A574 50%, rgba(212, 165, 116, 0) 100%)',
                  }}
                />
              </div>
            </>
          )}
        </div>
      }
    </>
  )
}

export default H5RedpacketPage
