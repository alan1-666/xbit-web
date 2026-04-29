import { SortByCreateAtType } from '@/types/enums.ts'
import { IconSortDown, IconSortUp } from '@components/icon'
import React from 'react'
import {useResponsive} from "@hooks/hyperliquid/useResponsive.ts";
import {cn} from "@/lib/utils.ts";

interface FilterArrowSortProps {
  onSort?: (sort: SortByCreateAtType) => void
  currentSort: SortByCreateAtType
}

const FilterArrowSort = React.memo(({ onSort, currentSort }: FilterArrowSortProps) => {
  const { isDesktop } = useResponsive()

  const handleOnclickSort = () => {
    onSort?.(currentSort === SortByCreateAtType.DESC ? SortByCreateAtType.ASC : SortByCreateAtType.DESC)
  }

  if (isDesktop) {
    return (
      <div className={
        cn('cursor-pointer transition-all', currentSort === SortByCreateAtType.DESC ? '' : 'rotate-180')
      }>
        <img src='/images/icons/icon-arrow-down-pc.svg' alt='icon sort' />
      </div>
    )
  }

  return (
    <div
      className="flex flex-col ml-1 cursor-pointer"
      onClick={handleOnclickSort}
    >
      <IconSortUp currentColor={currentSort === SortByCreateAtType.ASC ? '#843BEA' : '#605E68'} />
      <IconSortDown currentColor={currentSort === SortByCreateAtType.DESC ? '#843BEA' : '#605E68'} />
    </div>
  )
})

FilterArrowSort.displayName = 'FilterArrowSort'

export default FilterArrowSort
