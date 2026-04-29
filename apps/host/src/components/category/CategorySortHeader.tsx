import { useTranslation } from 'react-i18next'
import SortDirectionIcon, { SortDirection } from '@/components/icon/SortDirectionIcon'

// Enum for sorting fields
export enum CategorySortField {
  MarketCap = 'marketCap',
  Price = 'price',
  Change24h = 'change24h',
  Volume24h = 'volume24h',
  None = 'none',
}

// Define sort state type
export interface CategorySortState {
  field: CategorySortField
  direction: SortDirection
}

interface CategorySortHeaderProps {
  sortState: CategorySortState
  onSortChange: (field: CategorySortField) => void
  className?: string
}

/**
 * Sortable header component for the category token list
 * Allows sorting by market cap, price, 24h change, and volume
 */
export const CategorySortHeader = ({ sortState, onSortChange, className = '' }: CategorySortHeaderProps) => {
  const { t } = useTranslation()

  return (
    <div
      className={`w-full flex-row flex justify-between items-center text-center text-[#ffffff70] text-xs py-1.5 ${className}`}
    >
      <div className="w-[40%] inline-flex text-left items-center">
        <button className="inline-flex items-center" onClick={() => onSortChange(CategorySortField.MarketCap)}>
          {t('categoryDetail.tokenType')}
          <SortDirectionIcon
            direction={sortState.field === CategorySortField.MarketCap ? sortState.direction : 'none'}
          />
        </button>
      </div>
      <div className="w-[30%] inline-flex items-center break-keep md:justify-center">
        <button className="inline-flex items-center" onClick={() => onSortChange(CategorySortField.Price)}>
          {t('categoryDetail.latestPrice')}
          <SortDirectionIcon direction={sortState.field === CategorySortField.Price ? sortState.direction : 'none'} />
        </button>
        /
        <button className="inline-flex items-center pl-1" onClick={() => onSortChange(CategorySortField.Change24h)}>
          {t('categoryDetail.h24ChangePercent')}
          <SortDirectionIcon
            direction={sortState.field === CategorySortField.Change24h ? sortState.direction : 'none'}
          />
        </button>
      </div>
      <button
        className="w-[30%] text-right inline-flex items-center justify-end"
        onClick={() => onSortChange(CategorySortField.Volume24h)}
      >
        {t('categoryDetail.h24VolumeLabel')}
        <SortDirectionIcon direction={sortState.field === CategorySortField.Volume24h ? sortState.direction : 'none'} />
      </button>
    </div>
  )
}

export default CategorySortHeader
