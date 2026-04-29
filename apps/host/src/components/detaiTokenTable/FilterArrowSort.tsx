import { cn } from '@/lib/utils'
import { SortByCreateAtType } from '@/types/enums'
import { IconSortDown, IconSortUp } from '@components/icon'
import { useResponsive } from '@hooks/hyperliquid/useResponsive'

type FilterArrowSortProps = {
  sortByCreatedAt?: SortByCreateAtType
  handleOnclickSort?: () => void
  type?: string
  currentType?: string
  classNames?: string
  isNewTwoArrowSort?: boolean
}

const ACTIVE_COLOR = '#843BEA'
const INACTIVE_NEW_COLOR = '#6C6A74'
const INACTIVE_OLD_COLOR = '#605E6880'

const FilterArrowSort = ({
  handleOnclickSort,
  sortByCreatedAt,
  type,
  currentType,
  classNames,
  isNewTwoArrowSort = false,
}: FilterArrowSortProps) => {
  const { isDesktop } = useResponsive()

  const isActiveType = !type || !currentType || type === currentType

  const getColor = (direction: SortByCreateAtType) => {
    if (sortByCreatedAt === direction && isActiveType) {
      return ACTIVE_COLOR
    }
    return isNewTwoArrowSort ? INACTIVE_NEW_COLOR : INACTIVE_OLD_COLOR
  }

  if (isDesktop && !isNewTwoArrowSort) {
    return (
      <div
        className={cn('cursor-pointer transition-all', sortByCreatedAt !== SortByCreateAtType.DESC && 'rotate-180')}
        onClick={handleOnclickSort}
      >
        <img src="/images/icons/icon-arrow-down-pc.svg" alt="icon sort" />
      </div>
    )
  }

  return (
    <div className={cn('ml-1 flex cursor-pointer flex-col', classNames)} onClick={handleOnclickSort}>
      <IconSortUp currentColor={getColor(SortByCreateAtType.ASC)} />
      <IconSortDown currentColor={getColor(SortByCreateAtType.DESC)} />
    </div>
  )
}

export default FilterArrowSort
