import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { NAVIGATIONS } from '@/lib/navigations'

interface ActivityTitleProps {
  eventSlug?: string
  title: string
  className?: string
}

export const ActivityTitle = ({ eventSlug, title, className }: ActivityTitleProps) => {
  if (eventSlug) {
    return (
      <Link
        to={NAVIGATIONS.prediction.eventDetails(eventSlug)}
        className={cn('hover:underline cursor-pointer', className)}
      >
        {title}
      </Link>
    )
  }
  return <p className={className}>{title}</p>
}
