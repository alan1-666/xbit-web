import React, { ChangeEvent, HTMLProps, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils.ts'

interface InputUnitProps {
  label?: string
  unit?: string
  placeholder?: string
  unitClassName?: string
  type?: React.HTMLInputTypeAttribute
  className?: string
  inputWrapperClassName?: string
  containerClassName?: string
  onFocus?: (params?: any) => any
  onBlur?: (params?: any) => any
  onChange?: (params?: any) => any
  inputProps?: HTMLProps<HTMLInputElement>
}

const containerClassNameNormal = ['bg-[#ECECED0A]']
const containerClassNameFocus = ['bg-[#c8a7fd]']

// const labelClassNameNormal = ['text-[calc(1rem*(15/16))]', 'text-[#FFFFFFCC]']
// const labelClassNameCollapse = ['text-[calc(1rem*(9/16))]', 'text-[#FFFFFF5C]']

/**
 * InputUnit component provides an input field with a floating label and unit display
 * Used for numerical inputs that have an associated unit (like currency or tokens)
 * @param {string} label - The label text to display
 * @param {string} [unit] - The unit text to display after the input (e.g. "ETH", "BTC")
 * @param {object} [inputProps] - Props to spread to the input element
 * @param {string} [placeholder] - Placeholder text for the input
 * @param {string} [unitClassName] - Additional CSS classes for the unit text
 * @param {boolean} [isCenterText] - Whether to center the input text
 */
const InputUnit: React.FC<InputUnitProps> = ({
  label,
  unit,
  unitClassName,
  type = "text",
  onBlur,
  onFocus,
  onChange,
  className,
  containerClassName,
  inputProps,
  inputWrapperClassName
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  //hasValue
  const [_, setHasValue] = useState(
    inputProps?.defaultValue ? inputProps.defaultValue.toString().length > 0 : false
  )

  // Update hasValue when defaultValue changes
  useEffect(() => {
    const value = inputProps?.defaultValue?.toString() || ''
    setHasValue(value.length > 0)
  }, [inputProps?.defaultValue])

  // Check if input has value on mount
  useEffect(() => {
    if (inputRef.current) {
      setHasValue(inputRef.current.value.length > 0)
    }
  }, [])

  // Handle global focus tracking for portal context (Shadcn drawer)
  useEffect(() => {
    const handleDocumentFocus = () => {
      if (inputRef.current === document.activeElement) {
        setIsFocused(true)
      } else {
        setIsFocused(false)
      }
    }

    // Check focus on mount and whenever active element changes
    handleDocumentFocus()
    
    document.addEventListener('focusin', handleDocumentFocus)
    document.addEventListener('focusout', handleDocumentFocus)
    
    return () => {
      document.removeEventListener('focusin', handleDocumentFocus)
      document.removeEventListener('focusout', handleDocumentFocus)
    }
  }, [])

  const handleFocus = () => {
    setIsFocused(true)
    onFocus?.()
  }

  const handleBlur = () => {
    // Use a timeout to ensure we're checking after any focus changes have settled
    setTimeout(() => {
      if (inputRef.current !== document.activeElement) {
        setIsFocused(false)
      }
    }, 0)
    
    onBlur?.()
    
    if (inputRef.current) {
      setHasValue(inputRef.current.value.length > 0)
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value.length > 0)
    
    // Call the original onChange passed as prop
    onChange?.(e)
    
    // Call the original onChange if it exists in inputProps
    if (inputProps?.onChange) {
      inputProps.onChange(e as any)
    }
  }

  // Determine if label should be collapsed
  // const isLabelCollapsed = isFocused || hasValue
  
  // Determine container style
  const containerStyle = isFocused ? containerClassNameFocus : containerClassNameNormal

  return (
    <div
      className={cn(
        "h-[48px] rounded-[10px] relative after:content-[''] border-[0.5px] border-[#444455] bg-[#2b2b33] after:absolute after:inset-[1px] after:bg-[#2b2b33] after:rounded-[10px] after:z-0 after:pointer-events-none",
        containerStyle.join(' '),
        containerClassName,
      )}
    >
      <div className={cn("flex items-center gap-[12px] px-[12px] py-[4px] relative z-1 h-full", inputWrapperClassName)}>
        <div
          className="relative flex-1 h-full cursor-text"
          onClick={() => {
            inputRef?.current?.focus()
            setIsFocused(true)
          }}
        >
          {/* TODO: enable this */}
          {/* {label && (
            <div
              className={cn(
                'leading-none absolute top-0 left-0 translate-y-[70%] pointer-events-none transition-all duration-200',
                isLabelCollapsed ? labelClassNameCollapse.join(' ') : labelClassNameNormal.join(' ')
              )}
            >
              {label}
            </div>
          )} */}
          <input
            type={type}
            ref={inputRef}
            onBlur={handleBlur}
            onFocus={handleFocus}
            onChange={handleChange}
            className={cn(
              // 'outline-none text-[calc(1rem*(14/16))] text-[#00FFB4] leading-none absolute left-0 bottom-[3.5px] right-0', // TODO: enable this
              'outline-none text-[calc(1rem*(14/16))] text-white leading-none h-full w-full placeholder:text-[#FFFFFFCC]', // TODO: remove this
              className,
            )}
            placeholder={label} // TODO: remove this
            {...inputProps}
          />
        </div>
        {unit && (
          <div className={cn('text-[calc(1rem*(14/16))] text-[#FFFFFFCC] leading-none', unitClassName)}>{unit}</div>
        )}
      </div>
    </div>
  )
}

export default InputUnit
