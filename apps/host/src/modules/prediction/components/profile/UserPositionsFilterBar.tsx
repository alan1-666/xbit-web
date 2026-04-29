import { UserProfileSortDropdown } from './UserProfileSortDropdown'
import { useTranslation } from 'react-i18next'

interface UserPositionsFilterBarProps {
  positionsFilter: 'active' | 'closed'
  setPositionsFilter: (filter: 'active' | 'closed') => void
}

export const UserPositionsFilterBar = ({ positionsFilter, setPositionsFilter }: UserPositionsFilterBarProps) => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex w-full items-center gap-3 md:w-auto">
        <div className="flex flex-1 items-center rounded-md border border-white/10 bg-white/5 p-1 h-10 md:w-fit md:flex-none">
          <button
            onClick={() => setPositionsFilter('active')}
            className={`h-full flex-1 md:flex-none px-4 rounded-sm text-sm font-medium transition-all duration-200 ${positionsFilter === 'active' ? 'bg-white/10 text-white' : 'bg-transparent text-gray-400 hover:text-white'}`}
          >
            {t('prediction.profile.active')}
          </button>
          <div className="mx-1 h-4 w-px bg-white/10" />
          <button
            onClick={() => setPositionsFilter('closed')}
            className={`h-full flex-1 md:flex-none px-4 rounded-sm text-sm font-medium transition-all duration-200 ${positionsFilter === 'closed' ? 'bg-white/10 text-white' : 'bg-transparent text-gray-400 hover:text-white'}`}
          >
            {t('prediction.profile.closed')}
          </button>
        </div>
        <div className="md:hidden">
          <UserProfileSortDropdown positionsFilter={positionsFilter} />
        </div>
      </div>

      <div className="flex w-full items-center gap-2 md:w-auto md:justify-end">
        <div className="relative flex-1 md:max-w-sm">
          {/* <Input
            placeholder="Search positions"
            className="h-10 w-full rounded-md border border-white/10 bg-transparent pl-10 text-sm text-white placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-blue-500"
          /> */}
          {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} /> */}
        </div>
        <div className="hidden md:block">
          <UserProfileSortDropdown positionsFilter={positionsFilter} />
        </div>
      </div>
    </div>
  )
}
