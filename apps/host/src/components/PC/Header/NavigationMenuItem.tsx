import {
  NavigationMenuItem as NavMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from '@components/ui/navigation-menu.tsx'
import { Link, useLocation } from 'react-router-dom'
import { NavigationItemData } from '@components/PC/Header/NavigationItemData.ts'
import { cn } from '@/lib/utils.ts'

interface NavigationItemProps {
  menuItem: NavigationItemData
  className?: string
}

export const NavigationLinkItem = (props: NavigationItemProps) => {
  const { menuItem, className } = props
  const { key: itemKey, title, href, external, disabled } = menuItem
  const location = useLocation()
  const resolvedHref = typeof href === 'function' ? href() : href
  const isDisabled = disabled === true

  return (
    <NavMenuItem key={itemKey} className='list-none'>
      <NavigationMenuLink
        asChild={!isDisabled}
        className={cn(
          navigationMenuTriggerStyle(),
          menuItem.isActive?.(location.pathname)
            ? 'text-impartal active:text-impartal hover:text-impartal focus:text-impartal focus:bg-transparent'
            : 'text-[#908E98]',
          isDisabled && 'cursor-not-allowed text-[#FFFFFF50] opacity-50 hover:bg-transparent',
          'bg-transparent px-2 py-1.5',
          'text-[calc(14rem/16)]',
          className,
        )}
      >
        {isDisabled ? (
          <span>{title}</span>
        ) : resolvedHref ? (
          external ? (
            <a href={resolvedHref} target="_blank" rel="noopener noreferrer">
              {title}
            </a>
          ) : (
            <Link to={resolvedHref}>{title}</Link>
          )
        ) : (
          <span>{title}</span>
        )}
      </NavigationMenuLink>
    </NavMenuItem>
  )
}
