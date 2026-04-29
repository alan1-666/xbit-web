import { Button, ButtonProps } from '@components/ui/button.tsx'
import { cn } from '@/lib/utils.ts'
import { useEffect, useState } from 'react'

type FilterTimeButtonProps = ButtonProps & {
  isActive?: boolean,

}

export type TimeUnit = 's' | 'm' | 'h' | 'D' | 'W' | 'M' | 'Y'

export type FilterTimeOption = {
  value: string,
  unit: TimeUnit,
}
type FilterTimeProps = {
  options: FilterTimeOption[],
  defaultSelectedIndex?: number,
  onChange?: (index: number, option?: FilterTimeOption) => any,
  className?: string,
  classNameItem?: string,
  classNameItemActive?: string,
}

const FilterTimeButton = ({ className, children, isActive, ...rest }: FilterTimeButtonProps) => {
  return (
    <Button
      className={cn(
        'rounded-[0] bg-[none] w-[48px] min-w-auto h-[26px] text-[#FFFFFF99] text-[calc(1rem*(11/16))] font-[400]',
        isActive && 'bg-[#ECECED14] text-[#EFEFEF]',
        className,
      )}
      {...rest}
    >
      {children}
    </Button>
  )
}

const FilterTime = ({ options, onChange, defaultSelectedIndex = 0, className, classNameItem, classNameItemActive }: FilterTimeProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(defaultSelectedIndex)

  const handleFilterClick = (index: number, option?: FilterTimeOption) => {
    setSelectedIndex(index)
    if (onChange) {
      onChange(index, option)
    }
  }

  useEffect(() => {
    setSelectedIndex(defaultSelectedIndex)
  }, [defaultSelectedIndex]);

  return (
    <div className={cn("rounded-[4px] border-[0.5px] border-[#ECECED14] flex overflow-hidden gap-0", className)}>
      {options.map((option, index) => (
        <FilterTimeButton key={index} isActive={selectedIndex === index} onClick={() => handleFilterClick(index, option)} className={cn("flex items-center justify-center gap-2 px-2 py-0.5 min-w-[40px] rounded-sm", classNameItem, selectedIndex === index ? 'border-gradient' : '', selectedIndex === index && classNameItemActive)}>
          {option.value}{option.unit}
        </FilterTimeButton>
      ))}
    </div>
  )
}

export default FilterTime
