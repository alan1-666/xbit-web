import useSignWallet from '@/hooks/useSignWallet'
import { APP_PATH } from '@/lib/constant'
import { Configs } from '@/const/configs'
import { cn } from '@/lib/utils'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { HeaderTab, routerActions } from '@/redux/modules/router.slice.ts'
import { UITab } from '@/types/uiTabs.ts'
import Container from '@components/common/Container.tsx'
import MovingBgTabs, { MovingBgTabsHandle } from '@components/common/MovingBgTabs.tsx'
import { AppHeaderRight } from '@components/header/AppHeaderRight.tsx'
import { AppSettingsDrawer } from '@components/settings/AppSettingsDrawer.tsx'
import '@rainbow-me/rainbowkit/styles.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { MaintenanceNotification } from '../maintenance/MaintenanceNotification'
import { MaintenanceWarning } from '../maintenance/MaintenanceWarning'
import MobileSwitchChains from './mobile-switch-chains'
import { NAVIGATIONS } from '@/lib/navigations'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { Button } from '@components/ui/button.tsx'

export interface HeaderProps {
  showNotifications?: boolean
  bgColor?: string
}

const PREDICTON_EVENT = '/prediction/event'
const PREDICTON_PORTFOLIO = '/prediction/portfolio'

const getDefaultTab = () => {
  const pathname = window.location.pathname
  if (pathname === '/') return 'crypto'
  if (pathname.startsWith(APP_PATH.FUTURES)) return 'crypto'
  if (pathname.startsWith(APP_PATH.XSTOCKS)) return 'xstocks'
  if (pathname.startsWith(NAVIGATIONS.prediction.home())) return 'prediction'
  return 'meme'
}

const Header = (props: HeaderProps) => {
  const { showNotifications } = props

  const activeWallet = useSelector(_activeWallet)

  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const enablePrediction = useFeatureIsOn('enable_prediction')
  const ref = useRef<MovingBgTabsHandle>(null)
  useSignWallet({
    isAutoConnect: true,
  })

  // Create headerTabs with translated labels
  // Use `satisfies` to keep `value` inferred as `string` (avoid `string | undefined` from `UITab['value']`)
  const headerTabs = useMemo(() => {
    const tabs: UITab[] = [
      {
        value: 'crypto',
        label: t('header.crypto'),
      },
      {
        value: 'meme',
        label: t('header.meme'),
      },
      {
        value: 'xstocks',
        label: t('header.xstocks'),
        hidden: !Configs.enableSolana(),
      },
      {
        value: 'prediction',
        label: 'Prediction',
        hidden: !enablePrediction,
      },
    ]

    return tabs.filter((t) => !t.hidden)
  }, [t, enablePrediction])

  const [tabs, setTabs] = useState(headerTabs)

  useEffect(() => {
    // // Set the default tab based on the current route
    // if (ref.current) {
    //   ref.current.selectTab(routeTab)
    // }
    if (!ref.current) return
    let currentPathTab: string
    const locationPathname = window.location.pathname
    if (locationPathname.startsWith('/xstocks')) {
      ref.current.selectTab('xstocks')
      currentPathTab = 'xstocks'
    } else if (locationPathname.startsWith('/futures')) {
      ref.current.selectTab('crypto')
      currentPathTab = 'crypto'
    } else if (locationPathname.startsWith('/prediction')) {
      ref.current.selectTab('prediction')
      currentPathTab = 'prediction'
    } else {
      ref.current.selectTab('meme')
      currentPathTab = 'meme'
    }
    dispatch(routerActions.setHeaderTab(currentPathTab as HeaderTab))
  }, [ref.current, window.location.pathname])

  const tabPaths: Record<string, string> = {
    crypto: APP_PATH.FUTURES_DISCOVER,
    meme: APP_PATH.MEME_DISCOVER,
    xstocks: APP_PATH.XSTOCKS,
    prediction: NAVIGATIONS.prediction.home(),
  }

  useEffect(() => {
    setTabs(headerTabs)
  }, [headerTabs])

  const handleTabChange = (tab: string) => {
    navigate(tabPaths[tab])

    // // save the path of current tab
    dispatch(routerActions.setHeaderTab(tab as HeaderTab))
  }

  if (location.pathname.includes(PREDICTON_EVENT) || location.pathname.includes(PREDICTON_PORTFOLIO)) {
    return (
      <div className="z-10 w-full">
        <MaintenanceNotification />
        <MaintenanceWarning />
      </div>
    )
  }

  return (
    <>
      <div className="z-10 w-full">
        <MaintenanceNotification />
        <MaintenanceWarning />
      </div>
      <header
        className="relative z-1 py-[10px] hidden"
        style={
          {
            // backgroundColor: bgColor,
          }
        }
      >
        <Container className="relative flex h-full min-h-[32px] items-center justify-between">
          <div className="mr-[46px]">
            <AppSettingsDrawer />
          </div>
          <MovingBgTabs
            ref={ref}
            containerId="header-tab"
            containerClassName="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2"
            tabs={tabs}
            defaultTab={getDefaultTab()}
            tabsListClassName="border-0 px-[2px]"
            tabBgClassName="!bg-[#843bea] rounded-[18px]"
            // defaultTab="meme"
            onTabChange={handleTabChange}
            tabsTriggerClassName={cn('px-[14px] !w-auto !text-[14px]')}
            tabsTriggerActiveClassName="!text-primary font-semibold"
            tabsTriggerInactiveClassName="!text-[#CACACA] font-normal"
            // tabsTriggerActiveClassName="app-font-medium"
          />
          <AppHeaderRight showNotifications={showNotifications} />
          {/* {!activeWallet.isConnected && <MobileSwitchChains iconRight="/images/icons/arrow-down2.svg" />} */}
          {!activeWallet.isConnected && <Button variant="glassLiquid">{t('futuresDetails.loginAuth.connect')}</Button>}
          {/* {pathname !== APP_PATH.FUTURES_DISCOVER ? (
        ) : (
          <Notification />
        )} */}
          {/* {chain === TYPE_CHAIN.SOLANA && <WalletSolanaConnectModal />} */}
        </Container>
      </header>
    </>
  )
}

export default Header
