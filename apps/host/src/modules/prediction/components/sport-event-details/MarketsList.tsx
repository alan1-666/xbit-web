import { Accordion } from '@/components/ui/accordion.tsx'
import { MainMarkets } from './markets-list/MainMarkets'
import { FirstHalfMarkets } from './markets-list/FirstHalfMarkets'
import { CS2SeriesMarkets } from './markets-list/CS2SeriesMarkets'
import { LoLHandicapMarkets } from './markets-list/LoLHandicapMarkets'
import { LoLMostObjectivesMarkets } from './markets-list/LoLMostObjectivesMarkets'
import { SeriesTotalsMarkets } from './markets-list/SeriesTotalsMarkets'
import { TennisMarkets } from './markets-list/TennisMarkets'
import { TennisFirstSetMarkets } from './markets-list/TennisFirstSetMarkets'
import { PlayerPropsGroup } from './markets-list/PlayerPropsGroup'

import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { useMarketTabs } from '@/modules/prediction/hooks/useMarketTabs.ts'
import MovingLineTabs from '@/components/common/MovingLineTabs.tsx'

export const MarketsList = () => {
  const { event } = useEventDetailsPageContext()
  const { tabs, activeTab, setActiveTab } = useMarketTabs(event || undefined)

  if (!event || tabs.length <= 1) {
    return (
      <Accordion type="single" collapsible className="space-y-8">
        <MainMarkets />
        <FirstHalfMarkets />
        <CS2SeriesMarkets />
        <LoLHandicapMarkets />
        <LoLMostObjectivesMarkets />
        <SeriesTotalsMarkets />
        <TennisMarkets />
        <TennisFirstSetMarkets />
      </Accordion>
    )
  }

  return (
    <div className="space-y-4">
      <MovingLineTabs
        tabs={tabs}
        defaultTab={activeTab}
        onTabChange={setActiveTab}
        wrapperClassName="border-b border-border justify-start"
        containerClassName="justify-start pl-0"
        tabsListClassName="bg-transparent"
        tabsClassName="w-auto"
        itemClassName="px-4 py-2"
        labelClassName="text-sm font-medium"
      />

      <Accordion type="single" collapsible className="space-y-8 pt-4">
        {/* Game Lines / Main */}
        {activeTab === 'game_lines' && (
          <>
            <MainMarkets />
            <CS2SeriesMarkets />
            <LoLHandicapMarkets />
            <SeriesTotalsMarkets />
            <TennisMarkets />
          </>
        )}

        {/* 1st Half */}
        {activeTab === '1st_half' && <FirstHalfMarkets />}

        {/* Tennis Sets */}
        {activeTab === '1st_set' && <TennisFirstSetMarkets />}
        {activeTab === 'sets' && <TennisMarkets />}
        {/* Player Props */}
        {['points', 'assists', 'rebounds', 'threes', 'double_doubles', 'blocks', 'steals'].includes(activeTab) && (
          <PlayerPropsGroup type={activeTab} />
        )}
        {/* Esports Specific Tabs */}
        {activeTab === 'series_objectives' && <LoLMostObjectivesMarkets />}
      </Accordion>
    </div>
  )
}
