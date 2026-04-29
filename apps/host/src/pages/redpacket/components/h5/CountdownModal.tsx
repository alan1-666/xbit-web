import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Trans, useTranslation } from 'react-i18next'

interface CountdownModalProps {
  isOpen: boolean
  onOpenChange?: (status: boolean, action: 'cancel' | 'confirm') => void
  startTime?: number // 活动开始时间戳（毫秒）
  isCampaignActive?: boolean
  showOverlay?: boolean
  activityStatus?: 'not-started' | 'ongoing' | 'ended'
}

const CountdownModal = ({ 
  isOpen, 
  onOpenChange,
  startTime,
  isCampaignActive = true,
  showOverlay = false,
  activityStatus
}: CountdownModalProps) => {
  const { t } = useTranslation()

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })


  const handleOpenChange = (status: boolean, action: 'cancel' | 'confirm' = 'cancel') => {
    if (onOpenChange) {
      onOpenChange(status, action)
    }
  }

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

  const formatTime = (num: number) => String(num).padStart(2, '0')
  const canDisplayTime =
    activityStatus === 'not-started' && typeof startTime === 'number' && Number.isFinite(startTime) && startTime > 0


  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="rounded-[22px] border-2 w-[309px] h-[385px] border-[#8D0808] bg-gradient-to-b from-[#470000] to-[#1E0000] shadow-[0_4px_30px_0_rgba(212,9,9,0.87)] w-[80%] max-w-[400px] py-0 px-0 overflow-hidden"
        showDialogPrimitiveClose={false}
      >
        {/* 背景图 */}
        {/* <img
          src="/images/redpacket/lantern-bg.png"
          alt="background"
          className="absolute -top-8 left-1/2 -translate-x-1/2 w-[275px] h-[275px] object-cover"
        /> */}

        {/* 关闭按钮 */}
        <button onClick={() => handleOpenChange(false)} className="absolute right-[17px] top-[15px] z-20">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
            <g clipPath="url(#clip0_7323_7128)">
              <path
                d="M8.5359 7.50001L14.7562 13.7203C15.0423 14.0064 15.0423 14.47 14.7562 14.7561C14.4701 15.0422 14.0065 15.0422 13.7204 14.7561L7.50011 8.5358L1.2798 14.7563C0.993713 15.0423 0.53009 15.0423 0.244006 14.7563C-0.0420776 14.4702 -0.0420776 14.0066 0.244006 13.7205L6.46432 7.50001L0.24386 1.2797C-0.0422241 0.993616 -0.0422241 0.529994 0.24386 0.24388C0.386975 0.100765 0.574329 0.0292807 0.761829 0.0292807C0.949329 0.0292807 1.13668 0.100765 1.2798 0.243733L7.50011 6.46422L13.7204 0.24388C13.8634 0.100912 14.0509 0.0294266 14.2384 0.0294266C14.4259 0.0294266 14.6132 0.100912 14.7564 0.24388C15.0425 0.529994 15.0425 0.993616 14.7564 1.2797L8.5359 7.50001Z"
                fill="#FF7473"
              />
            </g>
            <defs>
              <clipPath id="clip0_7323_7128">
                <rect width="15" height="15" fill="white" transform="matrix(1 0 0 -1 0 15)" />
              </clipPath>
            </defs>
          </svg>
        </button>

        {/* 内容区域 */}
        <div className="px-4 mt-[-40px] flex flex-col justify-center items-center">
          <img src="/images/redpacket/hourglass.png?v=1" alt="lantern" className="w-[107px] mt-5" />

          <div className="justify-start text-white text-2xl font-semibold mb-2 mt-3">{t('red.packet.countdown.title')}</div>

          <div className="flex flex-col justify-center items-center mb-7">
            <div className="justify-start text-sm text-center">
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
            </div>
            <div className="justify-start text-white text-sm font-normal">{t('red.packet.countdown.reminder')}</div>
          </div>

          <button className="w-full h-10 relative rounded-lg" onClick={() => handleOpenChange(false)}>
            <div className="w-full h-10 left-0 top-0 absolute bg-gradient-to-bl from-orange-700 to-red-800 rounded-lg" />
            <div className="w-full h-9 left-0 top-[0.25px] absolute bg-gradient-to-bl from-orange-600 to-red-600 rounded-lg" />
            <div className="w-full h-9 left-0 top-[0.25px] absolute flex items-center text-center justify-center text-white text-lg font-semibold tracking-tight">
              {t('red.packet.countdown.confirm')}
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CountdownModal
