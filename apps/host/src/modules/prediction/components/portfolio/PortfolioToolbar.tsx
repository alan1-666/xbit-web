import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { DateRange } from 'react-day-picker'
import { useTranslation } from 'react-i18next'
import { HistoryActivityFilter } from './HistoryActivityFilter'
import { HistoryDateFilter } from './HistoryDateFilter'
import { HistoryExportButton } from './HistoryExportButton'
import { HistorySortFilter } from './HistorySortFilter'
import { PortfolioSortDropdown } from './PortfolioSortDropdown'

interface PortfolioToolbarProps {
  activeTab: string
}

export const PortfolioToolbar = ({ activeTab }: PortfolioToolbarProps) => {
  const { t } = useTranslation()
  const [activityFilter, setActivityFilter] = useState('All')
  const [historySort, setHistorySort] = useState('Newest')
  const [dateFilter, setDateFilter] = useState<string | DateRange>('All')

  return (
    <div className="order-2 flex w-full flex-wrap items-center gap-2 p-3 pb-0 max-lg:gap-y-3 lg:gap-2">
      <div className="relative h-10 flex-1 max-lg:w-full max-lg:flex-none lg:h-auto">
        <Input
          placeholder={t('prediction.common.search')}
          className="h-10 w-full rounded-md border border-white/10 bg-transparent pl-10 text-base text-white placeholder:text-gray-500 hover:bg-[#2c2c2e] focus-visible:bg-transparent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 sm:text-sm"
        />
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500">
          <Search size={18} />
        </div>
      </div>

      {activeTab === 'history' ? (
        <div className="flex w-full items-center gap-2 lg:w-auto">
          <HistoryActivityFilter value={activityFilter} onChange={setActivityFilter} className="flex-1 lg:flex-none" />
          <HistorySortFilter value={historySort} onChange={setHistorySort} className="flex-1 lg:flex-none" />
          <HistoryDateFilter value={dateFilter} onChange={setDateFilter} />
          <HistoryExportButton className="hidden sm:flex" />
        </div>
      ) : (
        <PortfolioSortDropdown />
      )}
    </div>
  )
}
