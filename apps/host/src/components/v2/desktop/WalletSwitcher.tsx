import { NewChangeWalletButton } from '@components/discover/header/NewChangeWalletButton.tsx'
import { NewIconTriangleDown } from '@components/icon'
import NewLoginDrawer from '@components/auth/NewLoginDrawer.tsx'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice.ts'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export const WalletSwitcher = () => {
  const activeWallet = useSelector(_activeWallet)
  const [open, setOpen] = useState<boolean>(false)
  const { t } = useTranslation()
  return (
    <div className="border-[0.5px] border-[#ECECED14] bg-[#ECECED14] h-[36px] rounded-full pl-[10px] pr-1.5 text-[calc(14rem/16)] leading-[calc(14rem/16)]">
      {activeWallet?.isConnected ? (
        <NewChangeWalletButton />
      ) : (
        <>
          <button className="flex items-center h-full gap-2" onClick={() => setOpen(true)}>
            <span className="text-[13px] leading-none text-white font-medium">{t('wallet.connectGuide')}</span>
            <NewIconTriangleDown className="mt-[1px]" />
          </button>
          <NewLoginDrawer open={open} setOpen={setOpen} />
        </>
      )}
    </div>
  )
}
