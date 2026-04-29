import { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'

interface CountdownModalProps {
  isOpen: boolean
  onClose: () => void
  startTime?: number // 活动开始时间戳（毫秒）
  isCampaignActive?: boolean
  showOverlay?: boolean
  activityStatus?: 'not-started' | 'ongoing' | 'ended'
}

const CountdownModal = ({
  isOpen,
  onClose,
  startTime,
  isCampaignActive = true,
  showOverlay = false,
  activityStatus,
}: CountdownModalProps) => {
  const { t } = useTranslation()
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    if (!isOpen) return
    const startTimeMs = typeof startTime === 'number' && Number.isFinite(startTime) ? startTime : undefined
    if (!startTimeMs) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      return
    }
    const shouldPauseCountdown = !isCampaignActive && !showOverlay
    if (shouldPauseCountdown) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      return
    }

    let timer: ReturnType<typeof setInterval> | undefined
    const calculateTimeLeft = () => {
      const now = Date.now()
      const difference = startTimeMs - now

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        if (timer) clearInterval(timer)
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })
    }

    calculateTimeLeft()
    timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [isCampaignActive, isOpen, showOverlay, startTime])

  if (!isOpen) return null

  const formatTime = (num: number) => String(num).padStart(2, '0')
  const canDisplayTime =
    activityStatus === 'not-started' && typeof startTime === 'number' && Number.isFinite(startTime) && startTime > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/90" onClick={onClose} />

      {/* 弹窗内容 */}
      <div className="relative w-[447px] h-[385px] rounded-[20px] bg-[#1E0000] border border-[#8D0808] overflow-hidden shadow-[0_0_30px_rgba(172,0,0,0.4)]">
        {/* 顶部半圆形渐变阴影 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[60px] rounded-[50%] bg-[#AC0000] opacity-80 blur-[50px]" />
        {/* 底部半圆形渐变阴影 */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[40px] rounded-[50%] bg-[#AC0000] opacity-80 blur-[50px]" />
        {/* 背景图 */}
        {/* <img
          src="/images/redpacket/lantern-bg.png"
          alt="background"
          className="absolute -top-8 left-1/2 -translate-x-1/2 w-[275px] h-[275px] object-cover"
        /> */}

        {/* 关闭按钮 */}
        <img
          src="/images/redpacket/close-btn.svg"
          alt="close"
          className="w-4 h-4 absolute top-6 right-6 z-20 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={onClose}
        />

        {/* 内容区域 */}
        <div className="relative z-10 flex flex-col items-center h-full px-12">
          {/* 灯笼图片 */}

          <img src="/images/redpacket/hourglass.png?v=1" alt="lantern" className="w-[107px] mt-10" />

          {/* 标题 */}
          <div className="text-white text-[24px] font-semibold mb-2 mt-4">{t('red.packet.countdown.title')}</div>

          {/* 描述文案 - 带颜色样式 */}
          <div className="text-center text-[16px] mb-5">
            <Trans
              i18nKey="red.packet.countdown.description"
              components={{
                highlight: <span className="text-[#FFD209]" />,
                normal: <span className="text-white" />,
              }}
              values={{
                time:
                  canDisplayTime
                    ? (timeLeft.days > 0 ? `${formatTime(timeLeft.days)}${t('red.packet.countdown.d')} ` : '') +
                      formatTime(timeLeft.hours) +
                      ':' +
                      formatTime(timeLeft.minutes) +
                      ':' +
                      formatTime(timeLeft.seconds)
                    : '--',
              }}
            />
            {/* 提示文案 */}
            <div className="text-[#FFF] text-[14px] text-center">{t('red.packet.countdown.reminder')}</div>
          </div>

          {/* 确认按钮 */}
          <button
            onClick={onClose}
            className="w-[325px] h-[41px] bg-[#DC2626] hover:bg-[#B91C1C] rounded-[12px] text-white text-[16px] border-b-[3px] border-[#900002] transition-colors"
          >
            {t('red.packet.countdown.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CountdownModal
