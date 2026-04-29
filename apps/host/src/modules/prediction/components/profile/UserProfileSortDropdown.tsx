import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useUserProfile } from '@/modules/prediction/context/UserProfileContext'
import { PositionSortField, ClosedPositionSortField, SortDirection } from '@/@generated/gql/graphql-prediction.ts'
import { SortIcon, SortIconAsc } from '../icons'
import { useTranslation } from 'react-i18next'

const ACTIVE_OPTIONS = [
  { label: 'Value', key: PositionSortField.Current, i18nKey: 'prediction.profile.value' },
  { label: 'PnL', key: PositionSortField.Cashpnl, i18nKey: 'prediction.profile.pnl' },
  { label: '% PnL', key: PositionSortField.Percentpnl, i18nKey: 'prediction.profile.percentPnl' },
  { label: 'Bet', key: PositionSortField.Initial, i18nKey: 'prediction.profile.bet' },
  { label: 'Alphabetically', key: PositionSortField.Title, i18nKey: 'prediction.profile.alphabetically' },
  { label: 'Average Price', key: PositionSortField.Avgprice, i18nKey: 'prediction.profile.averagePrice' },
  { label: 'Current Price', key: PositionSortField.Price, i18nKey: 'prediction.profile.currentPrice' },
]

const CLOSED_OPTIONS = [
  { label: 'PnL', key: ClosedPositionSortField.Realizedpnl, i18nKey: 'prediction.profile.pnl' },
  { label: 'Alphabetically', key: ClosedPositionSortField.Title, i18nKey: 'prediction.profile.alphabetically' },
  { label: 'Average Price', key: ClosedPositionSortField.Avgprice, i18nKey: 'prediction.profile.averagePrice' },
  // { label: 'Sold Price', key: ClosedPositionSortField.Price },
  { label: 'Time', key: ClosedPositionSortField.Timestamp, i18nKey: 'prediction.profile.time' },
]

interface UserProfileSortDropdownProps {
  positionsFilter: 'active' | 'closed'
}

export const UserProfileSortDropdown = ({ positionsFilter }: UserProfileSortDropdownProps) => {
  const {
    activeSortBy,
    activeSortDirection,
    setActiveSort,
    toggleActiveDirection,
    closedSortBy,
    closedSortDirection,
    setClosedSort,
    toggleClosedDirection,
  } = useUserProfile()

  const { t } = useTranslation()
  const isActive = positionsFilter === 'active'
  const options = isActive ? ACTIVE_OPTIONS : CLOSED_OPTIONS
  const currentSortBy = isActive ? activeSortBy : closedSortBy
  const currentSortDirection = isActive ? activeSortDirection : closedSortDirection

  const activeOption = options.find((o) => o.key === currentSortBy)

  const handleSelectField = (key: PositionSortField | ClosedPositionSortField) => {
    if (isActive) {
      if (key !== activeSortBy) {
        setActiveSort(key as PositionSortField)
      }
    } else {
      if (key !== closedSortBy) {
        setClosedSort(key as ClosedPositionSortField)
      }
    }
  }

  const handleToggleDirection = () => {
    if (isActive) {
      toggleActiveDirection()
    } else {
      toggleClosedDirection()
    }
  }

  return (
    <div className="flex items-center rounded-sm border border-white/10 bg-transparent h-10 overflow-hidden">
      {/* Sort direction toggle */}
      <button
        onClick={handleToggleDirection}
        className="flex h-full items-center justify-center px-2 text-gray-400 transition hover:text-gray-300 hover:bg-white/5 border-r-0 border-white/10 cursor-pointer"
      >
        {currentSortDirection === SortDirection.Asc ? (
          <SortIconAsc className="shrink-0" />
        ) : (
          <SortIcon className="shrink-0" />
        )}
      </button>

      {/* Sort field dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex h-full items-center justify-center gap-2 whitespace-nowrap rounded-none border-0 bg-transparent px-2 text-sm font-medium text-gray-400 transition hover:text-gray-300 focus-visible:outline-none focus-visible:ring-0 pr-3"
          >
            {activeOption ? t(activeOption.i18nKey) : 'Sort by'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 rounded-lg border border-white/10 bg-[#1c1c1e] p-1 shadow-xl">
          {options.map((option) => (
            <DropdownMenuItem
              key={option.key}
              onClick={() => handleSelectField(option.key)}
              className={`cursor-pointer rounded-md px-3 py-2 text-sm font-medium focus:bg-white/5 focus:text-white ${
                currentSortBy === option.key ? 'bg-white/10 text-white' : 'text-gray-400'
              }`}
            >
              {t(option.i18nKey)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
