import { SportsNavigationTabs } from '@/modules/prediction/components/sports/SportsNavigationTabs.tsx'
import { useCurrentSport } from '@/modules/prediction/hooks/useCurrentSport.ts'
import { Outlet } from 'react-router-dom'

export const LeagueLayout = () => {
  const { sportName, SportIcon, isFuturesView } = useCurrentSport()

  return (
    <div className="flex flex-col h-full overflow-hidden text-white">
      <div className="grow overflow-y-auto custom-scrollbar xl:pt-2 _hidescrollbar">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              {SportIcon && <div className="text-[#2C71F0]">{SportIcon}</div>}
              <h1 className="text-3xl font-bold">{isFuturesView ? 'Futures' : sportName}</h1>
            </div>

            <SportsNavigationTabs />
          </div>

          <div className="min-h-50">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
