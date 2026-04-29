import { Button, ButtonProps } from '@components/ui/button.tsx'
import { cn } from '@/lib/utils.ts'
// import TooltipTag from '@components/common/TooltipTag.tsx'
import { Ref } from 'react'
import { useResponsive } from '@/hooks/useResponsive'

export type ButtonGreen = ButtonProps & {
  isLoggedIn?: boolean
  toolTip?: string
  tooltipVariant?: 'normal' | 'gradient'
  ref?: Ref<HTMLButtonElement>
  buttonChildrenClass?: string
}

const ButtonGreen = ({ isLoggedIn, toolTip, tooltipVariant, className, buttonChildrenClass, children, ...rest }: ButtonGreen) => {
  const { isDesktop } = useResponsive()
  
  return (
    isDesktop ? 
    <Button className={cn('text-white shadow-sm', className)} {...rest}>
      <div className={buttonChildrenClass}>{children}</div>
    </Button>
    :<Button className={cn('text-white shadow-sm', className)} {...rest}>
      <div className={buttonChildrenClass}>{children}</div>
    </Button>
  )
}

export default ButtonGreen
