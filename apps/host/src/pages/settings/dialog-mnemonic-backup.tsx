import { IconExportWallet } from '@/components/icon'
import MnemonicBackupChecklistPage from '@components/auth/WalletBackup/MnemonicBackupChecklist.tsx'
import SecurityCheckModal, { VefiryWalletResponse } from '@components/auth/WalletBackup/SecurityCheckModal.tsx'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const DialogMnemonicBackup = () => {
  const { t } = useTranslation()
  const [showSecurityModal, setShowSecurityModal] = useState(false)
  const [memonic, setMemonic] = useState<string[]>([])
  const [openDrawerBackup, setOpenDrawerBackup] = useState(false)

  const handleVerifiedWallet = (response: VefiryWalletResponse) => {
    setMemonic(response?.memonic!.split(' '))
    setShowSecurityModal(false)
    setOpenDrawerBackup(true)
  }

  return (
    <>
      <button
        className="flex items-center px-1 hover:bg-neutral-800 transition-colors w-full group duration-0 gap-3 h-[36px] rounded-[4px]"
        onClick={() => setShowSecurityModal(true)}
      >
        <IconExportWallet />
        <span className="text-[14px] font-medium">{t('walletBackup.mnemonicChecklist.backupTitle')}</span>
      </button>

      <SecurityCheckModal
        showModal={showSecurityModal}
        setShowModal={setShowSecurityModal}
        onVerifyWallet={handleVerifiedWallet}
        type="mnemonic"
      />
      <MnemonicBackupChecklistPage
        memonic={memonic}
        openDrawer={openDrawerBackup}
        setOpenDrawer={setOpenDrawerBackup}
      />
    </>
  )
}

export default DialogMnemonicBackup
