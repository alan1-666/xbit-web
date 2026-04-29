import { useEffect, useState } from 'react'
import { RedPacketDetail } from '@/@generated/gql/graphql-redpacket'
import { redpacketClient } from '@/lib/gql/apollo-client'
import { CLAIM_ALL_RED_PACKET_MUTATION, CHECK_DAILY_BUDGET_AVAILABILITY } from '@/services/redpacket.service.ts'
import { toast } from 'sonner'
import Confetti from '@/pages/redpacket/components/Confetti.tsx'
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
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [redpacketAmount, setRedpacketAmount] = useState<number>(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isEnoughRedpacket, setIsEnoughRedpacket] = useState(true)
  const [showLoginDrawer, setShowLoginDrawer] = useState(false)
  const packetsAvailable = redPackets.filter((p) => p.status !== 'EXPIRED' && p.status !== 'CLAIMED')
  const number = packetsAvailable.length
  const isLogin = useCheckLoginOnArb()
  const navigate = useNavigate()

  /* const redpacketAmount = packetsAvailable.reduce((sum, item) => {
    return sum + Number(item.amount);
  }, 0);
  console.log('redpacketAmount', redpacketAmount); */

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

  const handleOpenRedpacket = async () => {
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
       handleClaimRedpacket()
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
      navigate('/futures')
      return
    }

    // 正常操作，打开红包
    handleClaimRedpacket()
  }
  const handleClaimRedpacket = async () => {
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
        setIsOpen(true)
        // 领取成功后，重新检查额度（进入第一点）
        // await checkBudgetAvailability()
      } else {
        toast.error('Cliaimed failed. Please try again later.')
      }
    } catch (error: any) {
      toast.error(error?.[0]?.message || 'Cliaimed failed. Please try again later.')
    }
  }

  const handleCloseRedpacket = async () => {
    onClaim && onClaim()
    setIsOpen(false)
    await checkBudgetAvailability()
  }
  const fireConfetti = () => {
    setShowConfetti(false) // 关键：先 reset
    requestAnimationFrame(() => {
      setShowConfetti(true)
    })
  }

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false)
      }, 1200)

      return () => clearTimeout(timer)
    }
  }, [showConfetti])
  return (
    <>
      <NewLoginDrawer setOpen={setShowLoginDrawer} open={showLoginDrawer} />
      <div
        className="w-[458px] h-[655px] relative mb-3 rounded-[20px] p-[1px]"
        style={{
          background: 'linear-gradient(180deg, #E30101 0%, rgba(227, 1, 1, 0) 100%)',
        }}
      >
        <div
          className="w-full h-full py-[40px] rounded-[20px]"
          style={{
            // background: '#121214 url(/images/redpacket/bg-bg.png) center center/100% auto no-repeat',
            background: 'linear-gradient(180deg, #900002 0%, #121214)',
            boxShadow: '0 0 18px 6px rgba(255, 210, 9, 0.10) inset',
          }}
        >
          <div className="px-[15px] h-full mx-auto relative text-center flex flex-col">
            <div className="text-[32px] text-white font-bold mb-[8px]">{t('red.packet.lantern.festival.title')}</div>
            <div className="text-center text-[#A9A9B3] text-[14px] font-normal mb-4">
              {t('red.packet.open packets.tips')}
            </div>

            <div className="flex-1 min-h-0 flex flex-col">
              {
                !isOpen ? (
                  <div className="w-full relative flex flex-col flex-1 min-h-0">
                    <div
                      className="flex-1 min-h-0 relative cursor-pointer flex items-center justify-center w-fit max-w-full mx-auto"
                      onClick={handleOpenRedpacket}
                    >
                      {/* 待领取标签 - 左上角 */}
                      <div className="absolute top-[-8px] left-[-10px] z-10 min-w-[72px] min-h-[72px] max-w-[120px] max-h-[120px] p-0.5 aspect-square rounded-full bg-[#FFD209] flex flex-col items-center justify-center">
                        <div className="text-[18px] font-bold text-[#121214] leading-none mb-1">
                          {isLoading ? <Loader className="size-4" /> : <span className="text-[24px]">{number}</span>}
                          {t('red.packet.piece')}
                        </div>
                        <div className="text-[12px] text-[#121214] leading-none">{t('red.packet.available')}</div>
                      </div>
                      <img
                        className="h-full w-auto max-w-full mx-auto object-contain animate-fade-in"
                        src="/images/redpacket/redbag-bg-pc.png?v=4"
                      />
                    </div>

                    {/* 只有 APP 支持时显示按钮和提示 */}
                    {/* 直接用是否支持 web 判断，web 和 H5 是一致的，不支持 web 直接认为只支持 App */}
                    {!claimEnabledWeb && (
                      <div className="w-full flex flex-col items-center mt-4">
                        <button
                          className="w-[322px] h-[52px] bg-[#DC2626] rounded-[12px] text-white text-[16px] font-semibold mb-2 border-b-[3px] border-[#900002]"
                          onClick={onOpenDownloadAppModal}
                        >
                          {t('red.packet.goToApp')}
                        </button>
                        <div className="text-[#6B6B78] text-[12px]">{t('red.packet.scan.download.tips')}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative flex flex-col items-center flex-1 min-h-0">
                    {/* 打开的红包 */}
                    <div className="aspect-[313/433] w-full max-w-[313px] bg-[url('/images/redpacket/open-redbag-bg.png')] bg-cover bg-center relative">
                      <div className="absolute top-[25%] left-1/2 -translate-x-1/2 w-full flex flex-col items-center px-4">
                        <div className="text-center">
                          {/* 金额 */}
                          <div className="mb-2">
                            <span className="text-[#DD0100] text-[42px] font-medium leading-none">
                              ${redpacketAmount || '0.00'}
                            </span>
                          </div>
                          {/* 恭喜文字 */}
                          <p className="text-[#AE0A09] text-base font-semibold">{t('red.packet.congratulations')}</p>
                          {/* 提示文字 */}
                          <div className="text-[#AE0A09] text-[10px]">{t('red.packet.will.be.added.tips')}</div>
                        </div>
                      </div>

                      {/* 关闭按钮 - 放在红包图片内部右上角 */}
                      <button
                        className="absolute top-4 right-4 flex items-center justify-center text-white text-2xl"
                        onClick={handleCloseRedpacket}
                      >
                        <img src="/images/redpacket/close.svg" alt="close" />
                      </button>
                    </div>
                  </div>
                )
              }
            </div>
          </div>
          <Confetti
            trigger={showConfetti}
            confettiOptions={{
              emojis: ['🌈', '⚡️', '💥', '✨', '💫'],
              emojiSize: 50,
              confettiNumber: 150,
            }}
          />
        </div>
      </div>
    </>
  )
}

export default HeroSection
