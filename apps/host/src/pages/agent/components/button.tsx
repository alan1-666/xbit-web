import React from 'react'
import { Button as UIButton } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'purple'
  size?: 'default' | 'sm'
  children: React.ReactNode
  className?: string
}

const PrimaryButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ variant = 'default', size = 'default', className, children, ...props }, ref) => {
    const baseStyles = 'font-medium transition-all duration-200'
    
    const variantStyles = {
      default: 'w-full bg-x-gradient hover:opacity-90 text-white py-4 rounded-4xl text-lg shadow-lg',
      purple: 'purple-btn-gradient !text-white flex items-center justify-center gap-0.5 hover:scale-105 transition-transform duration-200'
    }
    
    const sizeStyles = {
      default: variant === 'purple' ? 'h-6 min-w-[52px] px-2 rounded-full text-base font-[450]' : '',
      sm: 'h-6 min-w-[52px] px-2 rounded-full text-xs font-[450]'
    }
    
    return (
      <UIButton
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </UIButton>
    )
  }
)

PrimaryButton.displayName = 'PrimaryButton'

export { PrimaryButton }