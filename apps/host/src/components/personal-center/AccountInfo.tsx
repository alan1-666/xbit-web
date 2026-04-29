import { NewCopyButton } from '@/components/common/new-copy-btn'
import LogoXBit from '@/components/header/LogoXBit'
import { NewEmailIcon } from '@/components/icon'
import { NEW_TYPE_ACCOUNT } from '@/lib/blockchain'
import { futureClient } from '@/lib/gql/apollo-client'
import { formatAddressWallet, formatEmail } from '@/lib/string'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useAppSelector } from '@/redux/store'
import { getSmartMoneyInfoV2 } from '@/services/copytrade.service'
import { getChainType } from '@/utils/list-coin-helper'
import { useQuery } from '@apollo/client/react/hooks/useQuery'
import { useWallet } from '@solana/wallet-adapter-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { generateAvatar } from '@/utils/xbitAvatar/XbitAvatarGenerator.ts'
import NewLoginDrawer from '../auth/NewLoginDrawer'
import { cn } from '@/lib/utils.ts'

const AccountInfo = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { wallet } = useWallet()
  const activeWallet = useSelector(_activeWallet)
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const { data, refetch } = useQuery(getSmartMoneyInfoV2, {
    variables: { req: { address: activeWallet?.walletAddress, chain: getChainType(activeChain) } },
    client: futureClient,
    skip: !activeWallet?.walletAddress,
  })
  const { email, walletAddressLogin, activeAccount } = useAppSelector((state) => state.newWallet) as any
  const [showLoginDrawer, setShowLoginDrawer] = useState(false)

  useEffect(() => {
    if (activeWallet?.walletAddress) {
      refetch()
    }
  }, [activeWallet?.walletAddress])

  const navigateToLogin = () => {
    // navigate(APP_PATH.LOGIN)
    setShowLoginDrawer(true)
  }

  const [src, setSrc] = useState('')
  useEffect(() => {
    generateAvatar(activeWallet?.walletAddress).then(setSrc)
  }, [activeWallet?.walletAddress])

  const renderAccountTypeIcon = (accountType: NEW_TYPE_ACCOUNT) => {
    switch (accountType) {
      case NEW_TYPE_ACCOUNT.EMAIL:
        return <NewEmailIcon />
      case NEW_TYPE_ACCOUNT.GOOGLE:
        return <img src="/images/google-logo.svg" className="size-3" alt="Google" />
      case NEW_TYPE_ACCOUNT.WC:
        return <img src="/images/login/walletconnect.png" alt="WalletConnect" className="size-3" />
      case NEW_TYPE_ACCOUNT.APPLE:
        return (
          <span className="size-3 bg-[#212127] rounded-full flex items-center justify-center">
            <img src="/images/apple-logo.svg" alt="Apple" className="size-3" />
          </span>
        )
      case NEW_TYPE_ACCOUNT.WALLET:
        return <img src={wallet?.adapter.icon ?? ''} alt="Wallet" className="size-3 rounded-full" />
      default:
        return <img data-avatar-type="wallet" src={src} alt="Wallet" className="size-3 rounded-full" />
    }
  }

  return (
    <div
      className={cn(
        'sticky bg-[#0a0a0a] z-10 top-11 flex px-5 gap-2.5 items-center py-2.5',
        !activeWallet.isConnected ? 'hover:bg-white/5 cursor-pointer' : '',
      )}
    >
      {!activeWallet.isConnected ? (
        <div className="flex items-center gap-2 w-full" onClick={navigateToLogin}>
          <LogoXBit className="size-10" />
          <div className="flex-1 flex flex-col gap-2">
            <p className="text-white text-[14px] font-medium leading-3.5">{t('personalCenter.welcomeToXBIT')}</p>
            <div className="flex items-center cursor-pointer">
              <p className="font-light text-[11px] leading-2.75 text-[#908E98]">{t('personalCenter.pleaseLogin')}</p>
              {/* <div className="rotate-180">
                <NewArrowLeftIcon className="size-3.5 bg-[#908E98]" />
              </div> */}
            </div>
          </div>
          <NewLoginDrawer setOpen={setShowLoginDrawer} open={showLoginDrawer} />
        </div>
      ) : (
        <>
          <img
            src={data?.getSmartMoneyInfo?.avatar ? data?.getSmartMoneyInfo?.avatar : src}
            data-avatar-type="wallet"
            alt="logo"
            className="size-10 block rounded-full"
          />
          <div className="flex-1 flex flex-col gap-2">
            <p className="text-white text-[14px] font-medium leading-3.5">
              {formatAddressWallet(activeWallet?.walletAddress, 5, 5)}
            </p>
            <div className="flex items-center gap-1.25">
              {renderAccountTypeIcon(activeAccount)}
              <p className="font-light text-[11px] leading-2.75 text-[#908E98]">
                {formatEmail(email, 4) || formatAddressWallet(walletAddressLogin, 5, 3)}
              </p>
              <NewCopyButton text={email || walletAddressLogin} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AccountInfo
