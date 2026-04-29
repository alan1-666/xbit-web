import React from 'react'
import { cn } from '@/lib/utils'

export interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
  disabled?: boolean
}

/**
 * Switch component for toggling features
 */
export const Switch: React.FC<SwitchProps> = ({ 
  checked, 
  onChange, 
  className = '',
  disabled = false,
}) => {
  return (
    <div
      className={cn(
        "relative inline-block w-[44px] h-[22px] rounded-full cursor-pointer transition-colors", 
        checked ? 'bg-[#00FFB4]' : 'bg-[#141414]',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        className
      )}
      onClick={() => !disabled && onChange(!checked)}
    >
      <div
        className={cn(
          "absolute top-[2px] w-[18px] h-[18px] rounded-full transition-transform",
          checked ? 'bg-[#fff] transform translate-x-[24px]' : 'bg-[#9B9B9B] translate-x-[2px]'
        )}
      />
    </div>
  )
}

export default Switch 