import { NAVIGATIONS } from '@/lib/navigations'
import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCurrentSport } from '../../hooks/useCurrentSport'
import { useSportLiveGames } from '../../hooks/useSportLiveGames'
import { useSportTeamsByEvents } from '../../hooks/useSportTeams'
import { SportsFuturesView } from './SportsFuturesView'
import { SportsGamesView } from './SportsGamesView'
import { SportsPropsView } from './SportsPropsView'
import { useSportsSelection } from '@/modules/prediction/contexts/SportsSelectionContext'

const FUTURES_SPORTS = [
  { label: 'NFL', slug: 'nfl' },
  { label: 'NBA', slug: 'nba' },
  { label: 'EPL', slug: 'EPL' },
]

export const SportsMainContent = () => {
  const { slug, sportName, SportIcon, isFuturesView, isLiveView } = useCurrentSport()
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useSportLiveGames({ live: isLiveView })
  const { tab } = useParams()
  const { selectedEvent, setSelectedEvent } = useSportsSelection()

  const activeTab = isFuturesView ? 'futures' : tab || 'games'
  const scrollRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (data?.length && (!selectedEvent || !data.find(e => e.id === selectedEvent.id))) {
      setSelectedEvent(data[0])
    }
  }, [data, activeTab, selectedEvent, setSelectedEvent])

  return (
    <div className="flex flex-col h-full overflow-hidden text-white">
      <div ref={scrollRef} className="grow overflow-y-auto custom-scrollbar xl:pt-2 _hidescrollbar">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              {!isFuturesView && SportIcon && <div className="text-[#2C71F0]">{SportIcon}</div>}
              <h1 className="text-3xl font-bold">{isFuturesView ? 'Futures' : sportName}</h1>
            </div>

            <NavigationTabs slug={slug} activeTab={activeTab} isFuturesView={isFuturesView} />
          </div>

          <div className="min-h-[200px]">
            <Content
              activeTab={activeTab}
              data={data}
              isLoading={isLoading}
              fetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              scrollRef={scrollRef}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const NavigationTabs = ({
  slug,
  activeTab,
  isFuturesView,
}: {
  slug?: string
  activeTab: string
  isFuturesView: boolean
}) => {
  const navigate = useNavigate()

  if (isFuturesView) {
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

  if (!slug) return null

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

import { EventModel } from '@/modules/prediction/models/EventModel.ts'

interface ContentProps {
  activeTab: string
  data: EventModel[] | undefined
  isLoading: boolean
  fetchNextPage: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
  scrollRef: React.RefObject<HTMLDivElement | null>
}

const Content = ({
  activeTab,
  data,
  isLoading,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  scrollRef,
}: ContentProps) => {
  const { teams } = useSportTeamsByEvents(data)

  if (activeTab === 'futures') return <SportsFuturesView />

  // default data to empty array if undefined
  const safeData = data || []

  if (activeTab === 'props') return <SportsPropsView events={safeData} isLoading={isLoading} />

  if (isLoading && (!data || data.length === 0)) {
    return (
      <SportsGamesView
        events={[]}
        isLoading={true}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        scrollRef={scrollRef}
      />
    )
  }

  if (safeData.length > 0) {
    return (
      <SportsGamesView
        events={safeData}
        teams={teams}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        scrollRef={scrollRef}
      />
    )
  }

  return <div className="text-gray-500 text-sm">No live events available at the moment.</div>
}
