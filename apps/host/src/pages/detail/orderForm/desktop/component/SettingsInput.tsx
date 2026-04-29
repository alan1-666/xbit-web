import React, {
  ChangeEvent,
  DetailedHTMLProps,
  InputHTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { cn } from '@/lib/utils.ts'
import { onKeyDownValidateInput } from '../../useOrderForm'

type BuySettingsInputProps = {
  unit: string
  defaultValue: string
  containerClassName?: string
  inputProps?: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
}

const SettingsInput = ({ unit, defaultValue, containerClassName, inputProps }: BuySettingsInputProps) => {
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
        focus && 'border border-[#ECECED2E]',
      )}
      onClick={handleClick}
    >
      <div className={cn('absolute inset-[1px] rounded-full pointer-events-none', focus && 'bg-[#0F0F0F]')} />
      <input
        type="text"
        className="bg-none border-none outline-none text-[calc(1rem*(14/16))] text-[#FFFFFFCC] flex-1 leading-[1] relative w-[60%]"
        ref={inputRef}
        {...inputProps}
        onFocus={() => setFocus(true)}
        onBlur={() => {
          setFocus(false)
        }}
        onKeyDown={(e) => onKeyDownValidateInput(e, 3)}
        defaultValue={defaultValue}
      />
      <div className="text-[calc(1rem*(10/16))] text-[#FFFFFFCC] leading-[1] relative">{unit}</div>
    </div>
  )
}
