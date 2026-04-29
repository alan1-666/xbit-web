import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { RedPacketDetail } from '@/@generated/gql/graphql-redpacket'
import Confetti from '@/pages/redpacket/components/Confetti.tsx'
import { redpacketClient } from '@/lib/gql/apollo-client'
import { CLAIM_ALL_RED_PACKET_MUTATION, CHECK_DAILY_BUDGET_AVAILABILITY } from '@/services/redpacket.service.ts'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import Loader from '@components/common/Loader'
import { useNavigate } from 'react-router-dom'
import { useCheckLoginOnArb } from '@/hooks/hyperliquid/useCheckLoginOnArb'
import NewLoginDrawer from '@/components/auth/NewLoginDrawer'
interface HeroSectionProps {
  redPackets: Array<RedPacketDetail>
  onClaim?: () => void
  isLoading?: boolean
  onOpenCountdownModal?: () => boolean
  claimEnabledWeb?: boolean
  onOpenDownloadAppModal?: () => void
  activityStatus: 'not-started' | 'ongoing' | 'ended'
}

const HeroSection = ({ 
  redPackets = [], 
  onClaim, 
  isLoading = false,
  onOpenCountdownModal,
  claimEnabledWeb,
  onOpenDownloadAppModal,
  activityStatus
}: HeroSectionProps) => {
  const [showUnopened, setShowUnopened] = useState(false)
  const [showOpened, setShowOpened] = useState(false)
  const [redpacketAmount, setRedpacketAmount] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isEnoughRedpacket, setIsEnoughRedpacket] = useState(true)
  const [showLoginDrawer, setShowLoginDrawer] = useState(false)
  const navigate = useNavigate()
  
  
  
  const { t } = useTranslation()

  const packetsAvailable = redPackets.filter((p) => p.status !== 'EXPIRED' && p.status !== 'CLAIMED')
  const number = packetsAvailable.length
  const isLogin = useCheckLoginOnArb()



  const fireConfetti = () => {
    setShowConfetti(false)
    requestAnimationFrame(() => setShowConfetti(true))
  }

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 1200)
      return () => clearTimeout(timer)
    }
  }, [showConfetti])

  // 检查预算可用性的函数
  const checkBudgetAvailability = async () => {
    try {
      const checkRes: any = await redpacketClient.query({
        query: CHECK_DAILY_BUDGET_AVAILABILITY,
        variables: {},
      })
      const sharedPoolAvailable = checkRes?.data?.checkDailyBudgetAvailability?.sharedPoolAvailable
      setIsEnoughRedpacket(sharedPoolAvailable || false)
    } catch (error) {
      // 如果请求失败，默认设置为 true，允许用户尝试领取
      setIsEnoughRedpacket(true)
    }
  }

  // 页面加载时检查预算可用性
  useEffect(() => {
    checkBudgetAvailability()
  }, [])

  const handleClickRedpacket = () => {
    // 如果没登录，先打开登录弹窗
    if (!isLogin) {
      setShowLoginDrawer(true)
      return
    }
    // web端不能领取红包，需要去app领取
    if (!claimEnabledWeb) {
      onOpenDownloadAppModal?.()
      return
    }
    // 用户有红包，先支持打开
    if (packetsAvailable.length) {
       setShowUnopened(true)
       return
    }
    // 活动未开始或者活动结束，打开倒计时弹窗
    if (activityStatus === 'not-started' || activityStatus === 'ended') {
      onOpenCountdownModal?.()
      return
    }
    // 活动正在进行中
    if (!packetsAvailable.length) {
      /// 用户没有可以领取的红包
      navigate(`/futures`)
      return
    }
    // 正常操作，打开红包
    setShowUnopened(true)
  }

  const handleOpenRedpacket = async () => {
   
    // 如果有未打开的红包，直接领取，不判断 CHECK_DAILY_BUDGET_AVAILABILITY
    try {
      const res = await redpacketClient.mutate({
        mutation: CLAIM_ALL_RED_PACKET_MUTATION,
        variables: {},
      })
      const totalAmount = res.data?.claimAllRedPackets?.totalAmount
      if (totalAmount && totalAmount > 0) {
        setRedpacketAmount(totalAmount)
        fireConfetti()
        setShowUnopened(false)
        setShowOpened(true)
      } else {
        toast.error('Cliaimed failed. Please try again later.')
      }
    } catch (error: any) {
      toast.error(error?.[0]?.message || 'Cliaimed failed. Please try again later.')
    }
  }

  const handleCloseRedpacket = async () => {
    onClaim && onClaim()
    setShowOpened(false)
    await checkBudgetAvailability()
  }

  const handleCloseMask = () => {
    setShowUnopened(false)
  }

  
  return (
    <div className="relative w-full mb-3">
      
      {/* 背景图 */}
      <div className="px-[15px] mx-auto relative w-full text-center z-20">
   

        <div className="relative">
          

          <div className="aspect-[276/399] w-full relative">
            
            {/* 红包 */}
            <button
              type="button"
              aria-label={t('red.packet.open.redpacket')}
              className="absolute inset-0 bg-[url('/images/redpacket/redbag-bg-pc.png?v=1')] bg-cover bg-center z-10 cursor-pointer scale-90"
              onClick={handleClickRedpacket}
            />
              <div role="status" aria-live="polite" className="absolute left-[-8] top-[5%] z-11">
              <div className="min-w-16 min-h-16 max-w-25 max-h-25 bg-yellow-300 rounded-full shadow-[0px_4px_6px_0px_rgba(89,0,0,0.25)] flex items-center justify-center aspect-square p-0.5">
                {isLoading ? <Loader className="size-3 text-[#090909]" /> : <div>
                  <p className="text-[#090909] text-lg font-semibold "><span className="text-2.5xl">{number}</span>{t('red.packet.piece')}</p>
                  <div className=" text-neutral-950 text-xs font-normal">{t('red.packet.available')}</div>
                  </div>}
              </div>
            </div>
          </div>
          {/* 只有 APP 支持时显示按钮和提示 */}
          {
            !claimEnabledWeb && (
              <button type="button" onClick={() => onOpenDownloadAppModal?.()} className="w-full h-12 relative rounded-[10px] mt-[-15px]">
                <div aria-hidden="true" className="w-full h-12 left-0 top-[3.25px] absolute bg-gradient-to-bl from-orange-700 to-red-800 rounded-[10px]" />
                <div aria-hidden="true" className="w-full h-12 left-0 top-0 absolute bg-gradient-to-bl from-yellow-400 to-yellow-400 rounded-[10px]" />
                <div className="w-full h-12 left-0 top-0 absolute text-center flex items-center justify-center text-black text-xl font-semibold tracking-tight">
                  {t('red.packet.goToApp')}
                </div>
              </button>
            )
          }
          
        </div>
      

        <div className="mt-2 text-white/60 text-xs">{t('red.packet.tap.to.open.tips')}</div>
      </div>

      {/* 未打开红包蒙层 */}
      {showUnopened&& createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80">
          {/* 背景蒙层 */}
          <div aria-hidden="true" className="absolute inset-0 bg-[url('/images/redpacket/bg-bg-h5.png')] bg-cover bg-center" />

          {/* 内容区域 */}
          <div className="relative flex flex-col items-center w-full max-w-[256px]">
            {/* 闹元宵文字 */}
            {/* <img className="w-[280px] mb-4" src="/images/redpacket/h5/yuanxiao.png" alt="horse" /> */}

            {/* 红包 */}
            <div className="aspect-[256/370] w-full max-w-[256px] h-full relative">
              <div
                className="absolute inset-0 bg-[url('/images/redpacket/redbag-bg-pc.png?v=1')] bg-cover bg-center cursor-pointer"
                onClick={handleOpenRedpacket}
              ></div>
            </div>

            {/* 关闭按钮 */}
            <button
              type="button"
              className="mt-4 flex items-center justify-center text-white text-2xl"
              onClick={handleCloseMask}
              aria-label="Close"
            >
              <img src="/images/redpacket/close.svg" alt="close" />
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* 已打开红包蒙层 */}
      {showOpened && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80">
          {/* 背景蒙层 */}
          <div aria-hidden="true" className="absolute inset-0 bg-[url('/images/redpacket/bg-bg-h5.png')] bg-cover bg-center" />

          <div className="relative flex flex-col items-center w-full max-w-[313px]">
            {/* 闹元宵文字 */}
            {/* <img className="w-[280px] mb-4" src="/images/redpacket/h5/yuanxiao.png" alt="horse" /> */}

            {/* 打开的红包 */}
            <div className="aspect-[313/433] w-full max-w-[313px] bg-[url('/images/redpacket/open-redbag-bg.png')] bg-cover bg-center relative">
              <div className="absolute top-[25%] left-1/2 -translate-x-1/2 w-full flex flex-col items-center px-4">
                <div className="text-center">
                  {/* 金额 */}
                  <div className="mb-2">
                    <span className="text-[#DD0100] text-[42px] font-medium leading-none">${redpacketAmount || '0.00'}</span>
                  </div>
                  {/* 恭喜文字 */}
                  <p className="text-[#AE0A09] text-base font-semibold">{t('red.packet.congratulations')}</p>
                  {/* 提示文字 */}
                  <div className="text-[#AE0A09] text-[10px]">{t('red.packet.will.be.added.tips')}</div>
                </div>
              </div>


            </div>

            {/* 关闭按钮 */}
            <button
              type="button"
              className="mt-4 flex items-center justify-center text-white text-2xl"
              onClick={handleCloseRedpacket}
              aria-label="Close"
            >
              <img src="/images/redpacket/close.svg" alt="close" />
            </button>
          </div>
        </div>,
        document.body
      )}

      
      
            <NewLoginDrawer setOpen={setShowLoginDrawer} open={showLoginDrawer} />
      {/* Confetti 最上层 */}
      <Confetti
        trigger={showConfetti}
        confettiOptions={{
          emojis: ['🌈', '⚡️', '💥', '✨', '💫'],
          emojiSize: 50,
          confettiNumber: 150,
        }}
      />
    </div>
  )
}

export default HeroSection
