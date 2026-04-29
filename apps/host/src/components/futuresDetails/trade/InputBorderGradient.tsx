import { cn } from '@/lib/utils.ts'
import { formatNumberWithCommas, removeFormatting } from '@/utils/helpers'

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  DetailedHTMLProps,
  InputHTMLAttributes,
  ReactNode,
} from 'react'
import { useResponsive } from '@/hooks/useResponsive'


// 添加 CSS 动画样式
const slideUpAnimation = `
  @keyframes slideUpFadeIn {
    0% {
      transform: translateY(8px);
      opacity: 0;
    }
    100% {
      transform: translateY(0px);
      opacity: 1;
    }
  }
`

// 将样式注入到页面中
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style')
  styleElement.textContent = slideUpAnimation
  if (!document.head.querySelector('style[data-slide-up-animation]')) {
    styleElement.setAttribute('data-slide-up-animation', 'true')
    document.head.appendChild(styleElement)
  }
}

type InputBorderGradientProps = {
  placeholder?: string
  unit?: string | ReactNode
  containerClassName?: string
  innerBgClassName?: string
  unitClassName?: string
  inputClassName?: string
  inputWrapperClassName?: string
  readonly?: boolean
  readonlyLabel?: string
  value?: string
  inputProps?: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
  onFocus?: () => void
  onBlur?: () => void
  onChange?: (value: string) => void
  formatThousands?: boolean
  onlyPositiveInteger?: boolean
  customRegex?: RegExp
}

export type InputBorderGradientRef = {
  focus: () => void
  blur: () => void
}

const isValidDecimalInput = (value: string) => {
  if (
    value === '' ||
    value === '0' ||
    value === '.' ||
    value === '0.' ||
    /^[0-9]*\.?[0-9]*$/.test(value)
  ) {
    return value.split('.').length <= 2
  }
  return false
}

const InputBorderGradient = forwardRef<InputBorderGradientRef, InputBorderGradientProps>(
  (
    {
      placeholder,
      unit,
      containerClassName,
      innerBgClassName,
      inputClassName,
      inputWrapperClassName,
      unitClassName,
      readonly = false,
      readonlyLabel,
      value,
      inputProps = {},
      onFocus,
      onBlur,
      onChange,
      formatThousands = false,
      onlyPositiveInteger = true,
      customRegex
    },
    ref
  ) => {
    const [isFocus, setFocus] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const { isDesktop } = useResponsive()

    const handleFocus = () => {
      setFocus(true)
      onFocus?.()
    }

    const handleBlur = () => {
      setFocus(false)
      onBlur?.()
    }

    // 点击容器时聚焦到输入框
    const handleContainerClick = () => {
      if (inputRef.current && !inputProps.disabled && !readonly) {
        inputRef.current.focus()
      }
    }

    const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {

      let inputVal = event.target.value

      inputVal = inputVal.replace(/[。．｡]/g, '.')

      const cleanValue = removeFormatting(inputVal)
      // 校验：不能超过12位数字（包含小数点）
      if (cleanValue.length > 12) {
        return
      }


      let isValueInput: boolean

      if (customRegex) {
        isValueInput = customRegex.test(cleanValue) || cleanValue === ""
      } else {
        const regex = onlyPositiveInteger
          ? /^(?:$|(?:0|[1-9]\d*)(?:\.\d*)?|\.\d+)$/
        : /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$|^-?\.[0-9]*$|^-?$|^$/
        isValueInput = regex.test(cleanValue)
      }

      if (isValueInput && onChange) {
        onChange(cleanValue)
      }
    }

    const showFloatingLabel = !readonly && (isFocus || value)
    const showReadonly = readonly && readonlyLabel !== undefined
    const displayValue = formatThousands && value ? formatNumberWithCommas(value) : value

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus()
      },
      blur: () => {
        inputRef.current?.blur()
      },
    }))

    return (
      <div
        className={cn(
          `relative  py-1 px-2 flex items-center  rounded-[4px] after:content-[""] after:border-[0.5px] after:border-[#302E38] after:absolute after:inset-[1px] after:rounded-[4px] after:z-0 after:pointer-events-none
            ${isDesktop ? 'h-[48px]' : 'h-[40px]'}
          `,
          isFocus && 'purple-input-border-focus',
          inputProps.disabled && 'opacity-50 cursor-not-allowed',
          !inputProps.disabled && !readonly && 'cursor-text', // 添加文本光标样式
          containerClassName,
        )}
        // onClick={handleContainerClick} // 添加点击事件
      >
        <div className={cn(`absolute inset-[1px] bg-[#1F1E25] rounded-[4px] z-0`, 
          innerBgClassName)} />

        <div className="flex items-center justify-between gap-[10px] relative z-1 w-full">
          <div className={cn('flex-1 max-w-[calc(100%-50px)]', inputWrapperClassName)}>
            {showFloatingLabel && (
              <div
                className="text-[10px] leading-[10px] text-[#FFFFFF5C] transition-all duration-300 ease-out"
                style={{
                  transform: 'translateY(0px)',
                  opacity: 1,
                  animation: 'slideUpFadeIn 300ms ease-out'
                }}
              >
                {placeholder}
              </div>
            )}
            {showReadonly ? (
              <div className="text-[14px] leading-[14px] text-white">{readonlyLabel}</div>
            ) : (
              <input
                {...inputProps}
                ref={inputRef}
                value={displayValue}
                placeholder={placeholder}
                readOnly={readonly}
                className={cn(
                  'app-font-regular text-[#FFFFFF] focus:placeholder-transparent placeholder:text-[14px] placeholder:text-[#FFFFFF80] text-[14px] w-full leading-[1] outline-0 bg-transparent',
                  inputClassName,
                )}
                onChange={handleValueChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            )}
          </div>

          {unit && (
            <span
              className={cn(
                'app-font-regular text-[12px] flex items-center text-center',
                isFocus ? 'text-white' : 'text-[#FFFFFF5C]',
                unitClassName,
              )}
            >
              {unit}
            </span>
          )}
        </div>
      </div>
    )
  }
)

export default InputBorderGradient
