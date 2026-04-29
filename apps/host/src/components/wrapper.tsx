import Header from './header'
import Footer from '@components/footer'
import { _changeTokenAccount, LOGIN_SUCCESS, LOGOUT } from '@/redux/modules/auth.slice'
import { useEffect, useMemo, useState } from 'react'
import { useMultiChainWallet } from '@/hooks/useMultiChainWallet'
import { Connector } from '@/lib/mqtt'
import ls from '@/lib/local-storage'
import { useLocation, useNavigate } from 'react-router-dom'
import PriceToUSDSubscription from './mqtt/PriceToUSDSubscription'
import ErrorWrapper from './error-wapper'
import { cn, detectBrowser } from '@/lib/utils'
import OrdersSubscription from '@components/OrdersSubscription.tsx'
import AuthHandlerComponent from './auth/AuthHandlerComponent'
import NewBalanceWalletSubcription from './mqtt/NewBalanceWalletSubcription'
import { RootState, useAppSelector, useAppDispatch } from '@/redux/store'
import { ConnectorDex } from '@/lib/mqtt-dex'
import { futureClient, userGqlClient } from '@/lib/gql/apollo-client'
import { getClientLocation, userSettings } from '@/services/settings.service'
import { updateUserSettings } from '@/redux/modules/userSettings.slice'
import useNetworkFeeSubcription from '@/components/mqtt/NetworkFeeSubcription.tsx'
import { useSelector } from 'react-redux'
import { _activeWallet, updateWallet } from '@/redux/modules/newWallet.slice'
import { setApiKey } from '@/redux/modules/apiKey.slice'
import LatestBlockHashSubscription from '@components/LatestBlockHashSubscription.tsx'
import { Configs } from '@/const/configs'
import { ServiceConfig } from '@/lib/gql/service-config'
import { newWalletActions } from '@/redux/modules/newWallet.slice'
import ErrorCodeMsgListen from './ErrorCodeMsgListen'
import { WalletConnectProvider } from './auth/Appkit/walletconnect'
import { useResponsive } from '@hooks/hyperliquid/useResponsive.ts'
import { BaseLayout } from '@components/common/BaseLayout.tsx'
import TurnkeyPolicySubcription from './mqtt/TurnkeyPolicySubcription'
import { growthbook } from '@/lib/growthbook'
import { useQuery } from '@tanstack/react-query'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { useMaintenance } from '@/hooks/useMaintenance'
import { APP_PATH } from '@/lib/constant'
import { MaintenanceDialogModal } from './maintenance/MaintenanceDialogModal'
import { useAutoReloadOnLongSleep } from '@/hooks/useAutoReloadOnLongSleep'
import TransferDetailBottomSheet from '@components/assets/transferDetails/TransferDetailBottomSheet.tsx'
import { useTxDetail } from '@/hooks/useTxDetail'
import FundingHistoriesSubscription from '@components/assets/overview/FundingHistoriesSubscription'
import ExchangeDialog from '@pages/assets/overview/components/ExchangeDialog'
import { getTokensChains } from '@/redux/modules/tokensChains.slice'
import ConfirmCreateBTCWallet from '@/components/common/ConfirmCreateBTCWallet'
import SyncChain from './SyncChain'
import { useTurnkey } from '@turnkey/sdk-react'
import { defaultBitcoinMainnetP2TRAccountAtIndex } from '@turnkey/sdk-browser'
import { approveCreateWalletMutation } from '@/services/auth.service'
import AnnouncementPopup from '@/components/announcement'
import { NEW_TYPE_ACCOUNT } from '@/lib/blockchain.ts'
import LoginHandler from './auth/LoginHandler'
import { NotificationMqttSubscription } from '@components/common/notification/NotificationMqttSubscription.tsx'

export type PageWrapperProps = {
  children?: React.ReactNode
  showHeader?: boolean
  isWebview?: boolean
  isHorizontalFlip?: boolean
  isShowFooter?: boolean
  isDex?: boolean
  showNotifications?: boolean
  isScrollable?: boolean
  footerWithNonePadding?: boolean
  isShowBackgroundImage?: boolean
  isShowAuthWarning?: boolean
  bgColor?: string
  isXStock?: boolean
  fullscreen?: boolean
  fullscreenWithoutHeader?: boolean
}

const COUNTRY_CODE_KEY = 'country_code'
const COUNTRY_CODE_TTL = 10 * 60 * 1000 // 10 minutes

const getCountryCode = async () => {
  try {
    const cached = ls.get(COUNTRY_CODE_KEY)
    if (cached) {
      const { countryCode, timestamp } = cached
      if (Date.now() - timestamp < COUNTRY_CODE_TTL) {
        return countryCode
      }
    }

    const { data } = await futureClient.query({
      query: getClientLocation,
      fetchPolicy: 'network-only',
    })

    const countryCode = data?.getClientLocation?.countryCode || null

    if (countryCode) {
      ls.set(COUNTRY_CODE_KEY, {
        countryCode,
        timestamp: Date.now(),
      })
    }

    return countryCode
  } catch (error) {
    console.log('Failed to get country code:', error)
    return null
  }
}
const PageWrapper = ({
  children,
  showHeader = true,
  isWebview = false,
  isHorizontalFlip = false,
  isShowFooter = true,
  isShowBackgroundImage = true,
  isShowAuthWarning = true,
  isDex = false,
  isScrollable = true,
  footerWithNonePadding = false,
  bgColor,
  isXStock = false,
  fullscreen = false,
  fullscreenWithoutHeader = false,
}: PageWrapperProps) => {
  const { shouldRedirectToMaintenance } = useMaintenance()
  const navigate = useNavigate()
  const location = useLocation()
  const { indexedDbClient } = useTurnkey()
  const subOrgId = useSelector(_userInfo)?.subOrgId

  useEffect(() => {
    if (isWebview) return

    if (shouldRedirectToMaintenance) {
      navigate(APP_PATH.MAINTENANCE, { replace: true })
      return
    }
    if (!shouldRedirectToMaintenance && location.pathname === APP_PATH.MAINTENANCE) {
      navigate('/', { replace: true })
      return
    }
  }, [shouldRedirectToMaintenance, isWebview, location.pathname])

  //Tracking
  // usePageTracking()

  const [countryCode, setCountryCode] = useState<string>('')

  const userId = useSelector(_userInfo)?.userId
  //Todo: Automatically reload the page after 30 minutes due to the following error:
  //[PHANTOM] Failed to send message to service worker. Retrying... Error: Extension context invalidated.
  useAutoReloadOnLongSleep(30)
  const dispatch = useAppDispatch()
  const urlParams = new URLSearchParams(window.location.search)
  const ref = urlParams.get('r')
  const { pathname } = location
  const color = useAppSelector((state: RootState) => state.preference.priceChangeColor)
  const activeWallet = useSelector(_activeWallet)
  const accessToken = ServiceConfig.token || ''
  const { isDesktop } = useResponsive()
  const { txDetail, closeTxDetail } = useTxDetail()
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)
  const [openConfirmCreateBTCWallet, setOpenConfirmCreateBTCWallet] = useState(false)

  const { data } = useQuery({
    queryKey: ['country_code'],
    queryFn: getCountryCode,
    refetchOnWindowFocus: false,
  })

  const getAPIKey = async () => {
    try {
      const response = await fetch(`${Configs.rpcProxyUrl}/api-key`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch API key')
      }
      const data = await response.json()
      if (data && data.apiKey) {
        dispatch(setApiKey(data.apiKey))
      }
    } catch (error) {
      console.error('Error fetching API key:', error)
      return
    }
  }

  useEffect(() => {
    if (accessToken && listWalletsByChain.length > 0) {
      const btcWallet = listWalletsByChain.find((wallet: any) => wallet.chain === 'BTC')
      if (!btcWallet) {
        // setOpenConfirmCreateBTCWallet(true)
        handleConfirm()
      }
    }
  }, [accessToken, listWalletsByChain])

  useEffect(() => {
    if (accessToken) {
      getAPIKey()
      dispatch(newWalletActions.getAccountInfo({}))
    }
  }, [accessToken])

  useEffect(() => {
    if (data) {
      setCountryCode(data)
    }
  }, [data])

  const { email, walletAddressLogin, activeAccount } = useAppSelector((state) => state.newWallet) as {
    email: string
    walletAddressLogin?: string
    activeAccount: NEW_TYPE_ACCOUNT
  }
  const loginBy = useMemo(() => {
    return {
      method: activeAccount,
      by: email || walletAddressLogin,
    }
  }, [email, walletAddressLogin, activeAccount])
  useEffect(() => {
    const updateGrowthBookAttributes = async () => {
      const { href } = window.location

      if (countryCode) {
        try {
          growthbook.setAttributes({
            url: href,
            country: countryCode,
            deviceType: isDesktop ? 'desktop' : 'mobile',
            browser: detectBrowser(),

            // custom attr
            user_id: userId, // you need to create custom attr in GB admin dashboard
            // uuid: userId, // map to `id` field, https://docs.growthbook.io/lib/js#options
            login_method: loginBy.method, // eg: google
            login_by: loginBy.by, // eg: example@gmail.com
          })
        } catch (error) {
          console.error('❌ Failed to update GrowthBook attributes:', error)
        }
      }
    }

    updateGrowthBookAttributes()
  }, [activeWallet, countryCode, userId, loginBy])

  const handleConfirm = async () => {
    if (indexedDbClient) {
      const firstItem = listWalletsByChain[0]
      const walletId = firstItem?.walletId

      const activity = await indexedDbClient?.createWalletAccounts({
        organizationId: subOrgId,
        walletId,
        accounts: [defaultBitcoinMainnetP2TRAccountAtIndex(0)],
      })

      const response = await userGqlClient.mutate({
        mutation: approveCreateWalletMutation,
        variables: {
          input: {
            activityId: activity?.activity?.id,
            name: 'BTC Wallet',
          },
        },
      })

      const newWallet = response.data.approveCreateWallet?.wallet

      const walletWithBalance = {
        ...newWallet,
        balance: 0,
      }

      dispatch(
        updateWallet({
          listWalletsByChain: [...listWalletsByChain, walletWithBalance],
        }),
      )
    }
  }

  const getUserSettings = async () => {
    try {
      const { data } = await userGqlClient.query({
        query: userSettings,
      })
      const settings = data.userSettings
      if (settings) {
        dispatch(updateUserSettings(settings))
      }
    } catch (error) {
      console.error('Error fetching user settings:', error)
      return null
    }
  }

  useNetworkFeeSubcription()
  useEffect(() => {
    if (activeWallet && activeWallet.isConnected) {
      getUserSettings()
      dispatch(getTokensChains({}))
    }
  }, [activeWallet.isConnected])

  useEffect(() => {
    const root = window.document.documentElement
    if (isDesktop) {
      if (!root.classList.contains('pc')) {
        root.classList.add('pc')
      }
    } else {
      if (root.classList.contains('pc')) {
        root.classList.remove('pc')
      }
    }
  }, [isDesktop])

  useEffect(() => {
    const root = window.document.documentElement
    if (color === 'inverse') {
      // check if the root element has the class 'inverse'
      if (!root.classList.contains('inverse')) {
        root.classList.add('inverse')
      }
    } else {
      // remove the 'inverse' class from the root element
      if (root.classList.contains('inverse')) {
        root.classList.remove('inverse')
      }
    }
  }, [color])

  useEffect(() => {
    if (ref) {
      localStorage.setItem('REFERRER_CODE', ref)
    }
  }, [ref])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  if (isWebview) {
    return <Connector>{children}</Connector>
  }

  const isDesktopReady = fullscreen && isDesktop

  return (
    <>
      <MaintenanceDialogModal />
      <div
        id="main-content"
        className={cn(
          'relative max-w-[768px] mx-auto',
          fullscreen && isDesktop ? 'max-w-full w-full h-full' : '',
          fullscreenWithoutHeader && isDesktop ? 'max-w-full w-full h-full' : '',
          // isShowFooter && !isDesktopReady && 'pb-[85px]',
          isScrollable ? 'h-dvh no-scrollbar' : '',
          !activeWallet.isConnected && footerWithNonePadding && '!pb-0',
          // isDex && isMobile && 'landscape-html landscape-h-screen-custom overflow-x-hidden',
          // isDex && 'portrait-html',
        )}
      >
        <ErrorCodeMsgListen />
        <Connector>
          <ConnectorDex disableConnect={!isDex}>
            <SyncChain />
            <OrdersSubscription />
            <LatestBlockHashSubscription />
            <FundingHistoriesSubscription />
            <NotificationMqttSubscription />
            {showHeader && !isDesktopReady && <Header showNotifications bgColor={bgColor} />}
            {children}
            {isShowFooter && !isDesktopReady && <Footer isDex={isDex} isXStock={isXStock} />}
            <>
              <PriceToUSDSubscription />
              {/* <BalanceWalletSubcription /> */}
              {activeWallet.isConnected && <NewBalanceWalletSubcription />}
              {activeWallet.isConnected && <TurnkeyPolicySubcription />}
              <AnnouncementPopup />
              <WalletConnectProvider />
            </>
            <TransferDetailBottomSheet
              open={!!txDetail}
              setOpen={(isOpen) => {
                if (!isOpen) {
                  closeTxDetail()
                }
              }}
              record={txDetail}
            />
            <ExchangeDialog />
            {/* <ConfirmCreateBTCWallet open={openConfirmCreateBTCWallet} setOpen={setOpenConfirmCreateBTCWallet} /> */}
          </ConnectorDex>
        </Connector>
        {/* <BoardCastListener /> */}
        <ErrorWrapper />
        {isShowAuthWarning ? <AuthHandlerComponent /> : null}
        <LoginHandler />
      </div>
    </>
  )
}

export function wrapper({ children, ...props }: PageWrapperProps) {
  const { fullscreen } = props
  return <PageWrapper {...props}>{fullscreen ? <BaseLayout>{children}</BaseLayout> : children}</PageWrapper>
}

const AuthHandler = (children: any) => {
  return <>{children}</>
}

export function useAuth(children: any) {
  return <AuthHandler>{children}</AuthHandler>
}

const BoardCastListener = () => {
  const { disconnectActiveWallet } = useMultiChainWallet({})
  useEffect(() => {
    const authChannel = new BroadcastChannel('auth_sync_channel')
    let isCheckLogout = 0
    let isCheckLogin = 0
    const handleMessage = (event: MessageEvent) => {
      const { type, timestamp } = event.data

      if (Date.now() - timestamp < 5000) {
        switch (type) {
          case LOGIN_SUCCESS:
            if (isCheckLogin === 0) {
              isCheckLogin = 1
              isCheckLogout = 0
            }
            break
          case LOGOUT:
            if (isCheckLogout === 0) {
              disconnectActiveWallet()
              isCheckLogin = 0
              isCheckLogout = 1
            }
            break
          default:
            break
        }
      }
    }
    authChannel.addEventListener('message', handleMessage)

    return () => {
      authChannel.removeEventListener('message', handleMessage)
      authChannel.close()
    }
  }, [])

  return null
}
