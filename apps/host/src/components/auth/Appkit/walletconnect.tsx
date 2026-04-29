import { WALLETCONNECT_ID } from '@/lib/blockchain'
import {
  useOnSessionDelete,
  WalletConnectModalSign,
  useOnSessionExpire,
  useSession,
} from '@walletconnect/modal-sign-react'
import { newAuthActions } from '@/redux/modules/newAuth.slice.ts'
import { _activeWallet, newWalletActions } from '@/redux/modules/newWallet.slice.ts'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { useTurnkey } from '@turnkey/sdk-react'
import { logoutWithTurnkey } from '@/services/auth.service'
import ls from '@/lib/local-storage'
import { clearUserPositionCache } from '@/utils/indexedDB/userPositionDB'
import { setFavorites } from '@/redux/modules/symbolList.slide'
import { clearSymbolListCache } from '@/utils/indexedDB/symbolListDB'
import { clearAllSlice } from '@/redux/modules/userPosition.Slice'
import { toast } from 'sonner'
import { IconCheckCircle } from '@/components/icon/stroke/IconCheckCircle'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import { useUpdateWCModal } from '@/hooks/useUpdateWCModal'

export const WalletConnectProvider = () => {
  const session = useSession()
  const dispatch = useAppDispatch()
  const activeAccount = useAppSelector((state) => state.newWallet.activeAccount)
  const activeWallet = useSelector(_activeWallet)
  useUpdateWCModal('Wallet Connect Modal Overlay')

  const { indexedDbClient } = useTurnkey()
  const turnkeyUserId = useAppSelector((state) => state.newWallet.turnkeyRootUserId)
  const { t } = useTranslation()

  useOnSessionDelete((data) => {
    // console.log('Session WalletConnect deleted')
    if (data?.topic === session?.topic && activeWallet?.isConnected) {
      onClickDisConnected()
      const walletName = session?.peer?.metadata?.name

      toast.info(
        t('wallet.walletconnect.deleted', {
          wallet: walletName || 'Wallet',
        }),
        { icon: <IconCheckCircle className="size-4" /> },
      )
    }
  })

  useOnSessionExpire((data) => {
    // console.log('Session WalletConnect expired')
    if (data?.topic === session?.topic && activeWallet?.isConnected) {
      onClickDisConnected()
      toast.info(t('wallet.walletconnect.expired'), {
        icon: <IconCheckCircle className="size-4" />,
      })
    }
  })

  const onClickDisConnected = async () => {
    // reset turnkey client
    await logoutWithTurnkey(indexedDbClient, turnkeyUserId)
    await indexedDbClient?.clear()
    dispatch(
      newAuthActions.logout({
        activeAccount: activeAccount,
      }),
    )
    dispatch(newWalletActions.logoutWallet({}))
    // await indexedDbClient?.resetKeyPair()
    ls.remove('run-once-logined')

    await clearUserPositionCache()
    await clearSymbolListCache()

    dispatch(setFavorites([]))
    dispatch(clearAllSlice())
  }

  useEffect(() => {
    localStorage.removeItem('WCM_RECENT_WALLET_DATA')
  }, [])

  return (
    <WalletConnectModalSign
      signClient={null}
      projectId={WALLETCONNECT_ID}
      metadata={{
        name: 'KairoX',
        description: 'KairoX',
        url: window.location.origin,
        icons: [`${window.location.origin}/images/kairox-logo.svg`],
      }}
      modalOptions={{
        chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'], // Solana mainnet
        explorerRecommendedWalletIds: [
          '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709',
          '5d9f1395b3a8e848684848dc4147cbd05c8d54bb737eac78fe103901fe6b01a1',
          'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
          '15c8b91ade1a4e58f3ce4e7a0dd7f42b47db0c8df7e0d84f63eb39bcb96c4e0f',
          '38f5d18bd8522c244bdd70cb4a68e0e718865155811c043f052fb9f1c51de662',
          '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
          '8a0ee50d1f22f6651afcae7eb4253e52a3310b90af5daef78a8c4929a9bb99d4',
          '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927',
          '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
        ],
        // desktopWallets: [
        //   {
        //     id: "5d9f1395b3a8e848684848dc4147cbd05c8d54bb737eac78fe103901fe6b01a1",
        //     name: "xxx",
        //     links: {
        //       native: "okxwallet://",
        //     },
        //   },
        // ],
        // // mobileWallets: [
        // //   {
        // //     id: "5d9f1395b3a8e848684848dc4147cbd05c8d54bb737eac78fe103901fe6b01a1",
        // //     name: "OKX Wallet",
        // //     links: {
        // //       native: "okxwallet://",
        // //     },
        // //   },
        // // ],
        // walletImages: {
        //   "5d9f1395b3a8e848684848dc4147cbd05c8d54bb737eac78fe103901fe6b01a1": "/images/wallets/logo-okx-wallet.webp",
        // },
        explorerExcludedWalletIds: ['19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927'],
        termsOfServiceUrl: '',
        themeVariables: {
          '--wcm-background-color': '#ab57ff',
        },
      }}
    ></WalletConnectModalSign>
  )
}
