import { useNavigate, useParams } from 'react-router-dom'
import { NAVIGATIONS } from '@/lib/navigations'

const FUTURES_SPORTS = [
  { label: 'NFL', slug: 'nfl' },
  { label: 'NBA', slug: 'nba' },
  { label: 'EPL', slug: 'EPL' },
]

export const FuturesNavigationTabs = () => {
  const navigate = useNavigate()
  const params = useParams()
  const slug = params.slug || FUTURES_SPORTS[0].slug // Default to first sport if no slug in URL
  console.log('FuturesNavigationTabs - current slug:', slug)

  return (
    <div className="flex items-center gap-3 pb-2">
      {FUTURES_SPORTS.map((sport) => (
        <button
          key={sport.slug}
          onClick={() => navigate(NAVIGATIONS.prediction.sports.futures(sport.slug))}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
            slug === sport.slug ? 'bg-[#E5E7EB] text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          {sport.label}
        </button>
      ))}
    </div>
  )
}
