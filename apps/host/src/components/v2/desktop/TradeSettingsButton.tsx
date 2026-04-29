import { useState } from 'react'
import { IconPreferences } from '@components/icon'
import { useTranslation } from 'react-i18next'
import TradeSettingsBottomSheet from '@components/common/TradeSettingsBottomSheet.tsx'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import { toast } from 'sonner'
import NewTradeSettings from '@/components/common/tradeSetting'

export const TradeSettingsButton = () => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const activeWallet = useActiveWallet()

  const handleClick = () => {
    if (!activeWallet.isConnected) {
      toast.error(t('appSettings.loginRequired'))
      return
    }
    setOpen(true)
  }

  return (
    <>
      <div className="flex items-center gap-1 text-[calc(14rem/16)] font-[330] cursor-pointer text-[#908E98]" onClick={handleClick}>
        <IconPreferences className="size-4.5" />
        {t('appSettings.spotSettings')}
      </div>
      <div className="hidden">
        {/* <TradeSettingsBottomSheet open={open} setOpen={setOpen} /> */}
        <NewTradeSettings open={open} setOpen={setOpen} />
      </div>
    </>
  )
}
