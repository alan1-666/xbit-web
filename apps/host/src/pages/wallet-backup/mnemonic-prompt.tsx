import ButtonGradient from '@/components/common/buttons/ButtonGradient'
import HeaderBackTransparent from '@/components/header/HeaderBackTransparent'
import {
  AlertProtectionIcon,
  MessageTypingIcon,
  SecureLockIcon,
  SecureVaultIcon,
  ThreatDetectionIcon,
} from '@/components/wallet-backup/icon'
import SecurityCheckModal from '@/components/wallet-backup/SecurityCheckModal'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

const MnemonicPromptPage: React.FC = () => {
  const [showSecurityModal, setShowSecurityModal] = useState(false)
  const { t } = useTranslation()

  const handleNextClick = () => {
    setShowSecurityModal(true)
  }

  const handleContinue = () => {
    setShowSecurityModal(false)
  }

  const handleVerifyWallet = () => {
    setShowSecurityModal(false)
  }

  return (
    <div className="h-screen flex flex-col">
      <HeaderBackTransparent title={''} className="!px-3" />
      <div className="flex-1 flex flex-col px-3">
        <h2 className="text-[1.375rem] font-[380]">{t('walletBackup.mnemonicPrompt.title')}</h2>
        <p className="text-sm text-white/50 mt-3">
          {t('walletBackup.mnemonicPrompt.description')}
        </p>
        <div className="mt-3 py-4 px-[14px] text-[#F23F58] flex gap-2.5 rounded-[13.33px] bg-[#DC1162]/10">
          <AlertProtectionIcon />
          <div>
            <h5 className="text-base leading-[16px]">{t('walletBackup.mnemonicPrompt.specialReminder')}</h5>
            <p className="mt-2 text-xs">{t('walletBackup.mnemonicPrompt.specialReminderText')}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-5 flex-1">
          <div className=" flex items-center gap-4 text-base text-white font-[330]">
            <SecureLockIcon />
            {t('walletBackup.mnemonicPrompt.securityTips.tip1')}
          </div>
          <div className=" flex items-center gap-4 text-base text-white font-[330]">
            <MessageTypingIcon />
            {t('walletBackup.mnemonicPrompt.securityTips.tip2')}
          </div>
          <div className=" flex items-center gap-4 text-base text-white font-[330]">
            <ThreatDetectionIcon />
            {t('walletBackup.mnemonicPrompt.securityTips.tip3')}
          </div>
          <div className=" flex items-center gap-4 text-base text-white font-[330]">
            <SecureVaultIcon />
            {t('walletBackup.mnemonicPrompt.securityTips.tip4')}
          </div>
        </div>
        <ButtonGradient className="rounded-[200px] w-full max-h-11 text-base mt-6 mb-3" onClick={handleNextClick}>
          {t('walletBackup.mnemonicPrompt.nextStep')}
        </ButtonGradient>
      </div>

      <SecurityCheckModal
        showModal={showSecurityModal}
        setShowModal={setShowSecurityModal}
        onContinue={handleContinue}
        onVerifyWallet={handleVerifyWallet}
      />
    </div>
  )
}

export default MnemonicPromptPage
