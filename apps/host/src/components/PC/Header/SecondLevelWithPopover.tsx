import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover.tsx'
import { useState } from 'react'
import { ThirdLevelItem } from './ThirdLevelItem'
import { ChevronRight } from 'lucide-react'
import { NavigationItemData } from '@components/PC/Header/NavigationItemData.ts'
import { cn } from '@/lib/utils'

interface SecondLevelWithPopoverProps {
  menuItem: NavigationItemData
}

export const SecondLevelWithPopover = ({ menuItem }: SecondLevelWithPopoverProps) => {
  const [open, setOpen] = useState(false)
  const isDisabled = menuItem.disabled === true

  const handleMouseEnter = () => {
    if (!isDisabled) {
      setOpen(true)
    }
  }

  const handleMouseLeave = () => {
    setOpen(false)
  }

  return (
    <Popover open={open && !isDisabled} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={isDisabled}>
        <div
          className={cn('cursor-pointer', isDisabled && 'opacity-50 cursor-not-allowed')}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className={cn(
              'rounded-[8px] relative pr-8 hover:bg-[#2A2839] w-full group/nav p-2',
              isDisabled && 'pointer-events-none',
            )}
          >
            <div className="flex items-center flex-row">
              <div className="text-[#908E98] group-hover/nav:text-white transition-colors mr-1">{menuItem.icon}</div>
              <div className="flex-1">
                <div className={cn('text-[calc(14rem/16)]', isDisabled ? 'text-[#FFFFFF50]' : 'text-white')}>
                  {menuItem.title}
                  <span className="absolute right-2 top-1/2 -translate-y-1/2">
                    <ChevronRight />
                  </span>
                </div>
                {menuItem.subTitle ? (
                  <div className="text-[calc(10rem/16)] text-[#908E98] whitespace-nowrap">{menuItem.subTitle}</div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </PopoverTrigger>
      {!isDisabled && (
        <PopoverContent
          side="right"
          align="start"
          sideOffset={0}
          className="bg-transparent p-0 border-none"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <ul className="space-y-1 py-2 w-fit whitespace-nowrap bg-[#212127] p-0 border border-[#79778C29] rounded-[8px] shadow-lg ml-4">
            {menuItem.children?.map((grandchild) => (
              <ThirdLevelItem key={grandchild.key} menuItem={grandchild} />
            ))}
          </ul>
        </PopoverContent>
      )}
    </Popover>
  )
}
