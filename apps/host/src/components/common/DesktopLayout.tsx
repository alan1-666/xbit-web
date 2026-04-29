import { HTMLAttributes, useMemo } from 'react'
import { cn } from '@/lib/utils.ts'
import { TopBar } from '@components/v2/desktop/TopBar.tsx'
import { BottomBar } from '@components/v2/desktop/BottomBar.tsx'
import { NavigationTabs } from '@components/v2/desktop/NavigationTabs.tsx'
import { useLocation } from 'react-router-dom'
import { APP_PATH } from '@/lib/constant.ts'
import { useShouldShowTopBar } from '@pages/meme/discover/desktop/hooks/useShouldShowTopBar.ts'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { MaintenanceNotification } from '../maintenance/MaintenanceNotification'
import { MaintenanceNotificationBackground } from '../maintenance/MaintenanceNotificationBackground'
import { MaintenanceWarning } from '../maintenance/MaintenanceWarning'
import { selectShouldShowMaintenanceNotification } from '@/redux/modules/maintenance.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { homeActions } from '@/redux/modules/home.slice'
import { HeaderPCV3 } from '@components/PC/Header/HeaderPCV3.tsx'
import useIsMemeDetailPage from '@hooks/detail/useIsMemeDetailPage.ts'

export interface DesktopLayoutProps extends HTMLAttributes<HTMLDivElement> {}

export const DesktopLayout = (props: DesktopLayoutProps) => {
  const { className, children, ...rest } = props
  const location = useLocation()
  const dispatch = useAppDispatch()
  const shouldShowTopBar = useShouldShowTopBar()
  const activeWallet = useSelector(_activeWallet)
  const isShowMaintenanceNotification = useAppSelector(selectShouldShowMaintenanceNotification)
  const shouldShowNavigationTabs = useMemo(() => {
    const pathname = location.pathname
    return (
      pathname.includes(APP_PATH.MEME_DISCOVER) ||
      pathname === APP_PATH.MEME_SMART_MONEY ||
      pathname === APP_PATH.MEME_MONITORING
    )
  }, [location])

  const hideTopbar = useMemo(() => {
    const pathname = location.pathname
    return pathname.includes('/assets')
  }, [location])

  const isTopBarShown = shouldShowTopBar && !hideTopbar
  const isNavigationTabsShown = shouldShowNavigationTabs
  const isMemeDetailPage = useIsMemeDetailPage()

  // const isHidenHeaderFooter = useMemo(() => !activeWallet.isConnected && hideTopbar, [activeWallet, hideTopbar])

  const padding = useMemo(() => {
    if (isTopBarShown && isNavigationTabsShown) return 'pt-[154px]' // both shown
    if (isNavigationTabsShown && !isTopBarShown) return 'pt-[118px]' // only navigation tabs shown
    if (!isNavigationTabsShown && isTopBarShown) return 'pt-[98px]' // only top bar shown
    return 'pt-[60px]'
  }, [isTopBarShown, isNavigationTabsShown])

  return (
    <div className={cn('h-screen flex flex-col min-h-0', className)} {...rest}>
      <div className="fixed top-0 w-full z-10">
        <MaintenanceNotification />
        <MaintenanceWarning />
      </div>
      <MaintenanceNotificationBackground />
      <div className="fixed inset-x-0 bg-[#121214] z-10">
        <HeaderPCV3 />
        {shouldShowTopBar && !hideTopbar ? <TopBar /> : null}
        {shouldShowNavigationTabs && <NavigationTabs />}
      </div>
      <div
        id="desktop-layout-content"
        className={cn(
          isMemeDetailPage ? 'overflow-y-hidden' : 'overflow-y-auto',
          isShowMaintenanceNotification ? 'h-[calc(100%-32px)]' : 'h-full',
          padding,
        )}
      >
        {children}
      </div>
      <BottomBar />
    </div>
  )
}
