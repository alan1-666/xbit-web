import { NAVIGATIONS } from '@/lib/navigations.ts'
import { Link } from 'react-router-dom'

export interface BreakingItemTitleProps {
  eventSlug: string
  title: string
}

export const BreakingItemTitle = (props: BreakingItemTitleProps) => {
  const { title, eventSlug } = props
  return (
    <Link to={NAVIGATIONS.prediction.eventDetails(eventSlug || '')}>
      <p className="text-sm font-medium mb-0.5 text-pretty @max-[600px]:line-clamp-2 line-clamp-3 hover:underline underline-offset-2">
        {title}
      </p>
    </Link>
  )
}
