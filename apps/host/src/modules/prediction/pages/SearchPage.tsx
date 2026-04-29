import { Breadcrumbs } from '@/modules/prediction/components/event-details/Breadcrumbs.tsx'
import { SearchItem } from '@/modules/prediction/components/search/SearchItem.tsx'
import { useSearchParams } from 'react-router-dom'
import { useSearchResult } from '../hooks/useSearchResult'

export const SearchPage = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const { data } = useSearchResult(query)
  const events = data?.events || []
  const eventsCount = events.length
  return (
    <div className="px-4 py-5 max-w-[1500px] mx-auto">
      <Breadcrumbs page="Search" />
      <div className="mt-4">
        <span className="text-white/80">{eventsCount < 20 ? eventsCount : '20+'} results for </span>&quot;{query}&quot;
      </div>
      <div className="mt-4 space-y-6">
        {data?.events.map((event) => (
          <SearchItem event={event} />
        ))}
      </div>
    </div>
  )
}
