import React, { useMemo, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { SelectContentProps, SelectProps, SelectTriggerProps, SelectValueProps } from '@radix-ui/react-select'
import { cn } from '@/lib/utils'
import { ReactComponent as ArrowDownIcon } from '@/components/icon/supervisory/arrow_down.svg'

export type FilterSelectAlias<T> = {
  labelKey?: keyof T
  valueKey?: keyof T
  iconKey?: keyof T
}

export type FilterSelectOption = {
  value: string
  label: string | React.ReactNode
  icon?: string
}

type FilterSelectProps<T extends Record<string, any>> = {
  options: T[]
  value?: string
  defaultValue?: string

  onValueChange?: (value: string) => void

  alias?: FilterSelectAlias<T>
  getOptionLabel?: (opt: T) => React.ReactNode
  getOptionValue?: (opt: T) => string
  getOptionIcon?: (opt: T) => string | undefined

  selectProps?: SelectProps
  selectTriggerProps?: SelectTriggerProps
  selectValueProps?: SelectValueProps
  selectContentProps?: SelectContentProps
  triggerIconClassname?: string
  infoProps?: string | React.ReactNode
  prefixIcon?: React.ReactNode
  prefixIconClassName?: string
  placeholder?: string
}

function pick<T extends object, K extends keyof T>(obj: T, key: K) {
  return obj[key]
}

const DEFAULT_ALIAS = {
  labelKey: 'label',
  valueKey: 'value',
  iconKey: 'icon',
} as const

export default function FilterSelect<T extends Record<string, any>>({
  options,
  value,
  defaultValue,
  onValueChange,

  alias,
  getOptionLabel,
  getOptionValue,
  getOptionIcon,

  selectProps,
  selectTriggerProps,
  selectValueProps,
  selectContentProps,
  triggerIconClassname,
  infoProps,
  prefixIcon,
  prefixIconClassName,
  placeholder,
}: FilterSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false)

  const normalized = useMemo<FilterSelectOption[]>(() => {
    const labelKey = (alias?.labelKey ?? DEFAULT_ALIAS.labelKey) as keyof T
    const valueKey = (alias?.valueKey ?? DEFAULT_ALIAS.valueKey) as keyof T
    const iconKey = (alias?.iconKey ?? DEFAULT_ALIAS.iconKey) as keyof T

    return options?.map((opt) => {
      const v = getOptionValue?.(opt) ?? (pick(opt, valueKey) as any) ?? (opt as any).value

      const l = getOptionLabel?.(opt) ?? (pick(opt, labelKey) as any) ?? (opt as any).label

      const icon = getOptionIcon?.(opt) ?? (pick(opt, iconKey) as any) ?? (opt as any).icon

      return {
        value: String(v),
        label: l,
        icon: icon ? String(icon) : undefined,
      }
    })
  }, [options, alias, getOptionLabel, getOptionValue, getOptionIcon])

  const fallbackDefault = defaultValue ?? normalized?.[0]?.value

  return (
    <Select
      open={isOpen}
      onOpenChange={setIsOpen}
      {...selectProps}
      value={value}
      defaultValue={fallbackDefault}
      onValueChange={onValueChange}
    >
      <SelectTrigger
        {...selectTriggerProps}
        className={cn(
          'h-auto px-[8px] py-[5px] rounded-[6px] text-[13px] font-[400] text-[#908E9A] border-[0.8px] border-[#212129] [&_.lucide]:hidden',
          selectTriggerProps?.className,
        )}
      >
        {prefixIcon && <span className={cn('flex items-center', prefixIconClassName)}>{prefixIcon}</span>}

        <SelectValue
          {...selectValueProps}
          placeholder={placeholder}
          className={cn('flex align-middle text-left', selectValueProps?.className)}
        />

        <ArrowDownIcon
          className={cn(
            'w-4 h-4 min-w-4 transition-transform duration-200',
            triggerIconClassname,
            isOpen && 'rotate-180',
          )}
        />

        {infoProps && infoProps}
      </SelectTrigger>

      <SelectContent
        {...selectContentProps}
        className={cn(
          'rounded-[8px] bg-[#18181B] border border-[rgba(121, 119, 144, 0.16)] shadow-xl',
          selectContentProps?.className,
        )}
      >
        {normalized?.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className={cn(
              'relative flex w-full select-none items-center cursor-pointer',
              'text-[14px] leading-[1.2] rounded-[6px]',
              'pl-[12px] pr-8 py-[10px]',
              'text-[#605E6A]',
              'hover:bg-[rgba(121, 119, 144, 0.16)]',
              'data-[state=checked]:bg-[rgba(121, 119, 144, 0.16)]',
              'data-[state=checked]:text-[#FBFBFB]',
            )}
          >
            <div className="flex items-center leading-[1]">
              {option.icon && <img src={option.icon} className="w-[14px] h-[14px] mr-[4px] mt-[1px]" alt="" />}
              {option.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
