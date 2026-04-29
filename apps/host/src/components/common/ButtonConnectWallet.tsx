import Container from '@components/common/Container.tsx'
import ButtonLogin from '@components/common/LoginSection/ButtonLogin.tsx'
import NewLoginDrawer from '@components/auth/NewLoginDrawer.tsx'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice.ts'
import { useTranslation } from 'react-i18next'

type ButtonConnectWalletProps = {
  CTAComponent?: React.ReactNode
}

export const ButtonConnectWallet = ({ CTAComponent }: ButtonConnectWalletProps) => {
  const [showLoginDrawer, setShowLoginDrawer] = useState(false)
  const activeWallet = useSelector(_activeWallet)
  const { t } = useTranslation()

  const handleClickBtnLogin = () => {
    if (!activeWallet.isConnected) {
      setShowLoginDrawer(true)
    }
  }
  return (
    <Container className="mt-[10px] h-40">
      <div className="flex items-center gap-2 flex-col justify-center text-[14px] text-[#999999] mt-10">
        {
          CTAComponent ? CTAComponent : (
            <p>
              {t('login.notLogined', {
                name: 'XBIT',
              })}
            </p>
          )
        }
        <ButtonLogin onClick={handleClickBtnLogin} className="hover-scale w-auto !px-4">
          <img src="/images/icons/icon-wallet.svg" className="w-[1rem] h-[calc(1rem*(13.43/16))]" alt="" />
          {t('wallet.connectGuide')}
        </ButtonLogin>
      </div>
      <NewLoginDrawer setOpen={setShowLoginDrawer} open={showLoginDrawer} />
    </Container>
  )
}
