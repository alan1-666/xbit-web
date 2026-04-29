import { cn } from '@/lib/utils'
import { Button, ButtonProps } from '@components/ui/button.tsx'
import React, { FC } from 'react'
import TooltipTag from '../TooltipTag'

export type ButtonShadowGradientProps = ButtonProps & {
  isLoggedIn?: boolean
  toolTip?: string
  tooltipVariant?: 'normal' | 'gradient'
}
const ButtonShadowGradient: FC<ButtonShadowGradientProps> = ({
  isLoggedIn,
  toolTip,
  tooltipVariant,
  className,
  children,
  ...rest
}) => {
  const isDisabled = rest.disabled
  return (
    <Button
      variant="gradient"
      className={cn(
        isDisabled ? 'opacity-50 text-[#FFFFFFB2] bg-cover bg-center' : '',
        className,
      )}
      {...rest}
    >
      {children}
      {toolTip && <TooltipTag variant={tooltipVariant}>{toolTip}</TooltipTag>}
    </Button>
  )
}

export default ButtonShadowGradient
