import HeaderWithBack from '@components/header/HeaderWithBack.tsx'
import { Button } from '@components/ui/button.tsx'
import { useNavigate } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'

export const ResetGoogleAuthenticatorPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleReset = () => {}

  return (
    <div className="w-full h-dvh">
      <HeaderWithBack title={t('appSettings.googleAuth.title')} className="bg-transparent" />
      <div className="flex flex-col py-10 items-center px-3">
        <img src="/images/settings/google-authenticator.svg" alt="Google Authenticator" className="w-44 md:w-64" />
        <div className="text-[calc(15rem/16)] text-[#FFFFFF] mt-6">{t('appSettings.googleAuth.confirmResetTitle')}</div>
        <div className="text-[calc(13rem/16)] text-[#FFFFFFCC] mt-1 py-3 px-3.5 bg-[#ECECED14] rounded-[8px] w-full border border-[#ECECED14]">
          <Trans
            i18nKey="appSettings.googleAuth.warningMessage"
            components={{ span: <span className="text-[#FF353C]" /> }}
          />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-6 px-3 grid grid-cols-2 gap-3 pt-4 border-t">
        <Button variant="borderGradient" className="rounded-full" onClick={() => navigate(-1)}>
          {t('appSettings.googleAuth.cancel')}
        </Button>
        <Button variant="gradient" className="rounded-full text-[#141414]" onClick={handleReset}>
          {t('appSettings.googleAuth.confirmReset')}
        </Button>
      </div>
    </div>
  )
}
