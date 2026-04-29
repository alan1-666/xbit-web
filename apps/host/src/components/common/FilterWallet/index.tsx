import { Button, ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

type FilterWalletButtonProps = ButtonProps & {
  isActive?: boolean
  classNameActive?: string
}

type FilterWalletProps = {
  options: string[]
  defaultSelectedIndex?: number
  onChange?: (index: number, option?: string) => any
  classNameActive?: string
  classNameItem?: string
  classNameContainer?: string
}

const FilterWalletButton = ({ className, children, isActive, classNameActive, ...rest }: FilterWalletButtonProps) => {
  return (
    <Button
      className={cn(
        'bg-[#18171E] rounded-[5px] min-w-[64px] h-[auto] px-2.5 py-1 text-[#908E98] text-[11px] leading-[1.5] font-[330] transform-colors duration-200',
        className,
        isActive && 'bg-[#3E2761] text-[#C8A7FD]',
        isActive && classNameActive,
      )}
      {...rest}
    >
      {children}
    </Button>
  )
}

const FilterWallet = ({ options, onChange, defaultSelectedIndex = 0, classNameActive = '', classNameItem = '', classNameContainer='' }: FilterWalletProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(defaultSelectedIndex)

  const handleFilterClick = (index: number, option?: string) => {
    setSelectedIndex(index)
    if (onChange) {
      onChange(index, option)
    }
  }

  useEffect(() => {
    setSelectedIndex(defaultSelectedIndex)
  }, [defaultSelectedIndex])

  return (
    <div className="overflow-x-auto _hidescrollbar">
      <div className={cn('flex gap-1 w-max', classNameContainer)}>
        {options.map((option, index) => (
          <FilterWalletButton
            key={index}
            isActive={selectedIndex === index}
            onClick={() => handleFilterClick(index, option)}
            classNameActive={classNameActive}
            className={classNameItem}
          >
            {option}
          </FilterWalletButton>
        ))}
      </div>
    </div>
  )
}

export default FilterWallet
