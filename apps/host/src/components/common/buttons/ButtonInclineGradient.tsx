import { Button, ButtonProps } from '@components/ui/button.tsx'
import { cn } from '@/lib/utils.ts'
import TooltipTag from '@components/common/TooltipTag.tsx'

export type ButtonGradientProps = ButtonProps & {
  isLoggedIn?: boolean;
  toolTip?: string;
  tooltipVariant?: 'normal' | 'gradient';
}

const ButtonGradient = ({isLoggedIn, toolTip, tooltipVariant, className, children, ...rest}: ButtonGradientProps) => {
  return (
    <Button
      className={cn(
        'btn-gradient',
        className,
      )}
      {...rest}
    >
      {children}
      {
        toolTip && (
          <TooltipTag variant={tooltipVariant}>{toolTip}</TooltipTag>
        )
      }
    </Button>
  )
}

export default ButtonGradient