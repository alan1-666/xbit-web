import React, { useEffect, useRef, useState } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { cn } from '@/lib/utils'
import { formatVolume } from '@/lib/format'

interface ActivityStatusCardProps {
  status: 'not-started' | 'ongoing' | 'ended'
  startTime?: number // 活动开始时间戳（毫秒）
  isCampaignActive?: boolean
  showOverlay?: boolean
  progress?: number // 进度百分比 0-100
  remainingAmount?: number
  onActionClick?: () => void
  onCountdownEnd?: () => void
}

const ActivityStatusCard = ({ 
  status, 
  startTime, 
  isCampaignActive = true,
  showOverlay = false,
  progress = 0, 
  remainingAmount,
  onActionClick,
  onCountdownEnd,
}: ActivityStatusCardProps) => {
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

  // 将天数、小时、分钟、秒格式化为两位数
  const formatCountdownValue = (value: number) => String(value).padStart(2, '0')

  // 状态标签配置
  const statusConfig = {
    'not-started': {
      label: t('red.packet.tag.not_start'),
      title: `${t('redpacket.banner.starting.soon')}, ${t('redpacket.banner.please.wait')}`
    },
    'ongoing': {
      label: t('red.packet.tag.live'),
      title: t('redpacket.banner.activity.ongoing'),
      content: (
        <div className="mb-2.5 text-[14px]">
          {/* <span className="text-white font-normal [text-shadow:_0px_2px_2px_rgb(113_0_0_/_0.25)]">奖池</span>
          <span className="text-[#FEEE44] font-normal [text-shadow:_0px_2px_2px_rgb(113_0_0_/_0.25)]">剩余{remainingAmountLabel}USDT</span>
          <span className="text-white font-normal [text-shadow:_0px_2px_2px_rgb(113_0_0_/_0.25)]">，先到先得</span> */}
          <span className="text-white">
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
      ),
      progressBar: (
        <div className="w-full h-2 relative rounded-md">
          <div className="absolute inset-0 bg-red-900 rounded-md" />
          <div 
            className="absolute h-2 bg-gradient-to-r from-red-600 to-yellow-400 rounded-md transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )
    },
    'ended': {
      label: t('red.packet.tag.ended'),
      title: t('redpacket.banner.activity.ended'),
      content: (
        <div className="mb-2.5 text-[12px]">
         {/*  <span className="text-white text-xs font-normal [text-shadow:_0px_2px_2px_rgb(113_0_0_/_0.25)]">红包</span>
          <span className="text-[#FEEE44] text-xs font-normal [text-shadow:_0px_2px_2px_rgb(113_0_0_/_0.25)]">已派送完</span>
          <span className="text-white text-xs font-normal [text-shadow:_0px_2px_2px_rgb(113_0_0_/_0.25)]">，请明日再来，明日奖池</span>
          <span className="text-[#FEEE44] text-xs font-normal [text-shadow:_0px_2px_2px_rgb(113_0_0_/_0.25)]">将在00:00重置</span> */}
          <Trans
            i18nKey="redpacket.banner.ended.message"
            components={{
              highlight: <span className="text-[#FEEE44]" />,
            }}
            className="flex justify-between"
          />
        </div>
      ),
      progressBar: (
        <div className="w-full h-2 bg-gradient-to-r from-red-600 to-yellow-400 rounded-md" />
      )
    }
  }

  // 倒计时组件
  const CountdownTimer = () => {
    const timeUnits = [
      { unit: t('const.time.dayShort'), value: formatCountdownValue(displayCountdown.days) },
      { unit: t('red.packet.countdown.hours_short'), value: formatCountdownValue(displayCountdown.hours) },
      { unit: t('red.packet.countdown.minutes_short'), value: formatCountdownValue(displayCountdown.minutes) },
      { unit: t('red.packet.countdown.seconds_short'), value: formatCountdownValue(displayCountdown.seconds) }
    ]

    return (
      <div className="flex items-center gap-0.5 mb-2">
        {timeUnits.map(({ unit, value }) => (
          <div key={unit} className="flex items-center">
            <div className="w-[55px] h-[53px] flex items-center justify-center text-[#FEEE44] text-3xl font-bold mr-1.5 bg-[url('/images/redpacket/h5/time-bg.png')] bg-cover bg-center">
              {value}
            </div>
            <div className="text-red-600 text-lg font-semibold">{unit}</div>
          </div>
        ))}
      </div>
    )
  }

  // 状态标签组件
  const StatusTag = ({ label }: { label: string }) => (
    <div className="absolute right-[-4px] w-[70px] h-[30px] top-[10px] bg-[url('/images/redpacket/h5/biaoqian.png')] bg-cover bg-center text-center">
      <div className="text-[#FFF278] text-[13px] font-semibold mt-[1px]">{label}</div>
    </div>
  )

  return (
    <div className="w-full relative bg-gradient-to-b py-2 px-3 from-stone-950/70 to-stone-900/70 rounded-lg border border-rose-950" onClick={onActionClick}>
      {/* 标题 */}
      <div className={cn("text-base font-semibold [text-shadow:_0px_2px_2px_rgb(113_0_0_/_0.25)] mb-2", status === 'not-started' ? 'text-white' : 'text-[#FFEC43]')}>
        {statusConfig[status].title}
      </div>

      {/* 根据不同状态渲染不同内容 */}
      {status === 'not-started' && <CountdownTimer />}
      {status !== 'not-started' && (
        <>
          {status === 'ongoing' && (
            <>
              {statusConfig.ongoing.content}
              {statusConfig.ongoing.progressBar}
            </>
          )}
          {status === 'ended' && (
            <>
              {statusConfig.ended.content}
              {statusConfig.ended.progressBar}
            </>
          )}
        </>
      )}

      {/* 状态标签 */}
      <StatusTag label={statusConfig[status].label} />
    </div>
  )
}

export default ActivityStatusCard
