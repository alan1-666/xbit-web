import {
  IconArrowPair,
  IconArrowPairInverse,
  IconChevronRight,
  IconColorPaletteStroke,
  IconGlobalStroke,
  IconMessageNotificationStroke,
} from '@/components/icon'
import HeaderWithBack from '@components/header/HeaderWithBack.tsx'
import { useTranslation } from 'react-i18next'
import { useNotificationsEnabled } from '@hooks/useNotificationsEnabled.ts'
import { usePreference } from '@hooks/usePreference.ts'
import { APP_PATH } from '@/lib/constant'
import { useNavigateWithLocation } from '@hooks/useNavigateWithLocation.ts'
import { useLocation } from 'react-router-dom'
import { IconChina, IconIndia, IconUSA, IconVietnam } from '@components/icon/IconFlags.tsx'
import { ReactNode } from 'react'
import { toast } from 'sonner'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'

const NotificationStatus = () => {
  const { notificationsEnabled } = useNotificationsEnabled()
  const { t } = useTranslation()
  return <span>{notificationsEnabled ? t('appSettings.enabled') : t('appSettings.disabled')}</span>
}

const IconPriceChange = () => {
  const {
    preference: { priceChangeColor },
  } = usePreference()
  if (priceChangeColor === 'normal') return <IconArrowPair />
  return <IconArrowPairInverse />
}

const languages: Record<string, string> = {
  en: 'English',
  zh: '简体中文',
  ja: '日本語',
  hi: 'हिन्दी',
  hk: '繁體中文',
  vi: 'Tiếng Việt',
}

const languageIcons: Record<string, ReactNode> = {
  en: <IconUSA className="size-3.5" />,
  zh: <IconChina className="size-3.5" />,
  hi: <IconIndia className="size-3.5" />,
  hk: <IconChina className="size-3.5" />,
  vi: <IconVietnam className="size-3.5" />,
}

const CurrentLanguage = () => {
  const { i18n } = useTranslation()
  const currentLang = i18n.language ?? 'en'
  return (
    <div className="flex items-center gap-1">
      {languageIcons[currentLang]}
      <span>{languages[currentLang] || currentLang}</span>
    </div>
  )
}

const items = [
  {
    title: 'appSettings.messageNotifications',
    icon: <IconMessageNotificationStroke className="text-white" />,
    right: <NotificationStatus />,
    link: APP_PATH.MEME_NOTIFICATION_SETTINGS,
    loginRequired: true,
  },
  {
    title: 'appSettings.colorPreference',
    icon: <IconColorPaletteStroke className="text-white" />,
    right: <IconPriceChange />,
    link: APP_PATH.MEME_COLORS_SETTINGS,
  },
  {
    title: 'appSettings.language',
    icon: <IconGlobalStroke className="text-white" />,
    right: <CurrentLanguage />,
    link: APP_PATH.MEME_SETTINGS_LANGUAGE,
  },
]

export const SystemSettingsPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigateWithLocation()
  const location = useLocation()
  const activeWallet = useActiveWallet()
  return (
    <div className="flex flex-col h-dvh">
      <HeaderWithBack title={t('appSettings.systemSettingsTitle')} className="bg-transparent" />
      <div className="flex-1 pt-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between px-4 py-3.5 gap-3 cursor-pointer hover:bg-[#36364232] transition-colors duration-200"
            onClick={() => {
              if (item.loginRequired && !activeWallet.isConnected) {
                toast.warning(t('appSettings.loginRequired'))
                return
              }
              if (item.link) {
                navigate(item.link, {
                  callbackState: { from: location.state.from, callbackState: location.state.callbackState },
                })
              }
            }}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span className="text-white font-[380] text-[calc(15rem/16)] leading-[15px]">{t(item.title)}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="text-[#FFFFFFB2] font-[330] text-[calc(14rem/16)] leading-3.5 text-right">
                {item.right}
              </div>
              <IconChevronRight className="text-[#B9B9B9]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
