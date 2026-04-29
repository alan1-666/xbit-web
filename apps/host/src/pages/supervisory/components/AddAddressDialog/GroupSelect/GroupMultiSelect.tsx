import * as React from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { useAddressGroups } from '@/providers/AddressGroupsProvider'
import { CreateGroupInline } from './CreateGroupInline'
import { GroupManageDialog } from '../GroupManageDialog'
import { ReactComponent as ReturnIcon } from '@/components/icon/supervisory/return.svg'
import { useTranslation } from 'react-i18next'

type Props = {
  value: string[]
  onChange: (v: string[]) => void
  label?: string
}

export function GroupMultiSelect({ value, onChange, label = 'Address Group' }: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(false)
  const { groupList } = useAddressGroups()

  const selectedLabels = React.useMemo(() => {
    if (!value?.length) return t('smartMoney.supervisory.pleaseSelect')
    const map = new Map(groupList.map((g) => [g.value, g.label]))
    return value
      .map((id) => map.get(id))
      .filter(Boolean)
      .join(', ')
  }, [value, groupList])

  const toggle = (id: string) => {
    const next = value.includes(id) ? value.filter((x) => x !== id) : [...value, id]
    onChange(next)
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm text-[#FAFAFA] font-light">{label}</div>
        <GroupManageDialog />
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              'w-full h-11 px-3 rounded-xl bg-[#0E0E11] border border-[#2A2A2F]',
              'flex items-center justify-between text-sm text-white/80',
              'hover:border-white/20 transition',
            )}
          >
            <span className={cn('truncate', !value?.length && 'text-white/30')}>{selectedLabels}</span>
            <ChevronDown className="h-4 w-4 opacity-40" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className={cn(
            'w-[var(--radix-popover-trigger-width)] p-0',
            'bg-[#0E0E11] border border-[#2A2A2F] text-white rounded-xl shadow-xl overflow-hidden',
          )}
          // 关键：防止滚轮穿透
          onWheel={(e) => e.stopPropagation()}
        >
          <Command className="bg-transparent">
            <CommandInput placeholder={t('smartMoney.supervisory.selectGroup')} className="h-11" />
            <CommandList className="max-h-56 overflow-auto overscroll-contain">
              <CommandEmpty className="py-6 text-center text-sm text-white/40">No group</CommandEmpty>

              <CommandGroup>
                {groupList.map((g) => {
                  const checked = value.includes(g.value)
                  return (
                    <CommandItem
                      key={g.value}
                      value={String(g.label)}
                      onSelect={() => toggle(g.value)}
                      className={cn(
                        'h-11 px-3 cursor-pointer flex items-center justify-between',
                        'aria-selected:bg-white/5 text-[#FAFAFA] font-light',
                      )}
                    >
                      <span className="truncate">{g.label}</span>
                      <span
                        className={`
                            w-4 h-4
                            rounded-sm
                            flex items-center justify-center
                            ${checked ? 'bg-[#9B2CFC]' : 'bg-transparent border border-white/12'}
                            `}
                      >
                        {checked ? (
                          <svg width="3" height="3" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M20 6L9 17l-5-5"
                              stroke="white"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : null}
                      </span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>

            <CreateGroupInline />
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
