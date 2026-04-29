import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'
import { toast } from 'sonner'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useWallet, Wallet } from '@solana/wallet-adapter-react'
import { OKXWalletAdapter, OKXWalletName } from '@/lib/wallets/OKXWalletAdapter.ts'
import { PhantomWalletAdapter, PhantomWalletName } from '@/lib/wallets/PhantomWalletAdapter.ts'
import { _isMobileDevice } from '@/lib/utils'
import { WalletName } from '@solana/wallet-adapter-base'
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react'
import { WalletConnectWalletName } from '@/lib/wallets/WalletConnectWalletAdapter'
// import { NewWalletConnection } from './Appkit/NewWalletConnection'
import { useConnect } from '@walletconnect/modal-sign-react'
import { IconTrust } from '../icon/stroke'
import { MetaMaskWalletAdapter, MetaMaskWalletName } from '@/lib/wallets/MetaMaskWalletAdaper'
import WalletVerifyModal from './WalletVerifyModal'
import { BossWalletName } from '@/lib/wallets/BossWalletAdapter'
import { NEW_TYPE_ACCOUNT } from '@/lib/blockchain'
import { trackUserRegistered } from '@/services/google-analytics.service'

export const List_Wallets_Supported = [WalletConnectWalletName, OKXWalletName, MetaMaskWalletName, PhantomWalletName]

const LoginByWalletSol = ({
  publicKey,
  isAgree,
  onSubmit,
}: {
  publicKey: string
  isAgree: boolean
  onSubmit: (address: string, walletName: string) => void
}) => {
  const { t } = useTranslation()
  const { wallets, select } = useWallet()
  const solanaWallet = useSolanaWallet()
  const [loading, setLoading] = useState(false)
  const [nameWallet, setNameWallet] = useState<string | null>(null)
  const { connected } = useWallet()
  const [loginType, setLoginType] = useState<NEW_TYPE_ACCOUNT>(NEW_TYPE_ACCOUNT.WALLET)
  const [isOpenModalVerify, setIsOpenModalVerify] = useState(false)
  const { connect, data } = useConnect({
    requiredNamespaces: {},
    optionalNamespaces: {
      solana: {
        methods: ['solana_signMessage'],
        chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'], // Solana mainnet
        events: ['accountsChanged'],
      },
      eip155: {
        methods: ['eth_sendTransaction', 'personal_sign', 'eth_signTypedData'],
        chains: [
          'eip155:1', // Ethereum Mainnet
        ],
        events: ['accountsChanged', 'chainChanged'],
      },
    },
  })

  useEffect(() => {
    if (data) {
      setIsOpenModalVerify(true)
      setLoginType(NEW_TYPE_ACCOUNT.WC)
    }
  }, [data])

  function isMobile(): boolean {
    if (typeof navigator === 'undefined') return false

    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera

    // iOS
    if (/iPhone|iPad|iPod/i.test(userAgent)) return true

    // Android
    if (/Android/i.test(userAgent)) return true

    return false
  }

  const visibleWallets = List_Wallets_Supported.map((name) => {
    const found = wallets.find((item) => item.adapter.name === name)
    return (found || {
      adapter: {
        name,
        icon:
          name === MetaMaskWalletName
            ? '/images/login/metamask.png'
            : name === OKXWalletName
              ? '/images/login/okx.png'
              : name === WalletConnectWalletName
                ? '/images/login/walletconnect.png'
                : '/images/login/phantom.png',
      },
    }) as Wallet
  })

  const onClickItemWallet = async (name: WalletName, index: number) => {
    if (!isAgree) {
      toast.error(t('toast.termsAgreement'))
      return
    }

    if (name === WalletConnectWalletName) {
      try {
        await connect()
      } catch (err) {
        console.error('Connection error:', err)
      }
      return
    }

    if (connected) {
      await solanaWallet.disconnect()
    }

    handleConnect(name).then()
  }

  useEffect(() => {
    if (!loading) {
      setNameWallet(null)
    }
  }, [loading])

  const handleConnect = async (name: WalletName) => {
    if (!_isMobileDevice()) {
      setLoading(true)
    }

    try {
      let wallet = null
      switch (name) {
        case OKXWalletName:
          wallet = new OKXWalletAdapter()
          break
        case MetaMaskWalletName:
          wallet = new MetaMaskWalletAdapter()
          break
        case PhantomWalletName:
          wallet = new PhantomWalletAdapter()
          break
        default:
          console.warn(`[Chain error]:`)
      }
      wallet!
        .connect()
        .then((res) => {
          setNameWallet(name)
          setLoginType(NEW_TYPE_ACCOUNT.WALLET)
          setIsOpenModalVerify(true)
        })
        .catch((error) => {
          if (error?.message === 'wallet_not_installed') {
            toast.error(
              t('wallet.notLogginedWebApp', {
                name: name,
              }),
            )
          }
          select(null)
          solanaWallet.disconnect()
          console.log('error', error)
        })
        .finally(() => { })
    } catch (e: any) { }
  }

  useEffect(() => {
    if (!isOpenModalVerify) {
      if (solanaWallet) {
        solanaWallet.disconnect()
        select(null)
      }
    }
  }, [isOpenModalVerify])

  return (
    <>
      <div className="flex w-full flex-col gap-2.5">
        {visibleWallets.map((item, index) => (
          <div
            className={clsx(
              'w-ful flex items-center gap-2.5 px-3 py-1.5 bg-[#18181d] cursor-pointer rounded-[8px]',
              !isAgree && 'cursor-not-allowed',
              !!isMobile() && item.adapter.name !== WalletConnectWalletName && 'hidden',
            )}
            key={item.adapter.name}
            onClick={() => onClickItemWallet(item.adapter.name, index)}
          >
            {item.adapter.name === 'Trust' ? (
              <IconTrust className="w-9 h-9" />
            ) : (
              <img src={item.adapter.icon} className="w-9 h-9" alt="" />
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-base leading-normal">{item.adapter.name}</p>
                {item.adapter.name === BossWalletName && (
                  <div className="text-[11px] leading-none font-medium text-[#141414] p-[5.5px] purple-btn-gradient rounded-[4px]! before:rounded-[4px] after:rounded-[4px]">
                    {t('wallet.downloadWallet')}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* <NewWalletConnection publicKey={publicKey} setNameWallet={setNameWallet} setLoading={setLoading} data={data} /> */}
      {isOpenModalVerify && (
        <WalletVerifyModal
          open={isOpenModalVerify}
          setOpen={setIsOpenModalVerify}
          publicKey={publicKey}
          walletName={nameWallet!}
          loginType={loginType}
        />
      )}
    </>
  )
}
export default LoginByWalletSol
