import React from 'react'
import { cn } from '@/lib/utils'

export interface CheckboxProps {
  id: string
  name?: string
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  className?: string
  labelClassName?: string
  disabled?: boolean
}

/**
 * Custom Checkbox component with custom SVG design
 */
export const Checkbox: React.FC<CheckboxProps> = ({ 
  id, 
  name, 
  checked, 
  onChange, 
  label,
  className = '',
  labelClassName = '',
  disabled = false
}) => {
  return (
    <label htmlFor={id} className={cn("flex items-center gap-2 cursor-pointer", disabled && "opacity-50 cursor-not-allowed", className)}>
      <input
        id={id}
        type="checkbox"
        name={name}
        checked={checked}
        onChange={() => !disabled && onChange(!checked)}
        className="sr-only" // Hidden input for accessibility
      />
      <span className="inline-flex items-center justify-center">
        {checked ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.74935 13.2709H5.24935C2.08185 13.2709 0.728516 11.9176 0.728516 8.75008V5.25008C0.728516 2.08258 2.08185 0.729248 5.24935 0.729248H8.74935C11.9168 0.729248 13.2702 2.08258 13.2702 5.25008V8.75008C13.2702 11.9176 11.9168 13.2709 8.74935 13.2709ZM5.24935 1.60425C2.56018 1.60425 1.60352 2.56091 1.60352 5.25008V8.75008C1.60352 11.4392 2.56018 12.3959 5.24935 12.3959H8.74935C11.4385 12.3959 12.3952 11.4392 12.3952 8.75008V5.25008C12.3952 2.56091 11.4385 1.60425 8.74935 1.60425H5.24935Z" fill="#00FFB4"/>
            <path d="M6.17086 9.08851C6.05419 9.08851 5.94336 9.04185 5.86169 8.96018L4.21086 7.30935C4.04169 7.14018 4.04169 6.86018 4.21086 6.69101C4.38003 6.52185 4.66003 6.52185 4.82919 6.69101L6.17086 8.03268L9.16919 5.03435C9.33836 4.86518 9.61836 4.86518 9.78753 5.03435C9.95669 5.20351 9.95669 5.48351 9.78753 5.65268L6.48003 8.96018C6.39836 9.04185 6.28753 9.08851 6.17086 9.08851Z" fill="#00FFB4"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.74935 13.2709H5.24935C2.08185 13.2709 0.728516 11.9176 0.728516 8.75008V5.25008C0.728516 2.08258 2.08185 0.729248 5.24935 0.729248H8.74935C11.9168 0.729248 13.2702 2.08258 13.2702 5.25008V8.75008C13.2702 11.9176 11.9168 13.2709 8.74935 13.2709ZM5.24935 1.60425C2.56018 1.60425 1.60352 2.56091 1.60352 5.25008V8.75008C1.60352 11.4392 2.56018 12.3959 5.24935 12.3959H8.74935C11.4385 12.3959 12.3952 11.4392 12.3952 8.75008V5.25008C12.3952 2.56091 11.4385 1.60425 8.74935 1.60425H5.24935Z" fill="#747474"/>
          </svg>
        )}
      </span>
      {label && <span className={cn("text-sm", labelClassName)}>{label}</span>}
    </label>
  )
}

export default Checkbox 