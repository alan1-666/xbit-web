import { Dispatch, SetStateAction, useMemo, useState } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '../ui/drawer'
import CheckboxWithLabel from '../common/CheckboxWithLabel'
import WheelPicker from 'react-simple-wheel-picker'
import { DateSelectedType, TimeKey } from '@/types/enums'
import dayjs from 'dayjs'
import { getCurrentTime, TimeWheelDateType } from '@/redux/modules/tokenDetail.slice'
import { WheelItem } from '@/types/tokenDetail'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'

interface TimeRangeFilterProps {
  timeRangeFilter: string
  setTimeRangerFilter: Dispatch<SetStateAction<string>>
}

type TimeOption = {
  type: TimeKey
  maximum: number
  unit: string
  minimum?: number
  isPadStart?: boolean
}

const timeRangeOptions = [
  { value: '7d', label: '近7天' },
  { value: '30d', label: '近30天' },
  { value: '90d', label: '近90天' },
  { value: '1y', label: '近1年' },
]

const orderSorting = [
  { value: 'orderTime', label: '按委托时间' },
  { value: 'transactionTime', label: '按成交时间' },
  { value: 'canceled', label: '隐藏已撤销委托' },
]

const TimeRangeFilter = ({ timeRangeFilter, setTimeRangerFilter }: TimeRangeFilterProps) => {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState(DateSelectedType.START)
  const [endTime, setEndTime] = useState<TimeWheelDateType | undefined>()
  const [startTime, setStartTime] = useState<TimeWheelDateType | undefined>()
  const currentTimeSelect = type === DateSelectedType.END ? endTime : startTime
  const currentTime = startTime ?? endTime ?? getCurrentTime()

  const TIME_OPTIONS: TimeOption[] = [
    {
      type: TimeKey.YEAR,
      unit: '年',
      maximum: dayjs().year() + 1,
      minimum: 1990,
    },
    {
      type: TimeKey.MONTH,
      unit: '月',
      maximum: 12,
      minimum: 1,
    },
    {
      type: TimeKey.DAY,
      unit: '日',
      maximum: dayjs(
        `${currentTimeSelect?.year ?? currentTime.year}-${currentTimeSelect?.month ?? currentTime.month}`,
      ).daysInMonth(),
      minimum: 1,
    },
  ]

  const generateTimeList = (option: TimeOption): WheelItem[] => {
    const { type, unit, maximum, minimum = 0 } = option
    return Array.from({ length: maximum - minimum + 1 }, (_, i) => ({
      id: `${type}-${(i + minimum).toString().padStart(2, '0')}`,
      value: `${(i + minimum).toString().padStart(2, '0')}${unit}`,
    }))
  }

  const timeList = useMemo(
    () =>
      TIME_OPTIONS.map((option) => ({
        ...option,
        value:
          option.type === TimeKey.YEAR
            ? currentTime?.[option.type]
            : String(currentTime?.[option.type]).padStart(2, '0'),
        data: generateTimeList(option),
      })),
    [currentTime],
  )

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <div
          className="
            flex items-center py-1.5 cursor-pointer text-[calc(1rem*(13/16))] leading-[calc(1rem*(13/16))] text-[#FFFFFF] justify-center"
        >
          {timeRangeOptions.find((item) => item.value === timeRangeFilter)?.label}
          <img className="ml-1" src="/images/icons/icon-chevron-down.svg" alt="icon arrow down" />
        </div>
      </DrawerTrigger>
      <DrawerContent className="w-full bg-[#232329] px-3 max-w-[768px] mx-auto pb-6 bg-[url('/images/popup-bg.png')] bg-size-[100%_100%] bg-no-repeat">
        <DrawerTitle></DrawerTitle>
        <DrawerHeader className="flex justify-end p-0">
          <img
            src="/images/icons/icon-x.svg"
            className="w-6 h-6 cursor-pointer"
            onClick={() => setOpen(false)}
            alt=""
          />
        </DrawerHeader>
        <div className="">
          <div className="text-base leading-[calc(1rem)] app-font-medium text-[#FFFFFF]">选择时间范围</div>
          <div className="mt-2.5 text-sm text-[#FFFFFFB2]">
            请切换至“近7 天”查看已撒销的市价、限价、高级限价委托，且己撒销的委托记录将仅保留3天
          </div>
          <div className="mt-2 py-3 flex items-center justify-between overflow-x-auto whitespace-nowrap no-scrollbar">
            {timeRangeOptions.map((item) => (
              <CheckboxWithLabel
                key={item.value}
                label={item.label}
                isChecked={timeRangeFilter === item.value}
                onChange={() => {
                  setTimeRangerFilter(item.value)
                }}
              />
            ))}
          </div>
          <div className="py-3 flex justify-between items-center">
            <div className="px-3 py-2 rounded-[6px] border-[0.5px] border-[#FFFFFF42] bg-[#232329] text-[#FFFFFF] text-sm leading-4">
              2024-08-27
            </div>
            <div className="text-[#FFFFFF80]">到</div>
            <div className="px-3 py-2 rounded-[6px] border-[0.5px] border-[#FFFFFF42] bg-[#232329] text-[#FFFFFF] text-sm leading-4">
              2024-09-28
            </div>
          </div>
          <div className="flex justify-center">
            {timeList.map((item) => (
              <div
                key={`${item.type}-${item.value}`}
                className={cn(
                  'hidden-icon _hidescrollbar relative',
                  '[&>ul]:!px-3 [&>ul]:!right-[-4px]',
                  '[&>ul_li]:whitespace-nowrap',
                )}
              >
                <WheelPicker
                  data={item.data}
                  selectedID={`${item.type}-${item.value}`}
                  onChange={() => {}}
                  height={220}
                  itemHeight={40}
                  backgroundColor="transparent"
                  color="#6a6a8a"
                  activeColor="#ffffff"
                  fontSize={16}
                  shadowColor="transparent"
                  focusColor="transparent"
                />
              </div>
            ))}
          </div>
          <div>
            <div className="py-2 text-base text-[#FFFFFFB3]">订单排序</div>
            <div className="mt-1 grid grid-cols-2 justify-between gap-y-6">
              {orderSorting.map((item, index) => (
                <CheckboxWithLabel
                  key={item.value}
                  label={item.label}
                  // isChecked={timeRangeFilter === item.value}
                  // onChange={() => {
                  //   setTimeRangerFilter(item.value)
                  // }}
                  containerClassName={index === 1 ? 'justify-self-end' : ''}
                />
              ))}
            </div>
          </div>
          <div className="mt-5 py-2 grid grid-cols-2 gap-2">
            <Button variant="borderGradient" className="rounded-[50px] h-11" onClick={() => setOpen(false)}>
              重置
            </Button>
            <Button variant="gradient" className="rounded-[50px] h-11 text-tertiary" onClick={() => setOpen(false)}>
              确认
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default TimeRangeFilter
