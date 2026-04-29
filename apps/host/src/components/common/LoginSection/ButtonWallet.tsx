import { useAppDispatch, useAppSelector } from '@/redux/store'
import { walletActions } from '@/redux/modules/wallet.slice'
import { TYPE_ACCOUNT } from '@/lib/blockchain'
import ButtonLogin from '@components/common/LoginSection/ButtonLogin.tsx'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { LoginDrawer } from '../LoginDrawer'

const ButtonWallet = () => {
  const chain = useAppSelector((state) => state.newWallet.activeChain)
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const [showLoginDrawer, setShowLoginDrawer] = useState(false)

  const onClickConnectWallet = () => {
    dispatch(walletActions.setActiveAccount(TYPE_ACCOUNT.CHAIN))
    setShowLoginDrawer(true)
  }
  return (
    <>
      <ButtonLogin onClick={onClickConnectWallet} className="hover-scale">
        <img src="/images/icons/icon-wallet.svg" className="w-[1rem] h-[calc(1rem*(13.43/16))]" alt="" />
        {t('wallet.connectGuide')}
      </ButtonLogin>
      <LoginDrawer setOpen={setShowLoginDrawer} open={showLoginDrawer} />
      {/* {openLoginEvmEvm && <LoginEvmDrawer open={openLoginEvmEvm} setOpen={setOpenLoginEvm} />} */}
    </>
  )
}

export default ButtonWallet
