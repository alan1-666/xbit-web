import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { HTMLProps, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface InputPriceProps {
  label?: string
  onFocus?: (params?: any) => any
  onBlur?: (params?: any) => any
  onPlus?: (params?: any) => any
  onMinus?: (params?: any) => any
  inputProps?: HTMLProps<HTMLInputElement>
  containerClassName?: string
}

const containerClassNameNormal = ['bg-[#ECECED0A]']
const containerClassNameFocus = ['bg-[#c8a7fd]']

const labelClassNameNormal = ['text-[calc(1rem*(15/16))]', 'text-[#FFFFFFCC]']
const labelClassNameCollapse = ['text-[calc(1rem*(9/16))]', 'text-[#FFFFFF5C]']

/**
 * InputPrice component provides a specialized input field for price values
 * Features a floating label that collapses when the input has a value or is focused
 * @param {string} label - The label text to display
 * @param {object} [inputProps] - Props to spread to the input element
 */
const InputPrice: React.FC<InputPriceProps> = ({
  label,
  onFocus,
  onBlur,
  onPlus,
  onMinus,
  inputProps,
  containerClassName,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(
    inputProps?.defaultValue ? inputProps.defaultValue.toString().length > 0 : false,
  )
  const { t } = useTranslation()

  const labelType = useMemo(() => {
    if (label?.toLowerCase().includes('price')) {
      return 'orderForm.form.price'
    }
    return 'orderBook.marketCap'
  }, [label])

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value.length > 0)

    // Call the original onChange if it exists in inputProps
    if (inputProps?.onChange) {
      inputProps.onChange(e as any)
    }
  }

  // Determine container style based on focus state
  const containerStyle = isFocused ? containerClassNameFocus : containerClassNameNormal

  // Determine if label should be collapsed
  const isLabelCollapsed = isFocused || hasValue

  return (
    <div
      className={cn(
        "h-[48px] rounded-[10px] relative after:content-[''] border-[0.5px] border-[#444455] bg-[#2b2b33] after:absolute after:inset-[1px] after:bg-[#2b2b33] after:rounded-[10px] after:z-0 after:pointer-events-none",
        containerStyle.join(' '),
        containerClassName ? containerClassName : '',
      )}
    >
      <div className="flex items-center gap-[12px] px-[12px] py-[4px] relative z-1 h-full">
        <div
          className="relative flex-1 h-full cursor-text"
          onClick={() => {
            inputRef.current?.focus()
            setIsFocused(true)
          }}
        >
          {/* TODO: enable this */}
          {/* {label && (
            <div
              className={cn(
                'text-[calc(1rem*(15/16))] text-[#FFFFFFCC] leading-none absolute top-0 left-0 translate-y-[70%] pointer-events-none transition-all duration-200',
                isLabelCollapsed ? labelClassNameCollapse.join(' ') : labelClassNameNormal.join(' ')
              )}
            >
              {label}
            </div>
          )} */}
          <input
            ref={inputRef}
            type="text"
            autoFocus={true}
            // className="outline-none text-[calc(1rem*(14/16))] text-[#00FFB4] leading-none absolute left-0 bottom-[3.5px] right-0" // TODO: enable this
            className="outline-none text-[calc(1rem*(14/16))] text-white leading-none h-full w-full placeholder:text-[#FFFFFFCC]" // TODO: remove this
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={label} // TODO: remove this
            {...inputProps}
          />
        </div>
        <div className="flex gap-6">
          <Button
            className="w-[32px] h-[40px] p-0 rounded-[4px] bg-transparent flex items-center justify-center transform-all duration-100 hover:scale-[1.05]"
            onClick={onMinus}
          >
            <img src="/images/orderForm/icon-new-minus.svg" className="w-[17px] min-w-[17px] h-[17px]" alt="" />
          </Button>
          <Button
            className="w-[32px] h-[40px] p-0 rounded-[4px] bg-transparent flex items-center justify-center transform-all duration-100 hover:scale-[1.05]"
            onClick={onPlus}
          >
            <img src="/images/orderForm/icon-new-plus.svg" className="w-[17px] min-w-[17px] h-[17px]" alt="" />
          </Button>
        </div>
        {/* <div className="flex items-center gap-[6px] cursor-not-allowed">
          <div className="text-[calc(1rem*(14/16))] text-[#FFFFFFCC] leading-none">{t(labelType)}</div>
          <img src="/images/orderForm/icon-dropdown.svg" className="w-[8.42px] h-[5.14px]" alt="" />
        </div> */}
      </div>
    </div>
  )
}

export default InputPrice
