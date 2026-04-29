import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils.ts'

export interface SidebarItemProps {
  icon: ReactNode
  label: string
  link: string
  isActive: boolean
}

export const SidebarItem = (props: SidebarItemProps) => {
  const { icon, label, link, isActive } = props
  return (
    <div className="group/sports-item">
      <Link className="block" to={link}>
        <div
          className={cn(
            'rounded-lg transition-colors py-2 px-3 cursor-pointer relative',
            isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5',
          )}
        >
          <div className="flex items-center justify-between gap-x-2.5">
            <div className="flex items-center gap-x-2.5 min-w-0">
              <div className={cn('shrink-0', isActive ? 'text-primary' : '')}>{icon}</div>
              <p
                className={cn(
                  'text-[13px] pr-4 whitespace-nowrap truncate font-medium',
                  isActive ? 'text-white' : 'text-text-primary',
                )}
              >
                {label}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
