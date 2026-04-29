import AppDrawer from '@components/common/AppDrawer.tsx'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { CheckboxXbit } from '@components/ui/checkbox-xbit.tsx'
import ButtonTelegram from '@components/common/LoginSection/ButtonTelegram.tsx'
import { WalletButton } from '@rainbow-me/rainbowkit'
import { useTranslation } from 'react-i18next'
import { useAccount, useConnect } from 'wagmi'
import { toast } from 'sonner'
import { metaMask } from '@wagmi/connectors'
import { Link } from 'react-router-dom'
import { APP_PATH } from '@/lib/constant'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'

interface LoginEvmDrawerProps {
  setOpen: Dispatch<SetStateAction<boolean>>
  open: boolean
}

export const LoginEvmDrawer = (props: LoginEvmDrawerProps) => {
  const { open, setOpen } = props
  const { t } = useTranslation()
  const activeWallet = useSelector(_activeWallet)
  const { isConnecting } = useAccount()
  const [checked, setChecked] = useState<boolean>(true)
  const { connectAsync: connectMetaMask, connectors } = useConnect()

  const visibleWallets = [
    { id: 'metamask', name: 'MetaMask', icon: '/images/icons/metamask-icon.png' },
    { id: 'okx', name: 'OKX Wallet', icon: '/images/icons/okx-icon.png' },
    { id: 'trust', name: 'Trust Wallet', icon: '/images/icons/trust-icon.png' },
    // { id: 'binance', name: 'Binance Wallet' },
    // { id: 'rainbow', name: 'Rainbow' },
    // { id: 'coinbase', name: 'Coinbase' },
    { id: 'walletConnect', name: 'WalletConnect', icon: '/images/icons/wallet-connect-icon.png' },
    { id: 'bitget', name: 'Bitget wallet', icon: '/images/icons/bitget-icon.png' },
  ]

  // useEffect(() => {
  //   if (activeWallet?.isConnected && open) setOpen(false)
  // }, [activeWallet?.isConnected, open])

  useEffect(() => {
    if (isConnecting) {
      const fixPointerEvents = () => {
        const modalElements = document.querySelectorAll('[data-rk]')

        modalElements.forEach((el) => {
          ;(el as HTMLElement).style.pointerEvents = 'auto'
        })
      }

      fixPointerEvents()
    }
  }, [isConnecting])

  return (
    <AppDrawer
      open={open}
      setOpen={setOpen}
      drawerContent={
        <>
          <h1 className="text-[calc(14rem/16)]">{t('assets.login.thirdParty')}</h1>

          <ButtonTelegram
            customTrigger={
              <div className="flex items-center gap-4 rounded-xl justify-between border-b-[#ececed14] border-b-[0.5px] py-4 px-3 hover:bg-accent hover:text-accent-foreground cursor-pointer">
                <img src="/images/logo-tele.svg" className="w-11 h-11" alt="" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-base leading-none">Telegram</p>
                  </div>
                  <p className="text-xs text-[#ffffff99] mt-1.5">{t('wallet.clickConnect')} Telegram</p>
                </div>
                <div className="flex items-center gap-3 ml-auto">
                  <img src="/images/icons/ic-btn-next.svg" className="w-6 h-6" alt="" />
                </div>
              </div>
            }
          />

          <h1 className="text-[calc(14rem/16)] mt-6">{t('assets.login.web3Wallets')}</h1>
          <div className="flex flex-col gap-2">
            {visibleWallets.map((item) => (
              <WalletButton.Custom wallet={item.id} key={item.id}>
                {({ ready, connect }) => {
                  return (
                    <button
                      className="flex items-center rounded-xl justify-between border-b-[#ececed14] border-b-[0.5px] py-4 px-3 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      key={item?.name}
                      disabled={!ready}
                      onClick={() => {
                        if (!checked) {
                          toast.error(t('toast.termsAgreement'))
                          return
                        }
                        const mm = connectors.find((c) => item.name === 'MetaMask')
                        if (mm) {
                          connectMetaMask({ connector: metaMask() }).then((res) => {
                            setOpen(false)
                          })
                        } else {
                          connect().then(() => {
                            setOpen(false)
                          })
                        }
                      }}
                    >
                      <div className="w-full flex items-center gap-4">
                        <img src={item?.icon} className="w-11 h-11" alt="" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-base leading-none">{item?.name}</p>
                          </div>
                          <p className="text-xs text-[#ffffff99] mt-1.5">
                            {t('wallet.clickConnect')} {item?.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 ml-auto">
                          <img src="/images/icons/ic-btn-next.svg" className="w-6 h-6" alt="" />
                        </div>
                      </div>
                    </button>
                  )
                }}
              </WalletButton.Custom>
            ))}
          </div>
          <div className="flex items-center gap-1.5 mt-5 justify-center">
            <CheckboxXbit className="cursor-pointer" checked={checked} onCheckedChange={() => setChecked(!checked)} />
            <p className="text-[#ffffff99] text-[calc(1rem*(11/16))]">
              {t('login.termsAgreement')}{' '}
              <Link to={APP_PATH.TERMS_OF_USE}>
                <span className="text-[#50A1FF]">{t('login.terms')}</span>
              </Link>{' '}
              {t('login.with')}{' '}
              <Link to={APP_PATH.PRIVACY_POLICY}>
                <span className="text-[#50A1FF]">{t('login.privacyPolicy')}</span>
              </Link>
            </p>
          </div>
        </>
      }
      activeElement={document.querySelector('[data-rk] .iekbcc0') || undefined}
    />
  )
}
