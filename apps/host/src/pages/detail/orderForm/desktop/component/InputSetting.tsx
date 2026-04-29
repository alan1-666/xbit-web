import { cn } from '@/lib/utils'
import React, { DetailedHTMLProps, InputHTMLAttributes, useCallback, useRef, useState } from 'react'
import { onKeyDownValidateInput } from '../../useOrderForm'
type SellSettingsInputProps = {
  unit?: string
  defaultValue: string
  containerClassName?: string
  focusBgClassName?: string
  focusBorderClassName?: string
  unitClassName?: string
  inputClassName?: string
  decimal?: number
  inputProps?: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
}

const InputSetting = ({
  unit,
  defaultValue,
  containerClassName,
  focusBgClassName,
  focusBorderClassName,
  inputProps,
  unitClassName,
  inputClassName,
  decimal = 2,
}: SellSettingsInputProps) => {
  const [focus, setFocus] = useState<boolean>(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    if (inputRef?.current) {
      inputRef?.current?.focus()
    }
  }

  return (
    <div
      className={cn(
        'rounded-full bg-[#ECECED1F] p-[12px] flex items-center gap-[10px] relative w-full max-w-[111px] h-[38px]',
        containerClassName,
        focus && (!!focusBorderClassName ? focusBorderClassName : 'border border-[#ECECED2E]'),
      )}
      onClick={handleClick}
    >
      <div
        className={cn(
          'absolute inset-[1px] rounded-full pointer-events-none',
          focus && (!!focusBgClassName ? focusBgClassName : 'bg-transparent'),
        )}
      />
      <input
        type="text"
        className={cn(
          'bg-none border-none outline-none text-[calc(1rem*(14/16))] text-[#FFFFFFCC] flex-1 leading-[1] relative w-[60%]',
          inputClassName,
        )}
        ref={inputRef}
        {...inputProps}
        onFocus={() => setFocus(true)}
        onBlur={() => {
          setFocus(false)
        }}
        onKeyDown={(e) => onKeyDownValidateInput(e, decimal)}
        defaultValue={defaultValue}
      />
      {unit && (
        <div className={cn('text-[calc(1rem*(13/16))] text-[#FFFFFFCC] leading-[1] relative', unitClassName)}>
          {unit}
        </div>
      )}
    </div>
  )
}

export default InputSetting
