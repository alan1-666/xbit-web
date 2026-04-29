import { PortfolioOverview } from '@/modules/prediction/components/portfolio/PortfolioOverview.tsx'
import { PortfolioContent } from '@/modules/prediction/components/portfolio/PortfolioContent.tsx'

import { PortfolioProvider } from '../context/PortfolioContext'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Breadcrumbs } from '@/modules/prediction/components/event-details/Breadcrumbs.tsx'
import ClearTimerPendingClaims from '../components/shared/ClearTimerPendingClaims'

export const PortfolioPage = () => {
  return (
    <PortfolioProvider>
      <TooltipProvider>
        <div className="flex w-full flex-col items-center py-4 px-4">
          <div className="mb-8 flex w-full flex-col gap-4">
            <Breadcrumbs page="Portfolio" />
            <PortfolioOverview />
            <PortfolioContent />
            <ClearTimerPendingClaims />
          </div>
        </div>
      </TooltipProvider>
    </PortfolioProvider>
  )
}
