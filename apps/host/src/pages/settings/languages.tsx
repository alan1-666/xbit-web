import HeaderWithBack from '@components/header/HeaderWithBack.tsx'
import { IconArab, IconChina, IconFrance, IconGermany, IconIndia, IconItaly, IconJapan, IconKorea, IconPortugal, IconSpain, IconTurkey, IconUSA, IconVietnam } from '@components/icon/IconFlags.tsx'
import { useTranslation } from 'react-i18next'
import { APP_PATH } from '@/lib/constant.ts'
import { logEvent2, ACTIONS } from '@services/google-analytics.service'

export const languages = [
  { key: 'zh', label: '简体中文', region: 'zh-CN', flag: <IconChina /> },
  { key: 'hk', label: '繁体中文', region: 'zh-HK', flag: <IconChina /> },
  { key: 'en', label: 'English', region: 'en-US', flag: <IconUSA /> },
  { key: 'vi', label: 'Tiếng Việt', region: 'vi-VN', flag: <IconVietnam /> },
  { key: 'hi', label: 'हिन्दी', region: 'hi-IN', flag: <IconIndia /> },
  { key: 'es', label: 'Español', region: 'es-ES', flag: <IconSpain /> },
  { key: 'ja', label: '日本語', region: 'ja-JP', flag: <IconJapan /> },
  { key: 'pt', label: 'Português', region: 'pt-PT', flag: <IconPortugal /> },
  { key: 'fr', label: 'Français', region: 'fr-FR', flag: <IconFrance /> },
  { key: 'de', label: 'Deutsch', region: 'de-DE', flag: <IconGermany /> },
  { key: 'it', label: 'Italiano', region: 'it-IT', flag: <IconItaly /> },
  { key: 'tr', label: 'Türkçe', region: 'tr-TR', flag: <IconTurkey /> },
  { key: 'ko', label: '한국어', region: 'ko-KR', flag: <IconKorea /> },
  { key: 'ar', label: 'العربية', region: 'ar-SA', flag: <IconArab /> },
]

export const LanguagesSettingsPage = () => {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language
  const changeLanguage = (lang: string) => {
    const region = languages.find((l) => l.key === lang)?.region || lang

    logEvent2(ACTIONS.setting_change_language, { language: region })
    document.body.classList.remove('font-noto', 'font-noto-sc', 'font-noto-tc')
    i18n.changeLanguage(lang).then(() => {
      if (lang === 'zh') {
        document.body.classList.add('font-noto-sc')
      } else if (lang === 'hk') {
        document.body.classList.add('font-noto-tc')
      } else {
        document.body.classList.add('font-noto')
      }
    })
  }
  return (
    <div className="flex h-dvh w-full flex-col">
      <HeaderWithBack
        title={t('appSettings.languages.title')}
        className="bg-transparent"
        backHref={APP_PATH.MEME_DISCOVER}
      />
      <div className="no-scrollbar flex-1 overflow-y-auto">
        {languages.map((lang) => (
          <div
            key={lang.key}
            className="flex cursor-pointer items-center gap-2.5 px-3 py-5"
            onClick={() => {
              changeLanguage(lang.key)
            }}
          >
            {lang.flag}
            <span className="text-[calc(15rem/16)] text-[#FFFFFF]">{lang.label}</span>
            <span className="flex-1 text-[calc(14rem/16)] text-[#FFFFFFCC]">{lang.region}</span>
            {currentLang === lang.key && (
              <img src="/images/icons/ic-check-circle-gradient.svg?v=2" alt="" className="size-5" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
