import AppDrawer from '@components/common/AppDrawer.tsx'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { BossWalletAdapter, BossWalletName } from '@/lib/wallets/BossWalletAdapter.ts'
import { OKXWalletAdapter, OKXWalletName } from '@/lib/wallets/OKXWalletAdapter.ts'
import { BitgetWalletAdapter, BitgetWalletName } from '@/lib/wallets/BitgetWalletAdapter.ts'
import { PhantomWalletName } from '@/lib/wallets/PhantomWalletAdapter.ts'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'

import { useWallet, Wallet } from '@solana/wallet-adapter-react'
import { _isMobileDevice } from '@/lib/utils.ts'
import { useTranslation } from 'react-i18next'
import { WalletAdapterNetwork, WalletName } from '@solana/wallet-adapter-base'
import { toast } from 'sonner'
import {
  WalletConnectWalletAdapter as WalletConnectWalletAdapterV2,
  WalletConnectWalletName as WalletConnectWalletNameV2,
} from '@/lib/wallets/WalletConnectWalletAdapter.ts'
import { MetaMaskWalletAdapter, MetaMaskWalletName } from '@/lib/wallets/MetaMaskWalletAdaper.ts'
import { walletActions } from '@/redux/modules/wallet.slice.ts'
import { TYPE_ACCOUNT, TYPE_CHAIN } from '@/lib/blockchain.ts'
import { useAppDispatch } from '@/redux/store'
import { useMultiChainWallet } from '@hooks/useMultiChainWallet.ts'
import { CheckboxXbit } from '@components/ui/checkbox-xbit.tsx'
import ButtonTelegram from '@components/common/LoginSection/ButtonTelegram.tsx'
import SwitchChains from '../header/switch-chains'
import { useAccount, useConnect } from 'wagmi'
import { WalletButton } from '@rainbow-me/rainbowkit'
import clsx from 'clsx'
import { metaMask } from '@wagmi/connectors'
import { TokenPocketWalletAdapter, TokenPocketWalletName } from '@/lib/wallets/TokenPocketWalletAdapter'
import { TrustWalletAdapter, TrustWalletName } from '@/lib/wallets/TrustWalletAdapter'
import { APP_PATH } from '@/lib/constant'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
interface LoginDrawerProps {
  setOpen: Dispatch<SetStateAction<boolean>>
  open: boolean
  tab?: 'crypto' | 'meme'
}

export const LoginDrawer = (props: LoginDrawerProps) => {
  const { open, setOpen, tab = 'meme' } = props
  const acctiveWallet = useSelector(_activeWallet)
  const activeChain = acctiveWallet.chainType

  const { wallets } = useMultiChainWallet({})
  const telegramWalletConnected = wallets?.sol?.telegram?.isConnected
  const [checked, setChecked] = useState<boolean>(true)
  const { t } = useTranslation()
  const navigate = useNavigate()
  const handleClickNavigate = (path: string) => {
    navigate(path)
  }

  return (
    <AppDrawer
      open={open}
      setOpen={setOpen}
      drawerContent={
        <>
          <h1 className="text-[calc(14rem/16)]">{t('assets.login.thirdParty')}</h1>

          <ButtonTelegram
            customTrigger={
              <div
                className={clsx(
                  'flex items-center gap-4 rounded-xl justify-between border-b-[#ececed14] border-b-[0.5px] py-4 px-3 hover:bg-accent hover:text-accent-foreground cursor-pointer',
                  telegramWalletConnected && '!cursor-not-allowed',
                )}
              >
                <img src="/images/logo-tele.svg" className="w-11 h-11" alt="" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-base leading-none">Telegram</p>
                  </div>
                  {!telegramWalletConnected && (
                    <p className="text-xs text-[#ffffff99] mt-1.5">{t('wallet.clickConnect')} Telegram</p>
                  )}
                </div>
                <div className="flex items-center gap-3 ml-auto">
                  {telegramWalletConnected && (
                    <div className="px-3.5 py-[5.5px] bg-[#ececed1f] rounded-4xl text-[#ffffffcc] text-[13px] ml-auto">
                      {t('wallet.connected')}
                    </div>
                  )}
                  <img src="/images/icons/ic-btn-next.svg" className="w-6 h-6" alt="" />
                </div>
              </div>
            }
            disabled={telegramWalletConnected}
          />
          <div className="flex items-center justify-between">
            <h1 className="text-[calc(14rem/16)] mt-6">{t('assets.login.web3Wallets')}</h1>
            {tab !== 'crypto' && <SwitchChains />}
          </div>
          {activeChain === TYPE_CHAIN.SOLANA ? (
            <ListWalletsSolana checked={checked} setOpen={setOpen} />
          ) : (
            <ListWalletsEvm checked={checked} setOpen={setOpen} />
          )}
          <div className="flex items-center gap-1.5 mt-5 justify-center">
            <CheckboxXbit className="cursor-pointer" checked={checked} onCheckedChange={() => setChecked(!checked)} />
            <p className="text-[#ffffff99] text-[calc(1rem*(11/16))]">
              {t('login.termsAgreement')}{' '}
              <span
                className="text-[#50A1FF] cursor-pointer"
                onClick={() => handleClickNavigate(APP_PATH.TERMS_OF_USE)}
              >
                {t('login.terms')}
              </span>{' '}
              {t('login.with')}{' '}
              <span
                className="text-[#50A1FF] cursor-pointer"
                onClick={() => handleClickNavigate(APP_PATH.PRIVACY_POLICY)}
              >
                {t('login.privacyPolicy')}
              </span>
            </p>
          </div>
        </>
      }
    />
  )
}

const ListWalletsSolana = ({ checked, setOpen }: { checked: boolean; setOpen: Dispatch<SetStateAction<boolean>> }) => {
  const { wallets: listWallets } = useMultiChainWallet({})
  const { wallets, select } = useWallet()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const walletByChainSolana = listWallets?.sol?.chain

  const visibleWallets = [
    // wallets.find((item) => item.adapter.name === BossWalletName),
    wallets.find((item) => item.adapter.name === OKXWalletName),
    wallets.find((item) => item.adapter.name === BitgetWalletName),
    wallets.find((item) => item.adapter.name === PhantomWalletName),
    wallets.find((item) => item.adapter.name === TrustWalletName),
    wallets.find((item) => item.adapter.name === TokenPocketWalletName),
  ] as Wallet[]

  const handleConnect = async (name: WalletName) => {
    try {
      select(name)
      let wallet = null
      switch (name) {
        case BossWalletName:
          wallet = new BossWalletAdapter()
          break
        case OKXWalletName:
          wallet = new OKXWalletAdapter()
          break
        case MetaMaskWalletName:
          wallet = new MetaMaskWalletAdapter()
          break
        case BitgetWalletName:
          wallet = new BitgetWalletAdapter()
          break
        case PhantomWalletName:
          wallet = new PhantomWalletAdapter()
          break
        case TokenPocketWalletName:
          wallet = new TokenPocketWalletAdapter()
          break
        case TrustWalletName:
          wallet = new TrustWalletAdapter()
          break
        case WalletConnectWalletNameV2: {
          const network = WalletAdapterNetwork.Mainnet
          wallet = new WalletConnectWalletAdapterV2({
            network,
            options: {
              projectId: '614721f736ac2a1d6073d5adf36ced6e', // Get one from WalletConnect Cloud
            },
          })
          break
        }
        default:
          console.warn(`[Chain error]:`)
      }
      wallet!
        .connect()
        .then((res) => {
          toast.success(t('status.loginSuccess'))
          dispatch(walletActions.setActiveAccount(TYPE_ACCOUNT.CHAIN))
        })
        .catch(() => {})
        .finally(() => {
          setOpen(false)
          wallet = null
        })
    } catch (e: any) {
      select(null)
      console.warn('handleConnect', e)
    }
  }

  const onClickItemWallet = (name: WalletName) => {
    if (!checked) {
      toast.error(t('toast.termsAgreement'))
      return
    }
    handleConnect(name).then()
  }

  return (
    <div>
      {walletByChainSolana?.isConnected ? (
        <>
          <div
            className={clsx(
              'flex items-center rounded-xl justify-between border-b-[#ececed14] border-b-[0.5px] py-4 px-3 hover:bg-accent hover:text-accent-foreground cursor-not-allowed',
              !checked && 'cursor-not-allowed',
            )}
          >
            <div className="w-full flex items-center gap-4">
              <img src={walletByChainSolana?.walletInfo?.icon} className="w-11 h-11" alt="" />
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-base leading-none">{walletByChainSolana?.walletInfo?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-auto">
                <div className="px-3.5 py-[5.5px] bg-[#ececed1f] rounded-4xl text-[#ffffffcc] text-[13px] ml-auto">
                  {t('wallet.connected')}
                </div>
                <img src="/images/icons/ic-btn-next.svg" className="w-6 h-6" alt="" />
              </div>
            </div>
          </div>
          {/* warning */}
          <div className="px-[12px]">
            <div className="flex items-center gap-[8px] px-[8px] py-[6px] rounded-[6px] bg-[#ECECED0A]">
              <img src="/images/orderSetting/icon-warn.svg" className="w-[20px] min-w-[20px]" alt="" />
              <div className="text-[calc(1rem*(11/16))] text-[#FFFFFF99] leading-[1.5]">
                {t('wallet.warning.walletConnectd')}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {visibleWallets.map((item) => (
            <div
              className={clsx(
                'flex items-center rounded-xl justify-between border-b-[#ececed14] border-b-[0.5px] py-4 px-3 hover:bg-accent hover:text-accent-foreground cursor-pointer',
                !checked && 'cursor-not-allowed',
              )}
              key={item.adapter.name}
              onClick={() => onClickItemWallet(item.adapter.name)}
            >
              <div className="w-full flex items-center gap-4">
                <img src={item.adapter.icon} className="w-11 h-11" alt="" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-base leading-none">{item.adapter.name}</p>
                    {item.adapter.name === BossWalletName && (
                      <div className="text-[11px] leading-none font-medium text-[#141414] p-[5.5px] purple-btn-gradient !rounded-[4px] before:rounded-[4px] after:rounded-[4px]">
                        {t('wallet.downloadWallet')}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-[#ffffff99] mt-1.5">
                    {t('wallet.clickConnect')} {item.adapter.name}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-auto">
                  {item?.readyState === 'Installed' && !_isMobileDevice() && (
                    <div className="text-[13px] text-[#ffffffcc] rounded-2xl bg-[#ececed1f] px-3.5 py-1.5">
                      {t('wallet.installed')}
                    </div>
                  )}{' '}
                  {item.adapter.name === BossWalletName && (
                    <div className="text-[13px] leading-none font-normal text-[#141414] p-[5.5px] purple-btn-gradient !rounded-[16px] before:rounded-[16px] after:rounded-[16px]">
                      {t('login.recommended')}
                    </div>
                  )}
                  <img src="/images/icons/ic-btn-next.svg" className="w-6 h-6" alt="" />
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

const ListWalletsEvm = ({ checked, setOpen }: { checked: boolean; setOpen: Dispatch<SetStateAction<boolean>> }) => {
  const { wallets } = useMultiChainWallet({})
  // const isWalletEvmConnected = wallets?.eth?.chain?.isConnected
  const walletByChainEvm = wallets?.eth?.chain

  const { isConnecting } = useAccount()
  const { t } = useTranslation()
  const { connectAsync: connectMetaMask, connectors } = useConnect()
  const visibleWallets = [
    { id: 'metamask', name: 'MetaMask', icon: '/images/icons/metamask-icon.png' },
    { id: 'okx', name: 'OKX Wallet', icon: '/images/icons/okx-icon.png' },
    { id: 'trust', name: 'Trust Wallet', icon: '/images/icons/trust-icon.png' },
    // { id: 'tokenpocket', name: 'Tokenpocket', icon: '/images/icons/bitget-icon.png' },
    // { id: 'binance', name: 'Binance Wallet' },
    // { id: 'rainbow', name: 'Rainbow' },
    // { id: 'coinbase', name: 'Coinbase' },
    { id: 'walletConnect', name: 'Wallet Connect', icon: '/images/icons/wallet-connect-icon.png' },
    { id: 'bitget', name: 'Bitget Wallet', icon: '/images/icons/bitget-icon.png' },
  ]

  // useEffect(() => {
  //   if (activeWallet?.isConnected) setOpen(false)
  // }, [activeWallet?.isConnected])

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
    <div className="flex flex-col gap-2">
      {walletByChainEvm?.isConnected ? (
        <>
          <div
            className={clsx(
              'flex items-center rounded-xl justify-between border-b-[#ececed14] border-b-[0.5px] py-4 px-3 hover:bg-accent hover:text-accent-foreground cursor-not-allowed',
            )}
          >
            <div className="w-full flex items-center gap-4">
              <img src={walletByChainEvm?.walletInfo?.icon} className="w-11 h-11" alt="" />
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-base leading-none">{walletByChainEvm?.walletInfo?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-auto">
                <div className="px-3.5 py-[5.5px] bg-[#ececed1f] rounded-4xl text-[#ffffffcc] text-[13px] ml-auto">
                  {t('wallet.connected')}
                </div>
                <img src="/images/icons/ic-btn-next.svg" className="w-6 h-6" alt="" />
              </div>
            </div>
          </div>
          {/* warning */}
          <div className="px-[12px]">
            <div className="flex items-center gap-[8px] px-[8px] py-[6px] rounded-[6px] bg-[#ECECED0A]">
              <img src="/images/orderSetting/icon-warn.svg" className="w-[20px] min-w-[20px]" alt="" />
              <div className="text-[calc(1rem*(11/16))] text-[#FFFFFF99] leading-[1.5]">
                {t('wallet.warning.walletConnectd')}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {visibleWallets.map((item) => (
            <WalletButton.Custom wallet={item.id} key={item.id}>
              {({ ready, connect, connector }) => {
                // console.log('connector', connector)
                return (
                  <button
                    className={clsx(
                      'flex items-center rounded-xl justify-between border-b-[#ececed14] border-b-[0.5px] py-4 px-3 hover:bg-accent hover:text-accent-foreground',
                      // !checked && 'cursor-not-allowed',
                    )}
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
        </>
      )}
    </div>
  )
}
