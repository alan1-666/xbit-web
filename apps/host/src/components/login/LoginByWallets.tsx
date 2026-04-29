import { useEffect, useRef, useState } from 'react'
import { NewWalletConnection } from '../auth/Appkit/NewWalletConnection'
import { useWallet, Wallet } from '@solana/wallet-adapter-react'
import { OKXWalletAdapter, OKXWalletName } from '@/lib/wallets/OKXWalletAdapter.ts'
import { PhantomWalletName, PhantomWalletAdapter } from '@/lib/wallets/PhantomWalletAdapter.ts'
import { MetaMaskWalletAdapter, MetaMaskWalletName } from '@/lib/wallets/MetaMaskWalletAdaper'
import { WalletConnectWalletName } from '@/lib/wallets/WalletConnectWalletAdapter'
import { useConnect, useDisconnect as useDisconnectWC, useSession } from '@walletconnect/modal-sign-react'
import clsx from 'clsx'
import { WalletName } from '@solana/wallet-adapter-base'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { _activeWallet, setConnectedWalletInfo } from '@/redux/modules/newWallet.slice'
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react'
import ls from '@/lib/local-storage'
import { useDisconnect } from 'wagmi'
import { useAppDispatch } from '@/redux/store'

const LoginByWallets = ({
  publicKey,
  onSubmit,
  isDisabled,
}: {
  publicKey: string
  onSubmit: (address: string, walletName: string) => void
  isDisabled?: boolean
}) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const { wallets, select } = useWallet()
  const solanaWallet = useSolanaWallet()
  const [loading, setLoading] = useState(false)
  const [nameWallet, setNameWallet] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [connectedAddress, setConnectedAddress] = useState<string | null>()
  const userInitiatedRef = useRef(false)
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

  const session = useSession()

  const { disconnect: disconnectEvm } = useDisconnect()
  const { disconnect: disconnectWC } = useDisconnectWC({
    topic: session?.topic,
    reason: { code: 6000, message: 'User disconnected' },
  })

  const supportedWallets = [PhantomWalletName, OKXWalletName, MetaMaskWalletName, WalletConnectWalletName]

  const getWalletIcon = (name: WalletName): string => {
    switch (name) {
      case MetaMaskWalletName:
        return '/images/login/metamask.png'
      case OKXWalletName:
        return '/images/login/okx.png'
      case WalletConnectWalletName:
        return '/images/login/walletconnect.png'
      case PhantomWalletName:
      default:
        return '/images/login/phantom.png'
    }
  }

  const visibleWallets = supportedWallets.map((name) => {
    const found = wallets.find((item) => item.adapter.name === name)
    return (found || {
      adapter: {
        name,
        icon: getWalletIcon(name),
      },
    }) as Wallet
  })

  const isMobile = () => {
    if (typeof navigator === 'undefined') return false

    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera

    // iOS
    if (/iPhone|iPad|iPod/i.test(userAgent)) return true

    // Android
    if (/Android/i.test(userAgent)) return true

    return false
  }

  const onClickItemWallet = async (name: WalletName) => {
    if (name === WalletConnectWalletName) {
      userInitiatedRef.current = true
      try {
        await connect()
      } catch (err) {
        console.error('Connection error:', err)
      }
      return
    }

    if (connected) {
      await solanaWallet.disconnect()
      select(null)
      setConnectedAddress(null)
    }

    userInitiatedRef.current = true
    handleConnect(name).then()
  }

  const { connected } = useWallet()

  const handleConnect = async (name: WalletName) => {
    setNameWallet(name)
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
        .then(() => {
          // Check for EVM address first (for OKX EVM mode), then Solana publicKey
          const evmAddr = (wallet as any).evmAddress ?? (wallet as any)._evmAddress ?? null
          const maybePub: any = (wallet as any).publicKey ?? (wallet as any)._publicKey ?? null

          let address: string | null = null
          
          // EVM address (OKX EVM mode, MetaMask)
          if (evmAddr && typeof evmAddr === 'string') {
            address = evmAddr
          }
          // Solana publicKey
          else if (maybePub) {
            if (typeof maybePub.toBase58 === 'function') {
              address = maybePub.toBase58()
            } else if (typeof maybePub === 'string') {
              address = maybePub
            } else if (typeof maybePub.toString === 'function') {
              address = maybePub.toString()
            }
          }

          setConnectedAddress(address)
          select(name)

          // Save wallet info to Redux for non-Solana wallets
          dispatch(setConnectedWalletInfo({
            name: name,
            icon: getWalletIcon(name),
          }))

          if (address) {
            onSubmit(address, name)
          }
        })
        .catch((error) => {
          if (error?.message === 'wallet_not_installed') {
            toast.error(
              t('wallet.notLogginedWebApp', {
                name: name,
              }),
            )
            setLoading(false)
          }
          select(null)
          solanaWallet.disconnect()
          setError(t('status.loginFail'))
        })
        .finally(() => {})
    } catch (e: any) {
      select(null)
      solanaWallet.disconnect()
      setError(t('status.loginFail'))
    }
  }

  const disConnected = async () => {
    setConnectedAddress('')
    ls.remove('run-once-logined')

    disconnectEvm()

    if (solanaWallet.connected) {
      solanaWallet.disconnect()
    }

    if (session) {
      disconnectWC({
        topic: session?.topic,
        reason: { code: 6000, message: 'User disconnected' },
      })
    }
  }

  useEffect(() => {
    if (!session) return

    if (!userInitiatedRef.current) return

    try {
      const solanaNs = session.namespaces?.solana
      if (solanaNs && solanaNs.accounts && solanaNs.accounts.length) {
        const account = solanaNs.accounts[0]
        const address = account.split(':')?.[2]
        if (address) {
          setConnectedAddress(address)
          setNameWallet(session.peer?.metadata?.name ?? 'Wallet')
          onSubmit(address, '')
        }
        return
      }

      const evmNs = session.namespaces?.eip155
      if (evmNs && evmNs.accounts && evmNs.accounts.length) {
        const account = evmNs.accounts[0]
        const address = account.split(':')?.[2]
        if (address) {
          setConnectedAddress(address)
          setNameWallet(session.peer?.metadata?.name ?? 'Wallet')
          onSubmit(address, '')
        }
      }
    } catch (err) {
      console.log('err: ', err)
    }
  }, [session])

  useEffect(() => {
    if (solanaWallet) {
      solanaWallet.disconnect()
      select(null)
    }

    if (connectedAddress) {
      setConnectedAddress(null)
      select(null)
    }
    const handleCleanSession = async () => {
      await disConnected()
    }

    handleCleanSession()
  }, [])

  return (
    <div className="w-full">
      <NewWalletConnection publicKey={publicKey} setLoading={setLoading} setNameWallet={setNameWallet} data={data} />
      {visibleWallets.map(
        (item) =>
          item && (
            <div
              className={clsx(
                'w-full flex items-center justify-between mb-3 px-3 py-2 bg-[#333338] rounded-[10px] cursor-pointer',
                !!isMobile() && item.adapter.name !== WalletConnectWalletName && 'hidden',
                isDisabled && 'opacity-50 pointer-events-none',
              )}
              key={item.adapter.name}
              onClick={() => onClickItemWallet(item.adapter.name)}
            >
              <div className="w-full flex items-center gap-4">
                <img src={item.adapter.icon} className="w-9 h-9" alt="" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-base leading-none">{item.adapter.name}</p>
                  </div>
                </div>
              </div>
            </div>
          ),
      )}
    </div>
  )
}

export default LoginByWallets
