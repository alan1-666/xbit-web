import { IconRadioChecked, IconRadioUnchecked } from '@/components/icon'
import { cn } from '@/lib/utils'
import { FC } from 'react'

export interface RadioProps {
  id: string
  name: string
  value: string
  checked: boolean
  onChange: (value: string) => void
  label: string
  className?: string
  labelClassName?: string
  labelClassNameActive?: string
  pcMode?: boolean
}

/**
 * Custom Radio component with custom SVG design
 */
export const Radio: FC<RadioProps> = ({
  id,
  name,
  value,
  checked,
  onChange,
  label,
  className = '',
  labelClassName = '',
  labelClassNameActive = '',
  pcMode = false
}) => {
  return (
    <label htmlFor={id} className={cn("flex items-center gap-2 cursor-pointer", className)}>
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className={cn("sr-only")}
      />
      {
        !pcMode ? (
          <span className="inline-flex items-center justify-center">
            {checked ? (
              <IconRadioChecked />
            ) : (
              <IconRadioUnchecked />
            )}
          </span>
        ) : null
      }
      <span className={cn("text-sm text-white", labelClassName, checked && labelClassNameActive)}>{label}</span>
    </label>
  )
}

export default Radio
