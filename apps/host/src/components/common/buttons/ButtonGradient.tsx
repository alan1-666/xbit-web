import { Button, ButtonProps } from '@components/ui/button.tsx'
import { cn } from '@/lib/utils.ts'
import TooltipTag from '@components/common/TooltipTag.tsx'
import { Ref } from 'react'

export type ButtonGradientProps = ButtonProps & {
  isLoggedIn?: boolean
  toolTip?: string
  tooltipVariant?: 'normal' | 'gradient'
  ref?: Ref<HTMLButtonElement>
}

const ButtonGradient = ({ isLoggedIn, toolTip, tooltipVariant, className, children, ...rest }: ButtonGradientProps) => {
  return (
    <Button className={cn('purple-btn-gradient !text-white', className)} {...rest}>
      {children}
      {toolTip && <TooltipTag variant={tooltipVariant}>{toolTip}</TooltipTag>}
    </Button>
  )
}

export default ButtonGradient
