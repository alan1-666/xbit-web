import { cn } from '@/lib/utils.ts'
import { formatNumberWithCommas, removeFormatting } from '@/utils/helpers'
import {
  DetailedHTMLProps,
  InputHTMLAttributes,
  ReactNode,
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle
} from 'react'

type InputRightBorderGradientProps = {
  unit?: string | ReactNode
  containerClassName?: string
  innerBgClassName?: string
  unitClassName?: string
  inputClassName?: string
  inputWrapperClassName?: string
  value?: string
  label?: string
  inputProps?: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
  onFocus?: () => void
  onBlur?: () => void
  onChange?: (value: string) => void
  formatThousands?: boolean
  placeholder?: string
  floatingLabel?: boolean
  onlyPositiveInteger?: boolean
}

export type InputBorderGradientRef = {
  focus: () => void
  blur: () => void
}

const InputRightBorderGradient = forwardRef<InputBorderGradientRef, InputRightBorderGradientProps>(
  (
    {
      unit,
      containerClassName,
      innerBgClassName,
      inputClassName,
      inputWrapperClassName,
      inputProps = {},
      unitClassName,
      value,
      label,
      onFocus,
      onBlur,
      onChange,
      formatThousands = false,
      placeholder,
      floatingLabel = false,
      onlyPositiveInteger = true
    },
    ref
  ) => {
    const [isFocus, setFocus] = useState<boolean>(false)
    const inputRef = useRef<HTMLInputElement>(null)



    const handleFocus = () => {
      setFocus(true)
      if (onFocus) onFocus()
    }

    const handleBlur = () => {
      setFocus(false)
      if (onBlur) onBlur()
    }

    // 点击容器时聚焦到输入框
    const handleContainerClick = () => {
      if (inputRef.current && !inputProps?.disabled) {
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
      const isValueInput = onlyPositiveInteger
        ? /^(?:$|(?:0|[1-9]\d*)(?:\.\d*)?|\.\d+)$/
        : /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$|^-?\.[0-9]*$|^-?$|^$/;

       if (isValueInput.test(cleanValue)) {
        if (onChange) {
          onChange(cleanValue)
        }
      }
    }

    const styleDisable = inputProps?.disabled ? 'opacity-80 cursor-not-allowed' : ''
    const displayValue = formatThousands && value ? formatNumberWithCommas(value) : value

    // 确定是否显示浮动标签 - 修复值判断逻辑
    const hasValue = value && value !== '' && value !== '0' && value !== '0.0';
    const showFloatingLabel = floatingLabel && (isFocus || hasValue);

    const {
      type,
      value: propsValue,
      onChange: propsOnChange,
      onFocus: propsOnFocus,
      onBlur: propsOnBlur,
      ...safeInputProps
    } = inputProps
    

    const inputType = formatThousands ? 'text' : type || 'text'

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
          "rounded-[4px] relative after:content-[''] after:border-[0.5px] after:border-[#302E38] after:absolute after:inset-[1px] after:bg-[#212127] after:rounded-[4px] after:z-0 after:pointer-events-none h-[34px] py-2.5 px-1.5 flex items-center",
          isFocus && 'purple-input-border-focus',
          !inputProps?.disabled && 'cursor-text', // 添加文本光标样式
          containerClassName,
          styleDisable,
        )}
        // onClick={handleContainerClick} // 添加点击事件
      >
        <div className={cn('absolute inset-[1px] bg-[#212127] rounded-[4px] z-0', innerBgClassName, styleDisable)} />
        <div className={'flex items-center justify-between gap-[10px] relative z-1 w-full'}>
          {/* 只有在不显示浮动标签时才显示左侧标签 */}
          {(!floatingLabel || !showFloatingLabel) && (
            <div className="text-[calc(1rem*(10/16))] leading-[calc(1rem*(10/16))] text-[#FFFFFF5C]">{label}</div>
          )}

          <div className={cn("flex flex-1", showFloatingLabel ? "flex-col" : "")}>
            {/* 只有在显示浮动标签时才显示顶部标签 */}
            {showFloatingLabel && (
              <div className="text-[calc(1rem*(8/16))] leading-[calc(1rem*(1/16))] text-[#FFFFFF5C] text-left transition-all duration-300 fade-in transform translate-y-0 animate-in  slide-in-from-bottom-2">
                {label}
              </div>
            )}
            <div className={cn("flex flex-1", showFloatingLabel ? 'mt-1' : '')}>
              <input
                {...safeInputProps}
                ref={inputRef}
                type={inputType}
                value={displayValue}
                onChange={handleValueChange}
                placeholder={placeholder}
                style={{ width: '100%' }}
                className={cn(
                  `app-font-regular flex-1 text-[#FFFFFF] focus:placeholder-transparent placeholder:text-[calc(14rem/16)] placeholder:text-[#FFFFFF80]
                text-[calc(1rem*(11/16))] w-full leading-[calc(1rem*(11/16))] outline-0 bg-transparent text-left`,
                  inputClassName,
                  styleDisable
                )}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              {unit && (
                <span
                  className={cn(
                    'app-font-regular text-[calc(1rem*(12/16))] flex items-center text-center',
                    showFloatingLabel ? 'ml-1 mt-[-4px]' : '',
                    isFocus ? 'text-[#FFFFFF]' : 'text-[#FFFFFF5C]',
                    unitClassName
                  )}
                >
                  {unit}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
)

InputRightBorderGradient.displayName = 'InputRightBorderGradient'
export default InputRightBorderGradient
