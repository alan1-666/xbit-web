import DrawerCheckSelect from '@/components/common/DrawerCheckSelect'
import { FilterSelectOption } from '@/components/common/FilterSelect'
import React from 'react'

const yieldOptions: FilterSelectOption[] = [
  {
    label: '收益率：从高到低',
    value: '收益率：从高到低',
  },
  {
    label: '跑赢大盘：从高到低',
    value: '跑赢大盘：从高到低',
  },

  {
    label: '总锁仓价值：从高到低',
    value: '总锁仓价值：从高到低',
  },
  {
    label: '最大回撤：从低到高',
    value: '最大回撤：从低到高',
  },
]

interface YieldButtonProps {
  handleFilterOptionsChange: (key: string, value: string) => void
  filterOptions: {
    yieldType: string
    last30Days: string
  }
}

const YieldButton = ({ filterOptions, handleFilterOptionsChange }: YieldButtonProps) => {
  return (
    <div>
      <DrawerCheckSelect
        childrenTrigger={
          <div className="flex items-center cursor-pointer rounded-full px-[8px] py-[5px] bg-[#ECECED1F] h-[26px] text-[#FFFFFF] text-[13px] leading-[1] app-font-regular justify-between align-middle">
            <div className="truncate overflow-hidden">{filterOptions.yieldType}</div>
            <img className="ml-1 flex-shrink-0" src="/images/futuresDetail/order-arrow-down.svg" alt="icon arrow down" />
          </div>
        }
        options={yieldOptions}
        value={filterOptions.yieldType || '收益率：从高到低'}
        onChange={(e) => handleFilterOptionsChange('yieldType', e)}
        drawerContentClassName="bg-[url('/images/bg-drawer-gradient.png')] bg-no-repeat bg-cover"
      />
    </div>
  )
}

export default YieldButton
