import { PageWrapperProps, wrapper } from '@components/wrapper.tsx'
import { Route } from 'react-router-dom'
import React from 'react'
import { useResponsive } from '@hooks/hyperliquid/useResponsive.ts'
import { useAppSelector } from '@/redux/store'

type AppRouteProps = {
  path: string
  element: React.ReactNode
} & PageWrapperProps

export const ResponsiveRoute = (props: AppRouteProps) => {
  const { path, ...route } = props
  const { isDesktop } = useResponsive()

  const headerTab = useAppSelector((state) => state.router.headerTab)
  const isDex = headerTab === 'crypto'

  if (isDesktop) {
    return (
      <Route
        key={path}
        path={path.startsWith('/') ? path.replace('/', '') : path}
        {...route}
        element={wrapper({
          children: route.element,
          showHeader: false,
          isWebview: false,
          isShowFooter: false,
          fullscreen: true,
          isScrollable: false,
        })}
      />
    )
  }
  return (
    <Route
      key={path}
      path={path.startsWith('/') ? path.replace('/', '') : path}
      {...route}
      element={wrapper({
        children: route.element,
        showHeader: route?.showHeader,
        isWebview: route?.isWebview,
        isHorizontalFlip: route?.isHorizontalFlip,
        isShowFooter: route?.isShowFooter,
        isShowBackgroundImage: route?.isShowBackgroundImage,
        isDex: isDex,
        showNotifications: route?.showNotifications,
        isScrollable: route?.isScrollable,
        footerWithNonePadding: route?.footerWithNonePadding,
        isXStock: route?.isXStock,
        fullscreen: route.fullscreen,
      })}
    />
  )
}
