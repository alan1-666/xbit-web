import React, { useMemo, useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { cn } from '@/lib/utils'
import { ReactComponent as ArrowDownIcon } from '@/components/icon/supervisory/arrow_down.svg'
import { ReactComponent as MultiTickIcon } from '@/components/icon/smart-money/multi_tick.svg'

export type FilterSelectOption = {
  value: string
  label: string | React.ReactNode
  icon?: string
  disabled?: boolean
}

type FilterMultiSelectProps = {
  options: FilterSelectOption[]

  /** 多选值 */
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (next: string[]) => void

  /** Trigger */
  triggerClassName?: string
  valueClassName?: string
  contentClassName?: string
  itemClassName?: string
  triggerIconClassname?: string

  prefixIcon?: React.ReactNode
  prefixIconClassName?: string
  infoProps?: string | React.ReactNode

  placeholder?: string
  /** 超过多少个后显示 “A、B +N” */
  maxLabelCount?: number
  /** 是否显示清空按钮 */
  showClear?: boolean
}

export default function FilterMultiSelect({
  options,
  value,
  defaultValue = [],
  onValueChange,

  triggerClassName,
  valueClassName,
  contentClassName,
  itemClassName,
  triggerIconClassname,

  prefixIcon,
  prefixIconClassName,
  infoProps,

  placeholder = '请选择',
  maxLabelCount = 2,
  showClear = false,
}: FilterMultiSelectProps) {
  const [open, setOpen] = useState(false)

  const selected = value ?? defaultValue
  const selectedSet = useMemo(() => new Set(selected), [selected])

  const selectedLabels = useMemo(() => {
    const picked = options.filter((o) => selectedSet.has(o.value))

    if (picked.length === 0) return null

    // 只拿字符串 label；如果有 ReactNode，退化为数量
    const labels = picked.map((o) => o.label)
    const allString = labels.every((x) => typeof x === 'string')
    if (!allString) return `${picked.length} selected`

    const strs = labels as string[]
    if (strs.length <= maxLabelCount) return strs.join('、')

    // 超过 maxLabelCount
    const head = strs.slice(0, maxLabelCount).join('、')
    const rest = strs.length - maxLabelCount
    return `${head}… +${rest}`
  }, [options, selectedSet, maxLabelCount])

  const emit = (next: string[]) => {
    onValueChange?.(next)
  }

  const toggle = (v: string) => {
    const next = selectedSet.has(v) ? selected.filter((x) => x !== v) : [...selected, v]
    emit(next)
  }

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation()
    emit([])
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            'h-auto px-[8px] py-[5px] rounded-[6px] text-[13px] font-[400]',
            'text-[#908E9A] border-[0.8px] border-[#212129] bg-transparent',
            'flex items-center gap-2',
            triggerClassName,
          )}
        >
          {prefixIcon && <span className={cn('flex items-center', prefixIconClassName)}>{prefixIcon}</span>}

          <span className={cn('flex-1 min-w-0 truncate', valueClassName)}>
            {selectedLabels ?? <span className="text-[#605E6A]">{placeholder}</span>}
          </span>

          {showClear && selected.length > 0 ? (
            <span onClick={clear} className="text-white/40 hover:text-white/70 px-1" title="清空">
              ×
            </span>
          ) : null}

          <ArrowDownIcon
            className={cn(
              'w-4 h-4 min-w-4 transition-transform duration-200',
              triggerIconClassname,
              open && 'rotate-180',
            )}
          />

          {infoProps && infoProps}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className={cn(
            'z-50 min-w-[200px] p-2',
            'rounded-[8px] bg-[#18181B]',
            'border border-[rgba(121,119,144,0.16)] shadow-xl outline-none',
            contentClassName,
          )}
        >
          <div className="max-h-[280px] overflow-auto space-y-1 no-scrollbar">
            {options.map((o) => {
              const checked = selectedSet.has(o.value)
              const disabled = !!o.disabled

              return (
                <button
                  key={o.value}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    if (disabled) return
                    toggle(o.value)
                    // 多选：不关闭 popover
                  }}
                  className={cn(
                    'w-full flex items-center justify-between gap-2',
                    'rounded-[6px] px-[12px] py-[10px] text-[14px] leading-[1.2]',
                    'text-[#605E6A] hover:bg-[rgba(121,119,144,0.16)] hover:text-[#FBFBFB]',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                    checked && 'bg-[rgba(121,119,144,0.16)] text-[#FBFBFB]',
                    itemClassName,
                  )}
                >
                  <span className="flex items-center leading-[1] min-w-0">
                    {o.icon ? <img src={o.icon} className="w-[14px] h-[14px] mr-[6px] mt-[1px]" alt="" /> : null}
                    <span className="truncate">{o.label}</span>
                  </span>

                  {/* 右侧勾 */}
                  {checked ? <MultiTickIcon className="w-4 h-4" /> : null}
                </button>
              )
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
