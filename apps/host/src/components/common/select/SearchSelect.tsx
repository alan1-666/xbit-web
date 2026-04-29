import * as React from 'react'
import { Check, ChevronsDown, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { IconChevronDown } from '@/components/icon'

export interface SelectOption {
  value: string
  label: string
}

interface SearchSelectProps {
  options: SelectOption[]
  selectedValue: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  containerClassName?: string
}

export function SearchSelect({
  options,
  selectedValue,
  onValueChange,
  placeholder = 'Select value...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No results found.',
  containerClassName,
}: SearchSelectProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className={cn('w-full', containerClassName)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-[#1c1b1f] border-none text-[#908E98] hover:bg-[#1f1e25] hover:text-white h-9"
          >
            <span className="truncate">
              {selectedValue ? options.find((opt) => opt.value === selectedValue)?.label : placeholder}
            </span>
            <IconChevronDown className={cn('ml-2 h-4 w-4 shrink-0 text-[#908E98]', open ? 'rotate-180' : '')} />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          style={{ width: 'var(--radix-popover-trigger-width)' }}
          className="p-0 bg-[#1f1e25] border-[#27272a] shadow-xl"
        >
          <Command className="bg-[#262626] text-white p-1">
            <CommandInput
              placeholder={searchPlaceholder}
              className="text-white py-1.5 h-7"
              wrapperClassName="border border-[#605E68] rounded-[4px] p-1.5 h-7"
            />
            <CommandList className="max-h-53.75 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup className="p-0 mt-0.5">
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onValueChange(option.value)
                      setOpen(false)
                    }}
                    className={cn(
                      'flex items-center justify-between text-gray-300 cursor-pointer py-1.5 px-2 outline-none transition-colors',
                      'hover:!bg-[#404040] hover:!text-white data-[selected=true]:!text-white',
                      selectedValue === option.value && '!bg-[#404040] !text-white',
                    )}
                  >
                    <span className="text-[14px]">{option.label}</span>
                    <Check
                      className={cn('h-4 w-4 text-white', selectedValue === option.value ? 'opacity-100' : 'opacity-0')}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
