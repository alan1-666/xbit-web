import { BaseEventDetailsPage } from '@/modules/prediction/components/shared/BaseEventDetailsPage.tsx'
import { Scoreboard } from '@/modules/prediction/components/sport-event-details/Scoreboard.tsx'
import { MarketsList } from '@/modules/prediction/components/sport-event-details/MarketsList.tsx'
import { DescriptionSection } from '@/modules/prediction/components/event-details/DescriptionSection.tsx'
import { ActivitiesSection } from '@/modules/prediction/components/event-details/ActivitiesSection.tsx'
import { SportEventOrderForm } from '@/modules/prediction/components/sport-event-details/SportEventOrderForm.tsx'
import { MobileTradeDrawer } from '@/modules/prediction/components/event-details/MobileTradeDrawer.tsx'

export const SportEventPage = () => {
  return (
    <BaseEventDetailsPage>
      <div className="grid grid-cols-6 gap-4">
        <div className="space-y-4 col-span-6 xl:col-span-4">
          <Scoreboard />
          <MarketsList />
          <DescriptionSection />
          <ActivitiesSection />
        </div>
        <div className="xl:col-span-2 hidden xl:block">
          <SportEventOrderForm />
        </div>
      </div>
      <MobileTradeDrawer />
    </BaseEventDetailsPage>
  )
}
