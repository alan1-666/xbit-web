import { ReactNode } from 'react'
import { useResponsive } from '@hooks/hyperliquid/useResponsive.ts'
import { DesktopLayout } from '@components/common/DesktopLayout.tsx'
import { MobileLayout } from '@components/common/MobileLayout.tsx'
import useNetworkFeeSubcription from '@/components/mqtt/NetworkFeeSubcription.tsx'

export interface BaseLayoutProps {
  children: ReactNode
}

export const BaseLayout = (props: BaseLayoutProps) => {
  useNetworkFeeSubcription()
  const { children } = props
  const { isDesktop } = useResponsive()

  const Layout = isDesktop ? DesktopLayout : MobileLayout
  return (
    <Layout>
      {children}
    </Layout>
  )
}
