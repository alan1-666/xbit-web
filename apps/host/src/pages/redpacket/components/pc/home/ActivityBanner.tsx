import { useEffect, useRef, useState } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { formatVolume } from '@/lib/format'

interface ActivityBannerProps {
  status: 'not-started' | 'ongoing' | 'ended'
  startTime?: number // 活动开始时间戳（毫秒）
  isCampaignActive?: boolean
  showOverlay?: boolean
  progress?: number // 进度百分比 0-100
  remainingAmount?: number
  onActionClick?: () => void
  onCountdownEnd?: () => void
}

const ActivityBanner = ({
  status,
  startTime,
  isCampaignActive = true,
  showOverlay = false,
  progress = 0,
  remainingAmount,
  onActionClick,
  onCountdownEnd,
}: ActivityBannerProps) => {
  const { t } = useTranslation()
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const hasTriggeredCountdownEndRef = useRef(false)
  const lastStartTimeRef = useRef<number | undefined>(undefined)

  const remainingAmountLabel =
    remainingAmount === null || remainingAmount === undefined
      ? '--'
      : formatVolume(remainingAmount, { showCurrency: false })

  useEffect(() => {
    if (status !== 'not-started' || !startTime) return

    if (lastStartTimeRef.current !== startTime) {
      lastStartTimeRef.current = startTime
      hasTriggeredCountdownEndRef.current = false
    }
    let timer: ReturnType<typeof setInterval> | undefined

    const updateCountdown = () => {
      const now = Date.now()
      const diff = startTime - now
      const shouldPauseCountdown = !isCampaignActive && !showOverlay

      if (diff <= 0) {
        if (isCampaignActive || showOverlay) setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        if (!hasTriggeredCountdownEndRef.current) {
          hasTriggeredCountdownEndRef.current = true
          onCountdownEnd?.()
        }
        if (timer) clearInterval(timer)
        return
      }

      if (shouldPauseCountdown) return

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setCountdown({ days, hours, minutes, seconds })
    }

    updateCountdown()
    if (startTime - Date.now() > 0) {
      timer = setInterval(updateCountdown, 1000)
    }

    return () => clearInterval(timer)
  }, [isCampaignActive, onCountdownEnd, showOverlay, startTime, status])

  const displayCountdown =
    isCampaignActive || showOverlay ? countdown : { days: 0, hours: 0, minutes: 0, seconds: 0 }

  const renderCountdownNumber = (num: number) => (
    <div className="relative w-[55px] h-[55px] max-[1400px]:w-[45px] max-[1400px]:h-[45px] max-[1300px]:w-[35px] max-[1300px]:h-[35px]">
      <img src="/images/redpacket/num-bg.svg" alt="" className="w-full h-full" />
      <span className="absolute inset-0 flex items-center justify-center text-[#FFEC43] text-[24px] font-bold">
        {String(num).padStart(2, '0')}
      </span>
    </div>
  )

  const renderActionButton = () => {
    if (status === 'not-started') {
      return (
        <div className="relative left-[6px] flex items-center h-[42px]">
          {/* 左侧半圆 */}
          <div className="w-[21px] h-[42px] bg-[#DC0202] rounded-l-full" />
          {/* 主体矩形 */}
          <div className="relative h-[42px] bg-[#DC0202] pr-4 flex items-center">
            <span className="text-[#FEEE44] text-[20px] font-medium whitespace-nowrap">
              {t('red.packet.tag.not_start')}
            </span>
            {/* 右下角三角形 */}
            <div
              className="absolute right-0 bottom-[-6px] w-0 h-0"
              style={{
                borderRight: '5px solid transparent',
                borderTop: '6px solid #9A0000',
              }}
            />
          </div>
        </div>
      )
    }

    if (status === 'ongoing') {
      return (
        <button className="relative left-[6px] flex items-center h-[42px] cursor-pointer hover:opacity-90 transition-opacity">
          {/* 左侧半圆 */}
          <div className="w-[21px] h-[42px] bg-[#DC0202] rounded-l-full" />
          {/* 主体矩形 */}
          <div className="relative h-[42px] bg-[#DC0202] pr-4 flex items-center">
            <span className="text-[#FEEE44] text-[20px] font-medium whitespace-nowrap">{t('red.packet.tag.live')}</span>
            {/* 右下角三角形 */}
            <div
              className="absolute right-0 bottom-[-6px] w-0 h-0"
              style={{
                borderRight: '5px solid transparent',
                borderTop: '6px solid #9A0000',
              }}
            />
          </div>
        </button>
      )
    }

    return (
      <div className="relative left-[6px] flex items-center h-[42px]">
        {/* 左侧半圆 */}
        <div className="w-[21px] h-[42px] bg-[#DC0202] rounded-l-full" />
        {/* 主体矩形 */}
        <div className="relative h-[42px] bg-[#DC0202] pr-4 flex items-center">
          <span className="text-[#FEEE44] text-[20px] font-medium whitespace-nowrap">{t('red.packet.tag.ended')}</span>
          {/* 右下角三角形 */}
          <div
            className="absolute right-0 bottom-[-6px] w-0 h-0"
            style={{
              borderRight: '5px solid transparent',
              borderTop: '6px solid #9A0000',
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div
      className="w-full mb-6 relative h-[85px] flex items-center rounded-[16px] border border-[#732626]"
      onClick={onActionClick}
    >
      {/* 背景图 */}
      <div className="absolute inset-0">
        <img src={`/images/redpacket/banner-bg.png`} alt="" className="w-full h-full object-cover rounded-[16px]" />
        {/* 黑色遮罩层 */}
        <div className="absolute inset-0 bg-black opacity-80 rounded-[16px]" />
      </div>

      {/* 内容 */}
      <div className="relative flex items-center justify-between w-full">
        {/* 左侧：灯笼和文字 */}
        <div className="flex items-center justify-between h-full">
          <img src="/images/redpacket/banner-0.png?v=2" alt="" className="h-[110px] relative" />
          <img
            src="/images/redpacket/banner-text.png?v=2"
            alt=""
            className="h-[50px] max-[1450px]:w-[250px] max-[1450px]:h-[37px]"
          />
        </div>
        {/* 中间： 三种状态内容 */}
        {status === 'not-started' && (
          <div className="flex flex-col whitespace-nowrap">
            <span className="text-[#FEEE44] text-[22px] font-medium">{t('redpacket.banner.starting.soon')}</span>
            <span className="text-[#FEEE44] text-[22px]">{t('redpacket.banner.please.wait')}</span>
          </div>
        )}

        {status === 'ongoing' && (
          <div className="flex flex-1 ml-25 mr-12 max-[1500px]:ml-5 max-[1500px]:mr-2 flex-col gap-1 ">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#FEEE44] text-[22px] font-medium">{t('redpacket.banner.activity.ongoing')}</span>
              <span className="text-white text-[22px]">
                <Trans
                  i18nKey="redpacket.banner.pool.remaining"
                  components={{
                    highlight: <span className="text-[#FEEE44]" />,
                  }}
                  values={{
                    percent: `${remainingAmountLabel} USDC`,
                  }}
                  className="flex justify-between"
                />
              </span>
            </div>
            <div className="relative w-full h-[11px] bg-[#721A1A] rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#FC0B0F] to-[#FFD82A]  rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        {status === 'ended' && (
          <div className="flex flex-1 ml-25 mr-12 max-[1500px]:ml-5 max-[1500px]:mr-2 flex-col gap-2">
            <div className="flex w-full justify-between items-center gap-2">
              <span className="text-[#FEEE44] text-[22px]  max-[1400px]:text-base font-medium">{t('redpacket.banner.activity.ended')}</span>
              <span>
                <Trans
                  i18nKey="redpacket.banner.ended.message"
                  components={{
                    highlight: <span className="text-[#FEEE44]" />,
                  }}
                  className="flex justify-between"
                />
              </span>
            </div>
            <div className="relative w-full h-[8px] bg-[#4A0000] rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#FC0B0F] to-[#FFD82A] rounded-full transition-all duration-300"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )}

        {/* 右侧：倒计时或按钮 */}
        <div className="flex items-center justify-end">
          {status === 'not-started' && (
            <div className="flex-1 flex items-center">
              <div className="flex items-center gap-1 max-[1400px]:gap-1/2 min-[1500px]:gap-3">
                {renderCountdownNumber(displayCountdown.days)}
                <span className="text-[#FF2121] text-[22px] font-medium">{t('const.time.dayShort')}</span>
                {renderCountdownNumber(displayCountdown.hours)}
                <span className="text-[#FF2121] text-[22px] font-medium">{t('red.packet.countdown.hours_short')}</span>
                {renderCountdownNumber(displayCountdown.minutes)}
                <span className="text-[#FF2121] text-[22px] font-medium">
                  {t('red.packet.countdown.minutes_short')}
                </span>
                {renderCountdownNumber(displayCountdown.seconds)}
                <span className="text-[#FF2121] text-[22px] font-medium">{t('red.packet.countdown.seconds_short')}</span>
                <div />
                {/* <img src="/images/redpacket/banner-3.png" alt="" className="w-[100px] hidden min-[1400px]:block" /> */}
              </div>
            </div>
          )}
        </div>
        {renderActionButton()}
      </div>
    </div>
  )
}

export default ActivityBanner
