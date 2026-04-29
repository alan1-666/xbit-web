import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import HttpBackend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'

const TRANSLATION_VERSION = process.env.VITE_TRANSLATION_VERSION || '1.0.0'

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: getInitialLang(),
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: `/locales/{{lng}}/{{ns}}.json?v=${TRANSLATION_VERSION}`,
    },
    detection: {
      order: ['navigator', 'cookie', 'localStorage', 'path', 'subdomain'],
      caches: ['cookie', 'localStorage'],
    },
    fallbackNS: 'common',
    defaultNS: 'translation', // Namespace mặc định
    react: {
      useSuspense: true,
    },
  })

export function getInitialLang() {
  const params = new URLSearchParams(window.location.search)
  const langUrl = params.get('lang')
  let lang =
    langUrl || localStorage.getItem('i18nextLng')?.substring(0, 2) || navigator.language?.substring(0, 2) || 'en'

  const validLanguages = new Set(['en', 'zh', 'ja', 'hi', 'hk', 'vi'])
  if (!validLanguages.has(lang)) {
    console.warn('{getInitialLang} fallback to en because of invalid lang: ', lang)
    lang = 'en'
  }

  return lang
}

export default i18n
