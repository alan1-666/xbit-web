import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export interface FilterOption {
  label: string
  value: string
}

interface FilterWithDropdownProps {
  title: string
  options: FilterOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  triggerClassName?: string
  itemClassName?: string
  contentClassName?: string
}

function FilterWithDropdown({
  title,
  options,
  value,
  defaultValue,
  onValueChange,
  triggerClassName,
  itemClassName,
  contentClassName,
}: FilterWithDropdownProps) {
  const selectedValue = value ?? defaultValue ?? options[0]?.value

  const handleSelect = (value: string) => {
    onValueChange?.(value)
  }

  const selectedOption = options.find((opt) => opt.value === selectedValue)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div
          className={cn(
            'h-[30px] px-3 py-2.5 rounded-md text-xs font-medium whitespace-nowrap w-fit cursor-pointer flex items-center gap-2 transition-all duration-200',
            'bg-[#212127] text-[#777777] hover:bg-[#332546]/50 hover:text-[#ab70ff]/70',
            triggerClassName
          )}
        >
          <span>{title}:</span>
          <span>{selectedOption?.label}</span>
          <img src="/images/icons/icon-chevron-down.svg" alt="chevron down" className="w-2 h-2 mr-1" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className={cn('bg-[#212127] border-[#332546]', contentClassName)}>
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={cn(
              'text-xs font-medium cursor-pointer flex items-center justify-between transition-all duration-200',
              selectedValue === option.value 
                ? 'bg-[#332546] text-[#ab70ff]' 
                : 'text-[#777777] hover:bg-[#332546]/50 hover:text-[#ab70ff]/70',
              itemClassName
            )}
          >
            <span>{option.label}</span>
            {selectedValue === option.value && (
              <div className="w-1.5 h-1.5 rounded-full bg-[#ab70ff]" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default FilterWithDropdown
