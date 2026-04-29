import DialogLoginNewLoginDrawer from '@components/PC/DialogLoginNewLoginDrawer.tsx'
import { useState } from 'react'
import ButtonLogin from '@components/common/LoginSection/ButtonLogin.tsx'
import { useTranslation } from 'react-i18next'

export const ConnectWalletCTA = () => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  return (
    <div>
      <ButtonLogin onClick={() => setOpen(true)} className="hover-scale w-auto !px-4">
        <img src="/images/icons/icon-wallet.svg" className="w-[1rem] h-[calc(1rem*(13.43/16))]" alt="" />
        {t('wallet.connectGuide')}
      </ButtonLogin>
      <DialogLoginNewLoginDrawer open={open} setOpen={setOpen} />
    </div>
  )
}
