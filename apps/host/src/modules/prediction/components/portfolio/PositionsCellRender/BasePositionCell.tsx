import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar.tsx'
import { Link } from 'react-router-dom'
import { NAVIGATIONS } from '@/lib/navigations.ts'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface BasePositionCellProps {
  icon: string
  title: string
  eventSlug: string | undefined
  children: ReactNode
  className?: string
}

export const BasePositionCell = (props: BasePositionCellProps) => {
  const { icon, title, eventSlug, children, className } = props
  return (
    <div className={cn('flex items-center gap-3 pl-2 min-w-0 w-full', className)}>
      <Avatar className="h-[44px] w-[44px] min-w-[44px] rounded-sm border border-white/5 cursor-pointer">
        <AvatarImage src={icon} alt={title} className="object-cover" />
        <AvatarFallback className="rounded-sm text-xs">{title.slice(0, 2)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1 min-w-0">
        <Link
          to={NAVIGATIONS.prediction.eventDetails(eventSlug || '')}
          className="text-text-primary font-medium line-clamp-1 text-ellipsis overflow-hidden hover:underline cursor-pointer break-all text-[13px] leading-[21px]"
          title={title}
        >
          {title}
        </Link>
        <div className="flex items-center gap-2 text-xs ">{children}</div>
      </div>
    </div>
  )
}
