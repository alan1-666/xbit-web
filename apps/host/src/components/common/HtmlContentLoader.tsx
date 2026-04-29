import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface HtmlContentLoaderProps {
  contentType: 'privacy-policy' | 'terms-of-use'
}

const HtmlContentLoader: React.FC<HtmlContentLoaderProps> = ({ contentType }) => {
  const { i18n, t } = useTranslation()
  const [htmlContent, setHtmlContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true)
      const lang = i18n.language || 'en'

      try {
        const module = await import(`@/data/html/${contentType}/${lang}.html?raw`)
        setHtmlContent(module.default)
      } catch (error) {
        console.error(`${t('error.loadingHtmlContent')}`)

        if (lang !== 'en') {
          try {
            const enModule = await import(`@/data/html/${contentType}/en.html?raw`)
            setHtmlContent(enModule.default)
          } catch (fallbackError) {
            console.error(`${t('error.loadingFallbackHtmlContent')}`)
            setHtmlContent(`<p>${t('error.contentNotAvailable')}</p>`)
          }
        } else {
          setHtmlContent(`<p>${t('error.contentNotAvailable')}</p>`)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadContent()
  }, [i18n.language, contentType, t])

  return (
    <div className="min-h-screen bg-[#111] bg-cover bg-center">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : (
        <div
          className="p-3"
          dangerouslySetInnerHTML={{
            __html: htmlContent,
          }}
        ></div>
      )}
    </div>
  )
}

export default HtmlContentLoader
