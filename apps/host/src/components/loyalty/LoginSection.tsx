import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import NewLoginDrawer from '@components/auth/NewLoginDrawer.tsx'
import { Button } from '@components/ui/button.tsx'

export const LoginSection = () => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  return (
    <div className="w-full px-3 flex flex-col items-center mt-[60px]">
      <img src="/images/loyalty/login.svg" alt="" />
      <Button onClick={() => setOpen(true)} className="hover-scale w-auto !px-6 bg-impartal text-white rounded-full">
        {t('assets.futures.connectWallet')}
      </Button>
      <NewLoginDrawer open={open} setOpen={setOpen} />
    </div>
  )
}
