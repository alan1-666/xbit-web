import { WalletAdapterNetwork, WalletName } from '@solana/wallet-adapter-base'
import { Wallet, useWallet } from '@solana/wallet-adapter-react'
import { useEffect, useRef, useState } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import eventBus from '@/lib/eventBus'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { OKXWalletAdapter, OKXWalletName } from '@/lib/wallets/OKXWalletAdapter'
import { BossWalletAdapter, BossWalletName } from '@/lib/wallets/BossWalletAdapter'
import { MetaMaskWalletAdapter, MetaMaskWalletName } from '@/lib/wallets/MetaMaskWalletAdaper'
import {
  WalletConnectWalletAdapter as WalletConnectWalletAdapterV2,
  WalletConnectWalletName as WalletConnectWalletNameV2,
} from '@/lib/wallets/WalletConnectWalletAdapter'
import { CheckboxXbit } from '../ui/checkbox-xbit'
import { BitgetWalletAdapter, BitgetWalletName } from '@/lib/wallets/BitgetWalletAdapter'
import { toast } from 'sonner'
import MovingBgTabs from '../common/MovingBgTabs'
// import { PhantomWalletAdapter, PhantomWalletName } from '@solana/wallet-adapter-phantom'
import { walletActions } from '@/redux/modules/wallet.slice'
import { TYPE_ACCOUNT, TYPE_CHAIN } from '@/lib/blockchain'
import { _isMobileDevice } from '@/lib/utils'
import { UITab } from '@/types/uiTabs.ts'
import { useTranslation } from 'react-i18next'
import { PhantomWalletAdapter, PhantomWalletName } from '@/lib/wallets/PhantomWalletAdapter'
import { useMultiChainWallet } from '@/hooks/useMultiChainWallet'

export const EVENT_MESSAGE_MODAL_WALLET_CONNECT = 'EVENT_MESSAGE_MODAL_WALLET_CONNECT'
export const WalletConnectWalletName = 'WalletConnectWallet'
export const EVENT_CONNECT_SOLANA = 'EVENT_CONNECT_SOLANA'

const WalletSolanaConnectModal = () => {
  const { wallets, select, connect } = useWallet()
  const [open, setOpen] = useState<boolean>(false)
  const [openWalletConnect, setOpenWalletConnect] = useState<boolean>(false)
  const [checked, setChecked] = useState<boolean>(true)
  const chain = useAppSelector((state) => state.newWallet.activeChain)
  const dispatch = useAppDispatch()
  const ref = useRef(null)
  const { t } = useTranslation()
  const { disconnectWallet } = useMultiChainWallet({})

  useEffect(() => {
    eventBus.on(EVENT_MESSAGE_MODAL_WALLET_CONNECT, (data: any) => {
      if (data?.data) {
        setOpen(data?.data?.isOpen)
      }
    })
    return () => {
      eventBus.remove(EVENT_MESSAGE_MODAL_WALLET_CONNECT)
    }
  }, [])

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
        case WalletConnectWalletName:
          connect()
            .then((res) => {
              toast.success(t('status.loginSuccess'))
            })
            .catch((err) => {})
            .finally(() => {
              setOpen(false)
              if (openWalletConnect) setOpenWalletConnect(false)
            })
          return
        // break
        default:
          console.warn(`[Chain error]:`)
      }
      wallet!
        .connect()
        .then((res) => {
          toast.success(t('status.loginSuccess'))
          dispatch(walletActions.setActiveAccount(TYPE_ACCOUNT.CHAIN))
          // const s = setInterval(() => {
          //   disconnectWallet(TYPE_CHAIN.ETH, false)
          //   setTimeout(() => {
          //     clearInterval(s)
          //   }, 3000)
          // }, 1000)
        })
        .catch((err) => {})
        .finally(() => {
          wallet = null
          setOpen(false)
          if (openWalletConnect) setOpenWalletConnect(false)
        })

      // if (name === OKXWalletName) {
      //   setInterval(() => {
      //     disconnectWallet(TYPE_CHAIN.ETH)
      //   }, 500)
      //   console.log('vao day k')
      // }
    } catch (e: any) {
      select(null)
      console.warn('handleConnect', e)
    }
  }

  function getModalContent() {
    return <div className="flex flex-col gap-0">{getOptions()}</div>
  }

  const visibleWallets = [
    wallets.find((item) => item.adapter.name === BossWalletName),
    wallets.find((item) => item.adapter.name === OKXWalletName),
    // wallets.find((item) => item.adapter.name === MetaMaskWalletName),
    wallets.find((item) => item.adapter.name === BitgetWalletName),
    // wallets.find((item) => item.adapter.name === WalletConnectWalletName),
    // wallets.find((item) => item.adapter.name === WalletConnectWalletNameV2),
    wallets.find((item) => item.adapter.name === PhantomWalletName),
  ] as Wallet[]

  const onClickItemWallet = (name: WalletName) => {
    if (!checked) {
      toast.error(t('toast.termsAgreement'))
      return
    }
    if (name === WalletConnectWalletNameV2) {
      setOpenWalletConnect(true)
      return
    }
    handleConnect(name).then(() => {
      if (name === OKXWalletName) {
        // const s = setInterval(() => {
        //   disconnectWallet(TYPE_CHAIN.ETH)
        //   setTimeout(() => {
        //     clearInterval(s)
        //   }, 3000)
        //   console.log('vao day k')
        // }, 1000)
      }
    })
    // if (name === OKXWalletName) {
    //   setTimeout(() => {
    //     disconnectWallet(TYPE_CHAIN.ETH)
    //   }, 1000)
    //   console.log('vao day k')
    // }
  }
  function getOptions() {
    return visibleWallets.slice(0, 5).map((item) => {
      return (
        <div
          className="flex items-center rounded-xl justify-between border-b-[#ececed14] border-b-[0.5px] py-4 px-3 hover:bg-accent hover:text-accent-foreground cursor-pointer"
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
      )
    })
  }

  return (
    <>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto">
          <DrawerHeader className="py-3 px-3.5 flex w-full items-center justify-between">
            <DrawerTitle></DrawerTitle>
            <img
              src="/images/icons/icon-x.svg"
              className="w-6 h-6 cursor-pointer"
              onClick={() => setOpen(false)}
              alt=""
            />
          </DrawerHeader>
          <div className="px-3 pb-8">
            <p className="text-lg leading-none">
              {t('wallet.connectToNetwork', { chain: chain?.toString().toUpperCase() })}
            </p>
            <p className="text-[13px] leading-none mt-3 text-[#ffffffa6]">{t('wallet.returnToApp')}</p>
            <div className="mt-5">{getModalContent()}</div>
            <div className="flex items-center gap-1.5 mt-5 justify-center">
              <CheckboxXbit className="cursor-pointer" checked={checked} onCheckedChange={() => setChecked(!checked)} />
              <p className="text-[#ffffff99] text-[calc(1rem*(11/16))]">
                {t('login.termsAgreement')} <span className="text-[#50A1FF]">{t('login.terms')}</span> {t('login.with')}{' '}
                <span className="text-[#50A1FF]">{t('login.privacyPolicy')}</span>
              </p>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
      <WalletConnectModal
        openWalletConnect={openWalletConnect}
        onClose={() => setOpenWalletConnect(false)}
        visibleWallets={visibleWallets}
        handleConnect={handleConnect}
      />
    </>
  )
}

export default WalletSolanaConnectModal

const listTabs: UITab[] = [
  {
    value: 'qr',
    label: 'QR',
  },
  {
    value: 'app',
    label: '应用',
  },
]

const WalletConnectModal = ({
  openWalletConnect,
  visibleWallets,
  handleConnect,
  onClose,
}: {
  openWalletConnect: boolean
  visibleWallets: Wallet[]
  handleConnect: (name: WalletName) => void
  onClose: () => void
}) => {
  const [open, setOpen] = useState<boolean>(false)
  const [tabActive, setActiveTab] = useState<string>(listTabs[0].value)
  const { t } = useTranslation()

  useEffect(() => {
    setOpen(openWalletConnect)
  }, [openWalletConnect])

  const onCloseModal = () => {
    setOpen(false)
    onClose()
  }

  const translatedTabs = listTabs.map((tab) => ({
    ...tab,
    label: tab.value === 'app' ? t('wallet.applications') : tab.label,
  }))

  return (
    <Drawer open={open} onOpenChange={onCloseModal}>
      <DrawerContent className="w-full bg-[#232329] min-h-[60vh] max-w-[768px] mx-auto">
        <DrawerHeader className="py-3 px-3.5 flex w-full items-center justify-between">
          <DrawerTitle></DrawerTitle>
          <img src="/images/icons/icon-x.svg" className="w-6 h-6 cursor-pointer" onClick={onCloseModal} alt="" />
        </DrawerHeader>
        <div className="flex items-center justify-center flex-col px-3 pb-8">
          <MovingBgTabs
            containerId="wallet-tab"
            containerClassName="mx-auto"
            tabs={translatedTabs}
            defaultTab={tabActive}
            onTabChange={(tab) => {
              setActiveTab(tab)
            }}
            tabsListClassName="rounded-[6px]"
            tabsTriggerClassName="rounded-[6px] w-[88px]"
            tabBgClassName="rounded-[6px] before:rounded-[6px] after:rounded-[6px]"
          />
          {tabActive === 'qr' && (
            <div className="mt-5 flex items-center flex-col">
              <p className="text-sm leading-[1.5] text-center">{t('wallet.qrCodeInstruction')}</p>
              <div className="p-3 bg-[#ececed14] rounded-2xl mt-4">
                <img src="/images/wallets/ic-qr-code.jpeg" className="w-[276px] h-[276px] rounded-2xl" alt="" />
              </div>
              <p className="text-base text-center text-[#50A1FF] mt-4">{t('wallet.saveToAlbum')}</p>
            </div>
          )}
          {tabActive === 'app' && (
            <>
              <p className="text-base text-center mt-7">{t('wallet.selectWallet')}</p>
              <div className="grid grid-cols-4 gap-x-4 mt-4 gap-y-6">
                {visibleWallets
                  .filter((item) => item.adapter.name !== WalletConnectWalletName)
                  .map((item: Wallet) => (
                    <div
                      className="flex items-center justify-between flex-col cursor-pointer"
                      key={item.adapter.name}
                      onClick={() => {
                        handleConnect(item.adapter.name)
                      }}
                    >
                      <img src={item.adapter.icon} className="w-11 h-11" alt="" />
                      <p className="text-xs text-[#ffffff99] mt-1.5">{item.adapter.name}</p>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
