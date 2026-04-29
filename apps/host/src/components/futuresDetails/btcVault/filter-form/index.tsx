import { useState } from 'react'
import YieldButton from './yield-button'
import LastThirtyDays from './last-thirty-days'
import SearchInput from './search-input'
import DrawerFilter from './drawer-filter'

const FilterForm = () => {
  const [filterOptions, setFilterOptions] = useState<{
    yieldType: string
    last30Days: string
  }>({
    yieldType: '收益率：从高到低',
    last30Days: '最近24小时',
  })

  const handleFilterOptionsChange = (key: string, value: string) => {
    setFilterOptions({ ...filterOptions, [key]: value })
  }

  return (
    <div className="grid grid-cols-3 pb-2 gap-1">
      <div className="flex gap-1 col-span-2 overflow-auto _hide-scrollbar">
        <YieldButton filterOptions={filterOptions} handleFilterOptionsChange={handleFilterOptionsChange} />
        <LastThirtyDays filterOptions={filterOptions} handleFilterOptionsChange={handleFilterOptionsChange} />
      </div>
      <div className="flex justify-between gap-1 items-center">
        <div className="">
          <SearchInput />
        </div>

        <DrawerFilter />
      </div>
    </div>
  )
}

export default FilterForm
