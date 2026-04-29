import { Link, LinkProps } from 'react-router-dom'
import { cn } from '@/lib/utils.ts'

export type NavLinkProps = LinkProps & {
  title: string
  isMain?: boolean
  isDexRouter?: boolean
  isActive?: boolean
  isDisabled?: boolean
  icons: {
    default: string
    active: string
  }
  matchRegex?: RegExp
  iconClassName?: string
  textClassName?: string
}

const NavLink = ({
  title,
  icons,
  isMain,
  isActive,
  className,
  isDisabled,
  isDexRouter,
  iconClassName,
  textClassName,
  onClick,
  ...rest
}: NavLinkProps) => {
  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isDisabled) {
      e.preventDefault()
      return false
    }

    if (onClick) {
      onClick(e)
    }
  }

  return (
    <Link
      className={cn(
        'flex flex-col gap-[8px] items-center justify-end w-[20%]',
        isMain && 'gap-[4px] relative',
        isDisabled && 'cursor-not-allowed opacity-[70%]',
        className,
      )}
      onClick={handleNavLinkClick}
      {...rest}
    >
      <img
        alt=""
        src={isActive ? icons.active : icons.default}
        className={cn(isMain ? 'size-14 absolute top-[-26px]' : 'w-[20px] h-[20px]', isMain && !isActive && !isDexRouter && 'grayscale-100', iconClassName)}
      />
      <span data-state={isActive ? 'active' : 'inactive'} className={cn('text-[11px] leading-[1] tracking-[0px] transition-colors', isActive ? 'text-[#AB57FF]' : 'text-[#878787]', textClassName)}>
        {title}
      </span>
    </Link>
  )
}

export default NavLink
