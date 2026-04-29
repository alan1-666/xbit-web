import { EyeIcon } from '@/components/wallet-backup/icon'
import { useState, Dispatch, SetStateAction, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { logEvent2, ACTIONS } from '@services/google-analytics.service'

const MnemonicBackupChecklistPage = ({
  memonic,
  openDrawer,
  setOpenDrawer,
}: {
  memonic: string[]
  openDrawer: boolean
  setOpenDrawer: Dispatch<SetStateAction<boolean>>
}) => {
  const [mnemonicRevealed, setMnemonicRevealed] = useState(false)
  const { t } = useTranslation()

  const handleRevealMnemonic = () => {
    setMnemonicRevealed(true)
  }

  const handleProceedToShown = () => {
    try {
      if (mnemonicRevealed) {
        navigator.clipboard.writeText(memonic.join(' ') ?? '').then(() => {
          toast.success(t('toast.copiedSuccess'))
        })
        logEvent2(ACTIONS.setting_backup_mnemonic)
      } else {
        handleRevealMnemonic()
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (!openDrawer) {
      setMnemonicRevealed(false)
    }
  }, [openDrawer])

  const renderHiddenScreen = () => (
    <div className="flex-1 flex flex-col">
      <p className="text-sm text-white/70 mt-3 font-[380] leading-[calc(1rem*(18/16))] text-center">
        {t('walletBackup.mnemonicChecklist.accessLost')}
      </p>
      <div className="mt-4 text-[calc(1rem*(13/16))] text-white/70 font-[330]">
        {t('walletBackup.mnemonicChecklist.mnemonic')}
      </div>
      {!mnemonicRevealed ? (
        <div className="w-full flex flex-col items-center justify-center mt-3 rounded-[8px] pt-[13.5px] pb-[12.5px] border border-[#ECECED1F]">
          <div className="flex items-center justify-center cursor-pointer" onClick={handleProceedToShown}>
            <EyeIcon />
          </div>
          <div className="flex flex-col gap-1.5 text-white/50 text-xs text-center leading-none">
            <div>{t('walletBackup.mnemonicChecklist.viewMnemonic')}</div>
            <div>{t('walletBackup.mnemonicChecklist.privacyReminder')}</div>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex gap-6 py-4 px-3 border border-[#ECECED1F] rounded-[8px]">
          {/* <div className="w-full items-center flex-wrap gap-x-3 gap-y-4 grid grid-cols-4 grid-rows-3">
            {memonic.map((word) => (
              <div className="text-white/80 text-sm font-[380]">{word}</div>
            ))}
          </div> */}
          <div className="grid grid-cols-3 gap-y-2.5 gap-x-2.5 w-full">
            {memonic.map((word, index) => (
              <div
                key={index}
                className="bg-[#ECECED]/4 rounded-[8px] px-2 py-2 text-center flex gap-2 items-center border border-[#ECECED]/8"
              >
                {/* <span className="text-sm text-white/50">{index + 1}</span> */}
                <span className="text-sm text-white font-[380]">{word}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button
        // variant={'purpleDefault'}
        className="rounded-full w-full max-h-11 text-base mt-3 font-[450] text-[#FFFFFF] bg-[#843bea] shadow-inset-purple"
        onClick={handleProceedToShown}
      >
        {!mnemonicRevealed
          ? t('walletBackup.mnemonicChecklist.viewMnemonic')
          : t('walletBackup.mnemonicChecklist.copy')}
      </Button>
    </div>
  )

  return (
    <Dialog open={openDrawer} onOpenChange={setOpenDrawer}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent className="bg-[#232329] mx-auto p-0 gap-0 w-86 rounded-[0.75rem]" showDialogPrimitiveClose={false}>
        <DialogTitle className=""></DialogTitle>
        <div className="px-4">
          <div className="flex justify-center items-center py-4 relative text-base leading-[calc(1rem*(18/16))]">
            {t('walletBackup.mnemonicChecklist.backupTitle')}
            <div className="absolute right-0 top-4 cursor-pointer" onClick={() => setOpenDrawer(false)}>
              <X className="h-5 w-5 text-[#9B9B9B]" />
            </div>
          </div>
          <div className="flex flex-col ">{renderHiddenScreen()}</div>
        </div>
        <div className="mt-4 p-4 flex items-center gap-1.5 border-t border-[#ECECED14]">
          <img src="/images/icons/danger.svg" alt="icon alert" className="w-4 h-4" />
          <div className="text-white text-[calc(1rem*(11/16))] leading-[calc(1rem*(16/16))] font-[330]">
            {t('walletBackup.mnemonicChecklist.leakWarning')}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MnemonicBackupChecklistPage
