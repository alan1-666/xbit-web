import { useSearchParams } from 'react-router-dom'
import { EventCategoryTabs } from '@/modules/prediction/components/shared/EventCategoryTabs'
import { EventsPage } from '@/modules/prediction/pages/EventsPage.tsx'
import { useTranslation } from 'react-i18next'
import { ElectionsSidebar } from '@/modules/prediction/components/shared/ElectionsSidebar'
import { eventCategoryTabs } from '@/modules/prediction/data/event-category-tabs'
import { ElectionsTabContent } from '@/modules/prediction/components/elections/ElectionsTabContent'
import { MacroTabContent } from '@/modules/prediction/components/elections/MacroTabContent'
import { TrumpTabContent } from '@/modules/prediction/components/elections/TrumpTabContent'

const ELECTIONS_TAB = 'elections'
const MACRO_TAB = 'macro'
const TRUMP_TAB = 'trump'

const CustomElectionsPageContent = ({ selectedTab }: { selectedTab: string }) => {
  return (
    <>
      <EventCategoryTabs />
      <div className="flex flex-row items-start w-full">
        <ElectionsSidebar />
        <div className="flex-1 min-w-0 mt-3 xl:pb-5">
          {selectedTab === MACRO_TAB ? (
            <MacroTabContent />
          ) : selectedTab === TRUMP_TAB ? (
            <TrumpTabContent />
          ) : (
            <ElectionsTabContent />
          )}
        </div>
      </div>
    </>
  )
}

export const ElectionsPage = () => {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const selectedTab = searchParams.get('tab') || ELECTIONS_TAB

  if (selectedTab === ELECTIONS_TAB || selectedTab === MACRO_TAB || selectedTab === TRUMP_TAB) {
    return <CustomElectionsPageContent selectedTab={selectedTab} />
  }

  const tabConfig = eventCategoryTabs.find((tab) => tab.value === selectedTab)
  const title = tabConfig?.titleKey ? t(tabConfig.titleKey) : t('prediction.electionsPage.title')
  return <EventsPage tag="elections" title={title} />
}
