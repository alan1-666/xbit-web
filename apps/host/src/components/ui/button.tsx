import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import LoadingSpinner from './loading-spinner'
import { ConfigStatus } from '@/@generated/gql/graphql-trading'
import { IconPause, IconPlay } from '../icon'
import { useTranslation } from 'react-i18next'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-[450] transition-colors transition-transform cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95 select-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        gradient: 'purple-btn-gradient !text-white',
        borderGradient: 'border-gradient text-white',
        borderGradientCard: 'border-gradient bottom-card',
        close: 'rounded-3xl bg-[#2B2B33]',
        disabled: 'btn-gradient-disabled !cursor-not-allowed !disabled:opacity-100',
        greyDefault: 'text-[#fff] bg-[#2B2B33] w-full rounded-[50px] h-[calc(1rem*(32/16))]',
        greenDefault:
          'text-white bg-linear-to-r from-[#01AC79] to-[#00FFB4] h-[calc(1rem*(32/16))] inset-shadow-cyan-500/50',
        purpleDefault: 'text-white  bg-[#843BEA] h-[calc(1rem*(32/16))] inset-shadow-cyan-500/50',
        redDefault:
          'text-white  bg-[linear-gradient(79.89deg,#FF465E,#FF467A)] h-[calc(1rem*(32/16))] inset-shadow-cyan-500/50',
        purpleBorderGradient: 'purple-border-gradient',
        purpleBg: 'bg-[#843BEA]',
        normal: 'bg-[#472468] rounded-[12px]',
        btnOpacity:
          'bg-[#3E2761] rounded-[12px] text-[#C8A7FD] px-[16px] rounded-[12px] relative transition-all duration-200 hover:bg-[#AF7FFA] hover:text-white h-[38px]',
        glassLiquid:
          'bg-white/10 border-[0.5px] border-white/10 rounded-[200px] min-h-[30px] px-4 py-2 text-white text-[14px] font-normal backdrop-blur-xl shadow-[inset_1px_1px_1px_rgba(255,255,255,0.3)]',
      },
      size: {
        default: 'h-9 px-4 py-2',
        xs: 'h-7 px-3.5',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
        'btm-card': '!min-w-[112px] h-7 text-[calc(1rem*(13/16))] font-normal text-center',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  loadingText?: string
  loadingSize?: number
  status?: keyof typeof ConfigStatus
  showStatusLabel?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      status,
      showStatusLabel = false,
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      loadingText,
      children,
      disabled,
      loadingSize,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <LoadingSpinner size={loadingSize} /> : status && <ButtonIcon status={status} />}
        {showStatusLabel && status && (
          <span className="flex-1">
            <ButtonLabel status={status} />
          </span>
        )}
        {isLoading && loadingText ? loadingText : children}
      </Comp>
    )
  },
)
Button.displayName = 'Button'

function ButtonIcon(props: Pick<ButtonProps, 'status'>) {
  const { status } = props
  switch (status) {
    case 'Active':
      return <IconPause className="!size-3" />
    case 'Canceled':
      return <IconPlay className="!size-3" />
    case 'Paused':
      return <IconPlay className="!size-3" />
    default:
      return
  }
}
function ButtonLabel(props: Pick<ButtonProps, 'status'>) {
  const { status } = props
  const { t } = useTranslation()
  switch (status) {
    case 'Active':
      return t('listCoin.copyTrade.copyTradePaused')
    case 'Canceled':
      return t('listCoin.copyTrade.copyTradeRestart')
    case 'Paused':
      return t('listCoin.copyTrade.copyTradeRestart')
    default:
      return
  }
}

export { Button, buttonVariants, ButtonIcon, ButtonLabel }
