import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import { Dispatch, SetStateAction, useState } from 'react'

interface AlertTypesDrawerProps {
  type: number
  setType: Dispatch<SetStateAction<number>>
}

const reminderTypes = [
  { value: 0, label: '价格上涨至', description: '最新价等于或大于设置的价格时触发提醒' },
  { value: 1, label: '价格下跌至', description: '最新价等于或小于设置的价格时触发提醒' },
  {
    value: 2,
    label: '24小时涨幅超过',
    description: '最新价等于或小于设过去24小时内涨幅等于或超过设置比例时触发提醒置的价格时触发提醒',
  },
  { value: 3, label: '24小时跌幅超过', description: '过去24小时内跌幅等于或超过设置比例时触发提醒' },
]

const AlertTypesDrawer = ({ type, setType }: AlertTypesDrawerProps) => {
  const [open, setOpen] = useState(false)
  const handleClickChange = (value: number) => {
    setType(value)
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <div className="mt-3 py-4 px-3 h-12 rounded-[6px] flex justify-between items-center bg-[#19191E] text-[calc(1rem*(15/16))] leading-[calc(1rem*(15/16))] cursor-pointer">
          <span>{reminderTypes.find((item) => type === item.value)?.label}</span>
          <img src="/images/icons/icon-chevron-down.svg" alt="chevrom down" />
        </div>
      </DrawerTrigger>
      <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto pb-6 bg-[url('/images/popup-bg.png')] bg-size-[100%_100%] bg-no-repeat">
        <DrawerTitle></DrawerTitle>
        <DrawerHeader className="flex justify-end px-3 py-0">
          <img
            src="/images/icons/icon-x.svg"
            className="w-6 h-6 cursor-pointer"
            onClick={() => setOpen(false)}
            alt=""
          />
        </DrawerHeader>
        <div className="px-3 pb-8 mt-2">
          {reminderTypes.map((item) => {
            return (
              <div
                className="flex justify-between items-center py-4 cursor-pointer border-b-[0.5px] border-b-[#ECECED14]"
                key={item.value}
                onClick={() => {
                  handleClickChange(item.value)
                }}
              >
                <div className="flex-1 max-w-[calc(1rem*(305/16))]">
                  <p className="text-base leading-4 app-font-medium"> {item.label}</p>
                  <p className="mt-2 text-sm leading-[calc(1rem*(22/16))] text-[#FFFFFFCC]"> {item.description}</p>
                </div>
                <img
                  className={cn(
                    'transition-opacity duration-300',
                    type !== item.value ? 'opacity-0 pointer-events-none' : 'opacity-100',
                  )}
                  src="/images/futuresDetail/selected-icon2.svg"
                  alt="selected icon"
                />
              </div>
            )
          })}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default AlertTypesDrawer
