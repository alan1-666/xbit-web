import { cn } from '@/lib/utils.ts'
import { formatNumberWithCommas, removeFormatting } from '@/utils/helpers'
import { Button } from '@components/ui/button.tsx'
import React, { DetailedHTMLProps, InputHTMLAttributes, useEffect, useRef, useState } from 'react'


interface InputControl {
  placeholder?: string
  value: string
  unit?: string
  inputClassName?: string
  inputWrapperClassName?: string
  minusBtnClassName?: string
  plusBtnClassName?: string
  onChange?: (value: string) => void
  colorBg?: string
  inputProps?: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
  onMinus?: () => void
  onPlus?: () => void
  formatThousands?: boolean
  showPercentageTooltip?: boolean // 是否显示百分比悬浮提示
  percentageValue?: number // 百分比值
  decimalPlaces?: number //小数位数
  onlyPositiveInteger?: boolean
  validateInput?: boolean
}

const InputControl = ({
  placeholder,
  inputClassName,
  inputWrapperClassName,
  minusBtnClassName,
  plusBtnClassName,
  unit,
  value,
  onChange,
  inputProps,
  colorBg,
  onMinus,
  onPlus,
  formatThousands = false,
  showPercentageTooltip = false,
  percentageValue = 0,
  decimalPlaces,
  onlyPositiveInteger = true,
  validateInput = true
}: InputControl) => {
  const [isFocus, setFocus] = useState<boolean>(false)
  const [isAnimating, setIsAnimating] = useState<boolean>(false)
  const shouldFormatThousands = formatThousands && inputProps?.type !== 'number'
  const [inputValue, setInputValue] = useState<string>(shouldFormatThousands && value ? formatNumberWithCommas(value) : value || '')
  const inputRef = useRef<HTMLInputElement>(null)
  const prevValueRef = useRef<string>(value)

  // 同步外部 value 到内部状态
  useEffect(() => {
    if (value !== prevValueRef.current) {
      setInputValue(shouldFormatThousands && value ? formatNumberWithCommas(value) : value || '')
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 150);
      prevValueRef.current = value;
      return () => clearTimeout(timer);
    }
  }, [value, shouldFormatThousands]);

  const handleFocus = () => {
    inputRef?.current?.focus()
    setFocus(true)
  }



  const handleMinus = () => {
    // 直接聚焦输入框，不通过 handleFocus 避免状态变化
    // inputRef.current?.focus()
    setIsAnimating(true)
    onMinus?.()
    setTimeout(() => setIsAnimating(false), 150)
  }

  const handlePlus = () => {
    // 直接聚焦输入框，不通过 handleFocus 避免状态变化
    // inputRef.current?.focus()
    setIsAnimating(true)
    onPlus?.()
    setTimeout(() => setIsAnimating(false), 150)
  }

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = event.target.value

    const cleanValue = removeFormatting(inputVal)

    // 校验：不能超过12位数字（包含小数点）
    if (cleanValue.length > 12) {
      return
    }
    let isValueInput
    if (!validateInput && onChange) {
      onChange(cleanValue)
    } else {
      isValueInput = onlyPositiveInteger
        ? /^(0|[1-9][0-9]*)(\.[0-9]*)?$|^$/
        : /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$|^-?\.[0-9]*$|^-?$|^$/;
    }

    if (isValueInput.test(cleanValue)) {
      if (onChange) {
        onChange(cleanValue)
      }
    }
  }

  // 在失去焦点时格式化显示
  const handleBlur = () => {
    setFocus(false)
    if (shouldFormatThousands && value) {
      setInputValue(formatNumberWithCommas(value))
    }
  }


  // 格式化百分比显示
  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(2)}%`
  }

  return (
    <div
      className={cn(
        'rounded-[6px] relative h-[40px] px-[1.5px] py-[1px] mb-3 ', inputWrapperClassName,
        isFocus && 'gradient-border-focus',
      )}
    >
      <div className={cn('absolute inset-[1px] rounded-[6px] z-0 border-[#79778C29] border ', colorBg)} />
      <div className="flex items-center justify-between gap-0 relative z-1 h-full">
        <Button
          onClick={handleMinus}
          className={cn("w-[22px] min-w-[22px] p-0 bg-none rounded-[6px] bg-transparent flex items-center justify-center z-10", minusBtnClassName)}
        >
          <img src="/images/orderForm/icon-minus.svg" className="w-[14px] min-w-[14px]" alt="" />
        </Button>
        <div className="max-w-[calc(100%-102px)] min-w-[auto] flex-1 flex justify-center">
          <div className="relative">
            {/* 百分比显示 */}
            {showPercentageTooltip && isFocus && (
              <span
                className={cn(
                  //                   background: linear-gradient(43.83deg, #9C2CFF 0%, #FF5EFF 103.57%);
                  // linear-gradient(43.83deg, color(display-p3 0.565 0.208 1.000) 0%, color(display-p3 0.933 0.412 1.000) 103.57%);

                  "absolute top-0 left-[50%] translate-y-[-30px] translate-x-[-50%] bg-[linear-gradient(30deg,#9035FF_0%,#EE69FF_100%)] text-white leading-[1] inline-block px-[4.5px] py-[1px] text-[calc(1rem*(11/16))] rounded-[2px] pointer-events-none app-font-medium shadow-lg",
                )}
              >
                {formatPercentage(percentageValue)}
                <span className="absolute top-full left-[50%] translate-x-[-50%] w-[8px] h-[4px] bg-gradient-to-r from-[#9035FF] to-[#EE69FF]"
                  style={{
                    clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)'
                  }}>
                </span>
              </span>
            )}

            {isFocus && (
              <div className="text-[calc(1rem*(10/16))] text-center leading-[calc(1rem*(10/16))] text-[#FFFFFF5C]">
                {placeholder}
              </div>
            )}
            <input
              ref={inputRef}
              {...inputProps}
              value={inputValue}
              onChange={(event) => handleValueChange(event)}
              placeholder={placeholder}
              className={cn(
                'placeholder:text-[calc(14rem/16)] font-bold focus:placeholder-transparent app-font-regular text-[#FFFFFF] text-center placeholder:text-[#FFFFFFCC] text-[calc(1rem*(15/16))] leading-[1] outline-0',
                // isAnimating && 'scale-103 transition-transform duration-150',
                isAnimating && 'number-change-animation',
                inputClassName,
              )}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>
        </div>

        <Button
          onClick={handlePlus}
          className={cn("w-[22px] min-w-[22px] p-0 bg-none rounded-[6px] bg-transparent flex items-center justify-center", plusBtnClassName)}
        >
          <img src="/images/orderForm/icon-plus.svg" className="w-[14px] min-w-[14px]" alt="" />
        </Button>
      </div>
    </div>
  )
}

export default InputControl
