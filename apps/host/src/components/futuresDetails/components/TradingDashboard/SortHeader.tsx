import Text from '@/components/common/Text'
import { IconSortDown, IconSortUp } from '@/components/icon'
import React from 'react'

const SortHeader = React.memo(
  ({
    text,
    onSort,
    sortIndicator,
  }: {
    text: string
    onSort: () => void
    sortIndicator: { upColor: string; downColor: string }
  }) => (
    <div className="flex cursor-pointer" onClick={onSort}>
      <Text text={text} fontSize={12} fontWeight="light" color="#FFFFFF80" className="!font-[330]" />
      <div className="flex flex-col ml-1 cursor-pointer">
        <IconSortUp currentColor={sortIndicator.upColor} />
        <IconSortDown currentColor={sortIndicator.downColor} />
      </div>
    </div>
  ),
)

export default SortHeader
