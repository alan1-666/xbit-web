import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover.tsx'
import { SecondLevelItem } from './SecondLevelItem'
import { SecondLevelWithPopover } from './SecondLevelWithPopover'
import { NavigationItemData } from '@components/PC/Header/NavigationItemData.ts'
import { useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils.ts'
import { ChevronDownIcon } from 'lucide-react'
import { useState, useRef } from 'react'

interface NavigationDropdownItemProps {
  item: NavigationItemData
}

const HOVER_CLOSE_DELAY = 150

export const NavigationDropdownItem = ({ item }: NavigationDropdownItemProps) => {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  const handleOpen = () => {
    clearCloseTimeout()
    setOpen(true)
  }

  const handleClose = () => {
    closeTimeoutRef.current = setTimeout(() => setOpen(false), HOVER_CLOSE_DELAY)
  }

  const handleCloseImmediate = () => {
    clearCloseTimeout()
    setOpen(false)
    triggerRef.current?.blur()
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) triggerRef.current?.blur()
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          className={cn(
            'inline-flex h-9 w-max items-center justify-center rounded-md px-2 py-2 text-[calc(14rem/16)]',
            'bg-transparent focus:bg-transparent active:bg-transparent',
            'transition-colors',
            item.isActive?.(location.pathname)
              ? 'text-impartal active:text-impartal hover:text-impartal focus:text-impartal focus:bg-transparent data-[state=open]:text-impartal data-[state=open]:bg-transparent'
              : 'text-[#908E98] font-medium hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground focus:outline-none focus-visible:outline-none',
          )}
          onMouseEnter={handleOpen}
          onMouseLeave={handleClose}
          onClick={(e) => e.preventDefault()}
        >
          {item.title}
          <ChevronDownIcon className="relative top-px ml-1 size-3 transition duration-300" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={4}
        className="bg-transparent p-0 border-none w-auto"
        onMouseEnter={handleOpen}
        onMouseLeave={handleCloseImmediate}
      >
        <ul className="z-50 grid w-fit rounded-[8px] border border-[#79778C29] bg-[#212127] p-2">
          {item.children?.map((child) => {
            if (child.hidden) return null
            return (
              <li key={child.key} className="group/submenu relative whitespace-nowrap">
                {child.children && child.children.length > 0 ? (
                  <SecondLevelWithPopover menuItem={child} />
                ) : (
                  <SecondLevelItem menuItem={child} />
                )}
              </li>
            )
          })}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
