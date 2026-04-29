import { useMemo } from 'react'
import { DiscoverPageContent } from '@pages/meme/discover/desktop/components/DiscoverPageContent.tsx'
import { useLocation } from 'react-router-dom'

export const MemeDiscoverDesktopPage = () => {
    const location = useLocation()
  const currentTab = useMemo(() => {
    const lastSegment = location.pathname.split('/').pop()
    if (lastSegment === 'discover') {
      return 'meme'
    }
    return lastSegment || 'e'
  }, [location.pathname])

  return (
    <div className="h-full flex flex-col items-stretch bg-[#0A0A0A]">
      <div className="flex-1">
        <DiscoverPageContent currentTab={currentTab} />
      </div>
    </div>
  )
}
