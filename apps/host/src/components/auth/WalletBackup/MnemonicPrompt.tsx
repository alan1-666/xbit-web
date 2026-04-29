import ButtonGradient from '@/components/common/buttons/ButtonGradient'
import { AlertProtectionIcon, MessageTypingIcon, SecureLockIcon, SecureVaultIcon, ThreatDetectionIcon } from './icon'
import SecurityCheckModal, { VefiryWalletResponse } from './SecurityCheckModal'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@components/ui/drawer.tsx'
import MnemonicBackupChecklistPage from './MnemonicBackupChecklist'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { ServiceConfig } from '@/lib/gql/service-config'

const MnemonicPrompt = () => {
  const [showSecurityModal, setShowSecurityModal] = useState(false)
  const [openDrawer, setOpenDrawer] = useState(true)
  const [openDrawerBackup, setOpenDrawerBackup] = useState(false)
  const [memonic, setMemonic] = useState<string[]>([])
  const { t } = useTranslation()

  const handleNextClick = () => {
    setShowSecurityModal(true)
  }

  const handleVerifiedWallet = (response: VefiryWalletResponse) => {
    setMemonic(response?.memonic!.split(' '))
    setShowSecurityModal(false)
    setOpenDrawer(false)
    setOpenDrawerBackup(true)
  }

  return (
    <>
      <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
        <DrawerTrigger asChild></DrawerTrigger>
        <DrawerContent className="w-full bg-[#0A0A0A] max-w-[768px] mx-auto pb-6 h-full">
          <DrawerTitle></DrawerTitle>
          <DrawerHeader className="flex justify-between">
            <img
              src="/images/icons/arrow-left.svg"
              className="w-6 h-6 cursor-pointer"
              alt="arrow-left"
              onClick={() => setOpenDrawer(false)}
            />
            <div className="w-6 h-6"></div>
          </DrawerHeader>
          <div className="h-screen flex flex-col overflow-y-auto">
            <div className="flex-1 flex flex-col px-3">
              <h2 className="text-[1.375rem] leading-none font-[380]">{t('walletBackup.mnemonicPrompt.title')}</h2>
              <p className="text-sm text-white/50 mt-3">{t('walletBackup.mnemonicPrompt.description')}</p>
              <div className="mt-3 py-4 px-[14px] text-[#F23F58] flex gap-2.5 items-center rounded-[13.33px] bg-[#DC1162]/10">
                <AlertProtectionIcon />
                <div>
                  <h5 className="text-base leading-none font-[380]">
                    {t('walletBackup.mnemonicPrompt.specialReminder')}
                  </h5>
                  <p className="mt-2 text-xs leading-none">{t('walletBackup.mnemonicPrompt.specialReminderText')}</p>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-5 flex-1">
                <div className=" flex items-center gap-4 text-base text-white font-[330]">
                  <div>
                    <SecureLockIcon />
                  </div>
                  {t('walletBackup.mnemonicPrompt.securityTips.tip1')}
                </div>
                <div className=" flex items-center gap-4 text-base text-white font-[330]">
                  <div>
                    <MessageTypingIcon />
                  </div>
                  {t('walletBackup.mnemonicPrompt.securityTips.tip2')}
                </div>
                <div className=" flex items-center gap-4 text-base text-white font-[330]">
                  <div>
                    <ThreatDetectionIcon />
                  </div>
                  {t('walletBackup.mnemonicPrompt.securityTips.tip3')}
                </div>
                <div className=" flex items-center gap-4 text-base text-white font-[330]">
                  <div>
                    <SecureVaultIcon />
                  </div>
                  {t('walletBackup.mnemonicPrompt.securityTips.tip4')}
                </div>
              </div>
              <ButtonGradient
                className="rounded-[200px] w-full max-h-11 text-base my-3"
                onClick={handleNextClick}
                // disabled={memonic?.length === 0}
                // isLoading={memonic?.length === 0}
              >
                {t('walletBackup.mnemonicPrompt.nextStep')}
              </ButtonGradient>
            </div>

            <SecurityCheckModal
              showModal={showSecurityModal}
              setShowModal={setShowSecurityModal}
              onVerifyWallet={handleVerifiedWallet}
              type="mnemonic"
            />
          </div>
        </DrawerContent>
      </Drawer>
      <MnemonicBackupChecklistPage
        memonic={memonic}
        openDrawer={openDrawerBackup}
        setOpenDrawer={setOpenDrawerBackup}
      />
    </>
  )
}

export default MnemonicPrompt
