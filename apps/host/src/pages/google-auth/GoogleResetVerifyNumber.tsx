import LogoXBit from '@/components/header/LogoXBit'
import XQRCode from '@/components/ui/qrcode'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const GoogleResetVerifyNumber: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const items = ['xxxxxxxxxxxxxxxx', 'xxxxxxxxxxxxxxxx', 'xxxxxxxxxxxxxxxx']

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#111bg-cover bg-center text-white">
      {/* <HeaderWithBack title={t('google.auth.title')} onBack={handleBack} className="bg-transparent p-2.5" /> */}
      <div className="flex-1 pb-2 pt-4">
        {/* Token list */}
        <div className="space-y-4">
          <div className="flex flex-col min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white px-6 py-10">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <LogoXBit hasText />
            </div>

            {/* Success Message */}
            <div className="text-center mb-8">
              <h1 className="text-xl font-medium">{t('google.auth.slogan')}</h1>
            </div>

            {/* User Info and Instructions */}
            <div className="space-y-6 mb-8">
              <p className="text-sm">
                {t('google.auth.dear')} <span className="text-blue-400">k348876086@gmail.com</span>
              </p>

              <p className="text-sm leading-relaxed mb-0">{t('google.auth.note')}</p>

              <div className="mb-0">
                <ul>
                  {items.map((item, index) => (
                    <li key={index} className="text-sm">{`${index + 1}、 ${item}`}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-800 my-8"></div>

            {/* Team and Support */}
            <div className="text-center space-y-4 mb-8">
              <p className="font-medium">XBIT{t('google.auth.team')}</p>
              <p className="text-sm">
                {t('google.auth.thankyou')}
                <br />
                <a href="mailto:support@xbit.com" className="text-blue-400">
                  support@xbit.com
                </a>
              </p>
            </div>

            {/* Social Media Icons */}
            <div className="flex justify-center gap-6 mb-8">
              <a
                href="#"
                className="p-2 rounded-full w-10 h-10 justify-center flex items-center border border-gray-700"
              >
                <LogoXBit className="w-full" />
              </a>
              <a
                href="#"
                className="bg-[#100D1A] rounded-full w-10 h-10 justify-center flex items-center border border-gray-700"
              >
                <img src="/images/tokenDetail/icon-twitter.svg" alt="Telegram" className="w-[20px] block" />
              </a>
              <a
                href="#"
                className="bg-[#00A4FF] p-2 rounded-full w-10 h-10 justify-center flex items-center border border-gray-700"
              >
                <img src="/images/tokenDetail/icon-tele.svg" alt="Telegram" className="w-10 h-10" />
              </a>
            </div>
            <div className="flex justify-evenly mb-8">
              <a href="#">
                <img src="/images/icons/app-store.png" alt="Apple" className="block" />
              </a>
              <a href="#">
                <img src="/images/icons/google_play.png" alt="CHPlay" className="block" />
              </a>
            </div>
            <div className="text-left">
              <p className="mb-4">{t('google.auth.riskwarning')}</p>
              <p className="mb-4">{t('google.auth.copyright')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GoogleResetVerifyNumber
