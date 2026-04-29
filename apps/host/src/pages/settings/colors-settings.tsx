import HeaderWithBack from '@components/header/HeaderWithBack.tsx'
import { cn } from '@/lib/utils.ts'
import { useTranslation } from 'react-i18next'
import { usePreference } from '@hooks/usePreference.ts'
import { APP_PATH } from '@/lib/constant.ts'
import { useResponsive } from '@/hooks/useResponsive'
import { logEvent2, ACTIONS } from '@services/google-analytics.service'

export const Card = (props: { variant: 'normal' | 'invert'; onClick: () => void; selected: boolean }) => {
  const { variant, onClick, selected } = props
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()

  const riseColor = isDesktop ? 'var(--desktop-rise)' : 'var(--rise)'
  const fallColor = isDesktop ? 'var(--desktop-fall)' : 'var(--fall)'
  return (
    <div className="border border-[#ECECED14] rounded-[10px] relative cursor-pointer" onClick={onClick}>
      <div
        className={cn(
          'w-full h-full px-3.5 py-2 rounded-[10px] flex flex-col',
          selected && 'transition-colors border bg-[#232329]',
        )}
      >
        <div className="text-white font-medium text-[calc(14rem/16)] leading-3.5 flex items-center gap-2.5 mb-2">
          {variant === 'normal' ? t('appSettings.color.greenUpRedDown') : t('appSettings.color.redUpGreenDown')}
          {variant === 'normal' ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M7.96385 6.47995L5.48386 4L3.00391 6.47995"
                stroke="#00FFB4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5.48047 15.9999V4"
                stroke="#00FFB4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.0273 13.5195L14.5073 15.9995L16.9873 13.5195"
                stroke="#F25461"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14.5117 4V15.9999"
                stroke="#F25461"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M7.96385 6.47995L5.48386 4L3.00391 6.47995"
                stroke="#F25461"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5.48047 15.9999V4"
                stroke="#F25461"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.0273 13.5195L14.5073 15.9995L16.9873 13.5195"
                stroke="#00FFB4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14.5117 4V15.9999"
                stroke="#00FFB4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        <div className="flex items-center gap-2.5 mb-2">
          <div className="text-[#FFFFFF80] text-[calc(14rem/16)] font-medium flex-1">BTC</div>
          <div className="w-24 h-3.5 bg-[#ECECED1F] rounded-[2px]" />
          <div
            className={cn(
              'text-[calc(12rem/16)] text-[#141414] font-medium p-1 rounded-[3px] leading-3 text-center w-14',
              variant === 'normal' ? riseColor : fallColor,
            )}
            style={{
              backgroundColor: variant === 'normal' ? riseColor : fallColor,
            }}
          >
            +4.15%
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="text-[#FFFFFF80] text-[calc(14rem/16)] font-medium flex-1">BTC</div>
          <div className="w-24 h-3.5 bg-[#ECECED1F] rounded-[2px]" />
          <div
            className={cn(
              'text-[calc(12rem/16)] text-[#141414] font-medium p-1 rounded-[3px] leading-3  text-center w-14',
              variant === 'normal' ? fallColor : riseColor,
            )}
            style={{
              backgroundColor: variant === 'normal' ? fallColor : riseColor,
            }}
          >
            -4.15%
          </div>
        </div>
      </div>
    </div>
  )
}

export const ColorsSettingsPage = () => {
  const { t } = useTranslation()
  const { updatePreference, preference } = usePreference()
  const handleColorChange = (color: 'normal' | 'inverse') => {
    updatePreference({ priceChangeColor: color })
    switch (color) {
      case 'normal':
        logEvent2(ACTIONS.setting_change_color, { color_mode: 'green_up_red_down' })
        break
      case 'inverse':
        logEvent2(ACTIONS.setting_change_color, { color_mode: 'red_up_green_down' })
        break
    }
  }
  const color = preference?.priceChangeColor || 'normal'
  return (
    <div className="w-full h-[100dvh] flex flex-col">
      <HeaderWithBack
        title={t('appSettings.colors.title')}
        className="bg-transparent"
        backHref={APP_PATH.MEME_DISCOVER}
      />
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 space-y-4">
        <h1 className="text-white text-[calc(18rem/16)]">{t('appSettings.colors.gainLossColor')}</h1>
        <Card variant="normal" onClick={() => handleColorChange('normal')} selected={color === 'normal'} />
        <Card variant="invert" onClick={() => handleColorChange('inverse')} selected={color === 'inverse'} />
      </div>
    </div>
  )
}
