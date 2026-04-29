import { SportsSidebar } from './SportsSidebar'
import { SportsRightSidebar } from './SportsRightSidebar'
import { ReactNode } from 'react'
import TickerSection from './TickerSection'
import { useParams } from 'react-router-dom'
import { useCurrentSport } from '@/modules/prediction/hooks/useCurrentSport'
import { SportsMobileTopNav } from './SportsMobileTopNav'
import { SportsSelectionProvider, useSportsSelection } from '@/modules/prediction/contexts/SportsSelectionContext'
import { cn } from '@/lib/utils'

interface SportsLayoutProps {
  children: ReactNode
}

const SportsLayoutContent = ({ children }: SportsLayoutProps) => {
  const { tab } = useParams()
  const { isLiveView } = useCurrentSport()
  const { selectedEvent } = useSportsSelection()

  const isShowRightSidebar = (tab === 'games' || isLiveView) && !!selectedEvent

  return (
    <div className="flex flex-col h-screen text-foreground overflow-hidden">
      {isLiveView && (
        <div className="hidden xl:block">
          <TickerSection />
        </div>
      )}

      <div className="xl:hidden block">
        <SportsMobileTopNav />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden xl:block h-full shrink-0">
          <SportsSidebar />
        </div>

        <main className="flex-1 xl:p-4 p-2 min-w-0">
          {children}
        </main>

        <div
          className={cn(
            'hidden xl:block h-full shrink-0 transition-all duration-300 ease-in-out overflow-hidden',
            isShowRightSidebar ? 'w-[370px] opacity-100' : 'w-0 opacity-0',
          )}
        >
          <div className="w-[370px] h-full">
            <SportsRightSidebar />
          </div>
        </div>
      </div>
    </div>
  )
}

export const SportsLayout = ({ children }: SportsLayoutProps) => {
  return (
    <SportsSelectionProvider>
      <SportsLayoutContent>{children}</SportsLayoutContent>
    </SportsSelectionProvider>
  )
}

export const SportsLayoutV2 = ({ children }: SportsLayoutProps) => {
  return (
    <div className="flex flex-col h-screen text-foreground overflow-hidden">
      <div className="xl:hidden block">
        <SportsMobileTopNav />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden xl:block h-full shrink-0">
          <SportsSidebar />
        </div>

        <main className="flex-1 xl:p-4 p-2 min-w-0">{children}</main>
      </div>
    </div>
  )
}
