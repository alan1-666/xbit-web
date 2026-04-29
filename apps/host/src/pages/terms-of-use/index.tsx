import React, { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import HeaderWithBack from '@components/header/HeaderWithBack'
import { APP_PATH } from '@/lib/constant'
import HtmlContentLoader from '@/components/common/HtmlContentLoader'

const TermsOfUseAndPrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { pathname } = useLocation()

  const handleBack = () => {
    navigate(-1)
  }

  const title = useMemo(() => {
    return pathname === APP_PATH.TERMS_OF_USE ? t('termsOfUse.title') : t('privacyPolicy.title')
  }, [pathname, t])

  const contentType = pathname === APP_PATH.PRIVACY_POLICY ? 'privacy-policy' : 'terms-of-use'

  return (
    <div className="min-h-screen bg-[#111] bg-cover bg-center">
      <HeaderWithBack
        title={title}
        onBack={handleBack}
        titleClassName="ml-0"
        className="bg-[#111] sticky top-0 z-10 p-2.5 justify-center"
        isHidenIconLeft={true}
      />
      <HtmlContentLoader contentType={contentType} />
    </div>
  )
}

export default TermsOfUseAndPrivacyPolicyPage
