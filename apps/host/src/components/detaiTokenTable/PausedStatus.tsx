import { cn } from '@/lib/utils'
import { useResponsive } from '@hooks/useResponsive.ts'
import { useTranslation } from 'react-i18next'

export interface PausedStatusProps {
  paused: boolean
  setPaused: (paused: boolean) => void
}

/**
 * PausedStatus component, only visible on mobile devices.
 * @constructor
 */
export const PausedStatus = (props: PausedStatusProps) => {
  const { paused, setPaused } = props
  const { isDesktop } = useResponsive()
  const { t } = useTranslation()
  if (isDesktop) return null
  return (
    <div
      className={cn(
        'rounded-full p-1 pr-2 h-5 text-[calc(11rem/16)] leading-none flex items-center justify-center cursor-pointer',
        paused ? 'bg-[#facc141a] text-[#d9a508]' : 'bg-[#00FFB433] text-[#00FFB4]',
      )}
      onClick={() => setPaused(!paused)}
    >
      {paused ? (
        <svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.21875 3.85547H9.76431V3.86145H2.21875V3.85547Z" fill="#d9a508" />
          <path
            d="M2.88312 3.85521L9.10133 3.86118V3.85521H2.88312ZM1.20898 2.89856L2.88312 2.90454V2.89856H1.20898ZM9.10133 2.89856L10.7755 2.90454V2.89856H9.10133ZM3.83977 2.89856H8.14469V2.89258L3.83977 2.89856Z"
            fill="currentColor"
          />
          <path
            d="M3.71115 10.5C3.22227 10.5 2.82227 10.1 2.82227 9.61111V3.38889C2.82227 2.9 3.22227 2.5 3.71115 2.5C4.20004 2.5 4.60004 2.9 4.60004 3.38889V9.61111C4.60004 10.1 4.21115 10.5 3.71115 10.5ZM8.1556 10.5C7.66671 10.5 7.26671 10.1 7.26671 9.61111V3.38889C7.26671 2.9 7.66671 2.5 8.1556 2.5C8.64449 2.5 9.04449 2.9 9.04449 3.38889V9.61111C9.04449 10.1 8.6556 10.5 8.1556 10.5Z"
            fill="currentColor"
          />
        </svg>
      ) : (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          className="size-3"
        >
          <path
            d="M7.87 21.28C7.08 21.28 6.33 21.09 5.67 20.71C4.11 19.81 3.25 17.98 3.25 15.57V8.43999C3.25 6.01999 4.11 4.19999 5.67 3.29999C7.23 2.39999 9.24 2.56999 11.34 3.77999L17.51 7.33999C19.6 8.54999 20.76 10.21 20.76 12.01C20.76 13.81 19.61 15.47 17.51 16.68L11.34 20.24C10.13 20.93 8.95 21.28 7.87 21.28ZM7.87 4.21999C7.33 4.21999 6.85 4.33999 6.42 4.58999C5.34 5.20999 4.75 6.57999 4.75 8.43999V15.56C4.75 17.42 5.34 18.78 6.42 19.41C7.5 20.04 8.98 19.86 10.59 18.93L16.76 15.37C18.37 14.44 19.26 13.25 19.26 12C19.26 10.75 18.37 9.55999 16.76 8.62999L10.59 5.06999C9.61 4.50999 8.69 4.21999 7.87 4.21999Z"
            fill="currentColor"
          />
        </svg>
      )}
      {paused ? t('detail.trade.paused') : t('detail.trade.running')}
    </div>
  )
}
