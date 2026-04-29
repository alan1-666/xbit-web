import { useResponsive } from '@/hooks/useResponsive'
import React, { Suspense } from 'react'
import IntegralMultiplierDialog from './desktop/IntegralMultiplierDialog'
import IntegralMultiplierDrawer from './mobile/IntegralMultiplierDrawer'

export interface IntegralMultiplierPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const IntegralMultiplierPopup = (props: IntegralMultiplierPopupProps) => {
  const { isDesktop } = useResponsive()
  const Component = isDesktop ? IntegralMultiplierDialog : IntegralMultiplierDrawer
  return (
    <Suspense fallback={null}>
      <Component {...props} />
    </Suspense>
  )
}

export default IntegralMultiplierPopup
