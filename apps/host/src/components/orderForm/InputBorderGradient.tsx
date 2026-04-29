import { cn } from '@/lib/utils.ts'
import { DetailedHTMLProps, InputHTMLAttributes, ReactNode, useState } from 'react'

type InputBorderGradientProps = {
  placeHolder?: string
  unit: string
  containerClassName?: string
  innerBgClassName?: string
  innerBgClassNameFocus?: string
  unitClassName?: string
  inputClassName?: string
  containerInputClassName?: string
  isFocusShowTooltip?: boolean
  textTooltip?: string
  inputProps?: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
  onFocus?: () => void
  onBlur?: () => void
  value?: string
  onChange?: (value: string) => void
  hasValue?: boolean
  isShowPrefix?: boolean
  prefix?: string | ReactNode
  borderStyle?: string
  prefixStyle?: string
}

const InputBorderGradient = ({
  placeHolder,
  unit,
  containerClassName,
  innerBgClassName,
  innerBgClassNameFocus,
  inputClassName,
  containerInputClassName,
  inputProps,
  unitClassName,
  isFocusShowTooltip,
  textTooltip,
  onFocus,
  onBlur,
  value,
  onChange,
  hasValue = false,
  isShowPrefix = false,
  prefix,
  borderStyle,
  prefixStyle,
}: InputBorderGradientProps) => {
  const [isFocus, setFocus] = useState<boolean>(false)

  const handleFocus = () => {
    setFocus(true)
    if (onFocus) onFocus()
  }

  const handleBlur = () => {
    setFocus(false)
    if (onBlur) onBlur()
  }

  return (
    <div
      className={cn(
        'rounded-[6px] relative min-h-[40px] p-[10px] border border-transparent',
        borderStyle,
        isFocus && 'border-[#C8A7FD]',
        containerClassName,
      )}
    >
      <div
        className={cn(
          'absolute inset-[0.5px] bg-[#141414] rounded-[6px] z-0',
          innerBgClassName,
          isFocus && innerBgClassNameFocus,
        )}
      />
      {isFocusShowTooltip ? (
        <div
          className={cn(
            'flex items-start justify-between gap-[10px] rounded-[6px] relative z-1 group focus-within:pt-2 shadow-inset-dark',
            containerInputClassName,
          )}
        >
          <div className="flex-1 h-full">
            <input
              className={cn('mt-1 w-full h-full px-0 flex-1 app-font-regular text-white text-[14px]', inputClassName)}
              type="text"
              {...inputProps}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            <label
              className={cn(
                'flex w-full h-full select-none pointer-events-none transition absolute left-0 -top-[2px] bottom-0 items-center px-3',
                hasValue || isFocus
                  ? 'translate-y-[-12px] text-[9px] text-[#ffffff5c]'
                  : 'translate-y-[4px] text-[#FFFFFFCC] text-[14px] leading-none',
              )}
            >
              {isFocus || hasValue ? textTooltip : placeHolder}
            </label>
          </div>
          <span
            className={cn(
              'app-font-regular text-[calc(1rem*(11/16))] text-[#FFFFFFCC] inline-block mt-2 min-w-[40px] text-center',
              unitClassName,
            )}
          >
            {unit}
          </span>
        </div>
      ) : (
        <div
          className={cn(
            'flex items-center justify-between gap-[10px] rounded-[6px] relative z-1',
            containerInputClassName,
          )}
        >
          {isShowPrefix && <div className={cn(prefixStyle, isFocus && 'text-white')}>{prefix}</div>}
          <input
            type="text"
            placeholder={placeHolder}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            {...inputProps}
            className={cn(
              'app-font-regular text-white placeholder:text-[#FFFFFFCC] text-[14px] leading-[0] outline-0 w-full max-w-[calc(100%-50px)]',
              inputClassName,
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <span
            className={cn(
              'app-font-regular text-[calc(1rem*(11/16))] text-[#FFFFFFCC] inline-block min-w-[40px] text-center',
              unitClassName,
            )}
          >
            {unit}
          </span>
        </div>
      )}
    </div>
  )
}

export default InputBorderGradient
