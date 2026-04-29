import { ChangeEvent, ReactNode, useEffect, useState } from 'react'
import { cn } from '@/lib/utils.ts'
import { NumericFormat } from 'react-number-format'

export interface CustomizeInputProps {
  value: number | undefined
  onValueChange: (value: number | null) => void
  suffix?: string | ReactNode
  label: string
  labelClass?: string
  containerClass?: string
  focusStyle?: string
  blurStyle?: string
  classNameInput?: string
}

export const CustomizeInput = (props: CustomizeInputProps) => {
  const {
    value,
    containerClass,
    onValueChange,
    suffix,
    label,
    labelClass,
    blurStyle = 'bg-[#ECECED14]',
    focusStyle = 'bg-gradient-to-tr-47 style2',
    classNameInput,
  } = props

  const [focus, setFocus] = useState(false)
  const [inputValue, setInputValue] = useState<string>(value?.toString() || '')

  useEffect(() => {
    setInputValue(value?.toString() || '')
  }, [value])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
    setInputValue(newValue)
  }

  useEffect(() => {
    // if (inputValue === '') {
    //   onValueChange(null)
    // } else {
    //   const parsedValue = parseFloat(inputValue)
    //   if (!isNaN(parsedValue)) {
    //     onValueChange(parsedValue)
    //   }
    // }
  }, [inputValue])

  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-[8px] relative pr-3 text-[calc(12rem/16)] h-[40px]',
        focus || value !== undefined ? focusStyle : blurStyle,
        containerClass,
      )}
    >
      <div className="flex-1 h-9 flex items-center gap-1.5">
        <NumericFormat
          className={cn(
            'peer w-full h-full bg-transparent px-3 flex-1 placeholder:opacity-0 text-white',
            classNameInput,
          )}
          allowLeadingZeros
          thousandSeparator=","
          allowNegative={false}
          value={inputValue}
          onChange={(e) => {
            const newValue = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
            setInputValue(newValue)
            if (e?.toString() === '' || newValue === '') {
              onValueChange(null)
            }
            const parsedValue = parseFloat(newValue)
            if (!isNaN(parsedValue)) {
              onValueChange(parsedValue)
            }
          }}
          placeholder={label}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
        />
        <label
          className={cn(
            'flex w-full h-full select-none pointer-events-none transition absolute left-0 top-0 bottom-0 items-center px-3 -translate-y-3 text-[calc(9rem/16)] peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-[calc(12rem/16)] peer-placeholder-shown:text-[#FFFFFF80]',
            labelClass,
          )}
        >
          {label}
        </label>
        <div className="text-[#FFFFFF80] peer-focus:text-white">{suffix}</div>
      </div>
    </div>
  )
}
