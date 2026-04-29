import WalletSettingsForm from '@/components/copy-trading/wallet-settings/WalletSettingsForm'
import HeaderWithBack from '@components/header/HeaderWithBack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

/**
 * CopyTradeWalletSettings component displays the wallet settings for copy trading
 */
const CopyTradeWalletSettings: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleBack = () => {
    navigate(-1)
  }

  const handleCancel = () => {
    navigate(-1)
  }

  return (
    <div className="@container mx-auto flex flex-col items-stretch overflow-x-hidden overscroll-none overflow-y-auto no-scrollbar overflow-hidden h-full">
      <div className="flex flex-col bg-[#111] text-white h-screen">
        <HeaderWithBack
          title={t('walletCopy.settings.title')}
          onBack={handleBack}
          // right={<button className="text-sm font-medium capitalize">{t('walletCopy.settings.tutorial')}</button>}
          className="p-2.5 sticky top-0 bg-[#111111] z-10"
        />
        <div className="flex-1 flex-col flex">
          <WalletSettingsForm
            onCancel={handleCancel}
            initialValues={
              {
                // You can provide initial values here if needed
              }
            }
            isPC={false}
          />
        </div>
      </div>
    </div>
  )
}

export default CopyTradeWalletSettings
