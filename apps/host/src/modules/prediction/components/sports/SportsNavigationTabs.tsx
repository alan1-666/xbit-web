import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { NAVIGATIONS } from '@/lib/navigations'
import { useMemo } from 'react'

const TabButton = ({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) => (
  <button
    className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
      isActive ? 'text-white border-blue-500' : 'text-gray-400 border-transparent hover:text-gray-200'
    }`}
    onClick={onClick}
  >
    {label}
  </button>
)

const useActiveTab = () => {
  const location = useLocation()
  return useMemo(() => {
    const pathname = location.pathname
    if (pathname.includes('/games')) return 'games'
    if (pathname.includes('/props')) return 'props'
    return 'games' // Default to 'games' if no match
  }, [location.pathname])
}

export const SportsNavigationTabs = () => {
  const navigate = useNavigate()
  const params = useParams()
  const slug = params.slug || 'live' // Default to 'live' if no slug in URL
  const activeTab = useActiveTab()


  return (
    <div className="flex items-center justify-between border-b border-gray-800 pb-0">
      <div className="flex gap-6">
        <TabButton
          label="Games"
          isActive={activeTab === 'games'}
          onClick={() => navigate(NAVIGATIONS.prediction.sports.category(slug, 'games'))}
        />
        <TabButton
          label="Props"
          isActive={activeTab === 'props'}
          onClick={() => navigate(NAVIGATIONS.prediction.sports.category(slug, 'props'))}
        />
      </div>
    </div>
  )
}
