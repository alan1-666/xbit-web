import DrawerCheckSelect from '@/components/common/DrawerCheckSelect'
import { FilterSelectOption } from '@/components/common/FilterSelect'

const yieldOptions: FilterSelectOption[] = [
  {
    label: '最近24小时',
    value: '最近24小时',
  },
  {
    label: '最近7天',
    value: '最近7天',
  },

  {
    label: '最近30天',
    value: '最近30天',
  },
  {
    label: '全部时间',
    value: '全部时间',
  },
]

interface LastThirtyDaysProps {
  filterOptions: {
    yieldType: string
    last30Days: string
  }
  handleFilterOptionsChange: (key: string, value: string) => void
}
const LastThirtyDays = ({ filterOptions, handleFilterOptionsChange }: LastThirtyDaysProps) => {
  return (
    <div>
      <DrawerCheckSelect
        childrenTrigger={
          <div className="flex items-center cursor-pointer rounded-full px-[8px] py-[5px] bg-[#ECECED1F] h-[26px] text-[#FFFFFF] text-[13px] leading-[1] app-font-regular justify-between w-fit align-middle">
            <div className="truncate overflow-hidden">{filterOptions.last30Days}</div>
            <img
              className="ml-1 flex-shrink-0"
              src="/images/futuresDetail/order-arrow-down.svg"
              alt="icon arrow down"
            />
          </div>
        }
        options={yieldOptions}
        value={filterOptions.last30Days || '最近24小时'}
        onChange={(e) => handleFilterOptionsChange('last30Days', e)}
        drawerContentClassName="bg-[url('/images/bg-drawer-gradient.png')] bg-no-repeat bg-cover"
      />
    </div>
  )
}

export default LastThirtyDays
